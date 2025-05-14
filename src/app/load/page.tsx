"use client";

import { useState } from "react";
import { FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaMoneyBillWave, FaSearch } from "react-icons/fa";

export default function Load() {
  const [currentPage, setCurrentPage] = useState("load");

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

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {currentPage === "load" ? <SearchForm /> : <CreateForm />}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Доступные заказы</h2>
        <div className="space-y-4">
          <OrderCard />
          <OrderCard />
          <OrderCard />
        </div>
      </div>
    </div>
  );
}

function SearchForm() {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Маршрут</label>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Откуда"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                }}
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Куда"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Вес (тонны)</label>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="От"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value < 0 || value > 100 || isNaN(value)) {
                  e.target.value = '';
                }
              }}
            />
            <input
              type="number"
              placeholder="До"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value < 0 || value > 100 || isNaN(value)) {
                  e.target.value = '';
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип транспорта</label>
          <select className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black">
            <option value="all">Все виды</option>
            <option value="truck">Грузовик</option>
            <option value="truck_with_trailer">Фура</option>
            <option value="car">Легковой автомобиль</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Дата погрузки</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="reset"
          className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Сбросить
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
        >
          <FaSearch className="inline mr-2" />
          Найти
        </button>
      </div>
    </form>
  );
}

function CreateForm() {
  return (
    <form className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Маршрут</label>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Откуда"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
              }}
            />
            <input
              type="text"
              placeholder="Куда"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => {
                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Вес груза (тонны)</label>
          <input
            type="number"
            placeholder="Вес"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (value < 0 || value > 100 || isNaN(value)) {
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Описание груза</label>
          <textarea
            placeholder="Опишите ваш груз"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Фотографии груза</label>
          <input
            type="file"
            multiple
            accept="image/*"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="reset"
          className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Сбросить
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
        >
          Разместить заказ
        </button>
      </div>
    </form>
  );
}

function OrderCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">Перевозка мебели</h3>
          <div className="flex items-center text-gray-600">
            <FaMapMarkerAlt className="mr-2" />
            <span>Москва → Санкт-Петербург</span>
          </div>
        </div>
        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          Активный
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">
            <FaCalendar className="inline mr-1" /> Дата погрузки
          </div>
          <div className="font-medium">20.05.2024</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">
            <FaTruck className="inline mr-1" /> Тип транспорта
          </div>
          <div className="font-medium">Грузовик</div>
        </div>
        <div>
          <div className="text-sm text-gray-600 mb-1">
            <FaMoneyBillWave className="inline mr-1" /> Стоимость
          </div>
          <div className="font-medium">15 000 ₽</div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          Подробнее
        </button>
        <button className="px-4 py-2 text-sm rounded-lg bg-black text-white hover:bg-gray-800 transition-colors">
          Откликнуться
        </button>
      </div>
    </div>
  );
}