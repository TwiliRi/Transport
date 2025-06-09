import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaComments, FaUser, FaTruck, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { formatDate } from "~/utils/formatDate";
import PrivateTransportChat from "./PrivateTransportChat";

interface TransportChatsListProps {
  transportId: string;
  onClose: () => void;
}

interface ChatItem {
  id: string;
  transportId: string;
  transportTitle: string;
  transportType: string;
  otherUserName: string | null;
  lastMessage: {
    id: string;
    content: string;
    createdAt: Date;
    senderId: string;
  } | null;
  updatedAt: Date;
}

export default function TransportChatsList({ transportId, onClose }: TransportChatsListProps) {
  const { data: session } = useSession();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);

  // Получение списка чатов пользователя
  const { data: allChats, isLoading, refetch } = api.message.getUserPrivateChats.useQuery();

  // Фильтруем чаты только для данного транспорта
  const transportChats = allChats?.filter((chat: any) => chat.transportId === transportId) || [];

  const handleChatSelect = (chat: ChatItem) => {
    setSelectedChatId(chat.id);
    setSelectedChat(chat);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setSelectedChat(null);
    refetch(); // Обновляем список чатов
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FaSpinner className="animate-spin text-2xl text-gray-500" />
        <span className="ml-2 text-gray-500">Загрузка чатов...</span>
      </div>
    );
  }

  if (selectedChatId && selectedChat) {
    return (
      <div className="h-96">
        <div className="flex items-center mb-4">
          <button
            onClick={handleBackToList}
            className="text-blue-600 hover:text-blue-800 mr-3"
          >
            ← Назад к списку
          </button>
          <h5 className="font-semibold">Чат с {selectedChat.otherUserName}</h5>
        </div>
        <PrivateTransportChat
          transportId={transportId}
          ownerId={session?.user?.id || ""}
          transportTitle={selectedChat.transportTitle}
          existingChatId={selectedChatId}
        />
      </div>
    );
  }

  return (
    <div className="h-96">
      <h4 className="text-xl font-semibold mb-4 flex items-center">
        <FaComments className="mr-2" />
        Чаты по транспорту
      </h4>
      
      {transportChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <FaComments className="text-4xl mb-4" />
          <p>Пока нет чатов по этому транспорту</p>
          <p className="text-sm">Чаты появятся, когда клиенты начнут писать вам</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-x-hidden overflow-y-auto max-h-80">
          {transportChats.map((chat: any) => (
            <motion.div
              key={chat.id}
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleChatSelect(chat)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FaUser className="text-gray-500 mr-2" />
                    <span className="font-medium">{chat.otherUserName || "Неизвестный пользователь"}</span>
                  </div>
                  
                  {chat.lastMessage ? (
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {chat.lastMessage.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(new Date(chat.lastMessage.createdAt))}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Нет сообщений</p>
                  )}
                </div>
                
                <div className="text-right">
                  <FaComments className="text-gray-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}