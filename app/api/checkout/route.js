import { auth } from '@/auth';
import { NextResponse } from 'next/server'
import { prisma } from '@/database/prisma/prisma';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const YOUR_DOMAIN = process.env.DOMAIN_NAME;


export async function POST (req) {
    const { planName } = await req.json()
    console.log(planName)

    const session = await auth();
    if(!session) return NextResponse.json({url: `${YOUR_DOMAIN}/sign-in`, error: "No user detected"})

    const plan = await prisma.plan.findUnique({
        where: {name: planName}
    })

    const prices = await stripe.prices.list({
        lookup_keys: [planName],
        expand: ['data.product'],
    });
    console.log(prices)

    const stripeSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                // For usage-based billing, don't pass quantity
                quantity: 1,

            },
        ],
        metadata: {
            userId: session?.user?.id,
            planId: plan.id
        },  
        success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/cancel`,
    });
    console.log(stripeSession)


    return NextResponse.json({url: stripeSession.url});

}