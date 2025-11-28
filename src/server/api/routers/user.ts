import z from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  staffProcedure,
  userProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getAllUsers: staffProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
      orderBy: {
        createdAt: "desc",
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

      if (!userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found, please try again latter",
        });
      }

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
