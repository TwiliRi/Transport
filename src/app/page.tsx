"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTruck, FaBox, FaMapMarkerAlt, FaUsers, FaShieldAlt, FaClock, FaArrowRight, FaPlay, FaPause } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Данные для слайдов с более тёмными цветами
  const slides = [
    {
      id: 1,
      title: "ТРАНСПОРТ",
      subtitle: "БУДУЩЕГО",
      description: "Революционная платформа для логистики и грузоперевозок",
      background: "linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #000000 100%)",
      textColor: "white"
    },
    {
      id: 2,
      title: "НАДЁЖНОСТЬ",
      subtitle: "И СКОРОСТЬ",
      description: "Доставляем ваши грузы быстро и безопасно по всей стране",
      background: "linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 50%, #f0f0f0 100%)",
      textColor: "#000000"
    },
    {
      id: 3,
      title: "ИННОВАЦИИ",
      subtitle: "В ЛОГИСТИКЕ",
      description: "Современные технологии для эффективного управления перевозками",
      background: "linear-gradient(135deg, #000000 0%, #111111 50%, #000000 100%)",
      textColor: "white"
    }
  ];

  // Статистика
  const stats = [
    { number: "10K+", label: "Довольных клиентов", icon: FaUsers },
    { number: "50K+", label: "Успешных доставок", icon: FaBox },
    { number: "500+", label: "Единиц транспорта", icon: FaTruck },
    { number: "24/7", label: "Поддержка клиентов", icon: FaClock }
  ];

  // Услуги
  const services = [
    {
      icon: FaTruck,
      title: "Грузоперевозки",
      description: "Перевозка грузов любого типа и размера"
    },
    {
      icon: FaMapMarkerAlt,
      title: "Логистика",
      description: "Планирование и оптимизация маршрутов"
    },
    {
      icon: FaShieldAlt,
      title: "Безопасность",
      description: "Полное страхование и контроль груза"
    }
  ];

  // Фиксированные частицы для предотвращения проблем с гидратацией
  const staticParticles = [
    { id: 0, x: 10, y: 20, size: 2, duration: 15 },
    { id: 1, x: 80, y: 10, size: 3, duration: 18 },
    { id: 2, x: 30, y: 70, size: 1.5, duration: 12 },
    { id: 3, x: 60, y: 40, size: 2.5, duration: 20 },
    { id: 4, x: 90, y: 80, size: 1.8, duration: 16 },
    { id: 5, x: 15, y: 60, size: 2.2, duration: 14 },
    { id: 6, x: 70, y: 25, size: 1.3, duration: 17 },
    { id: 7, x: 40, y: 90, size: 2.8, duration: 13 },
    { id: 8, x: 85, y: 50, size: 1.6, duration: 19 },
    { id: 9, x: 25, y: 35, size: 2.4, duration: 11 }
  ];

  // Проверка монтирования компонента
  useEffect(() => {
    setIsMounted(true);
    setIsLoaded(true);
  }, []);

  // Автоматическая смена слайдов
  useEffect(() => {
    if (isAutoPlay && isMounted) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 10000); // Увеличено с 5000 до 8000 миллисекунд (8 секунд)
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, slides.length, isMounted]);

  // Отслеживание позиции мыши только на клиенте
  useEffect(() => {
    if (!isMounted) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMounted]);

  const currentSlideData = slides[currentSlide];

  // Показываем базовую версию до монтирования
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: slides[0]?.background || 'black' }}>
        <div className="text-center px-4">
          <h1 className="text-8xl md:text-9xl font-black mb-4 tracking-wider text-white">
            {slides[0]?.title}
          </h1>
          <h2 className="text-6xl md:text-7xl font-light mb-6 tracking-widest text-white">
            {slides[0]?.subtitle}
          </h2>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto opacity-80 text-white">
            {slides[0]?.description}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Главный слайдер */}
      <AnimatePresence mode="wait">
        <motion.section
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative h-screen flex items-center justify-center"
          style={{ background: currentSlideData?.background }}
        >
          {/* Анимированный фон с частицами */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Статичные плавающие частицы */}
            {staticParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full opacity-20"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: currentSlideData?.textColor
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: particle.duration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Волновые анимации без зависимости от mousePosition */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${currentSlideData?.textColor}10 0%, transparent 50%)`
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Геометрические волны */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: `linear-gradient(45deg, transparent 30%, ${currentSlideData?.textColor}05 50%, transparent 70%)`
              }}
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Пульсирующие кольца */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div 
                className="w-96 h-96 rounded-full border-2 opacity-20"
                style={{ borderColor: currentSlideData?.textColor }}
              />
            </motion.div>

            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              animate={{
                scale: [1.5, 3, 1.5],
                opacity: [0.05, 0.2, 0.05]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            >
              <div 
                className="w-96 h-96 rounded-full border opacity-10"
                style={{ borderColor: currentSlideData?.textColor }}
              />
            </motion.div>

            {/* Движущиеся линии */}
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundImage: [
                  `linear-gradient(90deg, transparent 0%, ${currentSlideData?.textColor}20 50%, transparent 100%)`,
                  `linear-gradient(90deg, transparent 100%, ${currentSlideData?.textColor}20 50%, transparent 0%)`
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Геометрические фигуры с улучшенными анимациями */}
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.3, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-20 left-20 w-40 h-40 border-2 border-current opacity-10"
              style={{ borderColor: currentSlideData?.textColor }}
            />
            
            <motion.div
              animate={{
                rotate: -360,
                x: [0, 80, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-20 right-20 w-32 h-32 rounded-full border-2 border-current opacity-15"
              style={{ borderColor: currentSlideData?.textColor }}
            />
            
            <motion.div
              animate={{
                rotate: [0, 180, 360],
                scale: [1, 0.7, 1],
                opacity: [0.1, 0.4, 0.1]
              }}
              transition={{
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-1/2 left-10 w-24 h-24 transform -translate-y-1/2"
              style={{
                background: `conic-gradient(from 0deg, transparent 30%, ${currentSlideData?.textColor}30 50%, transparent 70%)`
              }}
            />

            {/* Дополнительные декоративные элементы */}
            <motion.div
              className="absolute top-1/4 right-1/4 w-16 h-16"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                background: `linear-gradient(45deg, ${currentSlideData?.textColor}20, transparent)`
              }}
            />

            <motion.div
              className="absolute bottom-1/4 left-1/4 w-20 h-20 rounded-full"
              animate={{
                scale: [1, 2, 1],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{
                background: `radial-gradient(circle, ${currentSlideData?.textColor}30 0%, transparent 70%)`
              }}
            />
          </div>

          {/* Контент слайда */}
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <motion.h1
                className="text-8xl md:text-9xl font-black mb-4 tracking-wider"
                style={{ color: currentSlideData?.textColor }}
                animate={{
                  textShadow: [
                    `0 0 30px ${currentSlideData?.textColor}60`,
                    `0 0 60px ${currentSlideData?.textColor}30`,
                    `0 0 30px ${currentSlideData?.textColor}60`
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {currentSlideData?.title}
              </motion.h1>
              <motion.h2
                className="text-6xl md:text-7xl font-light mb-6 tracking-widest"
                style={{ color: currentSlideData?.textColor }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                {currentSlideData?.subtitle}
              </motion.h2>
              <motion.p
                className="text-xl md:text-2xl font-light max-w-2xl mx-auto opacity-80"
                style={{ color: currentSlideData?.textColor }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                {currentSlideData?.description}
              </motion.p>
            </motion.div>

            {/* Кнопки действий */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/load">
                <motion.button
                  className="group relative px-12 py-4 text-lg font-bold tracking-wider overflow-hidden"
                  style={{
                    backgroundColor: currentSlideData?.textColor,
                    color: currentSlideData?.textColor === 'white' ? '#000000' : '#ffffff'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    НАЙТИ ГРУЗ
                    <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </motion.button>
              </Link>
              <Link href="/search">
                <motion.button
                  className="group px-12 py-4 text-lg font-bold tracking-wider border-2 bg-transparent"
                  style={{
                    borderColor: currentSlideData?.textColor,
                    color: currentSlideData?.textColor
                  }}
                  whileHover={{
                    backgroundColor: currentSlideData?.textColor,
                    color: currentSlideData?.textColor === 'white' ? '#000000' : '#ffffff'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="flex items-center gap-3">
                    НАЙТИ ТРАНСПОРТ
                    <FaTruck className="group-hover:translate-x-2 transition-transform" />
                  </span>
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Навигация слайдов */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: index === currentSlide ? currentSlideData?.textColor : 'transparent',
                  borderColor: currentSlideData?.textColor
                }}
                onClick={() => setCurrentSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Контроль автовоспроизведения */}
          <motion.button
            className="absolute top-8 right-8 p-3 rounded-full border-2"
            style={{
              borderColor: currentSlideData?.textColor,
              color: currentSlideData?.textColor
            }}
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isAutoPlay ? <FaPause /> : <FaPlay />}
          </motion.button>
        </motion.section>
      </AnimatePresence>

      {/* Секция статистики с более тёмным фоном */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-black mb-6 tracking-wider">
              НАШИ ДОСТИЖЕНИЯ
            </h2>
            <div className="w-32 h-1 bg-black mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group text-center p-8 bg-black text-white hover:bg-white hover:text-black transition-all duration-500 border-2 border-black"
                  whileHover={{ scale: 1.05 }}
                >
                  <IconComponent className="text-5xl mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <motion.div
                    className="text-4xl font-black mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-lg font-medium tracking-wide">
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Секция услуг с более тёмным фоном */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black mb-6 tracking-wider">
              НАШИ УСЛУГИ
            </h2>
            <div className="w-32 h-1 bg-white mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="group p-8 border-2 border-white hover:bg-white hover:text-black transition-all duration-500"
                  whileHover={{ scale: 1.05 }}
                >
                  <IconComponent className="text-6xl mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-2xl font-bold mb-4 tracking-wide">
                    {service.title}
                  </h3>
                  <p className="text-lg opacity-80 group-hover:opacity-100">
                    {service.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Финальный призыв к действию */}
      <section className="py-20 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-6xl font-black text-black mb-8 tracking-wider">
              ГОТОВЫ НАЧАТЬ?
            </h2>
            <p className="text-2xl text-gray-800 mb-12 font-light">
              Присоединяйтесь к тысячам довольных клиентов уже сегодня
            </p>
            <Link href="/register">
              <motion.button
                className="group relative px-16 py-6 text-xl font-bold tracking-wider bg-black text-white overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-4">
                  ЗАРЕГИСТРИРОВАТЬСЯ
                  <FaArrowRight className="group-hover:translate-x-3 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800 to-black"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Курсор-следящий элемент */}
      <motion.div
        className="fixed w-6 h-6 bg-black rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      />
    </div>
  );
}