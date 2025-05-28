import { postRouter } from "~/server/api/routers/post";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { authRouter } from "~/server/api/routers/auth";
import { orderRouter } from "~/server/api/routers/order";
import { responseRouter } from "~/server/api/routers/response";
import { messageRouter } from "~/server/api/routers/message";
import { transportRouter } from "~/server/api/routers/transport";
import { adminRouter } from "~/server/api/routers/admin";
import { historyRouter } from "./routers/history";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  auth: authRouter,
  order: orderRouter,
  response: responseRouter,
  message: messageRouter,
  transport: transportRouter,
  admin: adminRouter,
  history:historyRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
