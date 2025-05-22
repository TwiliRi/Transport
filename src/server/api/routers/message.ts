import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Простой кэш для сообщений
const messageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 секунд

export const messageRouter = createTRPCRouter({
  // Получение сообщений по ID отклика
  getByResponseId: protectedProcedure
    .input(z.object({ responseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Проверяем кэш
      const cacheKey = `messages:${input.responseId}`;
      const cachedData = messageCache.get(cacheKey);
      
      // Если данные в кэше и они не устарели, возвращаем их
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        return cachedData.data;
      }
      
      // Иначе делаем запрос к БД
      const messages = await ctx.db.message.findMany({
        where: {
          responseId: input.responseId,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      // Форматируем данные
      const formattedMessages = messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: message.sender.name,
      }));
      
      // Сохраняем в кэш
      messageCache.set(cacheKey, {
        data: formattedMessages,
        timestamp: Date.now(),
      });
      
      return formattedMessages;
    }),

  // Получение последних сообщений по ID отклика
  getLatestByResponseId: protectedProcedure
    .input(z.object({ 
      responseId: z.string(),
      lastMessageId: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
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

      // Проверяем, что пользователь имеет доступ к этому чату
      if (!response) {
        throw new Error("Отклик не найден");
      }

      // Пользователь должен быть либо заказчиком, либо перевозчиком
      if (
        response.carrierId !== ctx.session.user.id &&
        response.order.userId !== ctx.session.user.id
      ) {
        throw new Error("У вас нет доступа к этому чату");
      }

      // Формируем условие для поиска новых сообщений
      const whereCondition: any = {
        responseId: input.responseId,
      };

      // Если указан ID последнего сообщения, получаем только новые
      if (input.lastMessageId) {
        whereCondition.id = {
          not: input.lastMessageId,
        };
        
        // Получаем дату последнего сообщения
        const lastMessage = await ctx.db.message.findUnique({
          where: { id: input.lastMessageId },
          select: { createdAt: true },
        });
        
        if (lastMessage) {
          whereCondition.createdAt = {
            gt: lastMessage.createdAt,
          };
        }
      }

      // Получаем сообщения
      const messages = await ctx.db.message.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: "asc",
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Форматируем сообщения для фронтенда
      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: message.sender.name,
      }));
    }),

  // Создание нового сообщения
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        responseId: z.string(),
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

      // Проверяем, что отклик существует
      if (!response) {
        throw new Error("Отклик не найден");
      }

      // Проверяем, что пользователь имеет доступ к этому чату
      if (
        response.carrierId !== ctx.session.user.id &&
        response.order.userId !== ctx.session.user.id
      ) {
        throw new Error("У вас нет доступа к этому чату");
      }

      // Создаем сообщение
      const message = await ctx.db.message.create({
        data: {
          content: input.content,
          responseId: input.responseId,
          senderId: ctx.session.user.id,
        },
      });

      return message;
    }),
});