'use client';

import { useState, useEffect } from "react";
import { FaTruck, FaCalendar, FaMapMarkerAlt, FaBox, FaMoneyBillWave } from "react-icons/fa";

// Типы для перевозок
type ShipmentStatus = 'active' | 'completed' | 'cancelled' | 'processing' | '';
type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | '';

interface Shipment {
  id: string;
  number: string;
  status: 'active' | 'completed' | 'cancelled' | "processing";
  date: string;
  vehicleType: string;
  vehicleCapacity: string;
  route: {
    from: string;
    to: string;
  };
  price: number;
  cargo: {
    type: string;
    weight: string;
  };
}

export default function ShipmentsPage() {
  // Состояния для фильтров и сортировки
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus>('');
  const [sortOption, setSortOption] = useState<SortOption>('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);

  // Пример данных о перевозках
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API
    const mockShipments: Shipment[] = [
      {
        id: '1',
        number: '78901',
        status: 'completed',
        date: '15.05.2025',
        vehicleType: 'Газель',
        vehicleCapacity: '1.5т',
        route: {
          from: 'Москва',
          to: 'Санкт-Петербург'
        },
        price: 15000,
        cargo: {
          type: 'Мебель',
          weight: '1.2т'
        }
      },
      {
        id: '2',
        number: '78902',
        status: 'active',
        date: '18.05.2025',
        vehicleType: 'Фура',
        vehicleCapacity: '20т',
        route: {
          from: 'Санкт-Петербург',
          to: 'Казань'
        },
        price: 45000,
        cargo: {
          type: 'Стройматериалы',
          weight: '18т'
        }
      },
      {
        id: '3',
        number: '78903',
        status: 'cancelled',
        date: '10.05.2025',
        vehicleType: 'Газель',
        vehicleCapacity: '1.5т',
        route: {
          from: 'Москва',
          to: 'Нижний Новгород'
        },
        price: 12000,
        cargo: {
          type: 'Электроника',
          weight: '0.8т'
        }
      }
    ];
    
    setShipments(mockShipments);
    setFilteredShipments(mockShipments);
  }, []);

  // Обработчики изменения фильтров
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as ShipmentStatus);
  };

  const handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Применение фильтров и сортировки при их изменении
  useEffect(() => {
    let result = [...shipments];
    
    // Применяем фильтр по статусу
    if (statusFilter) {
      result = result.filter(shipment => shipment.status === statusFilter);
    }
    
    // Применяем сортировку
    if (sortOption) {
      result.sort((a, b) => {
        switch (sortOption) {
          case 'date-desc':
            // Преобразуем даты для корректного сравнения
            return new Date(b.date.split('.').reverse().join('-')).getTime() - 
                   new Date(a.date.split('.').reverse().join('-')).getTime();
          case 'date-asc':
            return new Date(a.date.split('.').reverse().join('-')).getTime() - 
                   new Date(b.date.split('.').reverse().join('-')).getTime();
          case 'price-desc':
            return b.price - a.price;
          case 'price-asc':
            return a.price - b.price;
          default:
            return 0;
        }
      });
    }
    
    setFilteredShipments(result);
  }, [statusFilter, sortOption, shipments]);

  // Функция для отображения статуса перевозки
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Завершена</span>;
      case 'active':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">В пути</span>;
      case 'cancelled':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Отменена</span>;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Мои перевозки</h2>
      
      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="completed">Завершенные</option>
          <option value="cancelled">Отмененные</option>
        </select>
        
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
          value={sortOption}
          onChange={handleSortOptionChange}
        >
          <option value="">Сортировка</option>
          <option value="date-desc">Сначала новые</option>
          <option value="date-asc">Сначала старые</option>
          <option value="price-desc">По цене (убыв.)</option>
          <option value="price-asc">По цене (возр.)</option>
        </select>
      </div>
      
      {/* Список перевозок */}
      <div className="space-y-4">
        {filteredShipments.length > 0 ? (
          filteredShipments.map((shipment) => (
            <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold">Перевозка #{shipment.number}</h3>
                {renderStatusBadge(shipment.status)}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center">
                  <FaCalendar className="text-gray-400 mr-2" />
                  <span className="text-sm">{shipment.date}</span>
                </div>
                <div className="flex items-center">
                  <FaTruck className="text-gray-400 mr-2" />
                  <span className="text-sm">{shipment.vehicleType}, {shipment.vehicleCapacity}</span>
                </div>
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-gray-400 mr-2" />
                  <span className="text-sm">{shipment.route.from} → {shipment.route.to}</span>
                </div>
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-gray-400 mr-2" />
                  <span className="text-sm">{shipment.price.toLocaleString()} ₽</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center">
                  <FaBox className="text-gray-400 mr-2" />
                  <span className="text-sm">{shipment.cargo.type}, {shipment.cargo.weight}</span>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Подробнее</button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Перевозки не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}