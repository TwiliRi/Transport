'use client';

import { useState, useEffect } from "react";
import { FaCalendar, FaMapMarkerAlt, FaTruck, FaBox, FaMoneyBillWave, FaComments, FaReply, FaEnvelope } from "react-icons/fa";
import { api } from "~/trpc/react";

// Типы для истории активности
type ActivityType = "" | "order" | "transport" | "response" | "message" | "chat" | undefined;
type TimeFilter = 'week' | 'month' | 'year' | '';

interface Activity {
  id: string;
  type: 'order' | 'transport' | 'response' | 'message' | 'chat';
  date: string;
  time: string;
  title: string;
  details: {
    route?: {
      from: string;
      to: string;
    };
    price?: number;
    cargo?: {
      type: string;
      weight: string;
    };
    status?: string;
    description?: string;
  };
}

export default function HistoryPage() {
  // Состояния для фильтров
  const [typeFilter, setTypeFilter] = useState<ActivityType>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('');

  // Получаем историю активности через tRPC
  const { data: activities = [], isLoading, error } = api.history.getUserActivity.useQuery({
    typeFilter: typeFilter || undefined,
    timeFilter: timeFilter || undefined,
  });

  // Обработчики изменения фильтров
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as ActivityType);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value as TimeFilter);
  };

  // Карта для перевода статусов на русский
  const statusMap: { [key: string]: string } = {
    pending: 'В ожидании',
    completed: 'Завершено',
    cancelled: 'Отменено',
    active: 'Активно',
    new: 'Новое',
    read: 'Прочитано',
    unread: 'Непрочитано',
    delivered: 'Доставлено',
    in_progress: 'В процессе',
    accepted: 'Принято',
    rejected: 'Отклонено'
  };

  // Функция для отображения иконки в зависимости от типа активности
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <FaBox className="text-blue-600 text-xs" />
          </div>
        );
      case 'transport':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <FaTruck className="text-green-600 text-xs" />
          </div>
        );
      case 'response':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <FaReply className="text-purple-600 text-xs" />
          </div>
        );
      case 'message':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <FaEnvelope className="text-orange-600 text-xs" />
          </div>
        );
      case 'chat':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <FaComments className="text-red-600 text-xs" />
          </div>
        );
      default:
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
            <FaCalendar className="text-gray-600 text-xs" />
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">История активности</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">История активности</h2>
        <div className="text-center py-8">
          <p className="text-red-500">Ошибка загрузки истории: {error.message}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">История активности</h2>
      
      {/* Фильтры */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          className="block w-full md:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="">Все типы</option>
          <option value="order">Заказы</option>
          <option value="transport">Перевозки</option>
          <option value="response">Отклики</option>
          <option value="message">Сообщения</option>
          <option value="chat">Чаты</option>
        </select>

        <select
          className="block w-full md:w-auto p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          value={timeFilter}
          onChange={handleTimeFilterChange}
        >
          <option value="">За все время</option>
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
          <option value="year">За год</option>
        </select>
      </div>
      
      {/* Временная шкала */}
      <div className="relative border-l border-gray-200 ml-3 pl-8 space-y-10">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="relative">
              {renderActivityIcon(activity.type)}
              <time className="mb-1 text-sm font-normal leading-none text-gray-500">{activity.date}, {activity.time}</time>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{activity.title}</h3>
              
              <div className="border border-gray-200 rounded-lg p-4 mt-2 hover:shadow-sm transition-shadow">
                
                {activity.type === 'order' || activity.type === 'transport' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activity.details.route && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <span className="text-sm">{activity.details.route.from} → {activity.details.route.to}</span>
                      </div>
                    )}
                    {activity.details.price && (
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-gray-400 mr-2" />
                        <span className="text-sm">{activity.details.price.toLocaleString()} ₽</span>
                      </div>
                    )}
                    {activity.details.cargo && (
                      <div className="flex items-center">
                        <FaBox className="text-gray-400 mr-2" />
                        <span className="text-sm">{activity.details.cargo.type}, {activity.details.cargo.weight}</span>
                      </div>
                    )}
                    {activity.details.description && (
                      <div className="flex items-center col-span-full">
                        <FaCalendar className="text-gray-400 mr-2" />
                        <span className="text-sm">{activity.details.description}</span>
                      </div>
                    )}
                    {activity.details.status && (
                      <div className="flex items-center justify-end col-span-full">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {statusMap[activity.details.status] || activity.details.status}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{activity.details.description}</span>
                    {activity.details.status && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {statusMap[activity.details.status] || activity.details.status}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">История не найдена</p>
          </div>
        )}
      </div>
    </div>
  );
}