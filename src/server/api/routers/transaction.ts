import z from "zod";
import { createTRPCRouter, staffProcedure, userProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const transactionRouter = createTRPCRouter({
  getAllTransaction: userProcedure.query(async ({ ctx }) => {
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
            id: true,
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
        quantity: z.number(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { productId, quantity, typeTransaction, note } = input;

      const newTransaction = await db.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with ID ${productId} not found.`,
          });
        }

        if (typeTransaction === "OUT" && product.quantity < quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock. Only ${product.quantity} units available for product ${product.name}.`,
          });
        }

        const newQuantity =
          typeTransaction === "IN"
            ? product.quantity + quantity
            : product.quantity - quantity;

        const transaction = await tx.transaction.create({
          data: {
            type: typeTransaction,
            note,
            quantity,
            products: {
              connect: {
                id: productId,
              },
            },
            user: {
              connect: {
                id: user.id,
                email: user.email,
              },
            },
          },
        });

        await tx.product.update({
          where: { id: productId },
          data: { quantity: newQuantity },
        });

        return transaction;
      });

      return newTransaction;
    }),

  updateTransaction: staffProcedure
    .input(
      z.object({
        transactionId: z.string().uuid(),
        typeTransaction: z.enum(["IN", "OUT"]),
        productId: z.string(),
        quantity: z.number(),
        note: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { productId, quantity, transactionId, typeTransaction, note } =
        input;

      if (!transactionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      const updateTransaction = await db.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with ID ${productId} not found.`,
          });
        }

        if (typeTransaction === "OUT" && product.quantity < quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient stock. Only ${product.quantity} units available for product ${product.name}.`,
          });
        }

        const updateQuantity =
          typeTransaction === "IN"
            ? product.quantity + quantity
            : product.quantity - quantity;

        const transaction = await tx.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            type: typeTransaction,
            products: {
              set: [{ id: productId }],
            },
            quantity,
            note,
            user: {
              connect: {
                id: user.id,
                email: user.email,
              },
            },
          },
        });

        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            quantity: updateQuantity,
          },
        });

        return transaction;
      });
      return updateTransaction;
    }),

  deleteTransaction: staffProcedure
    .input(
      z.object({
        transactionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { transactionId } = input;

      if (!transactionId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transcation not found, please try again later",
        });
      }

      return await db.transaction.delete({
        where: {
          id: transactionId,
        },
      });
    }),
});
