import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const transportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Название обязательно"),
      vehicleType: z.string().min(1, "Тип транспорта обязателен"),
      carryingCapacity: z.number().min(100, "Грузоподъемность должна быть больше 100 кг"), // Изменено на кг
      platformLength: z.number().optional(),
      platformWidth: z.number().optional(),
      description: z.string().optional(),
      workPeriod: z.string().min(1, "Период работы обязателен"),
      city: z.string().min(1, "Город обязателен"),
      minOrderTime: z.string().min(1, "Минимальное время заказа обязательно"),
      price: z.string().min(1, "Цена обязательна"),
      driverName: z.string().min(1, "Имя водителя обязательно"),
      phoneNumber: z.string().min(1, "Номер телефона обязателен"),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Необходимо авторизоваться");
      }
      
      const transport = await ctx.db.transport.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
      
      return transport;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1, "Название обязательно"),
      vehicleType: z.string().min(1, "Тип транспорта обязателен"),
      carryingCapacity: z.number().min(100, "Грузоподъемность должна быть больше 100 кг"),
      platformLength: z.number().optional(),
      platformWidth: z.number().optional(),
      description: z.string().optional(),
      workPeriod: z.string().min(1, "Период работы обязателен"),
      city: z.string().min(1, "Город обязателен"),
      minOrderTime: z.string().min(1, "Минимальное время заказа обязательно"),
      price: z.string().min(1, "Цена обязательна"),
      driverName: z.string().min(1, "Имя водителя обязательно"),
      phoneNumber: z.string().min(1, "Номер телефона обязателен"),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Необходимо авторизоваться");
      }

      // Проверяем, что пользователь является владельцем транспорта
      const existingTransport = await ctx.db.transport.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existingTransport) {
        throw new Error("Транспорт не найден");
      }

      if (existingTransport.userId !== ctx.session.user.id) {
        throw new Error("Нет прав для редактирования этого транспорта");
      }

      const { id, ...updateData } = input;
      
      const updatedTransport = await ctx.db.transport.update({
        where: { id },
        data: updateData,
      });
      
      return updatedTransport;
    }),
    
  getAll: publicProcedure
    .input(z.object({
      vehicleType: z.string().optional(),
      city: z.string().optional(),
      minCapacity: z.number().optional(),
      maxCapacity: z.number().optional(),
      status: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ ctx, input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 10;
      const skip = (page - 1) * limit;
      
      const whereClause: any = {};
      
      if (input?.vehicleType && input.vehicleType !== "all") {
        whereClause.vehicleType = input.vehicleType;
      }
      
      if (input?.city) {
        whereClause.city = {
          contains: input.city,
          mode: 'insensitive',
        };
      }
      
      if (input?.minCapacity) {
        whereClause.carryingCapacity = {
          gte: input.minCapacity,
        };
      }
      
      if (input?.maxCapacity) {
        whereClause.carryingCapacity = {
          ...whereClause.carryingCapacity,
          lte: input.maxCapacity,
        };
      }
      
      if (input?.status) {
        whereClause.status = input.status;
      }
      
      // Получаем общее количество записей для пагинации
      const totalCount = await ctx.db.transport.count({
        where: whereClause,
      });
      
      const transports = await ctx.db.transport.findMany({
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
      
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;
      
      return {
        transports,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasMore,
          limit,
        },
      };
    }),

  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new Error("Необходимо авторизоваться");
      }

      // Проверяем, что пользователь является владельцем транспорта
      const existingTransport = await ctx.db.transport.findUnique({
        where: { id: input.id },
        select: { userId: true },
      });

      if (!existingTransport) {
        throw new Error("Транспорт не найден");
      }

      if (existingTransport.userId !== ctx.session.user.id) {
        throw new Error("Нет прав для удаления этого транспорта");
      }

      await ctx.db.transport.delete({
        where: { id: input.id },
      });
      
      return { success: true };
    }),

  getUserTransports: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.session?.user) {
        throw new Error("Необходимо авторизоваться");
      }
      
      const transports = await ctx.db.transport.findMany({
        where: {
          userId: ctx.session.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return transports;
    }),
});