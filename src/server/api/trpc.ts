/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { getAuth } from "@clerk/nextjs/server";
import type { Role, User } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = {
  session: ReturnType<typeof getAuth>;
};

// Definisikan tipe konteks dasar
type TRPCContext = {
  session: CreateContextOptions["session"];
  db: typeof db;
};

// Definisikan tipe konteks yang sudah memiliki user
// Ini adalah tipe yang kita harapkan ada di dalam middleware enforceUserHasRole
type TRPCContextWithUser = TRPCContext & {
  user: User;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = (opts: CreateContextOptions): TRPCContext => {
  return {
    session: opts.session,
    db,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = (opts: CreateNextContextOptions) => {
  const { req } = opts;

  const session = getAuth(req);

  return createInnerTRPCContext({
    session,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

// Inisialisasi tRPC dengan tipe konteks dasar
const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

const enforceUserIsExist = t.middleware(async ({ ctx, next }) => {
  const { db, session } = ctx;

  // cari user diDatabase
  const user = await db.user.findUnique({
    where: {
      clerkId: session.userId!,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User tidak ditemukan, silahkan logout dan login kembali !",
    });
  }

  // ini untuk menambahkan objek user ke ctx diprocedure berikutnya
  return next({
    ctx: {
      user,
    },
  });
});

// Middleware yang menerima daftar role yang di izinkan
// Gunakan type assertion untuk memecah masalah inferensi
const enforceUserHasRole = (allowedRoles: Role[]) =>
  t.middleware(async ({ ctx, next }) => {
    // ==========================================
    // PERHATIKAN PERUBAHAN KRUSIAL DI SINI
    // ==========================================
    // Kita beri tahu TypeScript bahwa 'ctx' di sini adalah TRPCContextWithUser
    // Ini aman karena middleware ini hanya akan dipanggil setelah enforceUserIsExist
    const contextWithUser = ctx as TRPCContextWithUser;

    if (!contextWithUser.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // Sekarang TypeScript tahu contextWithUser.user.role adalah tipe 'Role', bukan 'any'
    if (!allowedRoles.includes(contextWithUser.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Anda tidak memiliki izin. Role yang diizinkan: ${allowedRoles.join(", ")}`,
      });
    }

    return next();
  });

// ===================== ini untuk procedure nya ========================
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { session } = ctx;

  if (!session.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
    });
  }

  return next({
    ctx: {
      session: { ...ctx.session },
    },
  });
});

export const userProcedure = protectedProcedure.use(enforceUserIsExist);

export const publicProcedure = t.procedure.use(timingMiddleware);

export const adminProcedure = userProcedure.use(enforceUserHasRole(["ADMIN"]));

export const staffProcedure = userProcedure.use(
  enforceUserHasRole(["ADMIN", "STAFF"]),
);
