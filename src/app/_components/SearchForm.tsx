"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { FaSearch } from "react-icons/fa";

import type { OrderStatus, SortOption } from "~/types";

// Типы для грузов

export default function  SearchForm({ 
  statusFilter, 
  setStatusFilter, 
  sortOption, 
  setSortOption,
  routeFromFilter,
  setRouteFromFilter,
  routeToFilter,
  setRouteToFilter,
  minWeightFilter,
  setMinWeightFilter,
  maxWeightFilter,
  setMaxWeightFilter,
  dateFilter,
  setDateFilter,
  transportTypeFilter,
  setTransportTypeFilter
}: { 
  statusFilter: OrderStatus, 
  setStatusFilter: (status: OrderStatus) => void,
  sortOption: SortOption,
  setSortOption: (option: SortOption) => void,
  routeFromFilter: string,
  setRouteFromFilter: (value: string) => void,
  routeToFilter: string,
  setRouteToFilter: (value: string) => void,
  minWeightFilter: number | null,
  setMinWeightFilter: (value: number | null) => void,
  maxWeightFilter: number | null,
  setMaxWeightFilter: (value: number | null) => void,
  dateFilter: string,
  setDateFilter: (value: string) => void,
  transportTypeFilter: string,
  setTransportTypeFilter: (value: string) => void
}) {
  // Добавляем состояние для типа транспорта
  const [transportType, setTransportType] = useState<string>("all");
  
  // Список крупных городов России для автозаполнения
  

  // Состояния для автозаполнения
  const [russianCities, setRussianCities] = useState<string[]>([]);
  
  // Загружаем список городов при монтировании компонента
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/pensnarik/russian-cities/master/russian-cities.json');
        if (!response.ok) {
          throw new Error('Не удалось загрузить список городов');
        }
        const citiesData = await response.json();
        // Извлекаем только названия городов и сортируем их
        const cityNames = citiesData.map((city: { name: string , subject:string} ) => city.name + ", " + city.subject).sort();
        setRussianCities(cityNames);
        
      } catch (error) {
        console.error('Ошибка при загрузке списка городов:', error);
        // Используем резервный список городов в случае ошибки
        setRussianCities([
          "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", 
          "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", 
          "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар", 
          "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск", 
          "Иркутск", "Хабаровск", "Ярославль", "Владивосток", "Махачкала", 
          "Томск", "Оренбург", "Кемерово", "Новокузнецк", "Рязань", "Астрахань", 
          "Набережные Челны", "Пенза", "Липецк", "Киров", "Чебоксары", "Тула", 
          "Калининград", "Балашиха", "Курск", "Севастополь", "Сочи", "Ставрополь", 
          "Улан-Удэ", "Тверь", "Магнитогорск", "Брянск", "Иваново", "Белгород", 
          "Сургут", "Владимир", "Нижний Тагил", "Архангельск", "Чита", "Калуга", 
          "Смоленск", "Волжский", "Якутск", "Саранск", "Череповец", "Курган", 
          "Вологда", "Орёл", "Подольск", "Грозный", "Мурманск", "Тамбов", 
          "Петрозаводск", "Стерлитамак", "Нижневартовск", "Кострома", "Новороссийск", 
          "Йошкар-Ола", "Комсомольск-на-Амуре", "Таганрог", "Сыктывкар", "Нальчик", 
          "Шахты", "Дзержинск", "Орск", "Братск", "Благовещенск", "Энгельс", 
          "Ангарск", "Королёв", "Великий Новгород", "Старый Оскол", "Мытищи", 
          "Псков", "Люберцы", "Южно-Сахалинск", "Бийск", "Прокопьевск", "Армавир"
        ]);
      }
    };
    
    fetchCities();
  }, []);

  // Состояния для автозаполнения
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  
  // Состояние для даты поиска (остается локальным для SearchForm, но также обновляет dateFilter)
  const today = new Date().toISOString().split('T')[0];
  const [searchDate, setSearchDate] = useState(dateFilter ); // Инициализируем локальное состояние датой из пропсов или сегодняшней датой
  // Обработчик изменения поля "Откуда"
  const handleFromCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromCity(value);
    setRouteFromFilter(value);
    
    if (value.length > 0) {
      const filteredCities = russianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(filteredCities);
      setShowFromSuggestions(true);
    } else {
      setFromSuggestions([]);
      setShowFromSuggestions(false);
    }
  };

  // Обработчик изменения поля "Куда"
  const handleToCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setToCity(value);
    setRouteToFilter(value);
    
    if (value.length > 0) {
      const filteredCities = russianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(filteredCities);
      setShowToSuggestions(true);
    } else {
      setToSuggestions([]);
      setShowToSuggestions(false);
    }
  };

  // Обработчик выбора города из списка "Откуда"
  const handleSelectFromCity = (city: string) => {
    setFromCity(city);
    setRouteFromFilter(city);
    setShowFromSuggestions(false);
  };

  // Обработчик выбора города из списка "Куда"
  const handleSelectToCity = (city: string) => {
    setToCity(city);
    setRouteToFilter(city);
    setShowToSuggestions(false);
  };
  
  // Обработчик изменения даты поиска
  const handleSearchDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchDate(value); // Обновляем локальное состояние
    setDateFilter(value); // Обновляем состояние фильтра в родительском компоненте
  };

  // Обработчики изменения фильтров
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as OrderStatus);
  };

  const handleSortOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value as SortOption);
  };

  // Получаем текущую дату для установки минимальной даты в поле выбора даты
  

  // Обработчик изменения типа транспорта
  const handleTransportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTransportType(value);
    setTransportTypeFilter(value);
  };

  return (
    <form className="space-y-6 p-4 bg-white rounded-lg" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Маршрут</label>
          <div className="flex gap-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Откуда"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                value={fromCity}
                onChange={handleFromCityChange}
                onFocus={() => fromSuggestions.length > 0 && setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
              />
              {showFromSuggestions && fromSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {fromSuggestions.map((city, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleSelectFromCity(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Куда"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                value={toCity}
                onChange={handleToCityChange}
                onFocus={() => toSuggestions.length > 0 && setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
              />
              {showToSuggestions && toSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {toSuggestions.map((city, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleSelectToCity(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Дата поиска</label>
          <input
            type="date"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            value={searchDate} // Используем локальное состояние searchDate
            onChange={handleSearchDateChange}
            min={today}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Вес груза (кг)</label>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="От"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={minWeightFilter || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null;
                if (value === null || (value >= 0 && value <= 100000)) {
                  setMinWeightFilter(value);
                }
              }}
            />
            <input
              type="number"
              placeholder="До"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={maxWeightFilter || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : null;
                if (value === null || (value >= 0 && value <= 100000)) {
                  setMaxWeightFilter(value);
                }
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип транспорта</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
            value={transportType}
            onChange={handleTransportTypeChange}
          >
            <option value="all">Все виды</option>
            <option value="truck">Грузовик</option>
            <option value="truck_with_trailer">Фура</option>
            <option value="car">Легковой автомобиль</option>
            <option value="van">Микроавтобус</option>
            <option value="refrigerator">Рефрижератор</option>
            <option value="tanker">Автоцистерна</option>
            <option value="container">Контейнеровоз</option>
            <option value="tow_truck">Эвакуатор</option>
            <option value="dump_truck">Самосвал</option>
            <option value="flatbed">Платформа</option>
            <option value="crane">Кран</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">Все статусы</option>
            <option value="active">Активные</option>
            <option value="processing">В процессе</option>
            <option value="completed">Завершенные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Сортировка</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            value={sortOption}
            onChange={handleSortOptionChange}
          >
            <option value="">По умолчанию</option>
            <option value="date-desc">Сначала новые</option>
            <option value="date-asc">Сначала старые</option>
            <option value="price-desc">По цене (убыв.)</option>
            <option value="price-asc">По цене (возр.)</option>
            <option value="route-from">По городу отправления</option>
            <option value="route-to">По городу назначения</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="reset"
          className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
          onClick={() => {
            setStatusFilter('');
            setSortOption('');
            setRouteFromFilter('');
            setRouteToFilter('');
            setFromCity('');
            setToCity('');
            setSearchDate('');
            setMinWeightFilter(null);
            setMaxWeightFilter(null);
            setTransportType('all');
            setTransportTypeFilter('all');
          }}
        >
          Сбросить
        </button>
        
      </div>
    </form>
  );
}
