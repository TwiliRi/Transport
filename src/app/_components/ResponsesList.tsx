"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { FaSpinner, FaCheck, FaTimes, FaComments } from "react-icons/fa";
import Chat from "./Chat";

interface Response {
  id: string;
  status: string;
  message: string;
  createdAt: Date;
  carrierId: string;
  orderId: string;
  customerId: string;
}

interface ResponsesListProps {
  orderId: string;
  customerId: string;
}

export default function ResponsesList({ orderId, customerId }: ResponsesListProps) {
  const { data: session } = useSession();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  
  // Проверяем, является ли пользователь владельцем заказа
  const isOwner = session?.user.id === customerId;
  
  // Получаем отклики на заказ
  const { data: responsesData, isLoading, refetch } = api.response.getByOrderId.useQuery(
    { orderId },
    {
      enabled: !!orderId,
      refetchInterval: 10000, // Обновляем каждые 10 секунд
    }
  );
  
  // Мутации для принятия/отклонения отклика
  const acceptResponseMutation = api.response.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const rejectResponseMutation = api.response.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  // Добавьте этот тип в начало файла после импортов
 
  
  // Обновляем отклики при получении новых данных
  useEffect(() => {
    if (responsesData) {
      setResponses(responsesData.map((response): Response => ({
        id: response.id,
        status: response.status,
        message: response.message ?? '',
        createdAt: response.createdAt,
        carrierId: response.carrierId,
        orderId: response.orderId,
        customerId: customerId
      })));
      setLoading(false);
    }
  }, [responsesData]);
  
  // Обработчики принятия/отклонения отклика
  const handleAcceptResponse = (responseId: string) => {
    acceptResponseMutation.mutate({
      responseId: responseId,
      status: "accepted",
    });
  };
  
  const handleRejectResponse = (responseId: string) => {
    rejectResponseMutation.mutate({
      responseId: responseId,
      status: "rejected",
    });
  };
  
  // Обработчик открытия/закрытия чата
  const toggleChat = (responseId: string) => {
    setActiveChat(activeChat === responseId ? null : responseId);
  };
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
      </div>
    );
  }
  
  if (responses.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Пока нет откликов на этот заказ</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Отклики на заказ ({responses.length})</h3>
      
      {responses.map((response) => (
        <div key={response.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-500">
                {new Date(response.createdAt).toLocaleDateString()} в{" "}
                {new Date(response.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              {response.status === "pending" ? (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Ожидает ответа
                </span>
              ) : response.status === "accepted" ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Принят
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Отклонен
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <p className="whitespace-pre-line">{response.message}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => toggleChat(response.id)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <FaComments className="mr-1" />
              {activeChat === response.id ? "Скрыть чат" : "Открыть чат"}
            </button>
            
            {isOwner && response.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptResponse(response.id)}
                  className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200"
                >
                  <FaCheck className="mr-1" /> Принять
                </button>
                <button
                  onClick={() => handleRejectResponse(response.id)}
                  className="flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                >
                  <FaTimes className="mr-1" /> Отклонить
                </button>
              </div>
            )}
          </div>
          
          {activeChat === response.id && (
            <div className="mt-4">
              <Chat
                responseId={response.id}
                orderId={orderId}
                carrierId={response.carrierId}
                customerId={customerId}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}