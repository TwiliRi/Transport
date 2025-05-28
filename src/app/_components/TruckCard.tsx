"use client";

import Image from "next/image";
import Car from "~/public/car.png";
import { useState } from "react";
import {
  FaTruck,
  FaUser,
  FaMapMarkerAlt,
  FaCalendar,
  FaRuler,
  FaWeight,
  FaClock,
  FaPhone,
  FaTelegram,
  FaWhatsapp,
  FaComments,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "~/utils/formatDate";
import Chat from "./Chat";
import { useSession } from "next-auth/react";
import EditTransportForm from "./EditTransportForm";
import TransportChat from "./TransportChat";
import PrivateTransportChat from "./PrivateTransportChat";
import TransportChatsList from "./TransportChatsList";

// Определяем интерфейс для пропсов компонента
interface TruckCardProps {
  transport: {
    id: string;
    title: string;
    vehicleType: string;
    carryingCapacity: number;
    platformLength?: number | null;
    platformWidth?: number | null;
    description?: string | null;
    workPeriod: string;
    city: string;
    minOrderTime: string;
    price: string;
    driverName: string;
    phoneNumber: string;
    imageUrl?: string | null;
    createdAt: Date;
    userId?: string; // ID владельца транспорта
  };
}

// Функция для получения названия типа транспорта
const getVehicleTypeName = (typeValue: string) => {
  // Стандартные типы
  const standardTypes: Record<string, string> = {
    all: "Любой",
    truck: "Грузовик",
    truck_with_trailer: "Фура",
    car: "Легковой автомобиль",
    van: "Микроавтобус",
    refrigerator: "Рефрижератор",
    tanker: "Автоцистерна",
    container: "Контейнеровоз",
    tow_truck: "Эвакуатор",
    dump_truck: "Самосвал",
    flatbed: "Платформа",
    crane: "Кран",
    any: "Любой тип",
  };

  // Если это стандартный тип, возвращаем его название
  if (typeValue in standardTypes) {
    return standardTypes[typeValue];
  }

  // По умолчанию
  return "Не указан";
};

export default function TruckCard({ transport }: TruckCardProps) {
  const { data: session } = useSession();

  // Состояния для модальных окон
  const [showChatsList, setShowChatsList] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false); // Добавляем состояние для формы редактирования
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Проверяем, является ли текущий пользователь владельцем транспорта
  const isOwner = session?.user?.id === transport.userId;

  // Форматируем дату создания
  const createdAtFormatted = transport.createdAt.toLocaleDateString("ru-RU");

  // Функция для обработки выбора сервиса связи
  const handleServiceSelect = (service: string) => {
    const phone = transport.phoneNumber.replace(/[^\d]/g, ""); // Убираем все кроме цифр
    const message = encodeURIComponent(
      `Здравствуйте! Интересует ваш транспорт: ${transport.title}`,
    );

    switch (service) {
      case "telegram":
        // Изменяем ссылку на Telegram - используем username вместо номера
        window.open(`https://t.me/${phone}`, "_blank");
        break;
      case "whatsapp":
        // Открываем WhatsApp
        window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
        break;

      case "chat":
        setShowChat(true);
        setShowContact(false);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1366px] justify-between space-x-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md max-[700px]:flex-col max-[700px]:items-center sm:p-6">
        <div className="flex-shrink-0">
          {transport.imageUrl ? (
            <Image
              src={transport.imageUrl}
              alt={transport.title}
              width={192}
              height={192}
              className="h-48 w-48 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-200">
              <FaTruck className="text-6xl text-gray-500" />
            </div>
          )}

          <div className="mt-2 text-sm text-gray-500">
            <FaCalendar className="mr-1 inline" /> Дата создания:{" "}
            {createdAtFormatted}
          </div>
        </div>
        <div className="flex-grow">
          <h2 className="text-lg font-bold">{transport.title}</h2>
          <div className="flex gap-3 max-[940px]:grid max-[940px]:grid-cols-2 max-[700px]:grid-cols-1">
            <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
              <FaTruck className="mr-1 inline" />{" "}
              {getVehicleTypeName(transport.vehicleType)}
            </p>
            <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
              <FaWeight className="mr-1 inline" /> {transport.price}
            </p>
            <p className="rounded-xl bg-gray-200 px-2 py-1 text-sm text-gray-800">
              <FaClock className="mr-1 inline" /> Минимум{" "}
              {transport.minOrderTime}ч.
            </p>
          </div>
          <div className="mt-4">
            <div className="flex text-sm text-gray-800">
              <div className="w-48">
                <FaWeight className="mr-1 inline" /> Грузоподъёмность, кг
              </div>
              <div>- {transport.carryingCapacity}</div>
            </div>
            {transport.platformLength && (
              <div className="flex text-sm text-gray-800">
                <div className="w-48">
                  <FaRuler className="mr-1 inline" /> Длина платформы, м
                </div>
                <div>- {transport.platformLength}</div>
              </div>
            )}
            {transport.platformWidth && (
              <div className="flex text-sm text-gray-800">
                <div className="w-48">
                  <FaRuler className="mr-1 inline" /> Ширина платформы, м
                </div>
                <div>- {transport.platformWidth}</div>
              </div>
            )}
            {transport.description && (
              <div className="mt-2 text-sm text-gray-500">
                {transport.description}
              </div>
            )}
          </div>
        </div>
        <div className="flex max-w-[400px] flex-col items-end justify-between max-[700px]:w-full max-[700px]:items-center max-[700px]:gap-7 max-[700px]:text-center">
          <div className="text-sm text-gray-500">
            <FaCalendar className="mr-1 inline" /> {transport.workPeriod}
          </div>
          <div className="flex flex-col justify-center space-y-2 max-[700px]:w-full max-[700px]:items-center">
            {isOwner ? (
              // Если пользователь - владелец, показываем кнопку редактирования
              <button
                className="w-full min-w-[200px] rounded bg-black px-4 py-2 whitespace-nowrap text-white hover:bg-gray-800"
                onClick={() => setShowEditForm(true)}
              >
                Редактировать
              </button>
            ) : (
              // Если не владелец, показываем кнопку связи
              <button
                className="w-full min-w-[200px] rounded bg-black px-4 py-2 whitespace-nowrap text-white hover:bg-gray-800"
                onClick={() => setShowContact(true)}
              >
                Связаться
              </button>
            )}

            {isOwner ? (
              // Для владельца показываем кнопку "Открыть чаты" вместо "Подробнее"
              <button 
                  className="w-full px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center min-w-[200px]"
                  onClick={() => setShowChatsList(!showChatsList)}
                >
                  <FaComments className="mr-2" />
                  {showChatsList ? "Скрыть чаты" : "Открыть чаты"}
                </button>
            ) : (
              // Для не владельца оставляем кнопку "Подробнее"
              <button
                className="w-full rounded bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300"
                onClick={() => setShowDetails(true)}
              >
                Подробнее
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <FaMapMarkerAlt className="mr-1 inline" /> {transport.city}
          </div>
        </div>
      </div>

      {/* Модальное окно с вариантами связи */}
      <AnimatePresence>
        {showContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowContact(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowContact(false)}
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <h4 className="mb-4 text-xl font-semibold">
                Выберите способ связи
              </h4>

              <div className="space-y-3">
                {/* Внутренний чат */}
                {session && (
                  <button
                    onClick={() => handleServiceSelect("chat")}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                  >
                    <FaComments className="text-xl text-blue-600" />
                    <span className="font-medium text-blue-800">
                      Внутренний чат
                    </span>
                  </button>
                )}

                {/* Telegram */}
                <button
                  onClick={() => handleServiceSelect("telegram")}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                >
                  <FaTelegram className="text-xl text-blue-500" />
                  <span className="font-medium text-blue-800">Telegram</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => handleServiceSelect("whatsapp")}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-green-50 p-4 transition-colors hover:bg-green-100"
                >
                  <FaWhatsapp className="text-xl text-green-500" />
                  <span className="font-medium text-green-800">WhatsApp</span>
                </button>

                {/* Авито */}
                <button
                  onClick={() => handleServiceSelect("avito")}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-yellow-50 p-4 transition-colors hover:bg-yellow-100"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500">
                    <span className="text-xs font-bold text-white">А</span>
                  </div>
                  <span className="font-medium text-yellow-800">Авито</span>
                </button>

                {/* Прямой звонок */}
                <a
                  href={`tel:${transport.phoneNumber}`}
                  className="flex w-full items-center justify-center gap-3 rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <FaPhone className="text-xl text-gray-600" />
                  <span className="font-medium text-gray-800">
                    Позвонить: {transport.phoneNumber}
                  </span>
                </a>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowContact(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Модальное окно чата */}
      <AnimatePresence>
        {showChat && session && transport.userId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowChat(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowChat(false)}
                className="absolute top-3 right-3 z-10 text-2xl text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <h4 className="mb-4 text-xl font-semibold">
                Чат с {transport.driverName}
              </h4>
              // В модальном окне чата заменяем компонент Chat на TransportChat
              <div className="h-96">
                <PrivateTransportChat
                  transportId={transport.id}
                  ownerId={transport.userId}
                  transportTitle={transport.title}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Модальное окно редактирования */}
      <AnimatePresence>
        {showEditForm && (
          <EditTransportForm
            transport={transport}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </AnimatePresence>
        
      {/* Отображение списка чатов под карточкой транспорта */}
      {showChatsList && isOwner && (
        <div className="border border-gray-200 rounded-lg bg-white p-4 shadow-sm mb-4">
          <TransportChatsList
            transportId={transport.id}
            onClose={() => setShowChatsList(false)}
          />
        </div>
      )}

      {/* Модальное окно с подробной информацией */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
              <h4 className="mb-4 text-xl font-semibold">{transport.title}</h4>

              {transport.imageUrl && (
                <div className="mb-4">
                  <Image
                    src={transport.imageUrl}
                    alt={transport.title}
                    width={400}
                    height={300}
                    className="max-h-[300px] w-full rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h5 className="mb-2 font-semibold">Основная информация:</h5>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FaTruck className="mr-2 text-gray-500" />
                      <span>
                        Тип: {getVehicleTypeName(transport.vehicleType)}
                      </span>
                    </li>
                    <li className="flex items-center">
                      <FaWeight className="mr-2 text-gray-500" />
                      <span>
                        Грузоподъемность: {transport.carryingCapacity} т
                      </span>
                    </li>
                    <li className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      <span>Город: {transport.city}</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="mb-2 font-semibold">Дополнительно:</h5>
                  <ul className="space-y-2">
                    {transport.platformLength && (
                      <li className="flex items-center">
                        <FaRuler className="mr-2 text-gray-500" />
                        <span>
                          Длина платформы: {transport.platformLength} м
                        </span>
                      </li>
                    )}
                    {transport.platformWidth && (
                      <li className="flex items-center">
                        <FaRuler className="mr-2 text-gray-500" />
                        <span>
                          Ширина платформы: {transport.platformWidth} м
                        </span>
                      </li>
                    )}
                    <li className="flex items-center">
                      <FaClock className="mr-2 text-gray-500" />
                      <span>Мин. время заказа: {transport.minOrderTime} ч</span>
                    </li>
                    <li className="flex items-center">
                      <FaCalendar className="mr-2 text-gray-500" />
                      <span>Период работы: {transport.workPeriod}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {transport.description && (
                <div className="mb-4">
                  <h5 className="mb-2 font-semibold">Описание:</h5>
                  <p className="text-sm whitespace-pre-line text-gray-700">
                    {transport.description}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                {isOwner ? (
                  // Если пользователь - владелец, показываем кнопку связи
                  <button
                    className="rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800"
                    onClick={() => setShowContact(true)}
                  >
                    Связаться
                  </button>
                ) : (
                  ""
                )}
                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
                >
                  Закрыть
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
