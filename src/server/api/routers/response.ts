import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const responseRouter = createTRPCRouter({
  // Получение откликов по ID заказа
  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Если orderId === "all", возвращаем все отклики пользователя
      if (input.orderId === "all") {
        const responses = await ctx.db.response.findMany({
          where: {
            carrierId: ctx.session.user.id
          },
          orderBy: {
            createdAt: "desc",
          },
          include: {
            carrier: {
              select: {
                id: true,
                name: true,
              },
            },
            order: {
              select: {
                userId: true,
                number: true,
                routeFrom: true,
                routeTo: true,
              },
            },
          },
        });
  
        return responses;
      }
  
      // Иначе продолжаем как обычно
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: { userId: true },
      });
  
      if (!order) {
        throw new Error("Заказ не найден");
      }
  
      // Проверяем, что пользователь имеет доступ к этим откликам
      // (либо владелец заказа, либо перевозчик, который откликнулся)
      const responses = await ctx.db.response.findMany({
        where: {
          orderId: input.orderId,
          OR: [
            { order: { userId: ctx.session.user.id } },
            { carrierId: ctx.session.user.id }
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          carrier: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              userId: true,
              number: true,
              routeFrom: true,
              routeTo: true,
            },
          },
        },
      });
  
      return responses;
    }),

  // Создание нового отклика
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
      });

      if (!order) {
        throw new Error("Заказ не найден");
      }

      // Проверяем, что пользователь не является владельцем заказа
      if (order.userId === ctx.session.user.id) {
        throw new Error("Вы не можете откликнуться на свой собственный заказ");
      }

      // Проверяем, что пользователь еще не откликался на этот заказ
      const existingResponse = await ctx.db.response.findFirst({
        where: {
          orderId: input.orderId,
          carrierId: ctx.session.user.id,
        },
      });

      if (existingResponse) {
        throw new Error("Вы уже откликнулись на этот заказ");
      }

      // Создаем отклик
      const response = await ctx.db.response.create({
        data: {
          message: input.message,
          orderId: input.orderId,
          carrierId: ctx.session.user.id,
        },
      });

      return response;
    }),

  // Обновление статуса отклика
  updateStatus: protectedProcedure
    .input(
      z.object({
        responseId: z.string(),
        status: z.enum(["accepted", "rejected"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.db.response.findUnique({
        where: { id: input.responseId },
        include: {
          order: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!response) {
        throw new Error("Отклик не найден");
      }

      // Проверяем, что пользователь является владельцем заказа
      if (response.order.userId !== ctx.session.user.id) {
        throw new Error("У вас нет прав для изменения статуса этого отклика");
      }

      // Обновляем статус отклика
      const updatedResponse = await ctx.db.response.update({
        where: { id: input.responseId },
        data: {
          status: input.status,
        },
      });

      return updatedResponse;
    }),

  // Получение обновлений для отклика (для SSE)
  getUpdates: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        select: { userId: true },
      });

      if (!order) {
        throw new Error("Заказ не найден");
      }

      // Проверяем, что пользователь имеет доступ к этим откликам
      const responses = await ctx.db.response.findMany({
        where: {
          orderId: input.orderId,
          OR: [
            { order: { userId: ctx.session.user.id } },
            { carrierId: ctx.session.user.id }
          ],
        },
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          carrier: {
            select: {
              id: true,
              name: true,
            },
          },
          order: {
            select: {
              userId: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });

      return responses.map(response => ({
        id: response.id,
        status: response.status,
        carrierId: response.carrierId,
        carrierName: response.carrier.name,
        updatedAt: response.updatedAt,
        lastMessage: response.messages[0] || null
      }));
    }),

  // Удаление отклика
  deleteResponse: protectedProcedure
    .input(z.object({ responseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const response = await ctx.db.response.findUnique({
        where: { id: input.responseId },
        include: {
          order: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!response) {
        throw new Error("Отклик не найден");
      }

      // Проверяем, что пользователь является владельцем отклика (перевозчиком)
      if (response.carrierId !== ctx.session.user.id) {
        throw new Error("У вас нет прав для удаления этого отклика");
      }

      // Проверяем, что отклик не был принят
      if (response.status === "accepted") {
        throw new Error("Нельзя удалить принятый отклик");
      }

      // Удаляем связанные сообщения
      await ctx.db.message.deleteMany({
        where: { responseId: input.responseId },
      });

      // Удаляем отклик
      await ctx.db.response.delete({
        where: { id: input.responseId },
      });

      return { success: true };
    }),
});