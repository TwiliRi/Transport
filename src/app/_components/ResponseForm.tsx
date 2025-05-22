"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { FaSpinner } from "react-icons/fa";

interface ResponseFormProps {
  orderId: string;
  onSuccess?: () => void;
}

export default function ResponseForm({ orderId, onSuccess }: ResponseFormProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Проверяем, является ли пользователь перевозчиком
  
  // Мутация для создания отклика
  const createResponseMutation = api.response.create.useMutation({
    onSuccess: () => {
      setMessage("");
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setError(error.message);
    },
  });
  
  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !session?.user.id) {
      setError("Введите сообщение");
      return;
    }
    
   
    
    setError("");
    
    createResponseMutation.mutate({
      orderId,
      message,
    });
  };
  
  if (!session) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        Войдите в систему, чтобы откликнуться на заказ
      </div>
    );
  }
  
  
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Сообщение для заказчика
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите, почему вы подходите для этого заказа..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={createResponseMutation.isPending}
        className="w-full bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
      >
        {createResponseMutation.isPending ? (
          <span className="flex items-center justify-center">
            <FaSpinner className="animate-spin mr-2" /> Отправка...
          </span>
        ) : (
          "Откликнуться на заказ"
        )}
      </button>
    </form>
  );
}