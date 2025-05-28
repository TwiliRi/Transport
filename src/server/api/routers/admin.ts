import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Middleware для проверки админских прав
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new Error("Необходимо авторизоваться");
  }

  const user = await ctx.db.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new Error("Недостаточно прав доступа");
  }

  return next();
});

export const adminRouter = createTRPCRouter({
  // Получение всех заказов для админа
  getAllOrders: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Получение всего транспорта для админа
  getAllTransports: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.transport.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Получение всех сообщений для админа
  getAllMessages: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.message.findMany({
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        response: {
          include: {
            order: {
              select: {
                id: true,
                number: true,
              },
            },
          },
        },
        privateChat: {
          include: {
            transport: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  // Удаление любого заказа
  deleteOrder: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const deletedOrder = await ctx.db.order.delete({
        where: { id: input.id },
      });
      return deletedOrder;
    }),

  // Удаление любого транспорта
  deleteTransport: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const deletedTransport = await ctx.db.transport.delete({
        where: { id: input.id },
      });
      return deletedTransport;
    }),

  // Удаление любого сообщения
  deleteMessage: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const deletedMessage = await ctx.db.message.delete({
        where: { id: input.id },
      });
      return deletedMessage;
    }),

  // Получение статистики для админа
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [ordersCount, transportsCount, messagesCount, usersCount] = await Promise.all([
      ctx.db.order.count(),
      ctx.db.transport.count(),
      ctx.db.message.count(),
      ctx.db.user.count(),
    ]);

    return {
      orders: ordersCount,
      transports: transportsCount,
      messages: messagesCount,
      users: usersCount,
    };
  }),

  // Редактирование заказа
  updateOrder: adminProcedure
    .input(z.object({
      id: z.string(),
      number: z.string().optional(),
      status: z.string().optional(),
      date: z.string().optional(),
      routeFrom: z.string().optional(),
      routeTo: z.string().optional(),
      price: z.number().optional(),
      cargoType: z.string().optional(),
      cargoWeight: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const updatedOrder = await ctx.db.order.update({
        where: { id },
        data: updateData,
      });
      return updatedOrder;
    }),

  // Редактирование транспорта
  updateTransport: adminProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      vehicleType: z.string().optional(),
      carryingCapacity: z.number().optional(),
      platformLength: z.number().optional(),
      platformWidth: z.number().optional(),
      description: z.string().optional(),
      workPeriod: z.string().optional(),
      city: z.string().optional(),
      minOrderTime: z.string().optional(),
      price: z.string().optional(),
      driverName: z.string().optional(),
      phoneNumber: z.string().optional(),
      imageUrl: z.string().optional(),
      status: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const updatedTransport = await ctx.db.transport.update({
        where: { id },
        data: updateData,
      });
      return updatedTransport;
    }),
    // ... existing code ...

  // Получение всех пользователей для админа
  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userType: true,
        isAdmin: true,
        _count: {
          select: {
            orders: true,
            transports: true,
            messages: true,
          },
        },
      },
    });
  }),

  // Редактирование пользователя
  updateUser: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      userType: z.string().optional(),
      isAdmin: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      // Проверяем уникальность email если он изменяется
      if (updateData.email) {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            email: updateData.email,
            NOT: { id },
          },
        });
        
        if (existingUser) {
          throw new Error("Пользователь с таким email уже существует");
        }
      }
      
      const updatedUser = await ctx.db.user.update({
        where: { id },
        data: updateData,
      });
      return updatedUser;
    }),

  // Удаление пользователя
  deleteUser: adminProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что админ не удаляет сам себя
      if (input.id === ctx.session.user.id) {
        throw new Error("Нельзя удалить самого себя");
      }
      
      const deletedUser = await ctx.db.user.delete({
        where: { id: input.id },
      });
      return deletedUser;
    }),

  // Блокировка/разблокировка пользователя (можно добавить поле isBlocked в схему)
  toggleUserStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      isAdmin: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Проверяем, что админ не снимает права с самого себя
      if (input.id === ctx.session.user.id && !input.isAdmin) {
        throw new Error("Нельзя снять админские права с самого себя");
      }
      
      const updatedUser = await ctx.db.user.update({
        where: { id: input.id },
        data: { isAdmin: input.isAdmin },
      });
      return updatedUser;
    }),


});