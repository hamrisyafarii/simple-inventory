import z from "zod";

export const transactionDataSchema = z.object({
  typeTransaction: z.enum(["IN", "OUT"]),
  productId: z.string().uuid(),
  quantity: z.coerce.number(),
  note: z.string().optional(),
});

export type TransactionDataSchema = z.infer<typeof transactionDataSchema>;
