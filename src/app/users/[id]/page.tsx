import { notFound } from "next/navigation";
import { FaUser, FaTruck, FaBox } from "react-icons/fa";
import { api } from "~/trpc/server";

export default async function PublicProfile({ params }: { params: { id: string } }) {
  try {
    // Проверяем, что ID существует
    if (!params.id) {
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

    const user = await api.user.getPublicProfile({ userId: params.id });

    return (
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Дополнительная информация */}
        </div>
      </div>
    );
  } catch (error) {
    // Если пользователь не найден или произошла ошибка, показываем страницу с ошибкой
    return (
      <div className="flex w-full min-h-[70vh] flex-col items-center justify-center gap-6 p-5 bg-gray-50">
        <div className="bg-white p-10 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="mb-6">
            <FaUser className="mx-auto text-6xl text-gray-300" />
          </div>
          {/* Исправляем отображение ID пользователя */}
          <h1 className="text-3xl font-bold mb-4 text-gray-800">
            Пользователь не найден
          </h1>
          <p className="text-gray-500 mb-2">
            ID: <span className="text-gray-400 font-mono">{params.id}</span>
          </p>
          <p className="text-gray-600 mb-6">Запрашиваемый профиль не существует или был удален</p>
        </div>
      </div>
    );
  }
}