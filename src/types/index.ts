// ============ ОСНОВНЫЕ ТИПЫ ============

// Статусы
export type OrderStatus = 'active' | 'completed' | 'cancelled' | 'processing';
export type TransportStatus = 'active' | 'inactive' | '';
export type ActivityType = 'order' | 'shipment' | 'payment' | '';
export type TimeFilter = 'week' | 'month' | 'year' | '';

// Опции сортировки
export type SortOption = 'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'route-from' | 'route-to' | '';

// ============ ИНТЕРФЕЙСЫ ТРАНСПОРТА ============

export interface Transport {
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
  status?: TransportStatus;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface TransportUploadFormProps {
  onClose: () => void;
}

export interface EditTransportFormProps {
  transport: Transport;
  onClose: () => void;
}

export interface TruckCardProps {
  transport: Transport;
}

export interface SearchFormProps {
  onFiltersChange: (filters: any) => void;
}

// ============ ИНТЕРФЕЙСЫ ЗАКАЗОВ ============

export interface Order {
  id: string;
  number: string;
  status: OrderStatus;
  date: string;
  route: {
    from: string;
    to: string;
  };
  price: number;
  cargo: {
    type: string;
    weight: string;
  };
  transportType?: {
    value: string;
    label: string;
  };
  imageUrl?: string;
  description?: string;
  customerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EditOrderFormProps {
  order: Order;
  onClose: () => void;
}

// ============ ИНТЕРФЕЙСЫ ОТКЛИКОВ ============

export interface Response {
  id: string;
  status: string;
  message: string;
  createdAt: Date;
  orderId: string;
  carrierId: string;
  carrierName: string;
  customerId: string;
  orderNumber?: string;
  orderRoute?: {
    from: string;
    to: string;
  };
}

export interface ResponseFormProps {
  orderId: string;
  customerId: string;
}

export interface ResponsesListProps {
  orderId: string;
  customerId: string;
}

// ============ ИНТЕРФЕЙСЫ ЧАТОВ ============

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  senderName: string | null;
}

export interface ChatProps {
  responseId: string;
  orderId: string;
  carrierId: string;
  customerId: string;
}

export interface TransportChatProps {
  transportId: string;
  transportTitle?: string;
  driverName?: string;
}

export interface PrivateTransportChatProps {
  transportId: string;
  customerId: string;
  carrierId: string;
}

export interface ChatItem {
  id: string;
  transportTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface TransportChatsListProps {
  userId: string;
}

// ============ ИНТЕРФЕЙСЫ ПРОФИЛЯ ============

export interface EditProfileFormProps {
  onClose: () => void;
}

export interface Activity {
  id: string;
  type: ActivityType;
  date: string;
  time: string;
  title: string;
  details: {
    route?: {
      from: string;
      to: string;
    };
    price?: number;
    cargo?: {
      type: string;
      weight: string;
    };
    status?: string;
    transportType?: string;
  };
}

// ============ ИНТЕРФЕЙСЫ НАВИГАЦИИ ============

export interface NavProps {
  className?: string;
}

// ============ СИСТЕМНЫЕ ИНТЕРФЕЙСЫ ============

export interface ProcessEnv {
  [key: string]: string | undefined;
}

// ============ ТИПЫ ДЛЯ TRPC ============

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '~/server/api/root';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// ============ СЕССИЯ И АУТЕНТИФИКАЦИЯ ============

import type { DefaultSession } from 'next-auth';

export interface Session extends DefaultSession {
  user: {
    id: string;
    role?: string;
  } & DefaultSession['user'];
}