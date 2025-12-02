import z from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  staffProcedure,
  userProcedure,
} from "../trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";

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

  deleteUserByAdmin: adminProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { userId } = input;

      const user = await db.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          clerkId: true,
          email: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found, please try again latter",
        });
      }

      try {
        const clerk = await clerkClient();

        await clerk.users.deleteUser(user.clerkId);

        await db.user.delete({
          where: { id: userId },
        });

        return { success: true, email: user.email };
      } catch (error) {
        console.error("Error deleting user from Clerk:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user from Clerk",
        });
      }
    }),
});
