import z from "zod";
import { createTRPCRouter, staffProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

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

  createTransaction: staffProcedure
    .input(
      z.object({
        typeTransaction: z.enum(["IN", "OUT"]),
        productId: z.string().uuid(),
        quantity: z.number().int().positive(), // Ensure quantity is a positive integer
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { productId, quantity, typeTransaction, note } = input;

      // Use a database transaction to ensure both operations succeed or fail together
      const newTransaction = await db.$transaction(async (tx) => {
        // 1. First, find the product to check if it exists and get its current quantity
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          // If the product doesn't exist, throw an error to abort the transaction
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with ID ${productId} not found.`,
          });
        }

        // 2. Validate stock for "OUT" transactions
        if (typeTransaction === "OUT" && product.quantity < quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock. Only ${product.quantity} units available for product ${product.name}.`,
          });
        }

        // 3. Calculate the new quantity
        const newQuantity =
          typeTransaction === "IN"
            ? product.quantity + quantity
            : product.quantity - quantity;

        // 4. Create the transaction record and connect it to the product
        const transaction = await tx.transaction.create({
          data: {
            type: typeTransaction,
            note,
            // This is the key part for the many-to-many relation
            products: {
              connect: {
                id: productId,
              },
            },
          },
        });

        // 5. Update the product's quantity in the same transaction
        await tx.product.update({
          where: { id: productId },
          data: { quantity: newQuantity },
        });

        return transaction;
      });

      return newTransaction;
    }),
});
