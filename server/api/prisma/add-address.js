import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    
    const res = await prisma.addresses.create({
        data: {
            userId: body.userId,
            name: body.name,
            address: body.address,
            zipcode: body.zipCode,
            city: body.city,
            country: body.country,
        }
    })

    return res
})