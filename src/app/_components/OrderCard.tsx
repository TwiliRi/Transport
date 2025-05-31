"use client";
import { FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaMoneyBillWave, FaSearch, FaUser, FaSync, FaComments, FaBell } from "react-icons/fa";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EditOrderForm from "./EditOrderForm";
import ResponseForm from "./ResponseForm";
import ResponsesList from "./ResponsesList";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import Chat from "./Chat";


interface Order {
    id: string;
    number: string;
    status: 'active' | 'completed' | 'cancelled' | "processing";
    date: string;
    route: {
      from: string;
      to: string;
    };
    price: number;
    cargo: {
      type: string;
      weight: string;
    };
    transportType?: {
      value: string;
      label: string;
    };
    imageUrl?: string; // Добавляем опциональное поле для URL изображения
    description?: string; 
    user?: {
      id: string;
      name: string;
    };
  }

// Компонент скелетона для OrderCard
export function OrderCardSkeleton() {
  return (
    <div className="bg-white border border-gray-400 rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <div className="flex justify-between items-start mb-3">
            <div className="h-6 bg-gray-400 rounded w-32"></div>
            <div className="h-5 bg-gray-400 rounded w-16"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full"></div>
              <div className="h-4 bg-gray-400 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full"></div>
              <div className="h-4 bg-gray-400 rounded w-40"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full"></div>
              <div className="h-4 bg-gray-400 rounded w-32"></div>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 bg-gray-400 rounded-full"></div>
              <div className="h-4 bg-gray-400 rounded w-20"></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-col justify-between gap-4 md:min-w-[150px]">
          <div className="w-full h-10 bg-gray-400 rounded-lg"></div>
          <div className="w-full h-10 bg-gray-400 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export default function OrderCard({ order }: { order: Order }) {
    const [showDetails, setShowDetails] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showResponseForm, setShowResponseForm] = useState(false);
    const [showResponses, setShowResponses] = useState(false);
    const { data: session } = useSession();
    const [isOwner, setIsOwner] = useState(false);
    const [userResponse, setUserResponse] = useState<{ id: string; status: string } | null>(null);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    const [lastCheckedMessageTime, setLastCheckedMessageTime] = useState<Date | null>(null);
    const router = useRouter();
    
    // Добавляем состояние для хранения информации о принятом отклике
    const [acceptedResponse, setAcceptedResponse] = useState<{
      id: string;
      carrierId: string;
      carrierName: string;
      status: string;
    } | null>(null);
    
    // Проверяем, является ли текущий пользователь владельцем заказа
    useEffect(() => {
      if (session && order.user) {
        setIsOwner(session.user.id === order.user.id);
      }
    }, [session, order]);
   
    // Проверяем, откликался ли текущий пользователь на этот заказ
    const { data: responseData } = api.response.getByOrderId.useQuery(
      { orderId: order.id },
      { 
        enabled: !!session && !!order.id && !isOwner,
        refetchInterval: false
      }
    );
    
    // Получаем принятый отклик для заказа (только для владельца заказа)
    const { data: acceptedResponseData } = api.response.getByOrderId.useQuery(
      { orderId: order.id },
      { 
        enabled: !!session && !!order.id && isOwner,
        refetchInterval: false
      }
    );
    
    // Обновляем информацию о принятом отклике
    useEffect(() => {
      if (acceptedResponseData && acceptedResponseData.length > 0) {
        const accepted = acceptedResponseData.find(resp => resp.status === 'accepted');
        if (accepted) {
          setAcceptedResponse({
            id: accepted.id,
            carrierId: accepted.carrierId,
            carrierName: (accepted as any).carrier?.name ?? 'Перевозчик',
            status: accepted.status
          });
        }
      }
    }, [acceptedResponseData]);
    
    // Обновляем информацию об отклике пользователя
    useEffect(() => {
      if (responseData && responseData.length > 0) {
        setUserResponse({
          id: responseData[0]?.id ?? '',
          status: responseData[0]?.status ?? 'pending'
        });
      }
    }, [responseData]);

    // Получаем последние сообщения для проверки новых
    const { data: messagesData } = api.message.getByResponseId.useQuery(
      { responseId: userResponse?.id ?? '' },
      { 
        enabled: !!userResponse?.id && !showResponses,
        refetchInterval: 10000 // Проверяем каждые 10 секунд
      }
    );

    // Проверяем наличие новых сообщений
    useEffect(() => {
      if (messagesData && messagesData.length > 0) {
        const latestMessageTime = new Date(messagesData[0].createdAt);
        
        // Если это первая проверка, запоминаем время последнего сообщения
        if (!lastCheckedMessageTime) {
          setLastCheckedMessageTime(latestMessageTime);
          return;
        }
        
        // Если есть сообщения новее, чем последняя проверка
        if (latestMessageTime > lastCheckedMessageTime) {
          // Проверяем, не от текущего ли пользователя последнее сообщение
          if (messagesData[0].senderId !== session?.user.id) {
            setHasNewMessages(true);
          }
        }
      }
    }, [messagesData, lastCheckedMessageTime, session?.user.id]);

    // Сбрасываем индикатор новых сообщений при открытии чата
    useEffect(() => {
      if (showResponses && hasNewMessages) {
        setHasNewMessages(false);
        if (messagesData && messagesData.length > 0) {
          setLastCheckedMessageTime(new Date(messagesData[0].createdAt));
        }
      }
    }, [showResponses, hasNewMessages, messagesData]);
    
    // Функция для отображения статуса заказа
    // В функции renderStatusBadge добавляем обработку статуса "processing"
    const renderStatusBadge = (status: string) => {
      switch (status) {
        case 'completed':
          return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Завершен</span>;
        case 'active':
          return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Активен</span>;
        case 'processing':
          return <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">Выполняется</span>;
        case 'cancelled':
          return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Отменен</span>;
        default:
          return null;
      }
    };
    
    // Функция для получения названия типа транспорта
    const getTransportTypeName = (typeValue: string) => {
      // Стандартные типы
      const standardTypes: Record<string, string> = {
        'all': 'Любой',
        'truck': 'Грузовик',
        'truck_with_trailer': 'Фура',
        'car': 'Легковой автомобиль',
        'van': 'Микроавтобус',
        'refrigerator': 'Рефрижератор',
        'tanker': 'Автоцистерна',
        'container': 'Контейнеровоз',
        'tow_truck': 'Эвакуатор',
        'dump_truck': 'Самосвал',
        'flatbed': 'Платформа',
        'crane': 'Кран',
        'any': 'Любой тип'
      };
      
      // Если это стандартный тип, возвращаем его название
      if (typeValue in standardTypes) {
        
        return standardTypes[typeValue];
      }
      
      // Если это пользовательский тип, возвращаем его метку
      if (order.transportType?.value === typeValue) {
        return order.transportType.label;
      }
      
      // По умолчанию
      return 'Не указан';
    };
  
    return (
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6">
          
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">Заказ #{order.number}</h3>
              {renderStatusBadge(order.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="flex items-center">
                <FaCalendar className="text-gray-400 mr-2" />
                <span className="text-sm">{order.date}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="text-gray-400 mr-2" />
                <span className="text-sm">{order.route.from} → {order.route.to}</span>
              </div>
              <div className="flex items-center">
                <FaBox className="text-gray-400 mr-2" />
                <span className="text-sm">{getTransportTypeName(order.cargo.type)}, {order.cargo.weight}{" "}кг</span>
              </div>
              <div className="flex items-center">
                <FaMoneyBillWave className="text-gray-400 mr-2" />
                <span className="text-sm">{order.price.toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col justify-between gap-4 md:min-w-[200px]">
            {isOwner ? (
              <>
                <button 
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors min-w-[200px]"
                  onClick={() => setShowEditForm(true)}
                >
                  Редактировать
                </button>
                <button 
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center min-w-[200px]"
                  onClick={() => setShowResponses(!showResponses)}
                >
                  <FaComments className="mr-2" />
                  {showResponses ? "Скрыть отклики" : "Показать отклики"}
                </button>
              </>
            ) : userResponse ? (
              // Если пользователь откликнулся на заказ, показываем кнопку для просмотра чата
              <>
                <button 
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center min-w-[200px] relative"
                  onClick={() => setShowResponses(!showResponses)}
                >
                  <FaComments className="mr-2" />
                  {showResponses ? "Скрыть чат" : "Открыть чат"}
                  
                  {/* Индикатор новых сообщений */}
                  {hasNewMessages && !showResponses && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </button>
                <button 
                  className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors min-w-[200px]"
                  onClick={() => setShowDetails(true)}
                >
                  Подробнее
                </button>
              </>
            ) : (
              order.status === 'cancelled' ? (
                <button 
                  className="w-full px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed min-w-[200px]"
                  disabled
                >
                  Заказ отменен
                </button>
              ) : (
                <button 
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors min-w-[200px]"
                  onClick={() => setShowResponseForm(true)}
                >
                  Откликнуться
                </button>
              )
            )}
            {!userResponse && !isOwner && (
              <button 
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors min-w-[200px]"
                onClick={() => setShowDetails(true)}
              >
                Подробнее
              </button>
            )}
          </div>
        </div>
        
        {/* Отображение списка откликов для владельца заказа */}
        {showResponses && isOwner && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <ResponsesList orderId={order.id} customerId={order.user?.id || ""} />
          </div>
        )}
        
        {/* Отображение чата для перевозчика, который откликнулся на заказ */}
        {showResponses && userResponse && !isOwner && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="mb-4">
              <h4 className="font-medium mb-2">Ваш отклик на заказ</h4>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userResponse.status === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : userResponse.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userResponse.status === 'accepted' 
                    ? 'Принят' 
                    : userResponse.status === 'rejected'
                    ? 'Отклонен'
                    : 'Ожидает ответа'}
                </span>
              </div>
            </div>
            <Chat
              responseId={userResponse.id}
              orderId={order.id}
              carrierId={session?.user.id || ""}
              customerId={order.user?.id || ""}
            />
          </div>
        )}
        
        {/* Форма отклика */}
        {showResponseForm && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Откликнуться на заказ</h4>
              <button 
                onClick={() => setShowResponseForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <ResponseForm 
              orderId={order.id} 
              onSuccess={() => {
                setShowResponseForm(false);
                router.refresh();
              }} 
            />
          </div>
        )}
        
        {/* Модальное окно для деталей заказа */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60  flex items-center justify-center p-4 z-50"
              onClick={() => setShowDetails(false)} // Закрываем по клику на фон
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative"
                onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие по клику на контент модалки
              >
                <button 
                  onClick={() => setShowDetails(false)} 
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
                <h4 className="text-xl font-semibold mb-4">Детали заказа #{order.number}</h4>
                
                {/* Информация о заказчике */}
                {order.user && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-semibold mb-2 flex items-center">
                      <FaUser className="mr-2 text-gray-500" /> Заказчик:
                    </h5>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-700">{order.user.name}</p>
                      <Link 
                        href={`/users/${order.user.id}`}
                        className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md transition-colors"
                      >
                        Профиль
                      </Link>
                    </div>
                  </div>
                )}
                {acceptedResponse && order.status === 'processing' && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-semibold mb-2 flex items-center">
              <FaTruck className="mr-2 text-gray-500" /> Перевозчик:
            </h5>
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{acceptedResponse.carrierName}</p>
              <Link 
                href={`/users/${acceptedResponse.carrierId}`}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md transition-colors"
              >
                Профиль
              </Link>
            </div>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Принят
              </span>
            </div>
          </div>
        )}
                {order.imageUrl && (
                  <div className="mb-4">
                    <img 
                      src={order.imageUrl} 
                      alt="Изображение груза" 
                      className="w-full max-h-[300px] object-contain rounded-lg"
                    />
                  </div>
                )}
                {order.description && (
                  <div className="mb-4">
                    <h5 className="font-semibold mb-1">Описание груза:</h5>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{order.description}</p>
                  </div>
                )}
                {!order.imageUrl && !order.description && !order.user && (
                  <p className="text-sm text-gray-500">Дополнительная информация отсутствует.</p>
                )}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => setShowDetails(false)} 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно для редактирования заказа */}
        <AnimatePresence>
          {showEditForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0  bg-black/60 flex items-center justify-center p-4 z-50"
              onClick={() => setShowEditForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setShowEditForm(false)} 
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
                <h4 className="text-xl font-semibold mb-4">Редактирование заказа #{order.number}</h4>
                
                <EditOrderForm order={order} onClose={() => setShowEditForm(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )}
