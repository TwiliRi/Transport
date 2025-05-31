"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Car from "~/public/car.png";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaCamera, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TruckCard from "../_components/TruckCard";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import TransportUploadForm from "../_components/TransportUploadForm";
import { OrderCardSkeleton } from "../_components/OrderCard";
import SearchFormCar from "../_components/SearchFormCar";

const TRANSPORTS_PER_PAGE = 10;

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
  createdAt: Date;
  userId?: string;
}

export default function Search() {
  const [currentPage, setCurrentPage] = useState("search");
  const [filters, setFilters] = useState({
    vehicleType: "all",
    city: "",
    date: ""
  });

  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showLoadMore, setShowLoadMore] = useState(false);

  // Состояния для клиентской пагинации отфильтрованных результатов
  const [filteredTransports, setFilteredTransports] = useState<Transport[]>([]);
  const [displayedTransports, setDisplayedTransports] = useState<Transport[]>([]);
  const [filteredCurrentPage, setFilteredCurrentPage] = useState(1);
  const [filteredTotalPages, setFilteredTotalPages] = useState(0);

  // Состояния для автоматической загрузки
  const [isAutoLoading, setIsAutoLoading] = useState(false);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // Добавляем состояние для принудительного обновления
  const [forceUpdate, setForceUpdate] = useState(0);

  // Получаем данные с сервера с пагинацией
  const { data: serverData, isLoading, refetch } = api.transport.getAll.useQuery({
    vehicleType: filters.vehicleType !== "all" ? filters.vehicleType : undefined,
    page: currentPageNumber,
    limit: TRANSPORTS_PER_PAGE,
  }, {
    refetchInterval: 30000, // Обновляем данные каждые 30 секунд
  });
  useEffect(() => {
    // Сбрасываем все состояния
    setCurrentPageNumber(1);
    setTransports([]);
    setDisplayedTransports([]);
    setFilteredTransports([]);
    setFilteredCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
    setShowLoadMore(false);
    setIsAutoLoading(false);
    
    // Принудительно обновляем данные
    setForceUpdate(prev => prev + 1);
    refetch();
  }, [refetch]);

  // Функция для автоматической загрузки
  const handleAutoLoadMore = useCallback(() => {
    if (!isAutoLoading && !isLoading && showLoadMore) {
      setIsAutoLoading(true);
      setCurrentPageNumber(prev => prev + 1);
    }
  }, [isAutoLoading, isLoading, showLoadMore]);

  // Настройка IntersectionObserver для автоматической загрузки
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (lastItemRef.current && showLoadMore && !isLoading) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            handleAutoLoadMore();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '100px',
        }
      );

      observerRef.current.observe(lastItemRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleAutoLoadMore, showLoadMore, isLoading, displayedTransports.length]);

  // Обработка данных с сервера
  useEffect(() => {
    if (serverData) {
      const formattedTransports = serverData.transports.map(transport => ({
        ...transport,
        createdAt: new Date(transport.createdAt),
      }));

      if (currentPageNumber === 1) {
        setTransports(formattedTransports);
      } else {
        setTransports(prev => [...prev, ...formattedTransports]);
      }

      setTotalPages(serverData.pagination.totalPages);
      setTotalCount(serverData.pagination.totalCount);
      setShowLoadMore(serverData.pagination.hasMore);
      setIsAutoLoading(false);
    }
  }, [serverData, currentPageNumber]);

  // Функция для парсинга периода работы
  const parseWorkPeriod = (workPeriod: string) => {
    try {
      const cleanPeriod = workPeriod.trim();
      
      let dates: string[];
      if (cleanPeriod.includes(' - ')) {
        dates = cleanPeriod.split(' - ');
      } else if (cleanPeriod.includes('-')) {
        dates = cleanPeriod.split('-');
      } else if (cleanPeriod.includes(' по ')) {
        dates = cleanPeriod.split(' по ');
      } else {
        dates = [cleanPeriod];
      }
      
      const startDate = new Date(dates[0]?.trim() || '');
      const endDate = dates[1] ? new Date(dates[1].trim()) : startDate;
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }
      
      return { startDate, endDate };
    } catch (error) {
      console.error('Ошибка парсинга периода работы:', error);
      return null;
    }
  };

  // Применяем клиентскую фильтрацию и сортировку
  useEffect(() => {
    let filtered = transports.filter(transport => {
      // Фильтрация по городу
      if (filters.city && filters.city.trim() !== "") {
        const cityMatch = transport.city.toLowerCase().includes(filters.city.toLowerCase());
        if (!cityMatch) return false;
      }
      
      // Фильтрация по дате
      if (filters.date && filters.date.trim() !== "") {
        const selectedDate = new Date(filters.date);
        const workPeriodDates = parseWorkPeriod(transport.workPeriod);
        
        if (!workPeriodDates) {
          return false;
        }
        
        const { startDate, endDate } = workPeriodDates;
        
        if (selectedDate < startDate || selectedDate > endDate) {
          return false;
        }
      }
      
      return true;
    });

    // Сортируем по дате создания (новые сначала)
    const sorted = [...filtered].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredTransports(sorted);
    
    // Рассчитываем пагинацию для отфильтрованных результатов
    const totalFilteredPages = Math.ceil(sorted.length / TRANSPORTS_PER_PAGE);
    setFilteredTotalPages(totalFilteredPages);
    
    // Применяем пагинацию к отфильтрованным результатам
    const startIndex = (filteredCurrentPage - 1) * TRANSPORTS_PER_PAGE;
    const endIndex = startIndex + TRANSPORTS_PER_PAGE;
    const paginatedTransports = sorted.slice(startIndex, endIndex);
    setDisplayedTransports(paginatedTransports);
  }, [transports, filters, filteredCurrentPage]);

  // Сброс пагинации при изменении фильтров
  useEffect(() => {
    setFilteredCurrentPage(1);
  }, [filters.city, filters.date]);

  // Сброс серверной пагинации при изменении типа транспорта
  useEffect(() => {
    setCurrentPageNumber(1);
    setTransports([]);
  }, [filters.vehicleType]);

  // Функция для загрузки больше данных с сервера
  const handleLoadMore = () => {
    if (showLoadMore && !isLoading) {
      setCurrentPageNumber(prev => prev + 1);
    }
  };

  // Функция для изменения страницы отфильтрованных результатов
  const handleFilteredPageChange = (page: number) => {
    setFilteredCurrentPage(page);
  };

  // Функция для генерации номеров страниц
  const generateFilteredPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (filteredTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= filteredTotalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, filteredCurrentPage - 2);
      const endPage = Math.min(filteredTotalPages, startPage + maxVisiblePages - 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="w-full max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6">Поиск транспорта</h1>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setCurrentPage("search")}
            className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-colors ${
              currentPage === "search" 
                ? "bg-black text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <FaTruck className="mr-2" /> Найти машину
          </button>
          <button
            onClick={() => setCurrentPage("upload")}
            className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-colors ${
              currentPage === "upload" 
                ? "bg-black text-white" 
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <FaUser className="mr-2" /> Разместить машину
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPage === "search" ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <SearchFormCar filters={filters} setFilters={setFilters} />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <TransportUploadForm onSuccessCallback={refetch} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-6">
        {/* Заголовок с счетчиком */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            Доступный транспорт
          </h2>
          {!isLoading && (
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Показано: {displayedTransports.length} из {filteredTransports.length} 
              {filteredTransports.length !== totalCount && (
                <span className="text-blue-600"> (всего: {totalCount})</span>
              )}
            </div>
          )}
        </div>
        
        {isLoading && currentPageNumber === 1 ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <OrderCardSkeleton key={index} />
            ))}
          </div>
        ) : displayedTransports.length > 0 ? (
          <>
            <AnimatePresence>
              {displayedTransports.map((transport, index) => {
                // Устанавливаем ref на последний элемент только если:
                // 1. Это последний элемент в отфильтрованных результатах
                // 2. И мы показываем все доступные данные с сервера (нет больше страниц для загрузки с сервера)
                // 3. Или если фильтры не применены и это действительно последний загруженный элемент
                const isLastFilteredItem = index === displayedTransports.length - 1;
                const isLastServerItem = filteredTransports.length === transports.length && 
                                       index === Math.min(displayedTransports.length - 1, transports.length - 1);
                const shouldSetRef = isLastFilteredItem && (showLoadMore || isLastServerItem);
                
                return (
                  <motion.div
                    key={transport.id}
                    ref={shouldSetRef ? lastItemRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <TruckCard
                    key={`${transport.id}-${forceUpdate}`}
                    transport={transport} />
                  </motion.div>
                );
              })}
            </AnimatePresence>

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
                
                {generateFilteredPageNumbers().map((page) => (
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

            {/* Индикатор автоматической загрузки */}
            {isAutoLoading && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                <span className="ml-2 text-gray-600">Загружаем больше транспорта...</span>
              </div>
            )}

            {/* Кнопка для ручной загрузки */}
            {showLoadMore && !isAutoLoading && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Загрузка...
                    </>
                  ) : (
                    "Загрузить больше данных с сервера"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {filters.city || filters.date ? 
                `Транспорт с указанными параметрами не найден. Попробуйте изменить параметры поиска.` :
                "Транспорт не найден. Попробуйте изменить параметры поиска."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}