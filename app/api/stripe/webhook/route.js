
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/database/prisma/prisma';
import { stripe } from '@/lib/stripe';



export async function POST(req) {
  const rawBody = await req.text();
  const headersList = await headers()

  const endpointSecret = process.env.LIVE_SECRET_WEBHOOK_KEY;
  const signature = headersList.get('stripe-signature')

  try {
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    const session = event.data.object;
    
    if (event.type === 'checkout.session.completed') {
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId
      console.log("SESSION: ", session)
      console.log("UserId: ", userId)
      console.log("PlanId: ", planId)

      if (!planId) {
        console.error('Plan not found for Stripe price:');
        return new NextResponse('Plan not found', { status: 404 });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscription: {
            update: {
              data: { 
                planId: planId,
                stripeSubscriptionId: session.subscription
              },
            },
          },
        },
      });
    }

    if(event.type === "customer.subscription.updated"){
      const stripeCustomerId = session.customer
      const planName = session.items.data[0].price.lookup_key

      const plan = await prisma.plan.findUnique({
        where: { name: planName},
      });

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId},
      });

      await prisma.subscription.update({
        where: {
          userId: user.id
        },
        data: {
          planId: plan.id
        }
      })
      
    }

    if(event.type === "customer.subscription.delete"){
      const freePlan = await prisma.plan.findUnique({
        where: { name: 'free' },
      });

      await prisma.user.update({
        where: { stripeCustomerId:  session.customer},
        data: {
          subscription: {
            update: {
              data: { 
                planId: freePlan.id,
                stripeSubscriptionId: null
              },
            },
          },
        },
      });
    }

    return new NextResponse('ok', {status: 200});
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({error: err.message});
  }
}