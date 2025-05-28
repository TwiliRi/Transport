import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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

      orders.forEach(order => {
        activities.push({
          id: `order-${order.id}`,
          type: 'order',
          date: new Date(order.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(order.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Заказ #${order.number} ${order.status === 'active' ? 'создан' : order.status === 'completed' ? 'завершен' : 'отменен'}`,
          details: {
            route: {
              from: order.routeFrom,
              to: order.routeTo
            },
            price: order.price,
            cargo: {
              type: order.cargoType,
              weight: order.cargoWeight
            },
            status: order.status
          },
          createdAt: order.createdAt
        });
      });

      // Получаем транспорт пользователя
      const transports = await ctx.db.transport.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      transports.forEach(transport => {
        activities.push({
          id: `transport-${transport.id}`,
          type: 'transport',
          date: new Date(transport.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          time: new Date(transport.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          }),
          title: `Объявление о транспорте "${transport.title}" ${transport.status === 'active' ? 'создано' : 'деактивировано'}`,
          details: {
            cargo: {
              type: transport.vehicleType,
              weight: `${transport.carryingCapacity}т`
            },
            description: transport.city,
            status: transport.status
          },
          createdAt: transport.createdAt
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

      responses.forEach(response => {
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
          title: `Отклик на заказ #${response.order.number} ${response.status === 'pending' ? 'отправлен' : response.status === 'accepted' ? 'принят' : 'отклонен'}`,
          details: {
            route: {
              from: response.order.routeFrom,
              to: response.order.routeTo
            },
            price: response.order.price,
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

      privateChats.forEach(chat => {
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