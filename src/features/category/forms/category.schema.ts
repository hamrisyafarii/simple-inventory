import z from "zod";

export const categoryDataSchema = z.object({
  name: z.string({ message: "Name of category required" }),
});

export type CategoryDataSchema = z.infer<typeof categoryDataSchema>;
