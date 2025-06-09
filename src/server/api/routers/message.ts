import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Message } from "~/types";

// Простой кэш для сообщений
const messageCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // Увеличиваем до 60 секунд

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
      const formattedMessages = messages.map((message:Message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: message.senderName,
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
      return messages.map((message:Message) => ({
        id: message.id,
        content: message.content,
        createdAt: message.createdAt,
        senderId: message.senderId,
        senderName: message.senderName,
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

    getTransportMessages: protectedProcedure
  .input(z.object({ transportId: z.string() }))
  .query(async ({ ctx, input }) => {
    // Проверяем существование транспорта
    const transport = await ctx.db.transport.findUnique({
      where: { id: input.transportId },
    });

    if (!transport) {
      throw new Error("Транспорт не найден");
    }

    // Получаем сообщения для транспортного чата
    const messages = await ctx.db.message.findMany({
      where: {
        chatType: "transport",
        chatId: input.transportId,
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return messages.map((message:Message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.senderName,
    }));
  }),

// Создание сообщения для транспортного чата
createTransportMessage: protectedProcedure
  .input(
    z.object({
      content: z.string().min(1),
      transportId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    // Проверяем существование транспорта в таблице transport
    const transport = await ctx.db.transport.findUnique({
      where: { id: input.transportId },
      select: { 
        userId: true,
        id: true 
      }
    });

    // Проверяем, что транспорт существует
    if (!transport) {
      throw new Error("Транспорт не найден");
    }

    // Проверяем, что пользователь имеет доступ к этому чату
    // (владелец транспорта или любой авторизованный пользователь может писать)
    // Здесь можно добавить дополнительную логику проверки доступа при необходимости

    // Создаем сообщение
    const message = await ctx.db.message.create({
      data: {
        content: input.content,
        senderId: ctx.session.user.id,
        chatType: "transport",
        chatId: input.transportId,
      },
      include: {
        sender: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.sender.name,
    };
  }),

  getOrCreatePrivateChat: protectedProcedure
  .input(z.object({ 
    transportId: z.string(),
    ownerId: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    const clientId = ctx.session.user.id;
    
    // Проверяем, что клиент не является владельцем транспорта
    if (clientId === input.ownerId) {
      throw new Error("Нельзя создать чат с самим собой");
    }
    
    // Ищем существующий чат
    let chat = await ctx.db.privateChat.findUnique({
      where: {
        transportId_ownerId_clientId: {
          transportId: input.transportId,
          ownerId: input.ownerId,
          clientId: clientId
        }
      }
    });
    
    // Если чата нет, создаем новый
    if (!chat) {
      chat = await ctx.db.privateChat.create({
        data: {
          transportId: input.transportId,
          ownerId: input.ownerId,
          clientId: clientId
        }
      });
    }
    
    return chat;
  }),

// Получение сообщений приватного чата
getPrivateChatMessages: protectedProcedure
  .input(z.object({ chatId: z.string() }))
  .query(async ({ ctx, input }) => {
    // Проверяем доступ к чату
    const chat = await ctx.db.privateChat.findUnique({
      where: { id: input.chatId }
    });
    
    if (!chat) {
      throw new Error("Чат не найден");
    }
    
    // Проверяем, что пользователь участник чата
    if (chat.ownerId !== ctx.session.user.id && chat.clientId !== ctx.session.user.id) {
      throw new Error("Нет доступа к этому чату");
    }
    
    const messages = await ctx.db.message.findMany({
      where: {
        privateChatId: input.chatId
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });
    
    return messages.map((message:Message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.senderName
    }));
  }),

// Создание сообщения в приватном чате
createPrivateChatMessage: protectedProcedure
  .input(z.object({
    chatId: z.string(),
    content: z.string().min(1)
  }))
  .mutation(async ({ ctx, input }) => {
    // Проверяем доступ к чату
    const chat = await ctx.db.privateChat.findUnique({
      where: { id: input.chatId }
    });
    
    if (!chat) {
      throw new Error("Чат не найден");
    }
    
    // Проверяем, что пользователь участник чата
    if (chat.ownerId !== ctx.session.user.id && chat.clientId !== ctx.session.user.id) {
      throw new Error("Нет доступа к этому чату");
    }
    
    const message = await ctx.db.message.create({
      data: {
        content: input.content,
        senderId: ctx.session.user.id,
        privateChatId: input.chatId
      },
      include: {
        sender: {
          select: {
            name: true
          }
        }
      }
    });
    
    return {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: message.sender.name
    };
  }),

// Получение списка приватных чатов пользователя
  getUserPrivateChats: protectedProcedure
  .query(async ({ ctx }) => {
    const chats = await ctx.db.privateChat.findMany({
      where: {
        OR: [
          { ownerId: ctx.session.user.id },
          { clientId: ctx.session.user.id }
        ]
      },
      include: {
        transport: {
          select: {
            title: true,
            vehicleType: true
          }
        },
        owner: {
          select: {
            name: true
          }
        },
        client: {
          select: {
            name: true
          }
        },
        messages: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
    
    return chats.map((chat) => ({
      id: chat.id,
      transportId: chat.transportId,
      updatedAt: chat.updatedAt
    }));
  }),


});