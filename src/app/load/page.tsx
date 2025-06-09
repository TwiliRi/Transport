"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaMoneyBillWave, FaSearch, FaUser, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import SearchForm from "../_components/SearchForm";
import CreateForm from "../_components/CreateForm";
import OrderCard, { OrderCardSkeleton } from "../_components/OrderCard";
import type { Order, OrderStatus, SortOption } from "~/types";

// Типы для грузов
// type OrderStatus = 'active' | 'completed' | 'cancelled' | '';
// type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'route-from' | 'route-to' | '';

// interface Order {
//   id: string;
//   number: string;
//   status: 'active' | 'completed' | 'cancelled' | "processing";
//   date: string;
//   route: {
//     from: string;
//     to: string;
//   };
//   price: number;
//   cargo: {
//     type: string;
//     weight: string;
//   };
//   transportType?: {
//     value: string;
//     label: string;
//   };
//   imageUrl?: string;
//   description?: string;
//   user?: {
//     id: string;
//     name: string;
//   };
// }

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
  
  // Состояния для серверной пагинации
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Новые состояния для пагинации отфильтрованных результатов
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1);
  const [paginatedFilteredOrders, setPaginatedFilteredOrders] = useState<Order[]>([]);
  const [filteredTotalPages, setFilteredTotalPages] = useState(1);
  
  // Состояния для автоматической загрузки
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const lastOrderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const ORDERS_PER_PAGE = 10;

  // Используем tRPC для получения заказов из базы данных с пагинацией
  const { data: dbOrdersData, isLoading: isOrdersLoading, refetch } = api.order.getAll.useQuery(
    {
      status: statusFilter || undefined,
      routeFrom: routeFromFilter || undefined,
      routeTo: routeToFilter || undefined,
      date: dateFilter || undefined,
      page: currentPageNumber,
      limit: ORDERS_PER_PAGE,
    },
    {
      enabled: true,
      refetchOnWindowFocus: false,
    }
  );

  // Функция для автоматической загрузки следующей страницы
  const handleAutoLoadMore = useCallback(() => {
    if (showLoadMore && !isOrdersLoading && !isAutoLoading) {
      setIsAutoLoading(true);
      setCurrentPageNumber(prev => prev + 1);
    }
  }, [showLoadMore, isOrdersLoading, isAutoLoading]);

  
useEffect(() => {
  // Сброс серверной пагинации
  setCurrentPageNumber(1);
  setDisplayedOrders([]);
  setOrders([]);
  setTotalPages(1);
  setTotalCount(0);
  setShowLoadMore(true);
  
  // Сброс клиентской пагинации
  setFilteredCurrentPage(1);
  setFilteredOrders([]);
  setPaginatedFilteredOrders([]);
  setFilteredTotalPages(1);
  
  // Сброс состояний загрузки
  setIsLoading(true);
  setIsAutoLoading(false);
  
  // Принудительный рефетч данных
  refetch();
}, [refetch]); // Добавляем refetch в зависимости



  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          handleAutoLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (lastOrderRef.current && paginatedFilteredOrders.length > 0) {
      observerRef.current.observe(lastOrderRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [paginatedFilteredOrders.length, handleAutoLoadMore]);

  useEffect(() => {
    if (dbOrdersData) {
      const formattedOrders: Order[] = dbOrdersData.orders.map((order) => ({
        id: order.id,
        number: order.number,
        status: order.status as 'active' | 'completed' | 'cancelled',
        date: formatDate(order.date),
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
        imageUrl: order.imageUrl || undefined,
        
      }));
      
      if (currentPageNumber === 1) {
        setDisplayedOrders(formattedOrders);
        setOrders(formattedOrders);
      } else {
        setDisplayedOrders(prev => [...prev, ...formattedOrders]);
        setOrders(prev => [...prev, ...formattedOrders]);
      }
      
      setTotalPages(dbOrdersData.totalPages);
      setTotalCount(dbOrdersData.totalCount);
      setShowLoadMore(dbOrdersData.hasNextPage);
      setIsLoading(false);
      setIsAutoLoading(false);
    }
  }, [dbOrdersData, currentPageNumber]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Применение фильтров и пагинации для отфильтрованных результатов
  useEffect(() => {
    let result = [...displayedOrders];

    // Применяем фильтр по весу (клиентская фильтрация)
    if (minWeightFilter !== null || maxWeightFilter !== null) {
      result = result.filter(order => {
        let weightInKg: number;
        
        if (order.cargo.weight.includes('т')) {
          const weightStr = order.cargo.weight.replace('т', '').trim();
          weightInKg = parseFloat(weightStr) * 1000;
        } else {
          const weightStr = order.cargo.weight.replace('кг', '').trim();
          weightInKg = parseFloat(weightStr);
        }
        
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
        return order.cargo.type === transportTypeFilter;
      });
    }
    
    // Устанавливаем отфильтрованные результаты
    setFilteredOrders(result);
    
    // Вычисляем пагинацию для отфильтрованных результатов
    const totalFiltered = result.length;
    const totalFilteredPages = Math.ceil(totalFiltered / ORDERS_PER_PAGE);
    setFilteredTotalPages(totalFilteredPages);
    
    // Получаем заказы для текущей страницы отфильтрованных результатов
    const startIndex = (filteredCurrentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    const paginatedResults = result.slice(startIndex, endIndex);
    setPaginatedFilteredOrders(paginatedResults);
    
  }, [minWeightFilter, maxWeightFilter, sortOption, transportTypeFilter, displayedOrders, filteredCurrentPage]);

  // Сброс пагинации при изменении фильтров
  useEffect(() => {
    setCurrentPageNumber(1);
    setDisplayedOrders([]);
  }, [statusFilter, routeFromFilter, routeToFilter, dateFilter]);

  // Сброс пагинации отфильтрованных результатов при изменении фильтров
  useEffect(() => {
    setFilteredCurrentPage(1);
  }, [minWeightFilter, maxWeightFilter, sortOption, transportTypeFilter, statusFilter, routeFromFilter, routeToFilter, dateFilter]);

  // Функция для загрузки следующей страницы
  const handleLoadMore = () => {
    if (showLoadMore) {
      setCurrentPageNumber(prev => prev + 1);
    }
  };

  // Функция для перехода на конкретную страницу отфильтрованных результатов
  const handleFilteredPageChange = (page: number) => {
    setFilteredCurrentPage(page);
  };

  // Генерация номеров страниц для пагинации отфильтрованных результатов
  const getFilteredPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, filteredCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(filteredTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  return (
    <div className="max-w-[1366px] mx-auto px-4 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-6">Грузоперевозки</h1>
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setCurrentPage("load")}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              currentPage === "load" 
                ? "bg-black text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <FaTruck className="mr-2" /> Найти груз
          </button>
          <button
            onClick={() => setCurrentPage("upload")}
            className={`flex items-center px-6 py-3 rounded-lg transition-colors ${
              currentPage === "upload" 
                ? "bg-black text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
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
                dateFilter={dateFilter} 
                setDateFilter={setDateFilter}
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Доступные заказы</h2>
          <div className="text-sm text-gray-600">
            Показано {paginatedFilteredOrders.length} из {filteredOrders.length} заказов
            {filteredOrders.length !== totalCount && (
              <span className="text-blue-600"> (всего: {totalCount})</span>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {isLoading ? (
              // Показываем скелетоны во время загрузки
              <>
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                  >
                    <OrderCardSkeleton />
                  </motion.div>
                ))}
              </>
            ) : paginatedFilteredOrders.length > 0 ? (
              paginatedFilteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  ref={index === paginatedFilteredOrders.length - 1 ? lastOrderRef : null}
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
        
        {/* Индикатор автоматической загрузки */}
        {isAutoLoading && (
          <div className="flex justify-center items-center mt-4 py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mr-2"></div>
            <span className="text-sm text-gray-600">Автоматическая загрузка...</span>
          </div>
        )}
        
        {/* Пагинация для отфильтрованных результатов */}
        {filteredTotalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => handleFilteredPageChange(filteredCurrentPage - 1)}
              disabled={filteredCurrentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronLeft />
            </button>
            
            {getFilteredPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => handleFilteredPageChange(page)}
                disabled={filteredCurrentPage === page}
                className={`px-4 py-2 rounded-lg border transition-colors disabled:cursor-not-allowed  ${
                  page === filteredCurrentPage
                    ? 'bg-black text-white border-black'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handleFilteredPageChange(filteredCurrentPage + 1)}
              disabled={filteredCurrentPage === filteredTotalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
        
        {/* Дополнительная кнопка для загрузки большего количества данных с сервера */}
        {showLoadMore && filteredOrders.length > 0 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleLoadMore}
              disabled={isOrdersLoading || isAutoLoading}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isOrdersLoading || isAutoLoading ? 'Загрузка...' : 'Загрузить больше данных с сервера'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
