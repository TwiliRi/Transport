"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone, FaTruck, FaBox } from "react-icons/fa";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";

interface EditProfileFormProps {
  initialData: {
    name: string;
    email: string;
    phone: string;
    userType: string | null;
  };
  userId: string;
}

export default function EditProfileForm({ initialData, userId }: EditProfileFormProps) {
  const [name, setName] = useState(initialData.name);
  const [email, setEmail] = useState(initialData.email);
  const [phone, setPhone] = useState(initialData.phone);
  const [userType, setUserType] = useState(initialData.userType || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  
  // Используем tRPC мутацию вместо fetch
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: async (data) => {
      // Обновляем сессию с новыми данными
      await updateSession({
        user: {
          // Сохраняем существующие данные пользователя
          ...session?.user,
          // Обновляем имя
          name: data.name,
          // Добавляем тип пользователя
          userType: data.userType,
        }
      });
      
      setSuccess(true);
      
      // Обновляем данные на странице
      router.refresh();
      
      // Перенаправление на страницу профиля через 2 секунды
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setLoading(false);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка на пустое значение email
    if (!email.trim()) {
      setError("Email не может быть пустым");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      
      updateProfileMutation.mutate({
        name,
        email,
        phone,
        userType,
      });
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла ошибка при обновлении профиля");
      }
      setLoading(false);
    }
  };
  
  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md">
          Профиль успешно обновлен! Перенаправление на страницу профиля...
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Имя
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="Ваше имя"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Телефон
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="+7 999 999 99 99"
            />
          </div>
        </div>
        
        {/* Добавляем выбор типа деятельности */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Тип деятельности
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setUserType("carrier")}
              className={`flex items-center p-4 border ${userType === "carrier" ? "border-black bg-gray-50" : "border-gray-300"} rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}
            >
              <div className="mr-4 text-xl text-gray-700">
                <FaTruck />
              </div>
              <div>
                <h4 className="font-medium">Перевозчик</h4>
                <p className="text-sm text-gray-500">Я хочу перевозить грузы</p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border ${userType === "carrier" ? "border-black bg-black" : "border-gray-300"} flex items-center justify-center`}>
                  {userType === "carrier" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => setUserType("customer")}
              className={`flex items-center p-4 border ${userType === "customer" ? "border-black bg-gray-50" : "border-gray-300"} rounded-lg cursor-pointer hover:bg-gray-50 transition-colors`}
            >
              <div className="mr-4 text-xl text-gray-700">
                <FaBox />
              </div>
              <div>
                <h4 className="font-medium">Заказчик</h4>
                <p className="text-sm text-gray-500">Мне нужно перевезти груз</p>
              </div>
              <div className="ml-auto">
                <div className={`w-5 h-5 rounded-full border ${userType === "customer" ? "border-black bg-black" : "border-gray-300"} flex items-center justify-center`}>
                  {userType === "customer" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Link href="/profile">
            <button type="button" className="bg-gray-100 text-gray-800 font-medium py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
              Отмена
            </button>
          </Link>
          <button
            type="submit"
            disabled={loading}
            className={`bg-black text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </>
  );
}