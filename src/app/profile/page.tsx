import Link from "next/link";
import { auth } from "~/server/auth";
import { FaUser, FaBox, FaTruck, FaSignOutAlt, FaHistory, FaArrowRight } from "react-icons/fa";
import { db } from "~/server/db";

export default async function Profile() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex w-full min-h-[70vh] flex-col items-center justify-center gap-6 p-5 bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-6">
            <FaUser className="mx-auto text-6xl text-gray-300" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Вы не авторизованы</h1>
          <p className="text-gray-600 mb-6">Войдите в систему, чтобы получить доступ к своему профилю</p>
          <Link 
            href="/api/auth/signin" 
            className="inline-block bg-black text-white font-medium py-3 px-6 rounded-md hover:bg-gray-800 transition-colors"
          >
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }
  
  // Получаем дополнительные данные пользователя из БД
  const userData = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      phone: true,
      userType: true,
    },
  });
  
  // Получаем последние 3 заказа пользователя
  const recentOrders = await db.order.findMany({ 
    where: { 
      userId: session.user.id 
    },
    orderBy: {
      date: 'desc' // Сортировка по дате (сначала новые)
    },
    take: 3, // Берем только 3 последних заказа
    include: {
      user: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
  
  // Преобразуем данные из базы в формат для отображения
  const formattedOrders = recentOrders.map(order => ({
    id: order.id,
    number: order.number,
    status: order.status,
    date: formatDate(order.date),
    route: {
      from: order.routeFrom,
      to: order.routeTo,
    },
    price: order.price,
  }));
  
  // Функция для форматирования даты из ISO в формат DD.MM.YYYY
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  
  return (
    <>
    
    <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Информация о профиле</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Имя пользователя</p>
                  <p className="font-medium">{session?.user.name || "Не указано"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="font-medium">{session?.user.email || "Не указано"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Телефон</p>
                  <p className="font-medium">{userData?.phone || "Не указано"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Тип деятельности</p>
                  <p className="font-medium">
                    {userData?.userType === "carrier" ? (
                      <span className="flex items-center"><FaTruck className="mr-1" /> Перевозчик</span>
                    ) : userData?.userType === "customer" ? (
                      <span className="flex items-center"><FaBox className="mr-1" /> Заказчик</span>
                    ) : (
                      "Не указано"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Дата регистрации</p>
                  <p className="font-medium">
                  &ldquo;Не указано&ldquo;
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/profile/edit">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors">
                  Редактировать профиль
                </button>
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Последние заказы</h3>
                <Link href="/profile/orders" className="text-sm text-black hover:underline">
                  Смотреть все
                </Link>
              </div>
              
              <div className="space-y-4">
                {formattedOrders.length > 0 ? (
                  formattedOrders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Заказ #{order.number}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'text-green-600 bg-green-50' : 
                          order.status === 'active' ? 'text-blue-600 bg-blue-50' : 
                          'text-red-600 bg-red-50'
                        }`}>
                          {order.status === 'completed' ? 'Выполнен' : 
                           order.status === 'active' ? 'Активен' : 'Отменен'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        <span>Дата: {order.date}</span>
                        <span className="mx-2">•</span>
                        <span>Сумма: {order.price.toLocaleString()} ₽</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">{order.route.from} → {order.route.to}</span>
                        <Link href={`/orders/${order.id}`} className="text-sm text-black hover:underline flex items-center">
                          Подробнее <FaArrowRight className="ml-1" size={12} />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">У вас пока нет заказов</p>
                    <Link href="/load?page=upload" className="mt-3 inline-block text-black hover:underline">
                      Разместить груз
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="mt-6 text-center">
                <Link 
                  href="/profile/orders" 
                  className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center"
                >
                  Все мои заказы <FaArrowRight className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
    
    </>
  );
}
