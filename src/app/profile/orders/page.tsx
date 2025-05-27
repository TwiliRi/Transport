import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { FaBox, FaCalendar, FaMapMarkerAlt, FaTruck } from "react-icons/fa";
import OrderCard from "../../_components/OrderCard";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth();
  
  // Если пользователь не авторизован, показываем сообщение
  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Необходимо авторизоваться для просмотра заказов</p>
          <Link href="/api/auth/signin" className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }
  
  // Получаем заказы пользователя из базы данных
  const orders = await db.order.findMany({ 
    where: { 
      userId: session.user.id 
    },
    orderBy: {
      date: 'desc' // Сортировка по дате (сначала новые)
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        }
      }
    }
  });
  
  // Преобразуем данные из базы в формат для компонента OrderCard
  const formattedOrders = orders.map(order => ({
    id: order.id,
    number: order.number,
    status: order.status as 'active' | 'completed' | 'cancelled' | "processing",
    date: formatDate(order.date),
    route: {
      from: order.routeFrom,
      to: order.routeTo,
    },
    price: order.price,
    cargo: {
      type: order.cargoType,
      weight: order.cargoWeight,
    },
    description: order.description || undefined,
    imageUrl: order.imageUrl || undefined,
    user: order.user ? {
      id: order.user.id,
      name: order.user.name || "Неизвестный пользователь"
    } : undefined
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Мои заказы</h2>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">Всего заказов: {formattedOrders.length}</p>
        <Link 
          href="/load?page=upload" 
          className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
        >
          Создать новый заказ
        </Link>
      </div>
      
      {/* Список заказов или сообщение, если их нет */}
      <div className="space-y-4">
        {formattedOrders.length > 0 ? (
          formattedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
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
    </div>
  );
}