"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { FaCamera } from "react-icons/fa";

interface TransportUploadFormProps {
  onSuccessCallback?: () => void;
}

export default function TransportUploadForm({ onSuccessCallback }: TransportUploadFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Состояния для всех полей формы
  const [formData, setFormData] = useState({
    title: "",
    driverName: "",
    phoneNumber: "",
    vehicleType: "truck", // Устанавливаем грузовик по умолчанию
    carryingCapacity: 0,
    platformLength: 0,
    platformWidth: 0,
    description: "",
    workPeriodStart: new Date().toISOString().split("T")[0],
    workPeriodEnd: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    city: "",
    minOrderTime: 1,
    price: "договорная"
  });

  // Состояние для хранения списка городов
  const [russianCities, setRussianCities] = useState<string[]>([]);
  
  // Состояния для автозаполнения
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

  // Мутация для создания транспорта
  const createTransport = api.transport.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      // Сброс формы к начальным значениям
      // В функции onSuccess мутации createTransport
      setFormData({
        title: "",
        driverName: "",
        phoneNumber: "",
        vehicleType: "truck", // Устанавливаем грузовик по умолчанию и после сброса
        carryingCapacity: 0,
        platformLength: 0,
        platformWidth: 0,
        description: "",
        workPeriodStart: new Date().toISOString().split("T")[0],
        workPeriodEnd: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        city: "",
        minOrderTime: 1,
        price: "договорная"
      });
      setPreviewImage(null); // Сброс предпросмотра изображения
      // Вызываем callback для обновления данных
      onSuccessCallback?.();
      // Перенаправляем на страницу поиска после успешной отправки
      router.push("/search?success=true");
    },
    onError: (error) => {
      setIsSubmitting(false);
      setError(error.message);
    }
  });

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

  // Обработчик изменения поля города
  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      city: value
    });
    
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
    setFormData({
      ...formData,
      city: selectedCity
    });
    setShowCitySuggestions(false);
  };

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Для числовых полей преобразуем строку в число
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Функция валидации формы
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Проверка авторизации
    if (status === "unauthenticated") {
      setError("Ты не залогинен: Сперва нужно войти в аккаунт");
      return false;
    }
    
    if (status === "loading") {
      setError("Проверка авторизации...");
      return false;
    }
    
    // Проверка обязательных полей
    if (!formData.title.trim()) {
      errors.title = "Название объявления обязательно";
    }
    
    if (!formData.driverName.trim()) {
      errors.driverName = "ФИО водителя обязательно";
    } else if (formData.driverName.trim().length < 3) {
      errors.driverName = "ФИО должно содержать минимум 3 символа";
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = "Номер телефона обязателен";
    } else if (!/^\+?[0-9]{10,11}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = "Некорректный формат номера телефона";
    }
    
    if (!formData.vehicleType) {
      errors.vehicleType = "Выберите тип транспорта";
    }
    
    if (formData.carryingCapacity <= 0) {
      errors.carryingCapacity = "Грузоподъёмность должна быть больше 0";
    }
    
    if (!formData.city.trim()) {
      errors.city = "Город обязателен";
    }
    
    if (!formData.workPeriodStart) {
      errors.workPeriodStart = "Дата начала работы обязательна";
    }
    
    if (!formData.workPeriodEnd) {
      errors.workPeriodEnd = "Дата окончания работы обязательна";
    }
    
    if (formData.workPeriodStart && formData.workPeriodEnd) {
      const startDate = new Date(formData.workPeriodStart);
      const endDate = new Date(formData.workPeriodEnd);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.workPeriodStart = "Дата начала не может быть в прошлом";
      }
      
      if (endDate <= startDate) {
        errors.workPeriodEnd = "Дата окончания должна быть позже даты начала";
      }
    }
    
    if (formData.minOrderTime < 1) {
      errors.minOrderTime = "Минимальное время заказа должно быть не менее 1 часа";
    }
    
    if (!formData.price.trim()) {
      errors.price = "Цена обязательна";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    
    // Проверяем валидность формы
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Формируем период работы из двух дат
    const workPeriod = `${formData.workPeriodStart} - ${formData.workPeriodEnd}`;
    
    // Отправляем данные в API
    createTransport.mutate({
      title: formData.title,
      vehicleType: formData.vehicleType,
      carryingCapacity: formData.carryingCapacity,
      platformLength: formData.platformLength,
      platformWidth: formData.platformWidth,
      description: formData.description,
      workPeriod: workPeriod,
      city: formData.city,
      minOrderTime: String(formData.minOrderTime),
      price: formData.price,
      driverName: formData.driverName,
      phoneNumber: formData.phoneNumber,
      imageUrl: previewImage || undefined
    });
  };

  // Показываем сообщение о необходимости авторизации
  if (status === "unauthenticated") {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
          <h3 className="font-semibold mb-2">Требуется авторизация</h3>
          <p>Для размещения объявления необходимо войти в аккаунт</p>
        </div>
        <button
          onClick={() => router.push('/signin')}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Войти в аккаунт
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
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
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Например: Газель Next в поисках работы"
              className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                validationErrors.title 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              } focus:outline-none focus:ring-2`}
              required
            />
            {validationErrors.title && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.title}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ФИО водителя</label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                placeholder="Иванов Иван Иванович"
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.driverName 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                onChange={(e) => {
                  e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z\s]/g, '');
                  handleChange(e);
                }}
                required
              />
              {validationErrors.driverName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.driverName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Номер телефона</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                pattern="^\+?[0-9]{10,11}$"
                placeholder="+7 999 999 99 99"
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.phoneNumber 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
                maxLength={12}
              />
              {validationErrors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип транспорта</label>
              <select 
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.vehicleType 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
              >
                {cargoTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {validationErrors.vehicleType && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.vehicleType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Грузоподъёмность (кг)</label>
              <input
                type="number"
                name="carryingCapacity"
                value={formData.carryingCapacity || ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    carryingCapacity: value || 0
                  });
                }}
                min="0"
                max="100000"
                placeholder="1500"
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.carryingCapacity 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
              />
              {validationErrors.carryingCapacity && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.carryingCapacity}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Длина кузова (м)</label>
              <input
                type="number"
                name="platformLength"
                value={formData.platformLength || ''}
                onChange={handleChange}
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
                name="platformWidth"
                value={formData.platformWidth || ''}
                onChange={handleChange}
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
              name="description"
              value={formData.description}
              onChange={handleChange}
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
                name="workPeriodStart"
                value={formData.workPeriodStart}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.workPeriodStart 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
              />
              {validationErrors.workPeriodStart && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.workPeriodStart}</p>
              )}
              <input
                type="date"
                name="workPeriodEnd"
                value={formData.workPeriodEnd}
                onChange={handleChange}
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.workPeriodEnd 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
              />
              {validationErrors.workPeriodEnd && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.workPeriodEnd}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Город</label>
            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                placeholder="Рязань"
                className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.city 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
                onFocus={() => citySuggestions.length > 0 && setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              />
              {validationErrors.city && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.city}</p>
              )}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Минимальное время заказа</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="minOrderTime"
                value={formData.minOrderTime || ''}
                onChange={handleChange}
                min="1"
                placeholder="2"
                className={`w-20 px-4 py-2 rounded-lg border transition-shadow ${
                  validationErrors.minOrderTime 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-200 focus:ring-black'
                } focus:outline-none focus:ring-2`}
                required
              />
              <span className="text-gray-600">ч.</span>
            </div>
            {validationErrors.minOrderTime && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.minOrderTime}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цена</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Договорная"
              className={`w-full px-4 py-2 rounded-lg border transition-shadow ${
                validationErrors.price 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-gray-200 focus:ring-black'
              } focus:outline-none focus:ring-2`}
              required
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4 pt-4">
        <button
          type="reset"
          className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors min-w-[150px]"
          onClick={() => {
            setFormData({
              title: "",
              driverName: "",
              phoneNumber: "",
              vehicleType: "",
              carryingCapacity: 0,
              platformLength: 0,
              platformWidth: 0,
              description: "",
              workPeriodStart: "",
              workPeriodEnd: "",
              city: "",
              minOrderTime: 1,
              price: "договорная"
            });
            setPreviewImage(null);
            setError(null);
          }}
        >
          Сбросить
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors min-w-[150px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Отправка..." : "Разместить"}
        </button>
      </div>
    </form>
  );
}