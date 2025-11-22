import z from "zod";
import { createTRPCRouter, staffProcedure, userProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const productRouter = createTRPCRouter({
  createProduct: staffProcedure
    .input(
      z.object({
        name: z.string(),
        quantity: z.number(),
        price: z.number(),
        categoryId: z.string().optional(),
        supplierId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name, price, quantity, categoryId } = input;

      // Generate SKU
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const newProduct = await db.$transaction(async (tx) => {
            let prefix = "GEN";
            if (categoryId) {
              const category = await tx.category.findUnique({
                where: { id: categoryId },
              });
              if (category) {
                prefix = category.name.slice(0, 3).toUpperCase();
              }
            }

            const lastProduct = await tx.product.findFirst({
              where: { categoryId },
              orderBy: { sku: "desc" },
            });

            let nextNumber = 1;
            if (lastProduct?.sku) {
              const parts = lastProduct.sku.split("-");
              const lastNum = parseInt(parts[1]!);
              if (!isNaN(lastNum)) nextNumber = lastNum + 1;
            }

            const sku = `${prefix}-${String(nextNumber).padStart(3, "0")}`;

            return tx.product.create({
              data: {
                categoryId,
                name,
                price,
                quantity,
                sku,
              },
            });
          });

          return newProduct;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (error.code === "P2002" && attempt < maxRetries - 1) {
            continue;
          }
          throw error;
        }
      }
    }),

  getAllProduct: userProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        sku: true,
        category: {
          select: {
            name: true,
          },
        },
        supplier: {
          select: {
            name: true,
          },
        },
        supplierId: true,
        categoryId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  }),

  getProductById: staffProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { productId } = input;

      if (!productId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product Not Found",
        });
      }

      const product = await db.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          name: true,
          price: true,
          categoryId: true,
          category: true,
          quantity: true,
          sku: true,
          supplierId: true,
          supplier: true,
        },
      });

      return product;
    }),

  updateProduct: staffProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        categoryId: z.string().optional(),
        supplierId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { name, price, productId, quantity, categoryId, supplierId } =
        input;

      if (!productId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product Not Found",
        });
      }

      if (!name || !price || !quantity) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product name, quantity or price is required`,
        });
      }

      const updatedProduct = await db.product.update({
        where: {
          id: productId,
        },
        data: {
          name,
          price,
          quantity,
          categoryId,
          supplierId,
        },
      });

      return updatedProduct;
    }),

  deleteProduct: staffProcedure
    .input(
      z.object({
        productId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { productId } = input;

      if (!productId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product Not Found",
        });
      }

      await db.product.delete({
        where: {
          id: productId,
        },
      });
    }),
});
