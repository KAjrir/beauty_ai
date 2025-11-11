
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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
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
              where: { userId: userId },
              data: { 
                planId: planId,
                stripeSubscriptionId: session.subscription
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

  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object as Stripe.Checkout.Session;
  //   const customerId = session.customer as string;
  //   const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  //   const stripePriceId = subscription.items.data[0].price.id;

  //   const plan = await prisma.plan.findUnique({ where: { stripePriceId } });
  //   if (!plan) return NextResponse.json({ error: 'No plan found for this Stripe price' }, { status: 404 });

  //   await prisma.user.update({
  //     where: { stripeCustomerId: customerId },
  //     data: { planId: plan.id },
  //   });

  //   console.log(`✅ Updated user plan to ${plan.id}`);
  // }

  // return new NextResponse('OK', { status: 200 });
// }