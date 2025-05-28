import { NextRequest } from "next/server";
import { db } from "~/server/db";

// Кэш для последних сообщений и данных
const lastMessageTimestamps = new Map<string, Date>();
const messagesCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 30000; // 30 секунд

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const responseId = searchParams.get("responseId");
  
  if (!responseId) {
    return new Response("Отсутствует ID отклика", { status: 400 });
  }

  // Создаем поток для SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Функция для отправки сообщений в поток
      function sendMessage(data: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // Отправляем начальное сообщение для подтверждения соединения
      sendMessage({ type: "connected" });

      // Получаем последний известный timestamp для этого чата
      let lastTimestamp = lastMessageTimestamps.get(responseId) || new Date(0);

      // Настраиваем интервал для проверки новых сообщений
      const intervalId = setInterval(async () => {
        try {
          // Проверяем кэш
          const cacheKey = `sse:${responseId}`;
          const cachedData = messagesCache.get(cacheKey);
          const now = Date.now();
          
          // Если данные в кэше и они не устарели, используем их
          if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
            // Отправляем только если есть сообщения
            if (cachedData.data.length > 0) {
              sendMessage({ 
                type: "messages", 
                data: cachedData.data,
                cached: true
              });
            }
            return;
          }
          
          // Получаем только новые сообщения с момента последней проверки
          let messages;
          
          // Проверяем тип чата по responseId
          if (responseId.startsWith('private-chat-')) {
            const chatId = responseId.replace('private-chat-', '');
            
            messages = await db.message.findMany({
              where: {
                privateChatId: chatId,
                createdAt: {
                  gt: lastTimestamp
                }
              },
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
          } else if (responseId.startsWith('transport-')) {
            // Существующая логика для транспортных чатов
            const transportId = responseId.replace('transport-', '');
            
            messages = await db.message.findMany({
              where: {
                chatType: "transport",
                chatId: transportId,
                createdAt: {
                  gt: lastTimestamp
                }
              },
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
          } else {
            // Существующая логика для чатов заказов
            messages = await db.message.findMany({
              where: {
                responseId: responseId,
                createdAt: {
                  gt: lastTimestamp
                }
              },
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
          }

          if (messages.length > 0) {
            // Обновляем timestamp последнего сообщения
            lastTimestamp = messages[messages.length - 1]?.createdAt ?? lastTimestamp;
            lastMessageTimestamps.set(responseId, lastTimestamp);
            
            // Форматируем сообщения
            const formattedMessages = messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              createdAt: msg.createdAt,
              senderId: msg.senderId,
              senderName: msg.sender.name,
            }));
            
            // Сохраняем в кэш
            messagesCache.set(cacheKey, {
              data: formattedMessages,
              timestamp: now
            });
            
            // Отправляем только новые сообщения клиенту
            sendMessage({ 
              type: "messages", 
              data: formattedMessages
            });
          }
        } catch (error) {
          console.error("Ошибка при получении сообщений:", error);
          sendMessage({ type: "error", message: "Ошибка при получении сообщений" });
        }
      }, 7000); // Проверяем каждые 7 секунд

      // Обработка закрытия соединения
      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    }
  });

  // Возвращаем поток как ответ с соответствующими заголовками для SSE
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}