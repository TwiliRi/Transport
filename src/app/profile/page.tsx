import Link from "next/link";
import { auth } from "~/server/auth";
import { FaUser, FaBox, FaTruck, FaSignOutAlt, FaHistory } from "react-icons/fa";
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
                     "Не указано"
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
              
              {/* Пример заказов */}
              <div className="space-y-4">
                {[1, 2, 3].map((order) => (
                  <div key={order} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Заказ #{order}00{order}</span>
                      <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">Выполнен</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      <span>Дата: 10.0{order}.2023</span>
                      <span className="mx-2">•</span>
                      <span>Сумма: {order}0,000 ₽</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">Москва → Санкт-Петербург</span>
                      <button className="text-sm text-black hover:underline">
                        Подробнее
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Если нет заказов */}
                {false && (
                  <div className="text-center py-8">
                    <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">У вас пока нет заказов</p>
                    <Link href="/search" className="mt-3 inline-block text-black hover:underline">
                      Найти перевозчика
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
    
    </>
  );
}
