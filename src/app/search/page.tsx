"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Car from "~/public/car.png";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Добавляем импорт framer-motion
import TruckCard from "../_components/TruckCard";
import { api } from "~/trpc/react"; // Добавляем импорт API клиента
import { useRouter } from "next/navigation"; // Для перенаправления после отправки
import SearchForm from "../_components/SearchFormSimple";
import TransportUploadForm from "../_components/TransportUploadForm";
import { OrderCardSkeleton } from "../_components/OrderCard";

export default function Search() {
  const [currentPage, setCurrentPage] = useState("search");
  const [filters, setFilters] = useState({
    vehicleType: "all",
    city: "",
    date: ""
  });

  // Получаем данные о транспорте из API
  const { data: transports, isLoading } = api.transport.getAll.useQuery({
    vehicleType: filters.vehicleType !== "all" ? filters.vehicleType : undefined,
    city: filters.city || undefined,
  });

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
              <SearchForm filters={filters} setFilters={setFilters} />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <TransportUploadForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <OrderCardSkeleton/>
        ) : transports && transports.length > 0 ? (
          <AnimatePresence>
            {transports.map((transport) => (
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
            <p className="text-gray-600">Транспорт не найден. Попробуйте изменить параметры поиска.</p>
          </div>
        )}
      </div>
    </div>
  );
}



