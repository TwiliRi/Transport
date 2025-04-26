'use client';

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Icon from "~/public/ico.png";
import { useState } from "react";

export default function SignIn() {
  const [credentials, setCredentials] = useState({
    login: '',
    password: '',
    remember: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика входа
    await signIn('credentials', {
      login: credentials.login,
      password: credentials.password,
      callbackUrl: '/'
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-6 px-6">
        <div className="flex flex-col items-center">
          <Image src={Icon} alt="В пути" className="w-24 mb-4" />
          <h1 className="text-2xl font-medium mb-8">Вход</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm">Логин</label>
            <div className="relative">
              <input
                type="text"
                value={credentials.login}
                onChange={(e) => setCredentials({...credentials, login: e.target.value})}
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                placeholder="Логин"
              />
              {credentials.login && (
                <button
                  type="button"
                  onClick={() => setCredentials({...credentials, login: ''})}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="block text-sm">Пароль</label>
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:underline">
                Забыли пароль?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
                placeholder="Пароль"
              />
              {credentials.password && (
                <button
                  type="button"
                  onClick={() => setCredentials({...credentials, password: ''})}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={credentials.remember}
              onChange={(e) => setCredentials({...credentials, remember: e.target.checked})}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
              Запомнить пароль
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            Вход
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <Link href="/registration" className="text-black hover:underline">
              Регистрация
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}