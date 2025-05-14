import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
      },
    });
    
    return user;
  }),
  
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1, "Имя обязательно"),
      email: z.string().email("Некорректный email"),
      phone: z.string().optional(),
      userType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, email, phone, userType } = input;
      
      // Проверяем, не занят ли email другим пользователем
      if (email !== ctx.session.user.email) {
        const existingUser = await ctx.db.user.findUnique({
          where: { email },
        });
        
        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new Error("Этот email уже используется");
        }
      }
      
      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          name,
          email,
          phone,
          userType,
        },
      });
      
      return updatedUser;
    }),

  // Добавляем новую процедуру для получения публичного профиля
  getPublicProfile: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: {
          id: true,
          name: true,
          userType: true,
          // Добавьте другие публичные поля, которые нужно показывать
        },
      });

      if (!user) {
        throw new Error("Пользователь не найден");
      }

      return user;
    }),
});