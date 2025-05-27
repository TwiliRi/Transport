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
    
  getAll: publicProcedure
    .input(z.object({
      vehicleType: z.string().optional(),
      city: z.string().optional(),
      minCapacity: z.number().optional(),
      maxCapacity: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
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
          gte: input.minCapacity, // minCapacity теперь ожидается в кг
        };
      }
      
      if (input?.maxCapacity) {
        whereClause.carryingCapacity = {
          ...whereClause.carryingCapacity,
          lte: input.maxCapacity, // maxCapacity теперь ожидается в кг
        };
      }
      
      if (input?.status) {
        whereClause.status = input.status;
      }
      
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
      });
      
      return transports;
    }),
});