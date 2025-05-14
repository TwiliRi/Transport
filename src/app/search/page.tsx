"use client";

import { useState } from "react";
import Image from "next/image";
import Car from "~/public/car.png";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendar, FaRuler, FaWeight, FaClock, FaCamera } from "react-icons/fa";

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

      {currentPage === "search" ? <SearchForm /> : <UploadForm />}

      <div className="mt-8 space-y-6">
        <TruckCard />
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
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        <div className="w-full lg:w-48 flex-shrink-0">
          <div className="relative aspect-square w-full lg:w-48">
            <Image 
              src={Car} 
              alt="Газель next" 
              className="rounded-lg object-cover"
              fill
              quality={95}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
            />
          </div>
          <div className="text-sm text-gray-500 mt-2 text-center lg:text-left">
            <FaCalendar className="inline mr-2" />
            Дата создания: 19.12.2024
          </div>
        </div>
        
        <div className="flex-grow space-y-4">
          <h2 className="text-xl font-bold">Газель next в поисках работы</h2>
          
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
              <FaTruck className="mr-2" /> Лёгкие и микроавтобусы
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
              Цена договорная
            </span>
            <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full inline-flex items-center">
              <FaClock className="mr-2" /> Минимум 2ч
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <FaWeight className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 whitespace-nowrap">Грузоподъёмность:</span>
              <span className="font-medium">2,5 т</span>
            </div>
            <div className="flex items-center gap-2">
              <FaRuler className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-600 whitespace-nowrap">Габариты:</span>
              <span className="font-medium">6 × 2,3 м</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Перевозка грузов на газели
          </p>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-4 lg:min-w-[200px]">
          <div className="text-sm text-gray-500 text-center lg:text-right">
            <FaCalendar className="inline mr-2" />
            19.12.2024 - 22.12.2024
          </div>

          <div className="flex flex-col gap-2 w-full sm:w-auto lg:w-full">
            <button className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
              Связаться
            </button>
            <button className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors">
              Подробнее
            </button>
          </div>

          <div className="text-sm text-gray-500 text-center lg:text-right">
            <FaMapMarkerAlt className="inline mr-2" />
            Рязань, Рязанская обл.
          </div>
        </div>
      </div>
    </div>
  );
}