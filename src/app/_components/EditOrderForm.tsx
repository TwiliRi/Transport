"use client";

import { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaBox, FaCalendar, FaMoneyBillWave, FaCamera, FaFileAlt, FaTrash } from "react-icons/fa";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Order {
  id: string;
  number: string;
  status: 'active' | 'completed' | 'cancelled' | "processing" ;
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

interface EditOrderFormProps {
  order: Order;
  onClose: () => void;
}

export default function EditOrderForm({ order, onClose }: EditOrderFormProps) {
  // Получаем данные о текущем пользователе
  const { data: session } = useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    if (session && order.user) {
      setIsAuthorized(session.user.id === order.user.id);
    }
  }, [session, order]);
  // Преобразуем дату из формата DD.MM.YYYY в YYYY-MM-DD для input type="date"
  const formatDateForInput = (dateString: string) => {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  };

  // Состояния для полей формы
  const [routeFrom, setRouteFrom] = useState(order.route.from);
  const [routeTo, setRouteTo] = useState(order.route.to);
  const [cargoType, setCargoType] = useState(order.cargo.type);
  const [cargoWeight, setCargoWeight] = useState(order.cargo.weight);
  const [price, setPrice] = useState(order.price);
  const [date, setDate] = useState(formatDateForInput(order.date));
  const [description, setDescription] = useState(order.description || "");
  const [imageUrl, setImageUrl] = useState(order.imageUrl || "");
  const [status, setStatus] = useState(order.status);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const utils = api.useUtils(); 
  const router = useRouter();
  
  // Мутация для обновления заказа
  const updateOrderMutation = api.order.update.useMutation({
    onSuccess: async () => {
      // Инвалидируем кеш только для конкретного заказа
      await utils.order.getAll.invalidate();
      // Обновляем только те данные, которые относятся к текущему заказу
      utils.order.getAll.setData(undefined, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(item => 
          item.id === order.id ? { ...item, ...order } : item
        );
      });
      
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });
  
  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем авторизацию перед отправкой
    if (!isAuthorized) {
      setError("У вас нет прав на редактирование этого заказа");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    // Преобразуем дату обратно в формат ISO для сохранения
    const formattedDate = date;
    
    updateOrderMutation.mutate({
      id: order.id,
      routeFrom,
      routeTo,
      cargoType,
      cargoWeight,
      price: Number(price),
      date: formattedDate,
      description,
      imageUrl,
      status,
    });
  };
  
  // Список типов грузов
  const cargoTypes = [
    { value: 'truck', label: 'Грузовик' },
    { value: 'truck_with_trailer', label: 'Фура' },
    { value: 'car', label: 'Легковой автомобиль' },
    { value: 'van', label: 'Микроавтобус' },
    { value: 'refrigerator', label: 'Рефрижератор' },
    { value: 'tanker', label: 'Автоцистерна' },
    { value: 'container', label: 'Контейнеровоз' },
    { value: 'tow_truck', label: 'Эвакуатор' },
    { value: 'dump_truck', label: 'Самосвал' },
    { value: 'flatbed', label: 'Платформа' },
    { value: 'crane', label: 'Кран' },
  ];
  
  // Мутация для удаления заказа
  const deleteOrderMutation = api.order.delete.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setIsDeleting(false);
      
      // Обновляем страницу и закрываем форму через 2 секунды
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setIsDeleting(false);
    }
  });
  
  // Обработчик удаления заказа
  const handleDelete = () => {
    // Проверяем авторизацию перед удалением
    if (!isAuthorized) {
      setError("У вас нет прав на удаление этого заказа");
      return;
    }
    
    setIsDeleting(true);
    setError("");
    
    deleteOrderMutation.mutate({
      id: order.id
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md">
          {isDeleting ? "Заказ успешно удален!" : "Заказ успешно обновлен!"}
        </div>
      )}
      
      {!isAuthorized && (
        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-md">
          Внимание! Редактировать заказ может только его создатель.
        </div>
      )}
      
      {/* Остальная часть формы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Откуда
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <input
              type="text"
              value={routeFrom}
              onChange={(e) => setRouteFrom(e.target.value)}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Город отправления"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Куда
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            <input
              type="text"
              value={routeTo}
              onChange={(e) => setRouteTo(e.target.value)}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Город назначения"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип груза
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="text-gray-400" />
            </div>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              {cargoTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вес груза
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBox className="text-gray-400" />
            </div>
            <input
              type="text"
              value={cargoWeight}
              onChange={(e) => setCargoWeight(e.target.value)}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Например: 500кг или 2т"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Стоимость (₽)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMoneyBillWave className="text-gray-400" />
            </div>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Стоимость в рублях"
              min="1"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Дата
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendar className="text-gray-400" />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'cancelled' | "processing")}
              className="w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
            >
              <option value="active">Активен</option>
              <option value="processing">Выполняется</option>
              <option value="completed">Завершен</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL изображения (опционально)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaCamera className="text-gray-400" />
          </div>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="URL изображения"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Описание (опционально)
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FaFileAlt className="text-gray-400" />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="Дополнительная информация о грузе"
            rows={4}
          />
        </div>
      </div>
      
      {/* Добавляем кнопку удаления и модальное окно подтверждения */}
      {isAuthorized && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <FaTrash className="mr-2" /> Удалить заказ
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-600 mb-3">Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-70"
                >
                  {isDeleting ? "Удаление..." : "Да, удалить"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading || !isAuthorized}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
        >
          {isLoading ? "Сохранение..." : "Сохранить изменения"}
        </button>
      </div>
    </form>
  );
}

// Обработчик удаления заказа
// Проверяем, является ли текущий пользователь создателем заказа
