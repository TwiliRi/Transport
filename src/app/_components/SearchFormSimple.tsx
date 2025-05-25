"use client";

import { useState, useEffect } from "react";

interface SearchFormProps {
  filters: { vehicleType: string; city: string; date: string };
  setFilters: (filters: { vehicleType: string; city: string; date: string }) => void;
}

export default function SearchFormSimple({ filters, setFilters }: SearchFormProps) {
  const [city, setCity] = useState(filters.city);
  const [vehicleType, setVehicleType] = useState(filters.vehicleType);
  const [date, setDate] = useState(filters.date);
  
  // Состояние для хранения списка городов
  const [russianCities, setRussianCities] = useState<string[]>([]);
  
  // Состояния для автозаполнения
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
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
        const cityNames = citiesData.map((city: { name: string }) => city.name).sort();
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
          "Томск", "Оренбург", "Кемерово", "Новокузнецк", "Рязань", "Астрахань"
        ]);
      }
    };
    
    fetchCities();
  }, []);
  
  // Обработчик изменения поля города
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    
    if (value.length > 0) {
      const filteredCities = russianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10); // Ограничиваем количество подсказок для производительности
      setCitySuggestions(filteredCities);
      setShowCitySuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };
  
  // Обработчик выбора города из списка
  const handleSelectCity = (selectedCity: string) => {
    setCity(selectedCity);
    setShowCitySuggestions(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ vehicleType, city, date });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="col-span-1 sm:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Маршрут</label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Город"
                value={city}
                onChange={handleCityChange}
                onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
              />
              {showCitySuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {citySuggestions.map((city, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleSelectCity(city)}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Вид транспорта</label>
          <select 
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-6">
        <button
          type="reset"
          className="w-full sm:w-auto px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors text-center"
          onClick={() => {
            setCity("");
            setVehicleType("all");
            setDate("");
            setCitySuggestions([]);
            setShowCitySuggestions(false);
          }}
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