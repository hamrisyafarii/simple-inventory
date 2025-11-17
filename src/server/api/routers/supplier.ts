import z from "zod";
import { createTRPCRouter, staffProcedure, userProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const supplierRouter = createTRPCRouter({
  createSupplier: staffProcedure
    .input(
      z.object({
        name: z.string(),
        contact: z.string().optional(),
        address: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name, address, contact } = input;

      const newSupplier = await db.supplier.create({
        data: {
          name,
          contact,
          address,
        },
      });

      return newSupplier;
    }),

  getAllSupplier: userProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    return await db.supplier.findMany({
      select: {
        id: true,
        name: true,
        contact: true,
        address: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  updateSupplier: staffProcedure
    .input(
      z.object({
        supplierId: z.string().uuid(),
        name: z.string({ message: "Name must be required" }),
        contact: z.string().optional(),
        address: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name, address, contact, supplierId } = input;

      if (!supplierId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Supplier id not found, please try again later",
        });
      }

      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name must be required",
        });
      }

      const updateSupplier = await db.supplier.update({
        where: {
          id: supplierId,
        },
        data: {
          name,
          address,
          contact,
        },
      });

      return updateSupplier;
    }),

  deleteSupplier: staffProcedure
    .input(
      z.object({
        supplierId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { supplierId } = input;

      if (!supplierId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Can not find supplier, please try again later",
        });
      }

      return await db.supplier.delete({
        where: {
          id: supplierId,
        },
      });
    }),
});
