import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Проверяем, существует ли уже пользователь с данной почтой
  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'inavation@mail.ru'
    }
  });

  if (existingUser) {
    // Если пользователь существует, обновляем его права админа
    const updatedUser = await prisma.user.update({
      where: {
        email: 'inavation@mail.ru'
      },
      data: {
        isAdmin: true,
        name: 'Admin User'
      }
    });
    console.log('Пользователь обновлен с админскими правами:', updatedUser);
  } else {
    // Если пользователя нет, создаем нового с админскими правами
    const hashedPassword = await bcrypt.hash('admin123', 10); // Временный пароль
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'inavation@mail.ru',
        name: 'Admin User',
        isAdmin: true,
        password: hashedPassword,
        userType: 'carrier', // или 'customer' по вашему выбору
        emailVerified: new Date()
      }
    });
    console.log('Создан новый пользователь с админскими правами:', adminUser);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });