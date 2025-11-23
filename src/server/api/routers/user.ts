import z from "zod";
import { adminProcedure, createTRPCRouter, userProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });

    return users;
  }),

  updateDataUser: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: z.enum(["ADMIN", "STAFF", "VIEWER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { role, userId } = input;

      const updateUser = await db.user.update({
        where: {
          id: userId,
        },
        data: {
          role,
        },
      });

      return updateUser;
    }),

  getUserData: userProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const user = await db.user.findUnique({
      where: {
        clerkId: session.userId!,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return user;
  }),
});
