import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
import Link from "next/link";
import { redirect } from "next/navigation";
import EditProfileForm from "../../_components/EditProfileForm";

export default async function EditProfilePage() {
  const session = await auth();

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FaUser className="mx-auto text-4xl text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Необходимо авторизоваться для редактирования профиля</p>
          <Link href="/api/auth/signin" className="bg-black text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 transition-colors">
            Войти в аккаунт
          </Link>
        </div>
      </div>
    );
  }
  
  // Получаем данные пользователя из БД
  const userData = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      userType: true,
    },
  });
  
  if (!userData) {
    return redirect("/profile");
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-xl font-bold mb-6 text-gray-800">Редактирование профиля</h1>
      
      <EditProfileForm 
        initialData={{
          name: userData?.name || "",
          email: userData?.email || "",
          phone: userData?.phone || "",
          userType: userData?.userType || null,
        }} 
        userId={session.user.id} 
      />
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-lg font-medium mb-4 text-gray-800">Дополнительные настройки</h2>
        
        <div className="space-y-4">
          <div>
            <Link href="/profile/change-password">
              <button className="text-red-600 hover:text-red-800 transition-colors">
                Изменить пароль
              </button>
            </Link>
          </div>
          
          <div>
            <Link href="/profile/delete-account">
              <button className="text-red-600 hover:text-red-800 transition-colors">
                Удалить аккаунт
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}