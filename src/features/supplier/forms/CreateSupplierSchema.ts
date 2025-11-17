import z from "zod";

export const supplierDataSchema = z.object({
  name: z.string({ message: "Name of supplier must be required" }),
  contact: z.string().optional(),
  address: z.string().optional(),
});

export type SupplierDataSchema = z.infer<typeof supplierDataSchema>;
