"use client";
import { useState } from "react";
import { api } from "~/trpc/react";
import { FaTrash, FaBox, FaTruck, FaComments, FaUsers, FaChartBar, FaEdit, FaSave, FaTimes, FaUserShield, FaUserTimes } from "react-icons/fa";

type TabType = 'stats' | 'orders' | 'transports' | 'messages' | 'users';

interface EditingOrder {
  id: string;
  number: string;
  status: string;
  date: string;
  routeFrom: string;
  routeTo: string;
  price: number;
  cargoType: string;
  cargoWeight: string;
  description: string;
  imageUrl: string;
}

interface EditingTransport {
  id: string;
  title: string;
  vehicleType: string;
  carryingCapacity: number;
  platformLength: number;
  platformWidth: number;
  description: string;
  workPeriod: string;
  city: string;
  minOrderTime: string;
  price: string;
  driverName: string;
  phoneNumber: string;
  imageUrl: string;
  status: string;
}

interface EditingUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  isAdmin: boolean;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('stats');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<EditingOrder | null>(null);
  const [editingTransport, setEditingTransport] = useState<EditingTransport | null>(null);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);

  // Запросы данных
  const { data: stats, refetch: refetchStats } = api.admin.getStats.useQuery();
  const { data: orders, refetch: refetchOrders } = api.admin.getAllOrders.useQuery(
    undefined,
    { enabled: activeTab === 'orders' }
  );
  const { data: transports, refetch: refetchTransports } = api.admin.getAllTransports.useQuery(
    undefined,
    { enabled: activeTab === 'transports' }
  );
  const { data: messages, refetch: refetchMessages } = api.admin.getAllMessages.useQuery(
    undefined,
    { enabled: activeTab === 'messages' }
  );
  const { data: users, refetch: refetchUsers } = api.admin.getAllUsers.useQuery(
    undefined,
    { enabled: activeTab === 'users' }
  );

  // Мутации для удаления
  const deleteOrderMutation = api.admin.deleteOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      refetchStats();
      setConfirmDelete(null);
    },
    onError: (error) => {
      alert(`Ошибка удаления заказа: ${error.message}`);
    },
  });

  const deleteTransportMutation = api.admin.deleteTransport.useMutation({
    onSuccess: () => {
      refetchTransports();
      refetchStats();
      setConfirmDelete(null);
    },
    onError: (error) => {
      alert(`Ошибка удаления транспорта: ${error.message}`);
    },
  });

  const deleteMessageMutation = api.admin.deleteMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      refetchStats();
      setConfirmDelete(null);
    },
    onError: (error) => {
      alert(`Ошибка удаления сообщения: ${error.message}`);
    },
  });


  // Мутации для редактирования
  const updateOrderMutation = api.admin.updateOrder.useMutation({
    onSuccess: () => {
      refetchOrders();
      setEditingOrder(null);
    },
    onError: (error) => {
      alert(`Ошибка редактирования заказа: ${error.message}`);
    },
  });

  const updateTransportMutation = api.admin.updateTransport.useMutation({
    onSuccess: () => {
      refetchTransports();
      setEditingTransport(null);
    },
    onError: (error) => {
      alert(`Ошибка редактирования транспорта: ${error.message}`);
    },
  });

  const handleEditOrder = (order: any) => {
    setEditingOrder({
      id: order.id,
      number: order.number,
      status: order.status,
      date: order.date,
      routeFrom: order.routeFrom,
      routeTo: order.routeTo,
      price: order.price,
      cargoType: order.cargoType,
      cargoWeight: order.cargoWeight,
      description: order.description || '',
      imageUrl: order.imageUrl || '',
    });
  };

  const handleEditTransport = (transport: any) => {
    setEditingTransport({
      id: transport.id,
      title: transport.title,
      vehicleType: transport.vehicleType,
      carryingCapacity: transport.carryingCapacity,
      platformLength: transport.platformLength || 0,
      platformWidth: transport.platformWidth || 0,
      description: transport.description || '',
      workPeriod: transport.workPeriod,
      city: transport.city,
      minOrderTime: transport.minOrderTime,
      price: transport.price,
      driverName: transport.driverName,
      phoneNumber: transport.phoneNumber,
      imageUrl: transport.imageUrl || '',
      status: transport.status,
    });
  };

  const handleSaveOrder = () => {
    if (editingOrder) {
      updateOrderMutation.mutate(editingOrder);
    }
  };

  const handleSaveTransport = () => {
    if (editingTransport) {
      updateTransportMutation.mutate(editingTransport);
    }
  };


 

  // Мутации для пользователей
  const updateUserMutation = api.admin.updateUser.useMutation({
    onSuccess: () => {
      refetchUsers();
      refetchStats();
      setEditingUser(null);
    },
    onError: (error) => {
      alert(`Ошибка редактирования пользователя: ${error.message}`);
    },
  });

  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      refetchUsers();
      refetchStats();
      setConfirmDelete(null);
    },
    onError: (error) => {
      alert(`Ошибка удаления пользователя: ${error.message}`);
    },
  });

  const toggleUserStatusMutation = api.admin.toggleUserStatus.useMutation({
    onSuccess: () => {
      refetchUsers();
    },
    onError: (error) => {
      alert(`Ошибка изменения статуса: ${error.message}`);
    },
  });

  const handleEditUser = (user: any) => {
    setEditingUser({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      userType: user.userType || 'customer',
      isAdmin: user.isAdmin,
    });
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserMutation.mutate(editingUser);
    }
  };

  const handleToggleAdmin = (userId: string, currentStatus: boolean) => {
    toggleUserStatusMutation.mutate({
      id: userId,
      isAdmin: !currentStatus,
    });
  };

  const handleDelete = (type: 'order' | 'transport' | 'message' | 'user', id: string) => {
    if (confirmDelete === `${type}-${id}`) {
      switch (type) {
        case 'order':
          deleteOrderMutation.mutate({ id });
          break;
        case 'transport':
          deleteTransportMutation.mutate({ id });
          break;
        case 'message':
          deleteMessageMutation.mutate({ id });
          break;
        case 'user':
          deleteUserMutation.mutate({ id });
          break;
      }
    } else {
      setConfirmDelete(`${type}-${id}`);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Админ-панель</h1>

      {/* Навигация по табам */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'stats'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaChartBar className="mr-2" />
          Статистика
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'users'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaUsers className="mr-2" />
          Пользователи ({stats?.users || 0})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'orders'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaBox className="mr-2" />
          Заказы ({stats?.orders || 0})
        </button>
        <button
          onClick={() => setActiveTab('transports')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'transports'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaTruck className="mr-2" />
          Транспорт ({stats?.transports || 0})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'messages'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FaComments className="mr-2" />
          Сообщения ({stats?.messages || 0})
        </button>
      </div>

      {/* Контент табов */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Статистика системы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <FaUsers className="text-blue-600 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Пользователи</p>
                    <p className="text-2xl font-bold text-blue-600">{stats?.users || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <FaBox className="text-green-600 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Заказы</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.orders || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <FaTruck className="text-yellow-600 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Транспорт</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats?.transports || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <FaComments className="text-purple-600 text-2xl mr-4" />
                  <div>
                    <p className="text-sm text-gray-600">Сообщения</p>
                    <p className="text-2xl font-bold text-purple-600">{stats?.messages || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Управление заказами</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">№ заказа</th>
                    <th className="px-4 py-2 text-left">Пользователь</th>
                    <th className="px-4 py-2 text-left">Маршрут</th>
                    <th className="px-4 py-2 text-left">Цена</th>
                    <th className="px-4 py-2 text-left">Статус</th>
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      {editingOrder?.id === order.id ? (
                        // Форма редактирования
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editingOrder.number}
                              onChange={(e) => setEditingOrder({...editingOrder, number: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">{order.user.name}</td>
                          <td className="px-4 py-2">
                            <div className="space-y-1">
                              <input
                                type="text"
                                value={editingOrder.routeFrom}
                                onChange={(e) => setEditingOrder({...editingOrder, routeFrom: e.target.value})}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Откуда"
                              />
                              <input
                                type="text"
                                value={editingOrder.routeTo}
                                onChange={(e) => setEditingOrder({...editingOrder, routeTo: e.target.value})}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Куда"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={editingOrder.price}
                              onChange={(e) => setEditingOrder({...editingOrder, price: Number(e.target.value)})}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editingOrder.status}
                              onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            >
                              <option value="active">Активный</option>
                              <option value="completed">Завершен</option>
                              <option value="cancelled">Отменен</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editingOrder.date}
                              onChange={(e) => setEditingOrder({...editingOrder, date: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveOrder}
                                className="text-green-600 hover:text-green-800"
                                title="Сохранить"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => setEditingOrder(null)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Отменить"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Обычное отображение
                        <>
                          <td className="px-4 py-2 font-medium">{order.number}</td>
                          <td className="px-4 py-2">{order.user.name}</td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              <div>От: {order.routeFrom}</div>
                              <div>До: {order.routeTo}</div>
                            </div>
                          </td>
                          <td className="px-4 py-2">{order.price} ₽</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'active' ? 'bg-green-100 text-green-800' :
                              order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditOrder(order)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Редактировать"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete('order', order.id)}
                                className={`${
                                  confirmDelete === `order-${order.id}`
                                    ? 'text-red-800 bg-red-100 px-2 py-1 rounded'
                                    : 'text-red-600 hover:text-red-800'
                                }`}
                                title={confirmDelete === `order-${order.id}` ? 'Подтвердить удаление' : 'Удалить'}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transports' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Управление транспортом</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Название</th>
                    <th className="px-4 py-2 text-left">Владелец</th>
                    <th className="px-4 py-2 text-left">Тип</th>
                    <th className="px-4 py-2 text-left">Грузоподъемность</th>
                    <th className="px-4 py-2 text-left">Город</th>
                    <th className="px-4 py-2 text-left">Статус</th>
                    <th className="px-4 py-2 text-left">Дата</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {transports?.map((transport) => (
                    <tr key={transport.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{transport.title}</td>
                      <td className="px-4 py-2">
                        {transport.user.name || transport.user.email}
                      </td>
                      <td className="px-4 py-2">{transport.vehicleType}</td>
                      <td className="px-4 py-2">{transport.carryingCapacity}т</td>
                      <td className="px-4 py-2">{transport.city}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          transport.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transport.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(transport.createdAt)}</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete('transport', transport.id)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            confirmDelete === `transport-${transport.id}`
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          <FaTrash className="inline mr-1" />
                          {confirmDelete === `transport-${transport.id}` ? 'Удалить?' : 'Удалить'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Управление сообщениями</h2>
            <div className="space-y-4">
              {messages?.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">
                          {message.sender.name || message.sender.email}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{message.content}</p>
                      {message.response?.order && (
                        <p className="text-sm text-blue-600">
                          Заказ: #{message.response.order.number}
                        </p>
                      )}
                      {message.privateChat?.transport && (
                        <p className="text-sm text-green-600">
                          Транспорт: {message.privateChat.transport.title}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete('message', message.id)}
                      className={`px-3 py-1 rounded text-sm transition-colors ml-4 ${
                        confirmDelete === `message-${message.id}`
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      <FaTrash className="inline mr-1" />
                      {confirmDelete === `message-${message.id}` ? 'Удалить?' : 'Удалить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Управление пользователями</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Имя</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Телефон</th>
                    <th className="px-4 py-2 text-left">Тип</th>
                    <th className="px-4 py-2 text-left">Админ</th>
                    <th className="px-4 py-2 text-left">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      {editingUser && editingUser.id === user.id ? (
                        // Режим редактирования
                        <>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Имя"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Email"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="text"
                              value={editingUser.phone}
                              onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                              placeholder="Телефон"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={editingUser.userType}
                              onChange={(e) => setEditingUser({...editingUser, userType: e.target.value})}
                              className="w-full px-2 py-1 border rounded"
                            >
                              <option value="customer">Заказчик</option>
                              <option value="carrier">Перевозчик</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={editingUser.isAdmin}
                              onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                              className="w-4 h-4"
                            />
                          </td>
                          
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSaveUser}
                                className="text-green-600 hover:text-green-800"
                                title="Сохранить"
                              >
                                <FaSave />
                              </button>
                              <button
                                onClick={() => setEditingUser(null)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Отменить"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // Обычное отображение
                        <>
                          <td className="px-4 py-2 font-medium">{user.name || 'Не указано'}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">{user.phone || 'Не указан'}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.userType === 'carrier' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.userType === 'carrier' ? 'Перевозчик' : 'Заказчик'}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.isAdmin ? 'Админ' : 'Пользователь'}
                            </span>
                          </td>
                          
                          <td className="px-4 py-2">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Редактировать"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                                className="text-purple-600 hover:text-purple-800"
                                title={user.isAdmin ? 'Убрать права админа' : 'Сделать админом'}
                              >
                                <FaUserShield />
                              </button>
                              <button
                                onClick={() => handleDelete('user', user.id)}
                                className={`${
                                  confirmDelete === `user-${user.id}`
                                    ? 'text-red-800 bg-red-100 px-2 py-1 rounded'
                                    : 'text-red-600 hover:text-red-800'
                                }`}
                                title={confirmDelete === `user-${user.id}` ? 'Подтвердить удаление' : 'Удалить'}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )};