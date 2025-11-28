import z from "zod";

export const userDataSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
});

export type UserDataSchema = z.infer<typeof userDataSchema>;
