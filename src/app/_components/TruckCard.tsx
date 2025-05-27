"use client";

import Image from "next/image";
import Car from "~/public/car.png";
import { useState } from "react";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaPhone } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "~/utils/formatDate"; // Предполагаем, что у вас есть утилита для форматирования даты

// Определяем интерфейс для пропсов компонента
interface TruckCardProps {
  transport: {
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
  };
}

// Функция для получения названия типа транспорта

const getVehicleTypeName = (typeValue: string) => {
  // Стандартные типы
  const standardTypes: Record<string, string> = {
    'all': 'Любой',
    'truck': 'Грузовик',
    'truck_with_trailer': 'Фура',
    'car': 'Легковой автомобиль',
    'van': 'Микроавтобус',
    'refrigerator': 'Рефрижератор',
    'tanker': 'Автоцистерна',
    'container': 'Контейнеровоз',
    'tow_truck': 'Эвакуатор',
    'dump_truck': 'Самосвал',
    'flatbed': 'Платформа',
    'crane': 'Кран',
    'any': 'Любой тип'
  };
  
  // Если это стандартный тип, возвращаем его название
  if (typeValue in standardTypes) {
    
    return standardTypes[typeValue];
  }
 
  // По умолчанию
  return 'Не указан';
};



export default function TruckCard({ transport }: TruckCardProps) {
  // Состояния для модальных окон
  const [showDetails, setShowDetails] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  // Форматируем дату создания
  const createdAtFormatted = transport.createdAt.toLocaleDateString('ru-RU');
  
  return (
    <>
      <div className="w-full max-w-[1366px] mx-auto max-[700px]:flex-col
       max-[700px]:items-center justify-between flex space-x-4
       bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6 ">
              <div className="flex-shrink-0">
                  {transport.imageUrl ? (
                      <Image 
                        src={transport.imageUrl}
                        alt={transport.title} 
                        width={192}
                        height={192}
                        className="rounded-lg w-48 h-48 object-cover"
                      />
                  ) : (
                      <div className="w-48 h-48 flex items-center justify-center bg-gray-200 rounded-lg">
                          <FaTruck className="text-gray-500 text-6xl" />
                      </div>
                  )}
                      
                  <div className="text-sm text-gray-500 mt-2">
                    <FaCalendar className="inline mr-1" /> Дата создания: {createdAtFormatted}
                  </div>
              </div>
              <div className="flex-grow">
                  <h2 className="text-lg font-bold">{transport.title}</h2>
                  <div className="flex max-[940px]:grid max-[940px]:grid-cols-2 gap-3 max-[700px]:grid-cols-1">
                      <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                        <FaTruck className="inline mr-1" /> {getVehicleTypeName(transport.vehicleType)}
                      </p>
                      <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                        <FaWeight className="inline mr-1" /> {transport.price}
                      </p>
                      <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                        <FaClock className="inline mr-1" /> Минимум {transport.minOrderTime}ч.
                      </p>
                  </div>
                  <div className="mt-4">
                  <div className="flex text-sm text-gray-800">
                      <div className="w-48">
                        <FaWeight className="inline mr-1" /> Грузоподъёмность, кг
                      </div>
                      <div>- {transport.carryingCapacity}</div>
                  </div>
                  {transport.platformLength && (
                    <div className="flex text-sm text-gray-800">
                        <div className="w-48">
                          <FaRuler className="inline mr-1" /> Длина платформы, м
                        </div>
                        <div>- {transport.platformLength}</div>
                    </div>
                  )}
                  {transport.platformWidth && (
                    <div className="flex text-sm text-gray-800">
                        <div className="w-48">
                          <FaRuler className="inline mr-1" /> Ширина платформы, м
                        </div>
                        <div>- {transport.platformWidth}</div>
                    </div>
                  )}
                  {transport.description && (
                    <div className="text-sm text-gray-500 mt-2">{transport.description}</div>
                  )}
                  </div>
              </div>
              <div className="max-[700px]:gap-7 flex flex-col justify-between items-end max-[700px]:w-full max-[700px]:items-center
               max-w-[400px] max-[700px]:text-center">
                  <div className="text-gray-500 text-sm">
                    <FaCalendar className="inline mr-1" /> {transport.workPeriod}
                  </div>
                  <div className="flex flex-col space-y-2 max-[700px]:items-center justify-center max-[700px]:w-full">
                  <button 
                    className="bg-black text-white w-full px-4 py-2  rounded hover:bg-gray-800 whitespace-nowrap min-w-[200px]"
                    onClick={() => setShowContact(true)}
                  >
                    Связаться
                  </button>
                  <button 
                    className="bg-gray-200 text-gray-800 w-full px-4 py-2 rounded hover:bg-gray-300"
                    onClick={() => setShowDetails(true)}
                  >
                    Подробнее
                  </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    <FaMapMarkerAlt className="inline mr-1" /> {transport.city}
                  </div>
              </div>
          </div>

      {/* Модальное окно с контактной информацией */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowContact(false)} 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h4 className="text-xl font-semibold mb-4">Контактная информация</h4>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold mb-2 flex items-center">
                  <FaUser className="mr-2 text-gray-500" /> Водитель:
                </h5>
                <p className="text-gray-700 mb-2">{transport.driverName}</p>
                
                <h5 className="font-semibold mb-2 flex items-center">
                  <FaPhone className="mr-2 text-gray-500" /> Телефон:
                </h5>
                <p className="text-gray-700">
                  <a 
                    href={`tel:${transport.phoneNumber}`} 
                    className="text-blue-600 hover:underline"
                  >
                    {transport.phoneNumber}
                  </a>
                </p>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => setShowContact(false)} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно с подробной информацией */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowDetails(false)} 
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
              <h4 className="text-xl font-semibold mb-4">{transport.title}</h4>
              
              {transport.imageUrl && (
                <div className="mb-4">
                  <Image 
                    src={transport.imageUrl} 
                    alt={transport.title} 
                    width={400}
                    height={300}
                    className="w-full max-h-[300px] object-contain rounded-lg"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="font-semibold mb-2">Основная информация:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FaTruck className="text-gray-500 mr-2" />
                      <span>Тип: {getVehicleTypeName(transport.vehicleType)}</span>
                    </li>
                    <li className="flex items-center">
                      <FaWeight className="text-gray-500 mr-2" />
                      <span>Грузоподъемность: {transport.carryingCapacity} т</span>
                    </li>
                    <li className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-500 mr-2" />
                      <span>Город: {transport.city}</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-2">Дополнительно:</h5>
                  <ul className="space-y-2">
                    {transport.platformLength && (
                      <li className="flex items-center">
                        <FaRuler className="text-gray-500 mr-2" />
                        <span>Длина платформы: {transport.platformLength} м</span>
                      </li>
                    )}
                    {transport.platformWidth && (
                      <li className="flex items-center">
                        <FaRuler className="text-gray-500 mr-2" />
                        <span>Ширина платформы: {transport.platformWidth} м</span>
                      </li>
                    )}
                    <li className="flex items-center">
                      <FaClock className="text-gray-500 mr-2" />
                      <span>Мин. время заказа: {transport.minOrderTime} ч</span>
                    </li>
                    <li className="flex items-center">
                      <FaCalendar className="text-gray-500 mr-2" />
                      <span>Период работы: {transport.workPeriod}</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {transport.description && (
                <div className="mb-4">
                  <h5 className="font-semibold mb-2">Описание:</h5>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{transport.description}</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-between">
                <button 
                  onClick={() => {
                    setShowDetails(false);
                    setShowContact(true);
                  }} 
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Связаться
                </button>
                <button 
                  onClick={() => setShowDetails(false)} 
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}