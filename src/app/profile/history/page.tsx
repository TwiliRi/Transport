'use client';

import { useState, useEffect } from "react";
import { FaCalendar, FaMapMarkerAlt, FaTruck, FaBox, FaMoneyBillWave } from "react-icons/fa";

// Типы для истории активности
type ActivityType = 'order' | 'shipment' | 'payment' | '';
type TimeFilter = 'week' | 'month' | 'year' | '';

interface Activity {
  id: string;
  type: 'order' | 'shipment' | 'payment';
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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  // Пример данных об активности
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'order',
        date: '15 мая 2025',
        time: '14:30',
        title: 'Заказ #12345 создан',
        details: {
          route: {
            from: 'Москва',
            to: 'Санкт-Петербург'
          },
          price: 15000
        }
      },
      {
        id: '2',
        type: 'shipment',
        date: '12 мая 2025',
        time: '09:15',
        title: 'Перевозка #78901 завершена',
        details: {
          route: {
            from: 'Москва',
            to: 'Санкт-Петербург'
          },
          cargo: {
            type: 'Мебель',
            weight: '1.2т'
          }
        }
      },
      {
        id: '3',
        type: 'payment',
        date: '10 мая 2025',
        time: '16:45',
        title: 'Получен платеж за перевозку #78901',
        details: {
          price: 15000,
          status: 'Успешно'
        }
      },
      {
        id: '4',
        type: 'order',
        date: '5 мая 2025',
        time: '10:20',
        title: 'Заказ #12344 отменен',
        details: {
          route: {
            from: 'Москва',
            to: 'Казань'
          },
          price: 25000
        }
      }
    ];
    
    setActivities(mockActivities);
    setFilteredActivities(mockActivities);
  }, []);

  // Обработчики изменения фильтров
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value as ActivityType);
  };

  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeFilter(e.target.value as TimeFilter);
  };

  // Применение фильтров при их изменении
  useEffect(() => {
    let result = [...activities];
    
    // Применяем фильтр по типу активности
    if (typeFilter) {
      result = result.filter(activity => activity.type === typeFilter);
    }
    
    // Применяем фильтр по времени
    if (timeFilter) {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (timeFilter) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      // Преобразуем строковые даты в объекты Date для сравнения
      // Формат даты: "15 мая 2025"
      result = result.filter(activity => {
        const [day, month, year] = activity.date.split(' ');
        const monthMap: Record<string, number> = {
          'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
          'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
        };
        const activityDate = new Date(parseInt(year), monthMap[month], parseInt(day));
        return activityDate >= cutoffDate;
      });
    }
    
    setFilteredActivities(result);
  }, [typeFilter, timeFilter, activities]);

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
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">История активности</h2>
      
      {/* Фильтры */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={typeFilter}
          onChange={handleTypeFilterChange}
        >
          <option value="">Все типы</option>
          <option value="order">Заказы</option>
          <option value="shipment">Перевозки</option>
          <option value="payment">Платежи</option>
        </select>
        
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={timeFilter}
          onChange={handleTimeFilterChange}
        >
          <option value="">За всё время</option>
          <option value="week">За неделю</option>
          <option value="month">За месяц</option>
          <option value="year">За год</option>
        </select>
      </div>
      
      {/* Временная шкала */}
      <div className="relative border-l border-gray-200 ml-3 pl-8 space-y-10">
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="relative">
              {renderActivityIcon(activity.type)}
              <time className="mb-1 text-sm font-normal leading-none text-gray-500">{activity.date}, {activity.time}</time>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">{activity.title}</h3>
              
              <div className="border border-gray-200 rounded-lg p-4 mt-2 hover:shadow-sm transition-shadow">
                {activity.type === 'order' || activity.type === 'shipment' ? (
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
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Сумма: {activity.details.price?.toLocaleString()} ₽</span>
                    {activity.details.status && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {activity.details.status}
                      </span>
                    )}
                  </div>
                )}
                
                {(activity.type === 'order' || activity.type === 'shipment') && (
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-3">Подробнее</button>
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