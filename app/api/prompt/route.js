import { NextResponse } from 'next/server'
import { cookies } from 'next/headers';
import { prisma } from '@/database/prisma/prisma';

import OpenAI from "openai";
import { auth } from '@/auth';
import { getUserWithFeatures } from '@/lib/actions/action';
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
        return NextResponse.json({ error: "Limiet bereikt", limitReached: true }, {
            status: 429,
        });
    }

    const body = await req.json()
    const { messages } = body

    const messagesWithoutWhiteId = messages.map(message => {
        return {role: message.role, content: message.content}
    })

    let response

    if(!session) {
        response = await client.responses.create({
            model: 'gpt-4o-mini',
            input: messagesWithoutWhiteId,
            stream: true,
        });

    } else {
        response = await client.responses.create({
            model: planDetails?.features.version,
            input: messagesWithoutWhiteId,
            stream: true,
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {

            for await (const token of response) {
                controller.enqueue(encoder.encode(token?.delta));
                if(token.type === "response.completed"){
                    console.log(JSON.stringify(token,null,2))
                    // console.log(token.response.output[0].content[0].text)
                    controller.enqueue(encoder.encode(`\n[END]\n${token.response.output[0].content[0].text}\n`));

                }
            }

            controller.close();
            },
    });

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/plain',
            'Cache-Control': 'no-cache',
        },
    });

    return NextResponse.json({message: response.output_text});


}