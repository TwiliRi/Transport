"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { FaSpinner, FaPaperPlane } from "react-icons/fa";

interface ChatProps {
  responseId: string;
  orderId: string;
  carrierId: string;
  customerId: string;
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string;
}

export default function Chat({ responseId, orderId, carrierId, customerId }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

   
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Мутация для отправки сообщения
  const createMessageMutation = api.message.create.useMutation({
    onSuccess: (data) => {
      setNewMessage("");
      // Не добавляем сообщение здесь, оно придет через SSE
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  // Получаем начальные сообщения
  const { data: initialMessages, isLoading } = api.message.getByResponseId.useQuery(
    { responseId },
    {
      enabled: !!responseId && !!session,
      refetchOnWindowFocus: false,
      staleTime: 60000, // Данные считаются свежими в течение 1 минуты
    }
  );

  // Устанавливаем начальные сообщения
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      // Сортируем сообщения по времени создания (от старых к новым)
      const sortedMessages = [...initialMessages].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      setMessages(sortedMessages.map((msg: Message) => ({
        ...msg,
        senderName: msg.senderName ?? ''
      })));
    
      setLoading(false);
    } else if (initialMessages) {
      setLoading(false);
    }
  }, [initialMessages]);

  // Настраиваем SSE соединение
  useEffect(() => {
    if (!responseId || !session) return;

    // Создаем EventSource для SSE
    const sse = new EventSource(`/api/sse?responseId=${responseId}`);

    // Обработчик получения сообщений
    // В обработчике SSE сообщений
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "messages" && data.data.length > 0) {
          // Добавляем проверку на кэшированные данные
          if (data.cached && messages.length > 0) {
            // Если данные из кэша и у нас уже есть сообщения, не обновляем
            return;
          }
          
          setMessages(prevMessages => {
            // Фильтруем только новые сообщения, которых еще нет в списке
            const existingIds = new Set(prevMessages.map(msg => msg.id));
            const newMsgs = data.data.filter((msg: Message) => !existingIds.has(msg.id));
            
            if (newMsgs.length === 0) return prevMessages;
            
            // Объединяем существующие и новые сообщения
            return [...prevMessages, ...newMsgs].sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          });
        }
      } catch (error) {
        console.error("Ошибка при обработке SSE сообщения:", error);
      }
    };

    // Обработчики событий
    sse.onerror = (error) => {
      console.error("SSE ошибка:", error);
      sse.close();
    };

    

    // Очистка при размонтировании
    return () => {
      sse.close();
    };
  }, [responseId, session]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isScrolledToBottom = 
        chatContainer.scrollHeight - chatContainer.clientHeight <= 
        chatContainer.scrollTop; // 30px погрешность
        
      if (isScrolledToBottom) {
        // Вместо scrollIntoView используем scrollTop
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Прокрутка к последнему сообщению при первоначальной загрузке
  useEffect(() => {
    if (!loading && !isLoading && messages.length > 0) {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [loading, isLoading, messages.length]);

  // Обработчик отправки сообщения
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    createMessageMutation.mutate({
      content: newMessage,
      responseId,
    });
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ru", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h4 className="font-medium">Чат с пользователем</h4>
      </div>
      
      <div 
        ref={chatContainerRef} 
        className="h-64 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Нет сообщений. Начните общение!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-blue-100 text-blue-900"
                      : "bg-gray-200 text-gray-900"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {message.senderName} • {formatDate(message.createdAt)}
                  </div>
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
        {error && (
          <div className="p-2 mb-2 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            type="submit"
            disabled={createMessageMutation.isPending || !newMessage.trim()}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center"
          >
            {createMessageMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}