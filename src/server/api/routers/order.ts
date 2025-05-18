import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      routeFrom: z.string().min(1, "Поле 'Откуда' обязательно"),
      routeTo: z.string().min(1, "Поле 'Куда' обязательно"),
      cargoType: z.string().min(1, "Тип груза обязателен"),
      cargoWeight: z.string().min(1, "Вес груза обязателен"),
      price: z.number().min(1, "Стоимость должна быть больше 0"),
      date: z.string().min(1, "Дата обязательна"),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что пользователь авторизован
      if (!ctx.session || !ctx.session.user) {
        throw new Error("Необходимо авторизоваться");
      }
      
      // Создаем новый заказ в базе данных
      const order = await ctx.db.order.create({
        data: {
          number: `${Math.floor(Math.random() * 90000) + 10000}`, // Генерируем случайный номер заказа
          status: 'active',
          date: input.date,
          routeFrom: input.routeFrom,
          routeTo: input.routeTo,
          price: input.price,
          cargoType: input.cargoType,
          cargoWeight: input.cargoWeight,
          description: input.description,
          userId: ctx.session.user.id,
        },
      });
      
      return order;
    }),
    
  // Добавляем новый метод для получения всех заказов
  getAll: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      routeFrom: z.string().optional(),
      routeTo: z.string().optional(),
      date: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      // Создаем базовый запрос
      const whereClause: any = {};
      
      // Добавляем фильтры, если они указаны
      if (input?.status) {
        whereClause.status = input.status;
      }
      
      if (input?.routeFrom) {
        whereClause.routeFrom = {
          contains: input.routeFrom,
          mode: 'insensitive',
        };
      }
      
      if (input?.routeTo) {
        whereClause.routeTo = {
          contains: input.routeTo,
          mode: 'insensitive',
        };
      }
      
      if (input?.date) {
        whereClause.date = input.date;
      }
      
      // Получаем все заказы из базы данных без фильтрации
      const orders = await ctx.db.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return orders;
    }),
});