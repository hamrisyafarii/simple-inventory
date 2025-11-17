import z from "zod";

// ========== CREATE PRODUCT SCHEMA ==========

export const productDataSchema = z.object({
  name: z.string({ message: "Name of product must be required" }),
  quantity: z.coerce.number({
    message: "Quantity of product must be required",
  }),
  price: z.coerce.number({ message: "Price of product must be required" }),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

export type ProductDataSchema = z.infer<typeof productDataSchema>;

// ========== UPDATE PRODUCT SCHEMA ==========
export const updateDataProduct = z.object({
  name: z.string().min(1, "Name of product required"),
  quantity: z.coerce.number(),
  price: z.coerce.number(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
});

export type UpdateDataProduct = z.infer<typeof updateDataProduct>;
