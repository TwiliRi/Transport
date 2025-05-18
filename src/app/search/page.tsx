"use client";

import { useState } from "react";
import Image from "next/image";
import Car from "~/public/car.png";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaCamera } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; // Добавляем импорт framer-motion

export default function Search() {
  const [currentPage, setCurrentPage] = useState("search");

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
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
              <SearchForm />
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <UploadForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <TruckCard />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SearchForm() {
  return (
    <form className="space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Маршрут</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Город"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Вид транспорта</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
            defaultValue="all"
          >
            <option value="all">Все виды</option>
            <option value="truck">Грузовик</option>
            <option value="truck_with_trailer">Фура</option>
            <option value="car">Легковой автомобиль</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Дата</label>
          <input 
            type="date" 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
        <button
          type="reset"
          className="w-full sm:w-auto px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors text-center"
        >
          Сбросить
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors text-center"
        >
          Найти
        </button>
      </div>
    </form>
  );
}

function UploadForm() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form className="space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr,200px] gap-6">
        {/* Секция изображения */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full max-w-[300px] mx-auto">
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Предпросмотр"
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <FaCamera className="text-4xl text-gray-400" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
          />
        </div>

        {/* Основная информация */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Название объявления</label>
            <input
              type="text"
              placeholder="Например: Газель Next в поисках работы"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ФИО водителя</label>
              <input
                type="text"
                placeholder="Иванов Иван Иванович"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z\s]/g, '');
                }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Номер телефона</label>
              <input
                type="tel"
                pattern="^\+?[0-9]{10,11}$"
                placeholder="+7 (999) 999-99-99"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
                maxLength={12}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип транспорта</label>
              <select 
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                defaultValue="all"
                required
              >
                <option value="all" disabled>Выберите тип</option>
                <option value="truck">Грузовик</option>
                <option value="truck_with_trailer">Фура</option>
                <option value="car">Легковой автомобиль</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Грузоподъёмность (тонн)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="1.5"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Длина кузова (м)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="6"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ширина кузова (м)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="2.3"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
            <textarea
              placeholder="Опишите ваши услуги..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow min-h-[100px]"
              required
            />
          </div>
        </div>

        {/* Правая секция */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Период работы</label>
            <div className="space-y-2">
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
              <input
                type="date"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
            <input
              type="text"
              placeholder="Рязань"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Минимальное время заказа</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                placeholder="2"
                className="w-20 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                required
              />
              <span className="text-gray-600">ч.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="reset"
          className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors min-w-[150px]"
        >
          Сбросить
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors min-w-[150px]"
        >
          Разместить
        </button>
      </div>
    </form>
  );
}

function TruckCard() {
  return (
    <div className="w-full max-w-[1366px] mx-auto max-[700px]:flex-col
     max-[700px]:items-center justify-between  flex  space-x-4
     bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6 ">
            <div className="flex-shrink-0">
                <Image src={Car} alt="Газель next" className="rounded-lg w-48 h-48 object-cover"/>
                    
                <div className="text-sm text-gray-500 mt-2">
                  <FaCalendar className="inline mr-1" /> Дата создания: 19.12.2024
                </div>
            </div>
            <div className="flex-grow">
                <h2 className="text-lg font-bold">Газель next в поисках работы</h2>
                <div className="flex max-[940px]:grid max-[940px]:grid-cols-2 gap-3 max-[700px]:grid-cols-1">
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                      <FaTruck className="inline mr-1" /> Лёгковые и микроавтобусы
                    </p>
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                      <FaWeight className="inline mr-1" /> Цена договорная
                    </p>
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">
                      <FaClock className="inline mr-1" /> Минимум 2ч.
                    </p>
                </div>
                <div className="mt-4">
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">
                      <FaWeight className="inline mr-1" /> Грузоподъёмность, т
                    </div>
                    <div>- 2,5</div>
                </div>
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">
                      <FaRuler className="inline mr-1" /> Длина платформы, м
                    </div>
                    <div>- 6</div>
                </div>
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">
                      <FaRuler className="inline mr-1" /> Ширина платформы, м
                    </div>
                    <div>- 2,3</div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Перевозка грузов на газели</div>
                </div>
            </div>
            <div className="max-[700px]:gap-7 flex flex-col justify-between items-end max-[700px]:w-full max-[700px]:items-center
             max-w-[400px] max-[700px]:text-center">
                <div className="text-gray-500 text-sm">
                  <FaCalendar className="inline mr-1" /> С 19.12.2024 - По 22.12.2024
                </div>
                <div className="flex flex-col space-y-2 max-[700px]:items-center justify-center max-[700px]:w-full">
                <button className="bg-black text-white w-full px-4 py-2 rounded hover:bg-gray-800">Связаться</button>
                <button className="bg-gray-200 text-gray-800 w-full px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  <FaMapMarkerAlt className="inline mr-1" /> Рязань, Рязанская обл.
                </div>
            </div>
        </div>
  );
}
