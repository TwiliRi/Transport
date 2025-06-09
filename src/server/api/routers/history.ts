import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Order, Transport, Response } from "~/types";

interface ActivityItem {
  id: string;
  type: 'order' | 'transport' | 'response' | 'message' | 'chat';
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
    description?: string;
  };
  createdAt: Date;
}

export const historyRouter = createTRPCRouter({
  getUserActivity: protectedProcedure
    .input(z.object({
      typeFilter: z.enum(['order', 'transport', 'response', 'message', 'chat', '']).optional(),
      timeFilter: z.enum(['week', 'month', 'year', '']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const activities: ActivityItem[] = [];

      // Получаем заказы пользователя
      const orders = await ctx.db.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      orders.forEach((order: Order) => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          date: new Date(order.createdAt || new Date()).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(order.createdAt || new Date()).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Заказ #${order.number} ${order.status === 'active' ? 'создан' : order.status === 'completed' ? 'завершен' : 'отменен'}`,
          details: {
            route: {
              from: order.route.from,
              to: order.route.to
            },
            price: order.price,
            cargo: {
              type: order.cargo.type,
              weight: order.cargo.weight
            },
            status: order.status
          },
          createdAt: order.createdAt || new Date()
        });
      });

      // Получаем транспорт пользователя
      const transports = await ctx.db.transport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      transports.forEach((transport: Transport) => {
        activities.push({
          id: `transport-${transport.id}`,
          type: 'transport',
          date: new Date(transport.createdAt || new Date()).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(transport.createdAt || new Date()).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Транспорт "${transport.title}" ${transport.status === 'active' ? 'добавлен' : 'деактивирован'}`,
          details: {
            description: `${transport.vehicleType}, грузоподъемность: ${transport.carryingCapacity} кг`,
            status: transport.status || 'active'
          },
          createdAt: transport.createdAt || new Date()
        });
      });

      // Получаем отклики пользователя
      const responses = await ctx.db.response.findMany({
        where: { carrierId: userId },
        include: {
          order: true
        },
        orderBy: { createdAt: 'desc' },
      });

      responses.forEach((response: Response & { order: any }) => {
        activities.push({
          id: `response-${response.id}`,
          type: 'response',
          date: new Date(response.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(response.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Отклик на заказ #${response.orderNumber || 'N/A'} ${response.status === 'pending' ? 'отправлен' : response.status === 'accepted' ? 'принят' : 'отклонен'}`,
          details: {
            route: response.orderRoute ? {
              from: response.orderRoute.from,
              to: response.orderRoute.to
            } : undefined,
            status: response.status
          },
          createdAt: response.createdAt
        });
      });

      // Получаем приватные чаты пользователя
      const privateChats = await ctx.db.privateChat.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { clientId: userId }
          ]
        },
        include: {
          transport: true,
          owner: true,
          client: true
        },
        orderBy: { createdAt: 'desc' },
      });

      privateChats.forEach((chat: { 
        id: string;
        ownerId: string;
        clientId: string;
        createdAt: Date;
        transport: {
          title: string;
          vehicleType: string;
        };
        owner: {
          name: string;
        };
        client: {
          name: string;
        };
      }) => {
        const isOwner = chat.ownerId === userId;
        const otherUser = isOwner ? chat.client : chat.owner;
        
        activities.push({
          id: `chat-${chat.id}`,
          type: 'chat',
          date: new Date(chat.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(chat.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Начат чат по транспорту "${chat.transport.title}" с ${otherUser.name}`,
          details: {
            description: `Обсуждение транспорта: ${chat.transport.vehicleType}`,
            status: 'active'
          },
          createdAt: chat.createdAt
        });
      });

      // Сортируем все активности по дате создания (новые сначала)
      activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Применяем фильтры
      let filteredActivities = activities;

      if (input?.typeFilter ) {
        filteredActivities = filteredActivities.filter(activity => activity.type === input.typeFilter);
      }

      if (input?.timeFilter) {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (input.timeFilter) {
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            cutoffDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredActivities = filteredActivities.filter(activity => activity.createdAt >= cutoffDate);
      }

      return filteredActivities;
    }),
});