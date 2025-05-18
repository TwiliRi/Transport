"use client";

import { useState, useEffect } from "react";
import { FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaMoneyBillWave, FaSearch, FaUser } from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react"; // Добавляем импорт API
import SearchForm from "../_components/SearchForm";
import CreateForm from "../_components/CreateForm";
import OrderCard from "../_components/OrderCard";

// Типы для грузов
type OrderStatus = 'active' | 'completed' | 'cancelled' | '';
type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'route-from' | 'route-to' | '';

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

export default function Load() {
  const [currentPage, setCurrentPage] = useState("load");
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus>('');
  const [sortOption, setSortOption] = useState<SortOption>('');
  const [routeFromFilter, setRouteFromFilter] = useState('');
  const [routeToFilter, setRouteToFilter] = useState('');
  const [minWeightFilter, setMinWeightFilter] = useState<number | null>(null);
  const [maxWeightFilter, setMaxWeightFilter] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState(true);
  const [transportTypeFilter, setTransportTypeFilter] = useState<string>("all");

  // Загружаем пользовательские типы транспорта из localStorage только на стороне клиента
  

  // Используем tRPC для получения заказов из базы данных
  const { data: dbOrders, isLoading: isOrdersLoading } = api.order.getAll.useQuery(
    {
      status: statusFilter || undefined,
      routeFrom: routeFromFilter || undefined,
      routeTo: routeToFilter || undefined,
      date: dateFilter || undefined,
    },
    {
      // Обновляем данные при изменении фильтров
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  // Преобразуем данные из базы в формат для отображения
  useEffect(() => {
    if (dbOrders) {
      const formattedOrders: Order[] = dbOrders.map(order => ({
        id: order.id,
        number: order.number,
        status: order.status as 'active' | 'completed' | 'cancelled',
        date: formatDate(order.date), // Преобразуем дату в нужный формат
        route: {
          from: order.routeFrom,
          to: order.routeTo,
        },
        price: order.price,
        cargo: {
          type: order.cargoType,
          weight: order.cargoWeight,
        },
        description: order.description || undefined,
        user: order.user ? {
          id: order.user.id,
          name: order.user.name || "Неизвестный пользователь"
        } : undefined
      }));
      
      setOrders(formattedOrders);
      setIsLoading(false);
    }
  }, [dbOrders]);

  // Функция для форматирования даты из ISO в формат DD.MM.YYYY
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Применение фильтров и сортировки при их изменении
  useEffect(() => {
    let result = [...orders];

    // Применяем фильтр по дате
    if (dateFilter) {
      result = result.filter(order => {
        // Преобразуем дату заказа в формат YYYY-MM-DD для сравнения
        const orderDateParts = order.date.split('.');
        const formattedOrderDate = `${orderDateParts[2]}-${orderDateParts[1]}-${orderDateParts[0]}`;
        return formattedOrderDate === dateFilter;
      });
    }
    
    // Применяем фильтр по статусу
    if (statusFilter) {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Применяем фильтр по маршруту (откуда)
    if (routeFromFilter) {
      result = result.filter(order => 
        order.route.from.toLowerCase().includes(routeFromFilter.toLowerCase())
      );
    }
    
    // Применяем фильтр по маршруту (куда)
    if (routeToFilter) {
      result = result.filter(order => 
        order.route.to.toLowerCase().includes(routeToFilter.toLowerCase())
      );
    }

    // Применяем фильтр по весу
    if (minWeightFilter !== null || maxWeightFilter !== null) {
      result = result.filter(order => {
        // Извлекаем числовое значение из строки веса
        let weightInKg: number;
        
        // Проверяем, содержит ли строка 'т' (тонны) или 'кг'
        if (order.cargo.weight.includes('т')) {
          // Если вес указан в тоннах, конвертируем в килограммы
          const weightStr = order.cargo.weight.replace('т', '').trim();
          weightInKg = parseFloat(weightStr) * 1000;
        } else {
          // Если вес указан в кг или без единиц измерения
          const weightStr = order.cargo.weight.replace('кг', '').trim();
          weightInKg = parseFloat(weightStr);
        }
        
        // Применяем фильтры
        if (minWeightFilter !== null && maxWeightFilter !== null) {
          return weightInKg >= minWeightFilter && weightInKg <= maxWeightFilter;
        } else if (minWeightFilter !== null) {
          return weightInKg >= minWeightFilter;
        } else if (maxWeightFilter !== null) {
          return weightInKg <= maxWeightFilter;
        }
        return true;
      });
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
          case 'route-from':
            return a.route.from.localeCompare(b.route.from);
          case 'route-to':
            return a.route.to.localeCompare(b.route.to);
          default:
            return 0;
        }
      });
    }
    
    // Применяем фильтр по типу транспорта
    if (transportTypeFilter && transportTypeFilter !== 'all') {
      result = result.filter(order => {
        // Проверяем, соответствует ли тип груза выбранному типу транспорта
        return order.cargo.type === transportTypeFilter;
      });
    }
    
    setFilteredOrders(result);
  }, [statusFilter, sortOption, routeFromFilter, routeToFilter, minWeightFilter, maxWeightFilter, dateFilter, transportTypeFilter, orders]);
  
  return (
    <div className="max-w-[1366px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Грузоперевозки</h1>
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage("load")}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${currentPage === "load" 
              ? "bg-black text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
          >
            <FaTruck className="mr-2" /> Найти груз
          </button>
          <button
            onClick={() => setCurrentPage("upload")}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${currentPage === "upload" 
              ? "bg-black text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
          >
            <FaBox className="mr-2" /> Разместить груз
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPage === "load" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SearchForm 
                statusFilter={statusFilter} 
                setStatusFilter={setStatusFilter} 
                sortOption={sortOption} 
                setSortOption={setSortOption}
                routeFromFilter={routeFromFilter}
                setRouteFromFilter={setRouteFromFilter}
                routeToFilter={routeToFilter}
                setRouteToFilter={setRouteToFilter}
                minWeightFilter={minWeightFilter}
                setMinWeightFilter={setMinWeightFilter}
                maxWeightFilter={maxWeightFilter}
                setMaxWeightFilter={setMaxWeightFilter}
                dateFilter={dateFilter} // Передаем состояние и функцию
                setDateFilter={setDateFilter} // для фильтра по дате
                transportTypeFilter={transportTypeFilter}
                setTransportTypeFilter={setTransportTypeFilter}
              />
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <CreateForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Доступные заказы</h2>
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <OrderCard order={order} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <p className="text-gray-500">Заказы не найдены</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
