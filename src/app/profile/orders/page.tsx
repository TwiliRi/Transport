import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { FaBox, FaCalendar, FaMapMarkerAlt, FaTruck } from "react-icons/fa";

export default async function OrdersPage() {
  const session = await auth();
  
  // Здесь будет логика получения заказов пользователя из базы данных
  // const orders = await db.order.findMany({ where: { userId: session?.user.id } });
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Мои заказы</h2>
      
      {/* Здесь будет список заказов или сообщение, если их нет */}
      <div className="space-y-4">
        {/* Пример карточки заказа */}
        <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold">Заказ #12345</h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">В пути</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center">
              <FaCalendar className="text-gray-400 mr-2" />
              <span className="text-sm">12.05.2025</span>
            </div>
            <div className="flex items-center">
              <FaTruck className="text-gray-400 mr-2" />
              <span className="text-sm">Газель, 1.5т</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-400 mr-2" />
              <span className="text-sm">Москва → Санкт-Петербург</span>
            </div>
          </div>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Подробнее</button>
        </div>
        
        {/* Здесь будут другие карточки заказов */}
      </div>
    </div>
  );
}