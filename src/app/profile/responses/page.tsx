'use client';

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { FaComments, FaSpinner, FaExclamationCircle, FaCheck, FaTimes, FaTrash } from "react-icons/fa";
import Chat from "../../_components/Chat";
import Link from "next/link";

interface Response {
  id: string;
  status: string;
  message: string;
  createdAt: Date;
  orderId: string;
  carrierId: string;
  carrierName: string;
  customerId: string;
  orderNumber: string;
  orderRoute: {
    from: string;
    to: string;
  };
}

export default function ResponsesPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [deletingResponse, setDeletingResponse] = useState<string | null>(null);
  
  // Получаем все отклики пользователя
  const { data: responsesData, isLoading, refetch } = api.response.getByOrderId.useQuery(
    { orderId: "all" },
    {
      enabled: sessionStatus === "authenticated",
      refetchInterval: 10000, // Обновляем каждые 10 секунд
    }
  );
  
  // Мутация для удаления отклика
  const deleteResponseMutation = api.response.deleteResponse.useMutation({
    onSuccess: () => {
      refetch(); // Обновляем список откликов после удаления
      setDeletingResponse(null);
    },
  });
  
  // Обработчик удаления отклика
  const handleDeleteResponse = (responseId: string) => {
    if (confirm("Вы уверены, что хотите удалить этот отклик?")) {
      setDeletingResponse(responseId);
      deleteResponseMutation.mutate({ responseId });
    }
  };
  
  // Обновляем отклики при получении новых данных
  useEffect(() => {
    if (responsesData) {
      setResponses(responsesData.map((response: any) => ({
        id: response.id,
        status: response.status,
        message: response.message ?? '',
        createdAt: response.createdAt,
        orderId: response.orderId,
        carrierId: response.carrierId,
        carrierName: response.carrier.name ?? '',
        customerId: response.order.userId,
        orderNumber: response.order.number ?? '',
        orderRoute: {
          from: response.order.routeFrom ?? '',
          to: response.order.routeTo ?? ''
        }
      })));
      setLoading(false);
    }
  }, [responsesData]);
  
  // Обработчик открытия/закрытия чата
  const toggleChat = (responseId: string) => {
    setActiveChat(activeChat === responseId ? null : responseId);
  };
  
  if (sessionStatus === "loading" || loading || isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <FaSpinner className="animate-spin text-2xl text-gray-400" />
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FaExclamationCircle className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Необходимо авторизоваться для просмотра откликов</p>
          <Link href="/api/auth/signin" className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }
  
  if (responses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Мои отклики</h2>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">У вас пока нет откликов на заказы</p>
          <Link href="/search" className="mt-3 inline-block text-black hover:underline">
            Найти заказы
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Мои отклики</h2>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Всего откликов: {responses.length}</p>
      </div>
      
      <div className="space-y-6">
        {responses.map((response) => (
          <div key={response.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium">Заказ #{response.orderNumber}</h4>
                <p className="text-sm text-gray-500">
                  {response.orderRoute.from} → {response.orderRoute.to}
                </p>
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
            
            <div className="mb-3">
              <p className="text-sm">{response.message}</p>
            </div>
            
            <div className="flex justify-between items-center">
              {response.status !== "accepted" && (
                <button
                  onClick={() => handleDeleteResponse(response.id)}
                  disabled={deletingResponse === response.id}
                  className="flex items-center text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash className="mr-1" />
                  {deletingResponse === response.id ? "Удаление..." : "Удалить отклик"}
                </button>
              )}
              
              {response.status !== "rejected" && (
                <button
                  onClick={() => toggleChat(response.id)}
                  className="flex items-center text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-md hover:bg-blue-200 transition-colors"
                >
                  <FaComments className="mr-1" />
                  {activeChat === response.id ? "Скрыть чат" : "Открыть чат"}
                </button>
              )}
            </div>
            
            {activeChat === response.id && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <Chat
                  responseId={response.id}
                  orderId={response.orderId}
                  carrierId={session.user.id}
                  customerId={response.customerId}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}