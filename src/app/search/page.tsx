"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Car from "~/public/car.png";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TruckCard from "../_components/TruckCard";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import TransportUploadForm from "../_components/TransportUploadForm";
import { OrderCardSkeleton } from "../_components/OrderCard";
import SearchFormCar from "../_components/SearchFormCar";

export default function Search() {
  const [currentPage, setCurrentPage] = useState("search");
  const [filters, setFilters] = useState({
    vehicleType: "all",
    city: "",
    date: ""
  });

  // Получаем ВСЕ данные о транспорте из API без фильтрации по городу
  const { data: allTransports, isLoading, refetch } = api.transport.getAll.useQuery({
    vehicleType: filters.vehicleType !== "all" ? filters.vehicleType : undefined,
    // Убираем фильтрацию по городу из API запроса
  });

  // Функция для парсинга периода работы
  const parseWorkPeriod = (workPeriod: string) => {
    try {
      // Ожидаем формат "дата1 - дата2" или "дата1-дата2" или просто "дата1"
      const cleanPeriod = workPeriod.trim();
      
      // Проверяем различные форматы разделителей
      let dates: string[];
      if (cleanPeriod.includes(' - ')) {
        dates = cleanPeriod.split(' - ');
      } else if (cleanPeriod.includes('-')) {
        dates = cleanPeriod.split('-');
      } else if (cleanPeriod.includes(' по ')) {
        dates = cleanPeriod.split(' по ');
      } else {
        // Если только одна дата
        dates = [cleanPeriod];
      }
      
      const startDate = new Date(dates[0]?.trim() || '');
      const endDate = dates[1] ? new Date(dates[1].trim()) : startDate;
      
      // Проверяем валидность дат
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return null;
      }
      
      return { startDate, endDate };
    } catch (error) {
      console.error('Ошибка парсинга периода работы:', error);
      return null;
    }
  };

  // Применяем фильтрацию и сортировку на фронтенде
  const filteredAndSortedTransports = useMemo(() => {
    if (!allTransports) return [];
    
    // Сначала фильтруем
    let filtered = allTransports.filter(transport => {
      // Фильтрация по городу
      if (filters.city && filters.city.trim() !== "") {
        const cityMatch = transport.city.toLowerCase().includes(filters.city.toLowerCase());
        if (!cityMatch) return false;
      }
      
      // Фильтрация по дате - проверяем, входит ли выбранная дата в период работы
      if (filters.date && filters.date.trim() !== "") {
        const selectedDate = new Date(filters.date);
        const workPeriodDates = parseWorkPeriod(transport.workPeriod);
        
        if (!workPeriodDates) {
          // Если не удалось распарсить период работы, исключаем из результатов
          return false;
        }
        
        const { startDate, endDate } = workPeriodDates;
        
        // Проверяем, входит ли выбранная дата в период работы (включительно)
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

    return sorted;
  }, [allTransports, filters]);

  return (
    <div className="w-full max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6">Поиск транспорта</h1>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setCurrentPage("search")}
            className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-colors ${currentPage === "search" 
              ? "bg-black text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
          >
            <FaTruck className="mr-2" /> Найти машину
          </button>
          <button
            onClick={() => setCurrentPage("upload")}
            className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-lg transition-colors ${currentPage === "upload" 
              ? "bg-black text-white" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
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
        {/* Показываем количество найденных результатов */}
        {!isLoading && filteredAndSortedTransports && (
          <div className="text-center text-gray-600 mb-4">
            Найдено: {filteredAndSortedTransports.length} {filteredAndSortedTransports.length === 1 ? 'транспорт' : 
              filteredAndSortedTransports.length < 5 ? 'транспорта' : 'транспортов'}
            {filters.city && ` в городе "${filters.city}"`}
            {filters.date && ` доступных на дату ${new Date(filters.date).toLocaleDateString('ru-RU')}`}
            <span className="ml-2 text-sm text-blue-600">
              (сортировка: по дате создания, новые сначала)
            </span>
          </div>
        )}
        
        {isLoading ? (
          <OrderCardSkeleton/>
        ) : filteredAndSortedTransports && filteredAndSortedTransports.length > 0 ? (
          <AnimatePresence>
            {filteredAndSortedTransports.map((transport) => (
              <motion.div
                key={transport.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <TruckCard transport={transport} />
              </motion.div>
            ))}
          </AnimatePresence>
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



