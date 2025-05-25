import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import OrderCard from "./OrderCard";

export default function CreateForm() {
    // Добавляем состояние для типа транспорта
    const [transportType, setTransportType] = useState<string>("all");
    
    // Состояние для хранения списка городов
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
    
    // Состояние для даты отправления
    const [departureDate, setDepartureDate] = useState(new Date(Date.now()).toISOString().split('T')[0]?.toString());
    
    // Добавляем состояния для остальных полей формы
    const [cargoWeight, setCargoWeight] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    // Состояния для обработки отправки формы
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    // Используем tRPC мутацию для создания заказа
    const createOrderMutation = api.order.create.useMutation({
      onSuccess: () => {
        console.log("Order created successfully");
        
        setSuccess(true);
        // Сбрасываем форму
        setFromCity("");
        setToCity("");
        setDepartureDate("");
        setCargoWeight("");
        setPrice("");
        setTransportType("");
        setDescription("");
        // Скрываем сообщение об успехе через 3 секунды
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      },
      onError: (error) => {
        setError(error.message);
      },
      onSettled: () => {
        setLoading(false);
      }
    });
  
    // Обработчик изменения поля "Откуда"
    const handleFromCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFromCity(value);
      
      if (value.length > 0) {
        const filteredCities = russianCities.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10); // Ограничиваем количество подсказок для производительности
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
      
      if (value.length > 0) {
        const filteredCities = russianCities.filter(city =>
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10); // Ограничиваем количество подсказок для производительности
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
      setShowFromSuggestions(false);
    };
    // Обработчик изменения изображения
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        // Проверяем размер файла (максимум 5 МБ)
        if (file.size > 5 * 1024 * 1024) {
          setError("Размер файла превышает 5 МБ");
          return;
        }
        
        // Показываем предпросмотр изображения
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
          // Сохраняем изображение в формате base64 строки
          setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    
    // Обработчик выбора города из списка "Куда"
    const handleSelectToCity = (city: string) => {
      setToCity(city);
      setShowToSuggestions(false);
    };
    
    // Обработчик изменения даты отправления
    const handleDepartureDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDepartureDate(e.target.value);
    };
    
    // Обработчик отправки формы
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Проверяем обязательные поля
      if (!fromCity) {
        setError("Поле 'Откуда' обязательно для заполнения");
        return;
      }
      
      if (!toCity) {
        setError("Поле 'Куда' обязательно для заполнения");
        return;
      }
      
      if (!departureDate) {
        setError("Дата отправления обязательна для заполнения");
        return;
      }
      
      if (!cargoWeight) {
        setError("Вес груза обязателен для заполнения");
        return;
      }
      
      if (!price) {
        setError("Цена обязательна для заполнения");
        return;
      }
      
      try {
        setLoading(true);
        setError("");
        
        // Отправляем данные через tRPC мутацию
        createOrderMutation.mutate({
          routeFrom: fromCity,
          routeTo: toCity,
          date: departureDate,
          cargoWeight: cargoWeight,
          cargoType: transportType || "any", // Если тип транспорта не выбран, используем "any"
          price: parseFloat(price),
          description: description,
          imageUrl: imageUrl || undefined, // Добавляем изображение в запрос
        });
        
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Произошла ошибка при создании заказа");
        }
        setLoading(false);
        
        
      }
    };
  
    // Получаем текущую дату для установки минимальной даты в поле выбора даты
    const today = new Date().toISOString().split('T')[0];
  
    return (
      <form className="space-y-6 p-4 bg-white rounded-lg" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 text-green-600 rounded-md">
            Заказ успешно размещен!
          </div>
        )}
      
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Предположительная дата отправления</label>
            <input
              type="date"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={departureDate}
              onChange={handleDepartureDateChange}
              min={today}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Вес груза (кг)</label>
            <input
              type="number"
              placeholder="Вес"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={cargoWeight}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (isNaN(value) || value < 0 || value > 100000) {
                  setCargoWeight("");
                } else {
                  setCargoWeight(e.target.value);
                }
              }}
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Цена (₽)</label>
            <input
              type="number"
              placeholder="Укажите стоимость перевозки"
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
              value={price}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (isNaN(value) || value < 0) {
                  setPrice("");
                } else {
                  setPrice(e.target.value);
                }
              }}
            />
          </div>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Предпочтительный тип транспорта</label>
            <select 
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
            >
              <option value="" disabled>Выберите тип транспорта</option>
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
              <option value="any">Любой тип</option>
            </select>
          </div>
          <div>
            
          </div>
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Описание груза</label>
          <textarea
            placeholder="Опишите ваш груз"
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Фотография груза</label>
            <div className="flex flex-col space-y-2">
              {imagePreview && (
                <div className="relative w-full h-40 mb-2">
                  <img 
                    src={imagePreview} 
                    alt="Предпросмотр груза" 
                    className="w-full h-full object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                onChange={handleImageChange}
              />
              <p className="text-xs text-gray-500">Загрузите фотографию груза (макс. 5 МБ)</p>
            </div>
        </div>      
        <div className="flex justify-center gap-4 pt-4">
          <button
            type="reset"
            className="px-6 py-2 rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => {
              setFromCity("");
              setToCity("");
              setDepartureDate("");
              setCargoWeight("");
              setPrice("");
              setTransportType("");
              setDescription("");
              setImagePreview(null),
              setImageUrl(""),
              setError("");
              setSuccess(false);
            }}
          >
            Сбросить
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            {loading ? "Отправка..." : "Разместить заказ"}
          </button>
        </div>
      </form>
    );
}
