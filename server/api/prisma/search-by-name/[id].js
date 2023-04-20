import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  let items = await prisma.products.findMany({
    take: 5, // Max rows
    where: {
      title: {
        contains: event.context.params.id,
        mode: 'insensitive'
      },
    },
  });

  return items;
});
