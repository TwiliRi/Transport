'use client';

import { useState, useEffect } from "react";
import { FaTruck, FaCalendar, FaMapMarkerAlt, FaBox, FaMoneyBillWave, FaEdit, FaTrash, FaClock, FaWeight, FaRuler, FaUser, FaPhone } from "react-icons/fa";
import EditTransportForm from "~/app/_components/EditTransportForm";
import { api } from "~/trpc/react";

// Типы для транспорта
type TransportStatus = 'active' | 'inactive' | '';
type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | '';

interface Transport {
  id: string;
  title: string;
  vehicleType: string;
  carryingCapacity: number;
  platformLength?: number | null;
  platformWidth?: number | null;
  description?: string | null;
  workPeriod: string;
  city: string;
  minOrderTime: string;
  price: string;
  driverName: string;
  phoneNumber: string;
  imageUrl?: string | null;
  status: string;
  createdAt: Date;
  
}


const getVehicleTypeName = (typeValue: string) => {
  const standardTypes: Record<string, string> = {
    all: "Любой",
    truck: "Грузовик",
    truck_with_trailer: "Фура",
    car: "Легковой автомобиль",
    van: "Микроавтобус",
    refrigerator: "Рефрижератор",
    tanker: "Автоцистерна",
    container: "Контейнеровоз",
    tow_truck: "Эвакуатор",
    dump_truck: "Самосвал",
    flatbed: "Платформа",
    crane: "Кран",
    any: "Любой тип",
  };

  if (typeValue in standardTypes) {
    return standardTypes[typeValue];
  }

  return "Не указан";
};

export default function ShipmentsPage() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  
  // Состояния для фильтров и сортировки
  const [statusFilter, setStatusFilter] = useState<TransportStatus>('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  
  
  // Состояния для модального окна редактирования
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transport | null>(null);

  // Получаем транспорт пользователя
  const { data: transports = [], isLoading, refetch } = api.transport.getUserTransports.useQuery();

  // Обработчики изменения фильтров
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as TransportStatus);
  };
  const handleEditTransport = (transport: Transport) => {
    setEditingTransport(transport);
    setShowEditModal(true);
  };
  
  // Функция для закрытия модального окна редактирования
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingTransport(null);
    refetch(); // Обновляем данные после закрытия модального окна
  };
  
  // Функция для удаления транспорта (если нужна)
  const deleteTransportMutation = api.transport.delete.useMutation({
    onSuccess: () => {
      void refetch();
      setConfirmDeleteId(null); // Сбросить состояние подтверждения после успешного удаления
    },
    onError: (error) => {
      console.error('Ошибка при удалении транспорта:', error);
      alert('Ошибка при удалении транспорта');
      setConfirmDeleteId(null); // Сбросить состояние подтверждения в случае ошибки
    },
  });

  // ... existing code ...

  const handleDeleteTransport = (transportId: string) => {
    if (confirmDeleteId === transportId) {
      // Если уже нажали один раз, удаляем
      deleteTransportMutation.mutate({ id: transportId });
    } else {
      // В первый раз просим подтверждение
      setConfirmDeleteId(transportId);
      // Можно добавить таймер для сброса confirmDeleteId через несколько секунд
      setTimeout(() => {
        setConfirmDeleteId(null);
      }, 3000); // Сбросить через 3 секунды, если не подтверждено
    }
  };
  const handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Применение фильтров и сортировки при их изменении
  

  // Функция для отображения статуса транспорта
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Активно</span>;
      case 'inactive':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Неактивно</span>;
      default:
        return null;
    }
  };

  // Функция для форматирования даты
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Мои машины</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Мои машины</h2>
      
      
      
      {/* Список транспорта */}
      <div className="space-y-6">
        {transports.length > 0 ? (
          transports.map((transport: Transport) => (
            <div key={transport.id} className="mx-auto flex w-full max-w-[1366px] justify-between space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md max-[700px]:flex-col max-[700px]:items-center sm:p-6">
              {/* Левая часть - иконка вместо изображения */}
              <div className="flex-shrink-0">
                
               
              </div>
              
              {/* Центральная часть - основная информация */}
              <div className="flex-grow">
                
                
                <div className="flex gap-3 max-[940px]:grid max-[940px]:grid-cols-2 max-[700px]:grid-cols-1">
                  <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
                    <FaTruck className="mr-1 inline" />{" "}
                    {getVehicleTypeName(transport.vehicleType)}
                  </p>
                  <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
                    <FaMoneyBillWave className="mr-1 inline" /> {transport.price} ₽
                  </p>
                  <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
                    <FaClock className="mr-1 inline" /> Минимум{" "}
                    {transport.minOrderTime}ч.
                  </p>
                </div>
                
                <div className="mt-4">
                  <div className="flex text-sm text-gray-800">
                    <div className="w-48">
                      <FaWeight className="mr-1 inline" /> Грузоподъёмность, кг
                    </div>
                    <div>- {transport.carryingCapacity}</div>
                  </div>
                  {transport.platformLength && (
                    <div className="flex text-sm text-gray-800">
                      <div className="w-48">
                        <FaRuler className="mr-1 inline" /> Длина платформы, м
                      </div>
                      <div>- {transport.platformLength}</div>
                    </div>
                  )}
                  {transport.platformWidth && (
                    <div className="flex text-sm text-gray-800">
                      <div className="w-48">
                        <FaRuler className="mr-1 inline" /> Ширина платформы, м
                      </div>
                      <div>- {transport.platformWidth}</div>
                    </div>
                  )}
                 
                  {transport.description && (
                    <div className="mt-2 text-sm text-gray-500">
                      {transport.description}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Правая часть - действия и дополнительная информация */}
              <div className="flex max-w-[400px] flex-col items-end justify-between max-[700px]:w-full max-[700px]:items-center max-[700px]:gap-7 max-[700px]:text-center">
                <div className="text-sm text-gray-500">
                  <FaCalendar className="mr-1 inline" /> {transport.workPeriod}
                </div>
                
                <div className="flex flex-col justify-center space-y-2 max-[700px]:w-full max-[700px]:items-center">
                  <button
                    className="w-full min-w-[200px] rounded bg-black px-4 py-2 whitespace-nowrap text-white hover:bg-gray-800 flex items-center justify-center"
                    onClick={() => handleEditTransport(transport)}
                  >
                    <FaEdit className="mr-2" />
                    Редактировать
                  </button>
                  
                  <button
                  onClick={() => handleDeleteTransport(transport.id)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${confirmDeleteId === transport.id ? 'bg-red-500 text-white hover:bg-red-600' : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}`}
                >
                    <FaTrash className="mr-2" />
                    Удалить
                  </button>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  <FaMapMarkerAlt className="mr-1 inline" /> {transport.city}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">У вас пока нет размещенных машин</p>
            <p className="text-sm text-gray-400 mt-2">Перейдите в раздел &ldquo;Разместить транспорт&ldquo; чтобы добавить свою машину</p>
          </div>
        )}
      </div>
      
      {/* Модальное окно редактирования */}
      {showEditModal && editingTransport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white">
            <EditTransportForm 
              transport={editingTransport} 
              onClose={handleCloseEditModal} 
            />
          </div>
        </div>
      )}
    </div>
  );
}


// Функция для обработки редактирования транспорта

