"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { FaSpinner, FaPaperPlane } from "react-icons/fa";
import { api } from "~/trpc/react";
import { formatDate } from "~/utils/formatDate";

interface PrivateTransportChatProps {
  transportId: string;
  ownerId: string;
  transportTitle?: string;
  existingChatId?: string; // Добавляем новый проп
}
interface Message {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
    senderName: string | null;
  }
export default function PrivateTransportChat({ 
  transportId, 
  ownerId,
  transportTitle = "Транспорт",
  existingChatId // Добавляем новый проп
}: PrivateTransportChatProps) {
  const { data: session } = useSession();
  

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Создаем или получаем приватный чат
  const createChatMutation = api.message.getOrCreatePrivateChat.useMutation({
    onSuccess: (chat) => {
      setChatId(chat.id);
    },
    onError: (err) => {
      setError(`Ошибка создания чата: ${err.message}`);
    }
  });

  // Получение сообщений чата
  const { 
    data: initialMessages, 
    isLoading 
  } = api.message.getPrivateChatMessages.useQuery(
    { chatId: chatId! },
    { 
      enabled: !!chatId
    }
  );

  // Мутация для создания сообщения
  const createMessageMutation = api.message.createPrivateChatMessage.useMutation({
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

  // Инициализация чата
  useEffect(() => {
    if (existingChatId) {
      // Если передан существующий chatId, используем его
      setChatId(existingChatId);
    } else if (transportId && ownerId && session) {
      // Иначе создаем новый чат
      createChatMutation.mutate({ transportId, ownerId });
    }
  }, [transportId, ownerId, session, existingChatId]);

  // Установка начальных сообщений
  useEffect(() => {
    if (initialMessages) {
      setMessages(
        initialMessages.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [initialMessages]);

  // Настройка SSE для получения новых сообщений
  useEffect(() => {
    if (!chatId || !session) return;

    const sse = new EventSource(`/api/sse?responseId=private-chat-${chatId}`);

    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "messages" && data.data) {
          const newMessages = data.data.map((msg: any) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          }));
          
          setMessages((prevMessages) => {
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
        console.error("Ошибка обработки SSE:", error);
      }
    };

    sse.onerror = (error) => {
      console.error("SSE ошибка:", error);
      sse.close();
    };

    return () => {
      sse.close();
    };
  }, [chatId, session]);

  // Автоскролл
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const isNearBottom = 
        chatContainer.scrollHeight - chatContainer.clientHeight <=
        chatContainer.scrollTop + 30;
      
      if (isNearBottom) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [isLoading, messages.length]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatId) return;

    createMessageMutation.mutate({
      chatId,
      content: newMessage,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!session) {
    return (
      <div className="p-4 text-center text-gray-500">
        Войдите в систему для использования чата
      </div>
    );
  }

  return (
    <div className="flex flex-col h-96 border border-gray-300 rounded-lg bg-white">
      {/* Заголовок чата */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-800">
          Приватный чат: {transportTitle}
        </h3>
      </div>

      {/* Область сообщений */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Начните общение!
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === session?.user.id;
            
            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1">
                    {message.senderName} • {formatDate(message.createdAt)}
                  </div>
                  <p className="whitespace-pre-line">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        
        {isLoading && (
          <div className="flex justify-center py-4">
            <FaSpinner className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Поле ввода */}
      <div className="p-3 border-t border-gray-200">
        {error && (
          <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            className="flex-1 p-2 border border-gray-300 rounded-md resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={createMessageMutation.isPending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {createMessageMutation.isPending ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}