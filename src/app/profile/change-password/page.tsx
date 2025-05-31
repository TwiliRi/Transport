"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [checkingPassword, setCheckingPassword] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  // Проверяем, есть ли у пользователя пароль
  useEffect(() => {
    const checkUserPassword = async () => {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          // Проверяем через API, есть ли у пользователя пароль
          const passwordCheckResponse = await fetch("/api/user/check-password");
          if (passwordCheckResponse.ok) {
            const passwordData = await passwordCheckResponse.json();
            setHasPassword(passwordData.hasPassword);
          } else {
            // Если API недоступно, предполагаем что пароль есть
            setHasPassword(true);
          }
        }
      } catch (error) {
        console.error("Ошибка при проверке пароля:", error);
        setHasPassword(true); // По умолчанию предполагаем что пароль есть
      } finally {
        setCheckingPassword(false);
      }
    };

    if (session) {
      checkUserPassword();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Валидация на клиенте
    if (hasPassword && !currentPassword) {
      setError("Текущий пароль обязателен");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Новый пароль и подтверждение обязательны для заполнения");
      return;
    }

    if (newPassword.length < 6) {
      setError("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    if (hasPassword && currentPassword === newPassword) {
      setError("Новый пароль должен отличаться от текущего");
      return;
    }

    try {
      setLoading(true);

      const requestBody: any = {
        newPassword,
        confirmPassword,
      };

      // Добавляем текущий пароль только если он есть у пользователя
      if (hasPassword) {
        requestBody.currentPassword = currentPassword;
      }

      const response = await fetch("/api/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при смене пароля");
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Перенаправляем на страницу профиля через 2 секунды
      setTimeout(() => {
        router.push("/profile");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла неизвестная ошибка");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingPassword) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-600">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Заголовок с кнопкой назад */}
      <div className="flex items-center mb-6">
        <Link 
          href="/profile/edit" 
          className="mr-4 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FaArrowLeft className="text-lg" />
        </Link>
        <div className="flex items-center">
          <FaLock className="text-2xl text-gray-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">
            {hasPassword ? "Изменить пароль" : "Установить пароль"}
          </h1>
        </div>
      </div>

      {/* Информационное сообщение для пользователей Google */}
      {!hasPassword && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-sm">
            Вы вошли через Google. Установите пароль для возможности входа с помощью email и пароля.
          </p>
        </div>
      )}

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">
            {hasPassword ? "Пароль успешно изменен!" : "Пароль успешно установлен!"} Перенаправляем в профиль...
          </p>
        </div>
      )}

      {/* Форма смены пароля */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Текущий пароль - показываем только если у пользователя есть пароль */}
        {hasPassword && (
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Текущий пароль
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Введите текущий пароль"
                required={hasPassword}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        )}

        {/* Новый пароль */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {hasPassword ? "Новый пароль" : "Пароль"}
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder={hasPassword ? "Введите новый пароль" : "Введите пароль"}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Минимум 6 символов</p>
        </div>

        {/* Подтверждение пароля */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Подтверждение пароля
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Повторите пароль"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Обработка..." : (hasPassword ? "Изменить пароль" : "Установить пароль")}
          </button>
          <Link
            href="/profile/edit"
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
          >
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
}