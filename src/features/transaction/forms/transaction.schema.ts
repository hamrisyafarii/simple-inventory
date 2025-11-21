import z from "zod";

export const transactionDataSchema = z.object({
  typeTransaction: z.enum(["IN", "OUT"]),
  productId: z.string({ message: "Product transaction is required" }).uuid(),
  quantity: z.coerce.number({ message: "Quantity transaction is required" }),
  note: z.string().optional(),
});

export type TransactionDataSchema = z.infer<typeof transactionDataSchema>;
