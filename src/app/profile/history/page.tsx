'use client';

import { useState, useEffect } from "react";
import { FaCalendar, FaMapMarkerAlt, FaTruck, FaBox, FaMoneyBillWave } from "react-icons/fa";
import { api } from "~/trpc/react";

// Типы для истории активности
type ActivityType = "" | "order" | "transport" | "response" | "message" | "chat" | undefined;
type TimeFilter = 'week' | 'month' | 'year' | '';

interface Activity {
  id: string;
  type: 'order' | 'transport' | 'response' | 'message' | 'chat'; // Исправлено: убрал 'shipment' и 'payment', добавил правильные типы
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

  // Функция для отображения иконки в зависимости от типа активности
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <FaBox className="text-blue-600 text-xs" />
          </div>
        );
      case 'shipment':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <FaTruck className="text-green-600 text-xs" />
          </div>
        );
      case 'payment':
        return (
          <div className="absolute -left-11 mt-1.5 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <FaMoneyBillWave className="text-yellow-600 text-xs" />
          </div>
        );
      default:
        return null;
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
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <span className="text-sm">{activity.details.description}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{activity.details.description}</span>
                    {activity.details.status && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {activity.details.status}
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