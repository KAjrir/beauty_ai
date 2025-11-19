"use server"


import { signIn, signOut } from "@/auth"
import { prisma } from '@/database/prisma/prisma'
import { hash } from "bcryptjs"
import { redirect } from "next/navigation"
import { stripe } from "@/lib/stripe"


export const signInWithGoogle = async () => {
    await signIn('google')
    redirect('/')
}

export const handleSignOut = async () => {
    await signOut()
}

export const signInWithCredentials = async ( data ) => {
    const { email, password } = data

    try{
        const result = await signIn('credentials', {
            email,
            password,
            redirect: false
        })

        console.log("@/lib/actions/action.js (30): ", result)

        if (result?.error) {
            return { success: false, error: result.error };
        }

        return { success: true };
    }catch (err){
        console.log(JSON.stringify(err))
        // console.log(err, err.message, "Signin error");
        return { success: false, error: "Signin error" };
    }

}

export const signUp = async ( data ) => {
    const { email, password } = data
    console.log("action.js Regel 45: ", data)


    const  existingUser = await prisma.user.findUnique({
        where: { email }
    })

    console.log("Existing User: ", existingUser)

    if (existingUser) {
        return { success: false, error: "User already exists" };
    }

    const hashedPassword = await hash(password, 10)

    try {
        const plan = await prisma.plan.findUnique({
            where: { name: 'free' },
        });

         
        const customer = await stripe.customers.create({
          email: email
        });

        console.log("CUSTOMER_STRIPE CREATED: ", customer)


        
        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                stripeCustomerId: customer.id,
                subscription: {
                    create: {
                        plan: {
                            connect: {id: plan.id}
                        },
                        endDate: new Date()
                    }
                }
            }
        })

        await signInWithCredentials({ email, password });
        return {success: true}

    } catch (error) {
        console.log(error)
        return {success: false, error: 'Signup error'}
    }
}



export const getUser = async (id) => {
    if(!id) return null
    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            subscription: {
            select: {
                id: true,
                planId: true,
                startDate: true,
            }
            }
        }
    });

    if(!user) return null
    return user
}

export const getPlans = async () => {
    const plans = await prisma.plan.findMany()
    const sortedPlans =  plans.sort((a, b) => a.price - b.price)
    return sortedPlans
}

export const getUserWithFeatures = async (id) => {
    return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                subscription: {
                select: {
                    plan: {
                    select: {
                        name: true,
                        features: true
                    }
                    }
                }
                }
            }
        })
}



export const nepFunctie = async () => {
  console.log('Start nepFunctie...');
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Klaar met wachten.');
  return 'Nepresultaat 🧪';
}