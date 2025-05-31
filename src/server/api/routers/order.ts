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
      imageUrl: z.string().optional(), // Добавляем поле для хранения изображения
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
          imageUrl: input.imageUrl, // Сохраняем URL изображения
          userId: ctx.session.user.id,
        },
      });
      
      return order;
    }),
    
  // Добавляем новый метод для получения всех заказов
  // Обновляем метод getAll для поддержки пагинации
  getAll: publicProcedure
    .input(z.object({
      status: z.string().optional(),
      routeFrom: z.string().optional(),
      routeTo: z.string().optional(),
      date: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const skip = (page - 1) * limit;
      
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
      
      // Получаем общее количество заказов для пагинации
      const totalCount = await ctx.db.order.count({
        where: whereClause,
      });
      
      // Получаем заказы с пагинацией
      const orders = await ctx.db.order.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      });
      
      return {
        orders,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      };
    }),
  
  // Добавляем новый метод для обновления заказа
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      routeFrom: z.string().min(1, "Поле 'Откуда' обязательно"),
      routeTo: z.string().min(1, "Поле 'Куда' обязательно"),
      cargoType: z.string().min(1, "Тип груза обязателен"),
      cargoWeight: z.string().min(1, "Вес груза обязателен"),
      price: z.number().min(1, "Стоимость должна быть больше 0"),
      date: z.string().min(1, "Дата обязательна"),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      status: z.enum(['active', 'processing', 'completed', 'cancelled']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что пользователь авторизован
      if (!ctx.session || !ctx.session.user) {
        throw new Error("Необходимо авторизоваться");
      }
      
      // Находим заказ по ID
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
      });
      
      // Проверяем, что заказ существует и принадлежит текущему пользователю
      if (!order) {
        throw new Error("Заказ не найден");
      }
      
      if (order.userId !== ctx.session.user.id) {
        throw new Error("У вас нет прав на редактирование этого заказа");
      }
      
      // Обновляем заказ в базе данных
      const updatedOrder = await ctx.db.order.update({
        where: { id: input.id },
        data: {
          status: input.status,
          date: input.date,
          routeFrom: input.routeFrom,
          routeTo: input.routeTo,
          price: input.price,
          cargoType: input.cargoType,
          cargoWeight: input.cargoWeight,
          description: input.description,
          imageUrl: input.imageUrl,
        },
      });
      
      return updatedOrder;
    }),
  
  // Добавляем новый метод для удаления заказа
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что пользователь авторизован
      if (!ctx.session || !ctx.session.user) {
        throw new Error("Необходимо авторизоваться");
      }
      
      // Находим заказ по ID
      const order = await ctx.db.order.findUnique({
        where: { id: input.id },
      });
      
      // Проверяем, что заказ существует и принадлежит текущему пользователю
      if (!order) {
        throw new Error("Заказ не найден");
      }
      
      if (order.userId !== ctx.session.user.id) {
        throw new Error("У вас нет прав на удаление этого заказа");
      }
      
      // Удаляем заказ из базы данных
      const deletedOrder = await ctx.db.order.delete({
        where: { id: input.id },
      });
      
      return deletedOrder;
    }),
    
});

  // Метод для infinite query - добавить перед закрывающей скобкой (строка 202)
  
