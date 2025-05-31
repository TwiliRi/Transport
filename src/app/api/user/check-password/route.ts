import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        password: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      hasPassword: !!user.password 
    });
  } catch (error) {
    console.error("Ошибка при проверке пароля:", error);
    
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}