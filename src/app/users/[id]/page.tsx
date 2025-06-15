import { notFound } from "next/navigation";
import { FaUser, FaTruck, FaBox, FaMapMarkerAlt, FaCalendar, FaWeight } from "react-icons/fa";
import { api } from "~/trpc/server";
import Image from "next/image";

// Функция для получения названия типа транспорта
const getVehicleTypeName = (typeValue: string) => {
  const standardTypes: Record<string, string> = {
    all: "Любой",
    truck: "Грузовик",
    truck_with_trailer: "Фура",
    car: "Легковой автомобиль",
    van: "Микроавтобус",
    refrigerator: "Рефрижератор",
    tanker: "Автоцистерна",
    container: "Контейнеровоз",
    tow_truck: "Эвакуатор",
    dump_truck: "Самосвал",
    flatbed: "Платформа",
    crane: "Кран",
    any: "Любой тип",
  };

  if (typeValue in standardTypes) {
    return standardTypes[typeValue];
  }

  return "Не указан";
};

export default async function PublicProfile({ params }: { params: Promise<{ id: string }> }) {
  try {
    // Ожидаем разрешения Promise для получения параметров
    const resolvedParams = await params;
    
    // Проверяем, что ID существует
    if (!resolvedParams.id) {
      return (
        <div className="flex w-full min-h-[70vh] flex-col items-center justify-center gap-6 p-5 bg-gray-50">
          <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="mb-6">
              <FaUser className="mx-auto text-6xl text-gray-300" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Пользователь не найден</h1>
            <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
          </div>
        </div>
      );
    }

    // Получаем данные пользователя, его заказы и транспорт
    const [user, orders, transports] = await Promise.all([
      api.user.getPublicProfile({ userId: resolvedParams.id }),
      api.user.getPublicOrders({ userId: resolvedParams.id }),
      api.user.getPublicTransports({ userId: resolvedParams.id })
    ]);

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Информация о пользователе */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <FaUser className="text-3xl text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-500">
                {user.userType === "carrier" ? (
                  <span className="flex items-center"><FaTruck className="mr-1" /> Перевозчик</span>
                ) : user.userType === "customer" ? (
                  <span className="flex items-center"><FaBox className="mr-1" /> Заказчик</span>
                ) : (
                  "Не указано"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Заказы пользователя */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaBox className="mr-2 text-blue-600" />
              Активные заказы ({orders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-blue-600">№ {order.number}</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {order.status === 'active' ? 'Активный' : order.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-xs" />
                      <span>{order.routeFrom} → {order.routeTo}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaBox className="mr-2 text-xs" />
                      <span>{order.cargoType} ({order.cargoWeight})</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-2 text-xs" />
                      <span>{new Date(order.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {order.price} ₽
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Транспорт пользователя */}
        {transports.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FaTruck className="mr-2 text-green-600" />
              Доступный транспорт ({transports.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {transports.map((transport) => (
                <div key={transport.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {transport.imageUrl && (
                    <div className="mb-3">
                      <Image
                        src={transport.imageUrl}
                        alt={transport.title}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800 mb-2">{transport.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaTruck className="mr-2 text-xs" />
                      <span>{getVehicleTypeName(transport.vehicleType)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaWeight className="mr-2 text-xs" />
                      <span>Грузоподъёмность: {transport.carryingCapacity} кг</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-xs" />
                      <span>{transport.city}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaCalendar className="mr-2 text-xs" />
                      <span>{transport.workPeriod}</span>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {transport.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Сообщение, если нет данных */}
        {orders.length === 0 && transports.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-gray-400 mb-4">
              <FaUser className="mx-auto text-4xl mb-2" />
            </div>
            <p className="text-gray-500">У пользователя пока нет активных заказов или транспорта</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Если пользователь не найден или произошла ошибка, показываем страницу с ошибкой
    const resolvedParams = await params;
    
    return (
      <div className="flex w-full min-h-[70vh] flex-col items-center justify-center gap-6 p-5 bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-6">
            <FaUser className="mx-auto text-6xl text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Пользователь не найден
          </h1>
          <p className="text-gray-500 mb-2">
            ID: <span className="text-gray-400 font-mono">{resolvedParams.id}</span>
          </p>
          <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
        </div>
      </div>
    );
  }
}