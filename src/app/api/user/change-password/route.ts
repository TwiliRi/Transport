import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";
import { hash, compare } from "bcrypt";

// Схема валидации для смены пароля
const changePasswordSchema = z.object({
  currentPassword: z.string().optional(), // Делаем необязательным для Google OAuth пользователей
  newPassword: z.string().min(6, "Новый пароль должен содержать минимум 6 символов"),
  confirmPassword: z.string().min(1, "Подтверждение пароля обязательно"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export async function PUT(req: Request) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);
    
    // Получаем текущего пользователя с паролем и аккаунтами
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }
    
    // Проверяем, есть ли у пользователя Google OAuth аккаунт
    const hasGoogleAccount = user.accounts.some((account: { provider: string }) => account.provider === 'google');
    
    // Если у пользователя есть пароль, требуем текущий пароль
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Текущий пароль обязателен" },
          { status: 400 }
        );
      }
      
      // Проверяем текущий пароль
      const passwordMatch = await compare(currentPassword, user.password);
      
      if (!passwordMatch) {
        return NextResponse.json(
          { error: "Неверный текущий пароль" },
          { status: 400 }
        );
      }
    } else if (!hasGoogleAccount) {
      // Если нет пароля и нет Google аккаунта, что-то не так
      return NextResponse.json(
        { error: "Невозможно установить пароль для данного аккаунта" },
        { status: 400 }
      );
    }
    
    // Хешируем новый пароль
    const hashedNewPassword = await hash(newPassword, 10);
    
    // Обновляем пароль в базе данных
    await db.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
      },
    });
    
    const message = user.password ? "Пароль успешно изменен" : "Пароль успешно установлен";
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Ошибка при смене пароля:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}