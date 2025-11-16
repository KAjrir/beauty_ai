import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { prisma } from '@/database/prisma/prisma';

import OpenAI from "openai";
import { auth } from '@/auth';
import { getUserWithFeatures } from '@/lib/actions/action';
import { systemInstructions } from '@/constants';
import { DIRTY } from 'zod';
const client = new OpenAI()


function limitedCounts (plan = "free", cookie, session){
    if (plan !== 'free') return false;
    let  MAX_PROMPTS;

    MAX_PROMPTS = session ? 15 : 3  

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

    if (!chatId) {
        try {
            const response = await client.responses.create({
                model: "gpt-5",
                input: `Analyze the text and think of an appropiate title. It shouldn't be too long maximum of 50 characters: ${messages[messages.length - 1].content}`
            });

            const chat = await prisma.chat.create({
                data: {
                    userId: user.id,
                    title: response.output_text
                }
            })

            chatId = chat.id

        } catch(err){
            console.error(err)
            return NextResponse.json({error: "Internal Error"}, {status: 500})
        }
    }

    try {
        const validateChat = await prisma.chat.findFirst({
            where: {
                id: chatId,
                userId: user.id
            }
        })
        console.log(validateChat)

        if (!validateChat) {
            return NextResponse.json(
                    { error: `Unable to load conversation ${chatId}`},
                    { status: 404 }
                );
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
        response = await client.responses.create({
            model: model,
            input: input,
            stream: true,
        });
    } catch (err){
        console.error(err);
        return NextResponse.json(
            { error: "Error fetching AI response. Please try again." },
            { status: 500 }
        );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            controller.enqueue(
                encoder.encode(JSON.stringify({
                    type: "init",
                    chatId,
                }) + "\n")
            );

            const userMessage = await prisma.chatMessage.create({
                data: {
                    chatId,
                    role: "user",
                    content: messages[messages.length - 1].content,
                },
            });

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
                }
                
                if(token.type === "response.completed"){
                    console.log(JSON.stringify(token, null, 2))

                    const finalText = token.response.output[0].content[0].text;
                    const assistantMessage = await prisma.chatMessage.create({
                        data: {
                            chatId,
                            role: "assistant",
                            content: finalText,
                        }
                    });

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