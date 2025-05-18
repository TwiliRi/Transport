import { FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaMoneyBillWave, FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";



interface Order {
    id: string;
    number: string;
    status: 'active' | 'completed' | 'cancelled';
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
    description?: string; // Добавляем опциональное поле для описания груза
    user?: {
      id: string;
      name: string;
    };
  }

export default function OrderCard({ order }: { order: Order }) {
    const [showDetails, setShowDetails] = useState(false);
  
    // Функция для отображения статуса заказа
    const renderStatusBadge = (status: string) => {
      switch (status) {
        case 'completed':
          return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Завершен</span>;
        case 'active':
          return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Активен</span>;
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
          
          <div className="flex flex-row md:flex-col justify-between gap-4 md:min-w-[150px]">
            <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Откликнуться
            </button>
            <button 
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={() => setShowDetails(true)} // Открываем модальное окно
            >
              Подробнее
            </button>
          </div>
        </div>
  
        {/* Модальное окно для деталей заказа */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
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
                
                {order.imageUrl && (
                  <div className="mb-4">
                    <img src={order.imageUrl} alt={`Груз для заказа ${order.number}`} className="rounded-lg max-h-60 w-auto mx-auto" />
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
      </div>
    );
  }