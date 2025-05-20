'use client';
import Image from "next/image";
import Icon from "~/public/ico.png";
import Head from "~/public/head.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";

interface NavProps {
  session: Session | null;
}

export default function Nav({ session }: NavProps) {
  const pathname = usePathname();
  const active = (path: string) =>
    path === pathname ? "border-black text-red" : "border-transparent hover:font-normal";
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Обработка изменения размера экрана
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Закрытие меню при клике на ссылку
  const handleLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };
  
  // Закрытие меню при нажатии клавиши Escape
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isMenuOpen]);
  
  return (
    <header className="relative z-50">
      <div className="flex justify-between px-3 py-2 items-center">
        <Link href="/"><Image src={Icon} className="max-w-16" alt="иконка" /></Link>
        
        {/* Бургер-кнопка для мобильных устройств */}
        <button 
          className="md:hidden text-2xl z-50" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        {/* Навигация для десктопа */}
        <nav className="hidden md:block">
          <ul className="text-base flex gap-6 font-light">
            <li><Link className={`border-b-2 ${active("/")}`} href="/">Главная</Link></li>
            <li><Link className={`border-b-2 ${active("/load")}`} href="/load">Грузы</Link></li>
            <li><Link className={`border-b-2 ${active("/search")}`} href="/search">Найти машину</Link></li>
          </ul>
        </nav>
        
        {/* Профиль пользователя для десктопа */}
        <div className="hidden md:flex items-center gap-2">
          <div>{session ? 
            <Link href={'/profile'}>
              <div className="flex items-center gap-6">
                {session.user.name}
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={"иконка пользователя"} 
                    className="rounded-full w-10 h-10"
                  />
                ) : (
                  <FaUser className="text-4xl text-gray-400 w-6 h-6" />
                )}
              </div> 
            </Link>
            : 
            <div className="flex gap-4">
              <Link href={'/api/auth/signin'}>Вход</Link>
              <Link href={'/register'}>Регистрация</Link>
            </div>
          }</div>
        </div>
        
        {/* Затемнение фона при открытом меню */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black opacity-35 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Мобильное меню */}
        <div className={`fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden z-50`}>
          {/* Прозрачная область слева для закрытия меню */}
          {isMenuOpen && (
            <div 
              className="absolute top-0 bottom-0 right-full w-screen bg-transparent"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />
          )}
          
          <div className="flex flex-col h-full pt-20 px-6 relative">
            {/* Кнопка закрытия в верхнем углу */}
            <button 
              className="absolute top-4 right-4 text-2xl p-2"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Закрыть меню"
            >
              <FaTimes />
            </button>
            
            <nav className="mb-8">
              <ul className="flex flex-col gap-6 text-xl">
                <li>
                  <Link 
                    className={`block py-2 ${active("/")}`} 
                    href="/" 
                    onClick={handleLinkClick}
                  >
                    Главная
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`block py-2 ${active("/load")}`} 
                    href="/load" 
                    onClick={handleLinkClick}
                  >
                    Грузы
                  </Link>
                </li>
                <li>
                  <Link 
                    className={`block py-2 ${active("/search")}`} 
                    href="/search" 
                    onClick={handleLinkClick}
                  >
                    Найти машину
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="mt-auto mb-10">
              {session ? (
                <Link href={'/profile'} onClick={handleLinkClick}>
                  <div className="flex items-center gap-4 py-4">
                    {session.user.image ? (
                      <img 
                        src={session.user.image} 
                        alt={"иконка пользователя"} 
                        className="rounded-full w-12 h-12"
                      />
                    ) : (
                      <FaUser className="text-5xl text-gray-400" />
                    )}
                    <span className="text-lg">{session.user.name}</span>
                  </div>
                </Link>
              ) : (
                <div className="flex flex-col gap-4 py-4">
                  <Link 
                    href={'/api/auth/signin'} 
                    className="block w-full py-3 text-center bg-black text-white rounded-lg"
                    onClick={handleLinkClick}
                  >
                    Вход
                  </Link>
                  <Link 
                    href={'/register'} 
                    className="block w-full py-3 text-center border border-black rounded-lg"
                    onClick={handleLinkClick}
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
