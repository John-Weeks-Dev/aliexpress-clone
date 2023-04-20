import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {    
    const res = await prisma.addresses.findFirst({
        where: { userId: event.context.params.id }
    })
    return res
})