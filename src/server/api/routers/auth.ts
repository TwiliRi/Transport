import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { hash } from "bcrypt";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(1, "Имя обязательно"),
      email: z.string().email("Некорректный email"),
      password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { name, email, password } = input;
      
      // Проверяем, не занят ли email
      const existingUser = await ctx.db.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new Error("Этот email уже используется");
      }
      
      // Хешируем пароль
      const hashedPassword = await hash(password, 10);
      
      // Создаем пользователя
      const user = await ctx.db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
      
      return { success: true };
    }),
});