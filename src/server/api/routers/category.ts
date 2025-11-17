import z from "zod";
import { createTRPCRouter, staffProcedure, userProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const categoryRouter = createTRPCRouter({
  createCategory: staffProcedure
    .input(
      z.object({
        name: z.string().toLowerCase(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name } = input;

      const cateogry = await db.category.findFirst({ where: { name } });

      if (cateogry) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name of category used",
        });
      }

      const newCategory = await db.category.create({
        data: {
          name,
        },
      });

      return newCategory;
    }),

  getAllCategory: userProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    return await db.category.findMany({
      select: {
        id: true,
        name: true,
        createAt: true,
      },
      orderBy: {
        createAt: "desc",
      },
    });
  }),

  updateCategory: staffProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name, categoryId } = input;

      const existingName = await db.category.findFirst({
        where: { name },
      });

      if (existingName) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name of category used !",
        });
      }

      if (!categoryId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category tidak ditemukan",
        });
      }

      const updateCategory = await db.category.update({
        where: {
          id: categoryId,
        },
        data: {
          name,
        },
      });

      return updateCategory;
    }),

  deleteCategory: staffProcedure
    .input(
      z.object({
        categoryId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { categoryId } = input;

      if (!categoryId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category tidak ditemukan",
        });
      }

      return await db.category.delete({
        where: {
          id: categoryId,
        },
      });
    }),
});
