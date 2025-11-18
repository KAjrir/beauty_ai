import { prisma } from './prisma.js'

const createUser = async (email, password) => {
    if(!email || !password) return

    const user = await prisma.user.create({
        data: {
            email,
            password
        }
    })
    console.log(user)
    return user
}

const selectUser = async (email) => {

    const user = await prisma.user.findUnique({
        where: {
            email
        },
        select: {
            id :true,
            email: true
        },
    })
    console.log(user)
    return user
    
}

const seedPlans = async () => {
    const plans = await prisma.plan.createMany({
        data: [
            {name: "free", price: 0, features: {version: 'gpt-4.1-nano'}},
            {name: "pro", price: 800, features: {version: 'gpt-4.1-mini'}},
            {name: "premium", price: 1500, features: {version: 'gpt-4.1'}},
        ]
    })

    console.log(plans)
}

const deleteUser = async (email) => {
    const user = await prisma.user.deleteMany()
    console.log(user)
}

const find = async () => {
    const user = await prisma.subscription.findMany()

    console.log(user)
}
const getUser = async (id) => {
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
    console.log(user)
    return user
}

const existingUser = async (id) => {
    const user = await prisma.user.findUnique({
        where: {id: id},
        include: {
          subscription: true
        }
      })

      console.log(user)
    }

const getPlans = async () => {
    const plans = await prisma.plan.findMany()
    const sortedPlans =  plans.sort((a, b) => a.price - b.price)
    console.log(JSON.stringify(sortedPlans, null, 2))
}



const seedChats = async () => {
    for (let i = 0; i < 10; i++){
        await prisma.chat.create({
            data: {
                userId: "cmhmmvzdo0001dah20ejeypbb",
                title: `${i}`
            }
        })
    }
}

await seedChats()

// existingUser('cmcmld5yp0001dactabyatego')
//   .then(async () => {
//     await prisma.$disconnect()
//   })
//   .catch(async (e) => {
//     console.error(e)
//     await prisma.$disconnect()
//     process.exit(1)
//   })


