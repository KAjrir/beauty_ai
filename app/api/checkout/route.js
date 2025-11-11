import { auth } from '@/auth';
import { NextResponse } from 'next/server'
import { prisma } from '@/database/prisma/prisma';
import { stripe } from '@/lib/stripe';

const YOUR_DOMAIN = process.env.DOMAIN_NAME;


export async function POST (req) {
    const { planName } = await req.json()

    const session = await auth();
    console.log("SESSION: ", session)
    if(!session) return NextResponse.json({url: `${YOUR_DOMAIN}/sign-in`, error: "No user detected"})
        
    const [user, plan] = await Promise.all([
        prisma.user.findUnique({
            where: { id: session.user.id },
            include: { subscription: true },
        }),
        prisma.plan.findUnique({
            where: { name: planName },
        }),
    ]);

    console.log(user)
    if(user.subscription.stripeSubscriptionId){
        const stripeSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${YOUR_DOMAIN}`,
        });
        return NextResponse.json({url: stripeSession.url});
    }

    const prices = await stripe.prices.list({
        lookup_keys: [planName],
        expand: ['data.product'],
    });

    const stripeSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: user.stripeCustomerId,
        billing_address_collection: 'auto',
        line_items: [
            {
                price: prices.data[0].id,
                quantity: 1
            },
        ],
        metadata: {
            userId: user.id,
            planId: plan.id
        },
        submit_type: "subscribe",
        success_url: `${YOUR_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/cancel`,
    });


    return NextResponse.json({url: stripeSession.url});

}