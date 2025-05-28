import { useState } from 'react';
import { FaDice, FaCopy, FaServer, FaCheck, FaTimes } from 'react-icons/fa';
import { api } from '~/trpc/react';

interface GeneratedCargoData {
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  cargoWeight: string;
  price: string;
  transportType: string;
  description: string;
}

export default function CargoDataGenerator() {
  const [generatedData, setGeneratedData] = useState<GeneratedCargoData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Массивы данных для генерации
  const cities = [
    'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург', 'Казань',
    'Нижний Новгород', 'Челябинск', 'Самара', 'Омск', 'Ростов-на-Дону',
    'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград', 'Краснодар',
    'Саратов', 'Тюмень', 'Тольятти', 'Ижевск', 'Барнаул', 'Ульяновск',
    'Иркутск', 'Хабаровск', 'Ярославль', 'Владивосток', 'Махачкала',
    'Томск', 'Оренбург', 'Кемерово', 'Новокузнецк', 'Рязань', 'Астрахань',
    'Набережные Челны', 'Пенза', 'Липецк', 'Киров', 'Чебоксары', 'Тула',
    'Калининград', 'Курск', 'Сочи', 'Ставрополь', 'Тверь', 'Магнитогорск',
    'Брянск', 'Иваново', 'Белгород', 'Сургут', 'Владимир', 'Нижний Тагил',
    'Архангельск', 'Чита', 'Калуга', 'Смоленск', 'Волжский', 'Якутск'
  ];

  const transportTypes = [
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
    { value: 'any', label: 'Любой тип' }
  ];

  const cargoDescriptions = [
    'Строительные материалы (кирпич, цемент)',
    'Мебель и предметы интерьера',
    'Бытовая техника в упаковке',
    'Продукты питания (сухие товары)',
    'Одежда и текстиль',
    'Автозапчасти и комплектующие',
    'Офисное оборудование',
    'Спортивные товары',
    'Книги и канцелярские товары',
    'Электроника и компьютеры',
    'Медицинское оборудование',
    'Промышленное оборудование',
    'Металлические изделия',
    'Пластиковые изделия',
    'Химические товары (безопасные)',
    'Игрушки и детские товары',
    'Косметика и парфюмерия',
    'Садовый инвентарь',
    'Инструменты и оборудование',
    'Упакованные товары народного потребления'
  ];

  // Мутация для отправки данных на сервер
  const createOrderMutation = api.order.create.useMutation({
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

  // Функция для генерации случайной даты в будущем (от 1 до 30 дней)
  const generateRandomDate = (): string => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    return futureDate.toISOString().split('T')[0]!;
  };

  // Функция для генерации веса груза в зависимости от типа транспорта
  const generateCargoWeight = (transportType: string): string => {
    const weightRanges: Record<string, [number, number]> = {
      car: [1, 500],
      van: [100, 1500],
      truck: [500, 10000],
      truck_with_trailer: [5000, 40000],
      refrigerator: [1000, 20000],
      tanker: [5000, 30000],
      container: [10000, 30000],
      tow_truck: [1000, 5000],
      dump_truck: [5000, 25000],
      flatbed: [2000, 20000],
      crane: [1000, 15000],
      any: [100, 20000]
    };

    const [min, max] = weightRanges[transportType] || [100, 10000];
    return Math.floor(Math.random() * (max - min) + min).toString();
  };

  // Функция для генерации цены в зависимости от веса и расстояния
  const generatePrice = (weight: number): string => {
    const basePrice = Math.floor(weight * (0.5 + Math.random() * 2)); // 0.5-2.5 руб за кг
    const minPrice = Math.max(basePrice, 1000); // Минимум 1000 рублей
    const maxPrice = Math.min(minPrice + Math.random() * 50000, 200000); // Максимум 200000
    return Math.floor(minPrice + Math.random() * (maxPrice - minPrice)).toString();
  };

  // Основная функция генерации данных
  const generateRandomData = (): GeneratedCargoData => {
    const fromCity = getRandomItem(cities);
    let toCity = getRandomItem(cities);
    
    // Убеждаемся, что города отправления и назначения разные
    while (toCity === fromCity) {
      toCity = getRandomItem(cities);
    }

    const transportType = getRandomItem(transportTypes);
    const weight = generateCargoWeight(transportType.value);
    const price = generatePrice(parseInt(weight));

    return {
      routeFrom: fromCity,
      routeTo: toCity,
      departureDate: generateRandomDate(),
      cargoWeight: weight,
      price: price,
      transportType: transportType.value,
      description: getRandomItem(cargoDescriptions)
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

  // Функция для отправки данных на сервер
  const handleSubmitToServer = () => {
    if (!generatedData) return;

    setIsSubmitting(true);
    setSubmitError(null);

    createOrderMutation.mutate({
      routeFrom: generatedData.routeFrom,
      routeTo: generatedData.routeTo,
      date: generatedData.departureDate,
      cargoWeight: generatedData.cargoWeight,
      cargoType: generatedData.transportType,
      price: parseFloat(generatedData.price),
      description: generatedData.description
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Генератор данных для грузов</h3>
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
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition-colors ${
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
              'Откуда': generatedData.routeFrom,
              'Куда': generatedData.routeTo,
              'Дата отправления': generatedData.departureDate,
              'Вес груза (кг)': generatedData.cargoWeight,
              'Цена (₽)': generatedData.price,
              'Тип транспорта': transportTypes.find(t => t.value === generatedData.transportType)?.label || generatedData.transportType
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
                <span className="text-sm text-gray-600">Описание груза:</span>
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
              <FaCheck /> Заказ успешно создан!
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