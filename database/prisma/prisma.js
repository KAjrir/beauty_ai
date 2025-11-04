import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

let prisma;

const connectionString = process.env.DATABASE_URL

const adapter = new PrismaNeon({ connectionString })


if (!global.prisma) {
  global.prisma = new PrismaClient({ 
    adapter, 
    // log: ['query', 'info', 'warn', 'error']
  })
}
prisma = global.prisma;


export { prisma }