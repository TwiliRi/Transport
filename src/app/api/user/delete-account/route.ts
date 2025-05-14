import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function DELETE() {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }
    
    // Удаляем пользователя из базы данных
    await db.user.delete({
      where: { id: session.user.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при удалении аккаунта:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}