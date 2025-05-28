'use client';

import { useState } from 'react';
import { FaDice, FaCopy, FaServer, FaCheck, FaTimes } from 'react-icons/fa';
import { api } from '~/trpc/react';

interface GeneratedData {
  title: string;
  driverName: string;
  phoneNumber: string;
  vehicleType: string;
  carryingCapacity: number;
  platformLength: number;
  platformWidth: number;
  description: string;
  workPeriodStart: string;
  workPeriodEnd: string;
  city: string;
  minOrderTime: number;
  price: string;
}

export default function TransportDataGenerator() {
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Массивы данных для генерации
  const vehicleTypes = [
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

  const cities = [
    "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
    "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
    "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар",
    "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск",
    "Иркутск", "Хабаровск", "Ярославль", "Владивосток", "Махачкала",
    "Томск", "Оренбург", "Кемерово", "Новокузнецк", "Рязань", "Астрахань"
  ];

  const firstNames = [
    "Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей",
    "Артём", "Илья", "Кирилл", "Михаил", "Никита", "Матвей", "Роман",
    "Егор", "Арсений", "Иван", "Денис", "Евгений", "Данил", "Тимур"
  ];

  const lastNames = [
    "Иванов", "Петров", "Сидоров", "Смирнов", "Кузнецов", "Попов",
    "Васильев", "Соколов", "Михайлов", "Новиков", "Фёдоров", "Морозов",
    "Волков", "Алексеев", "Лебедев", "Семёнов", "Егоров", "Павлов",
    "Козлов", "Степанов"
  ];

  const middleNames = [
    "Александрович", "Дмитриевич", "Максимович", "Сергеевич", "Андреевич",
    "Алексеевич", "Артёмович", "Ильич", "Кириллович", "Михайлович",
    "Никитич", "Матвеевич", "Романович", "Егорович", "Арсеньевич",
    "Иванович", "Денисович", "Евгеньевич", "Данилович", "Тимурович"
  ];

  const descriptions = [
    "Надёжный транспорт для перевозки грузов любой сложности",
    "Опытный водитель с большим стажем работы",
    "Быстрая и безопасная доставка грузов",
    "Профессиональные услуги грузоперевозок",
    "Качественный сервис по доступным ценам",
    "Современный автопарк в отличном состоянии",
    "Гарантируем сохранность вашего груза",
    "Работаем круглосуточно без выходных",
    "Индивидуальный подход к каждому клиенту",
    "Большой опыт в сфере грузоперевозок"
  ];

  const priceOptions = [
    "договорная", "от 1000 руб/час", "от 2000 руб/час", "от 1500 руб/час",
    "от 3000 руб/час", "от 2500 руб/час", "от 5000 руб/день", "от 8000 руб/день"
  ];

  // Мутация для создания транспорта
  const createTransport = api.transport.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setSubmitError(null);
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
    onError: (error) => {
      setIsSubmitting(false);
      setSubmitError(error.message);
      setTimeout(() => setSubmitError(null), 5000);
    }
  });

  // Функция для получения случайного элемента из массива
  const getRandomItem = <T,>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)]!;
  };

  // Функция для генерации случайного номера телефона
  const generatePhoneNumber = (): string => {
    const codes = ['903', '905', '906', '909', '951', '953', '960', '961', '962', '963', '964', '965', '966', '967', '968'];
    const code = getRandomItem(codes);
    const number = Math.floor(Math.random() * 9000000) + 1000000;
    return `+7${code}${number}`;
  };

  // Функция для генерации случайной даты
  const generateRandomDate = (daysFromNow: number = 0, maxDaysRange: number = 30): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow + Math.floor(Math.random() * maxDaysRange));
    return date.toISOString().split('T')[0] ?? '';
  };

  // Основная функция генерации данных
  const generateRandomData = (): GeneratedData => {
    const vehicleType = getRandomItem(vehicleTypes);
    const city = getRandomItem(cities);
    const firstName = getRandomItem(firstNames);
    const lastName = getRandomItem(lastNames);
    const middleName = getRandomItem(middleNames);
    
    // Генерируем характеристики в зависимости от типа транспорта
    let carryingCapacity: number;
    let platformLength: number;
    let platformWidth: number;
    
    switch (vehicleType.value) {
      case 'truck':
        carryingCapacity = Math.floor(Math.random() * 8) + 3; // 3-10 тонн
        platformLength = Math.floor(Math.random() * 3) + 4; // 4-6 метров
        platformWidth = Math.floor(Math.random() * 1) + 2; // 2-2.5 метра
        break;
      case 'truck_with_trailer':
        carryingCapacity = Math.floor(Math.random() * 15) + 15; // 15-30 тонн
        platformLength = Math.floor(Math.random() * 5) + 12; // 12-16 метров
        platformWidth = Math.floor(Math.random() * 1) + 2; // 2-2.5 метра
        break;
      case 'car':
        carryingCapacity = Math.floor(Math.random() * 1) + 0.5; // 0.5-1.5 тонны
        platformLength = Math.floor(Math.random() * 2) + 2; // 2-3 метра
        platformWidth = Math.floor(Math.random() * 1) + 1; // 1-1.5 метра
        break;
      case 'van':
        carryingCapacity = Math.floor(Math.random() * 2) + 1; // 1-3 тонны
        platformLength = Math.floor(Math.random() * 2) + 3; // 3-4 метра
        platformWidth = Math.floor(Math.random() * 1) + 1.5; // 1.5-2 метра
        break;
      default:
        carryingCapacity = Math.floor(Math.random() * 10) + 5; // 5-15 тонн
        platformLength = Math.floor(Math.random() * 4) + 6; // 6-9 метров
        platformWidth = Math.floor(Math.random() * 1) + 2; // 2-2.5 метра
    }

    const workPeriodStart = generateRandomDate(0, 7);
    const workPeriodEnd = generateRandomDate(7, 30);

    return {
      title: `${vehicleType.label} ${city} - ${lastName}`,
      driverName: `${lastName} ${firstName} ${middleName}`,
      phoneNumber: generatePhoneNumber(),
      vehicleType: vehicleType.value,
      carryingCapacity: Math.round(carryingCapacity * 10) / 10,
      platformLength: Math.round(platformLength * 10) / 10,
      platformWidth: Math.round(platformWidth * 10) / 10,
      description: getRandomItem(descriptions),
      workPeriodStart,
      workPeriodEnd,
      city,
      minOrderTime: Math.floor(Math.random() * 8) + 1, // 1-8 часов
      price: getRandomItem(priceOptions)
    };
  };

  // Функция для копирования в буфер обмена
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Ошибка копирования:', err);
    }
  };

  // Функция для получения отображаемого названия типа транспорта
  const getVehicleTypeLabel = (value: string): string => {
    const type = vehicleTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  // Функция для отправки данных на сервер
  const handleSubmitToServer = () => {
    if (!generatedData) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const transportData = {
      title: generatedData.title,
      vehicleType: generatedData.vehicleType,
      carryingCapacity: generatedData.carryingCapacity * 1000, // Конвертируем в кг
      platformLength: generatedData.platformLength,
      platformWidth: generatedData.platformWidth,
      description: generatedData.description,
      workPeriod: `${generatedData.workPeriodStart} - ${generatedData.workPeriodEnd}`,
      city: generatedData.city,
      minOrderTime: generatedData.minOrderTime.toString(),
      price: generatedData.price,
      driverName: generatedData.driverName,
      phoneNumber: generatedData.phoneNumber,
    };

    createTransport.mutate(transportData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Генератор данных для транспорта</h3>
        <div>
        <button
          onClick={() => setGeneratedData(generateRandomData())}
          className="flex items-center w-full gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaDice /> Сгенерировать данные
        </button>
        <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmitToServer}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 w-full py-2 rounded-lg transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              } text-white`}
            >
              <FaServer />
              {isSubmitting ? 'Отправка...' : 'Отправить на сервер'}
            </button>
          </div>
          </div>
      </div>

      {generatedData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              'Название': generatedData.title,
              'ФИО водителя': generatedData.driverName,
              'Телефон': generatedData.phoneNumber,
              'Тип транспорта': getVehicleTypeLabel(generatedData.vehicleType),
              'Грузоподъёмность (т)': generatedData.carryingCapacity.toString(),
              'Длина платформы (м)': generatedData.platformLength.toString(),
              'Ширина платформы (м)': generatedData.platformWidth.toString(),
              'Город': generatedData.city,
              'Начало работы': generatedData.workPeriodStart,
              'Конец работы': generatedData.workPeriodEnd,
              'Мин. время заказа (ч)': generatedData.minOrderTime.toString(),
              'Цена': generatedData.price
            }).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">{label}:</span>
                  <div className="font-medium">{value}</div>
                </div>
                <button
                  onClick={() => copyToClipboard(value, label)}
                  className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                  title="Копировать"
                >
                  {copiedField === label ? <FaCheck className="text-green-500" /> : <FaCopy />}
                </button>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-sm text-gray-600">Описание:</span>
                <div className="font-medium mt-1">{generatedData.description}</div>
              </div>
              <button
                onClick={() => copyToClipboard(generatedData.description, 'Описание')}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors ml-2"
                title="Копировать"
              >
                {copiedField === 'Описание' ? <FaCheck className="text-green-500" /> : <FaCopy />}
              </button>
            </div>
          </div>

          

          {submitSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-lg">
              <FaCheck /> Транспорт успешно создан!
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg">
              <FaTimes /> Ошибка: {submitError}
            </div>
          )}

          
        </div>
      )}
    </div>
  );
}