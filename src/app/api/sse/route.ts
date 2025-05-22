import { NextRequest } from "next/server";
import { db } from "~/server/db";

// Кэш для последних сообщений
const lastMessageTimestamps = new Map<string, Date>();

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
          // Получаем только новые сообщения с момента последней проверки
          const messages = await db.message.findMany({
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

          if (messages.length > 0) {
            // Обновляем timestamp последнего сообщения
            lastTimestamp = messages[messages.length - 1]?.createdAt ?? lastTimestamp;
            lastMessageTimestamps.set(responseId, lastTimestamp);
            
            // Отправляем только новые сообщения клиенту
            sendMessage({ 
              type: "messages", 
              data: messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                createdAt: msg.createdAt,
                senderId: msg.senderId,
                senderName: msg.sender.name,
              }))
            });
          }
        } catch (error) {
          console.error("Ошибка при получении сообщений:", error);
          sendMessage({ type: "error", message: "Ошибка при получении сообщений" });
        }
      }, 7000); // Проверяем каждые 7 секунды

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