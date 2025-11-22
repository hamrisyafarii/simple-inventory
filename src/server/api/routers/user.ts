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
