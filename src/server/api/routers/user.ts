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
        createdAt: true,
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

  // Добавляем метод для получения публичных заказов пользователя
  getPublicOrders: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const orders = await ctx.db.order.findMany({
        where: { 
          userId: input.userId,
          status: 'active' // Показываем только активные заказы
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10, // Ограничиваем количество
        select: {
          id: true,
          number: true,
          status: true,
          routeFrom: true,
          routeTo: true,
          cargoType: true,
          cargoWeight: true,
          price: true,
          date: true,
          createdAt: true,
        },
      });

      return orders;
    }),

  // Добавляем метод для получения публичного транспорта пользователя
  getPublicTransports: publicProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const transports = await ctx.db.transport.findMany({
        where: { 
          userId: input.userId,
          status: 'active' // Показываем только активный транспорт
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10, // Ограничиваем количество
        select: {
          id: true,
          title: true,
          vehicleType: true,
          carryingCapacity: true,
          city: true,
          price: true,
          workPeriod: true,
          createdAt: true,
          imageUrl: true,
        },
      });

      return transports;
    }),
});