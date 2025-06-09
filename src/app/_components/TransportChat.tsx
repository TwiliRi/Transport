import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { FaSpinner, FaPaperPlane } from "react-icons/fa";
import { api } from "~/trpc/react";
import type { Message } from "~/types"; // Импортируем глобальный тип
interface TransportChatProps {
  transportId: string;
  transportTitle?: string;
  driverName?: string;
}



export default function TransportChat({ 
  transportId, 
  transportTitle = "Транспорт", 
  driverName = "Водитель" 
}: TransportChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Получение сообщений
  const { 
    data: initialMessages, 
    isLoading 
  } = api.message.getTransportMessages.useQuery(
    { transportId },
    { 
      enabled: !!transportId,
      
    }
  );

  // Мутация для создания сообщения
  const createMessageMutation = api.message.createTransportMessage.useMutation({
    onSuccess: (newMsg) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          ...newMsg,
          createdAt: new Date(newMsg.createdAt),
        },
      ]);
      setNewMessage("");
    },
    onError: (err) => {
      setError(`Ошибка при отправке сообщения: ${err.message}`);
    },
  });

  // Установка начальных сообщений
  useEffect(() => {
    if (initialMessages) {
      setMessages(
        initialMessages.map((msg: Message) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [initialMessages]);

  // Настройка SSE для получения новых сообщений
  useEffect(() => {
    if (!transportId || !session) return;

    // Используем правильный формат responseId для SSE
    const sse = new EventSource(`/api/sse?responseId=transport-${transportId}`);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Обрабатываем сообщения
        if (data.type === "messages" && data.data) {
          const newMessages = data.data.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          }));
          
          setMessages((prevMessages) => {
            // Фильтруем дубликаты
            const uniqueMessages = newMessages.filter(
              (newMsg: Message) => !prevMessages.some(prevMsg => prevMsg.id === newMsg.id)
            );
            
            if (uniqueMessages.length === 0) {
              return prevMessages;
            }
            
            return [...prevMessages, ...uniqueMessages].sort((a, b) => 
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
  }, [transportId, session]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isScrolledToBottom = 
        chatContainer.scrollHeight - chatContainer.clientHeight <= 
        chatContainer.scrollTop; // 30px погрешность
        
      if (isScrolledToBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Прокрутка к последнему сообщению при первоначальной загрузке
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [isLoading, messages.length]);

  // Обработчик отправки сообщения
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    createMessageMutation.mutate({
      content: newMessage,
      transportId,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200">
      <div className="p-3 border-b border-gray-200">
        <h4 className="font-medium">Чат по транспорту: {transportTitle}</h4>
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