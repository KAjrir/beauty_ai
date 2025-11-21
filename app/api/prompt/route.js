import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { prisma } from '@/database/prisma/prisma';
import { v4 } from "uuid"


import OpenAI from "openai";
import { auth } from '@/auth';
import { getUserWithFeatures } from '@/lib/actions/action';
import { systemInstructions } from '@/constants';

const client = new OpenAI()

// Deze functie even uitzetten zodat mogelijke werkgevers deze site kunnen bezoeken en beoordelen
// als je de functie weer geldig wil maken dan return statement weghalen

function limitedCounts (plan = "free", cookie, session){
    return
    if (!plan) return false;
    let  MAX_PROMPTS;

    MAX_PROMPTS = session ? 30 : 10  

    const countCookie = cookie.get('prompt_count');
    const startCookie = cookie.get('prompt_start');

    const now = Date.now();
    const count = countCookie ? parseInt(countCookie.value, 10) : 0;
    const startTime = startCookie ? parseInt(startCookie.value, 10) : now;

    const limitWindow = 1000 * 60 * 60 * 24; // 24 uur

    let newCount = count;
    let newStartTime = startTime;
    let expires

    
    if (!startTime || now - startTime > limitWindow) {
        // 🚨 Nieuw venster begint
        newCount = 1;
        newStartTime = now;
        expires = new Date(now + limitWindow); // nieuwe vaste deadline
    } else {
        // 🧮 Binnen bestaand venster → verhoog count
        newCount = count + 1;
        newStartTime = startTime;
        expires = new Date(startTime + limitWindow); // vaste oorspronkelijke expiry behouden
    }
    console.log("Count: ", newCount)
    console.log("StartTime: ", newStartTime)
    console.log("Expires: ", expires)

    if (newCount > MAX_PROMPTS) {
        return true
    }
    
    cookie.set({
        name: 'prompt_count',
        value: newCount.toString(),
        expires,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    });

    cookie.set({
        name: 'prompt_start',
        value: newStartTime.toString(),
        expires,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
    return false
}


export async function POST (req) {
    const cookieStore = await cookies();
    const session = await auth()
    const user = session ? await getUserWithFeatures(session?.user?.id) : null

    const planDetails = user?.subscription.plan
    console.log(planDetails)

    const limit = limitedCounts(planDetails?.name, cookieStore, session)
    
    if (limit) {
        return NextResponse.json({ error: "Reached Limit", limitReached: true }, {
            status: 429,
        });
    }

    const body = await req.json()
    let { messages, chatId } = body


    // Free usage
    if (!user) {
        const input = [
            ...systemInstructions,
            ...messages.map(msg => ({ 
                role: msg.role, 
                content: msg.content 
            }))
        ];

        const model = "gpt-4o-mini";

        const response = await client.responses.create({
            model,
            input,
            stream: true,
        });

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {

                controller.enqueue(
                    encoder.encode(JSON.stringify({
                        type: "user_message_id",
                        id: v4()
                    }) + "\n")
                )

                    

                for await (const token of response) {
                    if(token.delta) {
                        controller.enqueue(
                            encoder.encode(JSON.stringify({
                                type: "token",
                                value: token.delta
                            }) + "\n" )
                                
                        )
                    }
                    
                    if(token.type === "response.completed"){
                        console.log(JSON.stringify(token, null, 2))

                        const finalText = token.response.output[0].content[0].text;

                        controller.enqueue(
                        encoder.encode(JSON.stringify({
                            type: "assistant_message_id",
                            id: v4()
                        }) + "\n")
                    )

                        controller.enqueue(
                            encoder.encode(JSON.stringify({
                                type: "end",
                                text: finalText
                            }) + "\n")
                        )
                    }
                }

                controller.close();
                },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                "Connection": "keep-alive"
            },
        });
    }


    // Paid usage
    
    try {
        if (chatId) {
            const validateChat = await prisma.chat.findFirst({
                where: {
                    id: chatId,
                    userId: user.id
                }
            })
            console.log("Validation of chat: ", validateChat)

            if (!validateChat) {
                return NextResponse.json(
                        { error: `Unable to load conversation ${chatId}`},
                        { status: 404 }
                    );
            }
        } else{
            try {

                
                const chat = await prisma.chat.create({
                    data: {
                        userId: user.id,
                    }
                })
                chatId = chat.id
                
                setImmediate(async () => {
                    try{
                        const res = await client.responses.create({
                            model: "gpt-5-mini",
                            input: `Analyze the text and think of an appropiate title. It shouldn't be too long maximum of 35 characters: ${messages[messages.length - 1].content}`
                        });
    
                        await prisma.chat.update({
                            where: { id: chatId },
                            data: { title: res.output_text }
                        });
                    } catch(err){
                        console.error(err)
                        return NextResponse.json({error: "Internal Error"}, {status: 500})

                    }
                });
                
    
            } catch(err){
                console.error(err)
                return NextResponse.json({error: "Internal Error"}, {status: 500})
            }
        }


    } catch(err){
        console.error(err)
        return NextResponse.json({error: "Internal Error"}, {status: 500})
    }



    const messagesWithoutId = messages.map(message => {
        return {role: message.role, content: message.content}
    })

    const input = [
        ...systemInstructions,
        ...messagesWithoutId
    ]


    const model = session ? planDetails?.features.version : 'gpt-4o-mini'
    let response
    try {
        console.time("response")

        response = await client.responses.create({
            model: model,
            input: input,
            stream: true,
        });
        console.timeEnd("response")

    } catch (err){
        console.error(err);
        return NextResponse.json(
            { error: "Error fetching AI response. Please try again." },
            { status: 500 }
        );
    }

    const userMessage = await prisma.chatMessage.create({
        data: {
            chatId,
            role: "user",
            content: messages[messages.length - 1].content,
        },
    }).catch(err => console.error("failed to save message: ", err))

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(
                encoder.encode(JSON.stringify({
                    type: "init",
                    chatId,
                }) + "\n")
            );

            controller.enqueue(
                encoder.encode(JSON.stringify({
                    type: "user_message_id",
                    id: userMessage.id
                }) + "\n")
            )

                

            for await (const token of response) {
                if(token.delta) {
                    controller.enqueue(
                        encoder.encode(JSON.stringify({
                            type: "token",
                            value: token.delta
                        }) + "\n" )
                    )
                    continue
                }
                
                console.log(JSON.stringify(token, null, 2))
                if(token.type === "response.completed"){


                    const finalText = token.response?.output[1]?.content[0].text || token.response.output[0].content[0].text;

                    const assistantMessage = await prisma.chatMessage.create({
                        data: {
                            chatId,
                            role: "assistant",
                            content: finalText,
                        }
                    }).catch(err => console.error("failed to save message: ", err))

                    controller.enqueue(
                        encoder.encode(JSON.stringify({
                            type: "assistant_message_id",
                            id: assistantMessage.id
                        }) + "\n")
                    )

                    controller.enqueue(
                        encoder.encode(JSON.stringify({
                            type: "end",
                            text: finalText
                        }) + "\n")
                    )
                    controller.enqueue(encoder.encode("[END]\n"));
                }
            }

            controller.close();
            },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            "Connection": "keep-alive"
        },
    });

}

