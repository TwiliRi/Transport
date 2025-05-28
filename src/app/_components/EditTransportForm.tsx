"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { FaCamera, FaTruck } from "react-icons/fa";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
}

interface EditTransportFormProps {
  transport: Transport;
  onClose: () => void;
}

export default function EditTransportForm({ transport, onClose }: EditTransportFormProps) {
  const router = useRouter();
  const utils = api.useUtils();
  
  // Состояния для полей формы
  const [title, setTitle] = useState(transport.title);
  const [driverName, setDriverName] = useState(transport.driverName);
  const [phoneNumber, setPhoneNumber] = useState(transport.phoneNumber);
  const [vehicleType, setVehicleType] = useState(transport.vehicleType);
  const [carryingCapacity, setCarryingCapacity] = useState(transport.carryingCapacity);
  const [platformLength, setPlatformLength] = useState(transport.platformLength || 0);
  const [platformWidth, setPlatformWidth] = useState(transport.platformWidth || 0);
  const [description, setDescription] = useState(transport.description || "");
  const [city, setCity] = useState(transport.city);
  const [price, setPrice] = useState(transport.price);
  const [imageUrl, setImageUrl] = useState(transport.imageUrl || "");
  const [previewImage, setPreviewImage] = useState<string | null>(transport.imageUrl || null);
  
  // Разбираем период работы на начальную и конечную даты
  const [workPeriodStart, setWorkPeriodStart] = useState(() => {
    const dates = transport.workPeriod.split(' - ');
    return dates[0] || new Date().toISOString().split('T')[0];
  });
  const [workPeriodEnd, setWorkPeriodEnd] = useState(() => {
    const dates = transport.workPeriod.split(' - ');
    return dates[1] || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  });
  
  const [minOrderTime, setMinOrderTime] = useState(parseInt(transport.minOrderTime) || 1);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Состояние для хранения списка городов
  const [russianCities, setRussianCities] = useState<string[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  
  const cargoTypes = [
    { value: 'truck', label: 'Грузовик' },
    { value: 'truck_with_trailer', label: 'Фура' },
    { value: 'car', label: 'Легковой автомобиль' },
    { value: 'van', label: 'Микроавтобус' },
    { value: 'refrigerator', label: 'Рефрижератор' },
    { value: 'tanker', label: 'Автоцистерна' },
    { value: 'container', label: 'Контейнеровоз' },
    { value: 'tow_truck', label: 'Эвакуатор' },
    { value: 'dump_truck', label: 'Самосвал' },
    { value: 'flatbed', label: 'Платформа' },
    { value: 'crane', label: 'Кран' },
  ];
  
  // Загружаем список городов при монтировании компонента
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/pensnarik/russian-cities/master/russian-cities.json');
        if (!response.ok) {
          throw new Error('Не удалось загрузить список городов');
        }
        const citiesData = await response.json();
        const cityNames = citiesData.map((city: { name: string }) => city.name).sort();
        setRussianCities(cityNames);
      } catch (error) {
        console.error('Ошибка при загрузке списка городов:', error);
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
  
  // Мутация для обновления транспорта
  const updateTransportMutation = api.transport.update.useMutation({
    onSuccess: async () => {
      await utils.transport.getAll.invalidate();
      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.refresh();
        onClose();
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setIsLoading(false);
    }
  });
  
  // Обработчик изменения изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Обработчик изменения поля города
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    
    if (value.length > 0) {
      const filteredCities = russianCities.filter(city =>
        city.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 10);
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
    setIsLoading(true);
    setError("");
    
    const workPeriod = `${workPeriodStart} - ${workPeriodEnd}`;
    
    updateTransportMutation.mutate({
      id: transport.id,
      title,
      driverName,
      phoneNumber,
      vehicleType,
      carryingCapacity,
      platformLength: platformLength || undefined,
      platformWidth: platformWidth || undefined,
      description: description || undefined,
      city,
      price,
      imageUrl: imageUrl || undefined,
      workPeriod: workPeriod,
      minOrderTime: String(minOrderTime)
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Редактировать транспорт</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Транспорт успешно обновлен!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    value={driverName}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z\s]/g, '');
                      setDriverName(e.target.value);
                    }}
                    placeholder="Иванов Иван Иванович"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Номер телефона</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    pattern="^\+?[0-9]{10,11}$"
                    placeholder="+7 999 999 99 99"
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
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                  >
                    {cargoTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Грузоподъёмность (кг)</label>
                  <input
                    type="number"
                    value={carryingCapacity || ''}
                    onChange={(e) => setCarryingCapacity(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100000"
                    placeholder="1500"
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
                    value={platformLength || ''}
                    onChange={(e) => setPlatformLength(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="6"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ширина кузова (м)</label>
                  <input
                    type="number"
                    value={platformWidth || ''}
                    onChange={(e) => setPlatformWidth(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="2.3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите ваши услуги..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow min-h-[100px]"
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
                    value={workPeriodStart}
                    onChange={(e) => setWorkPeriodStart(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                  />
                  <input
                    type="date"
                    value={workPeriodEnd}
                    onChange={(e) => setWorkPeriodEnd(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
                <div className="relative">
                  <input
                    type="text"
                    value={city}
                    onChange={handleCityChange}
                    placeholder="Рязань"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                    onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {citySuggestions.map((cityOption, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onMouseDown={() => handleSelectCity(cityOption)}
                        >
                          {cityOption}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Минимальное время заказа</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minOrderTime || ''}
                    onChange={(e) => setMinOrderTime(parseInt(e.target.value) || 1)}
                    min="1"
                    placeholder="2"
                    className="w-20 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    required
                  />
                  <span className="text-gray-600">ч.</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Договорная"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </motion.div>
      
    </motion.div>
  );
}