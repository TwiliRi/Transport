"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaExclamationTriangle } from "react-icons/fa";
import { signOut } from "next-auth/react";

export default function DeleteAccountPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Ошибка при удалении аккаунта");
      }

      // Выход из системы после успешного удаления
      await signOut({ redirect: false ,  callbackUrl: "/?accountDeleted=true" });
      
      // Перенаправление на главную страницу
      router.refresh();
      router.push("/?accountDeleted=true");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла ошибка при удалении аккаунта");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <FaExclamationTriangle className="mx-auto text-5xl text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Удаление аккаунта</h1>
        <p className="text-gray-600">
          Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-red-50 p-4 rounded-md mb-6">
        <p className="text-red-700 font-medium mb-2">Внимание!</p>
        <ul className="list-disc list-inside text-red-600 space-y-1 text-sm">
          <li>Все ваши данные будут безвозвратно удалены</li>
          <li>Вы потеряете доступ ко всем заказам и перевозкам</li>
          <li>Это действие нельзя отменить</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <Link href="/profile/edit">
          <button
            type="button"
            className="w-full sm:w-auto py-2 px-6 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        </Link>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="w-full sm:w-auto bg-red-600 text-white font-medium py-2 px-6 rounded-md hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Удаление..." : "Подтвердить удаление"}
        </button>
      </div>
    </div>
  );
}