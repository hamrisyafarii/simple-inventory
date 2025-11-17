import { createTRPCRouter, staffProcedure } from "../trpc";

export const transactionRouter = createTRPCRouter({
  getAllTransaction: staffProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    return await db.transaction.findMany({
      select: {
        id: true,
        quantity: true,
        type: true,
        note: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
        products: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });
  }),
});
