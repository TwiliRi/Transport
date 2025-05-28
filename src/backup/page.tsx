"use client";

import Link from 'next/link';
import { FaArrowRight, FaTruck, FaBox, FaShieldAlt, FaChartLine, FaQuoteLeft, FaRocket, FaAtom, FaBolt, FaEye, FaCog, FaFire, FaSpaceShuttle, FaGem, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [easterEggCount, setEasterEggCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  // Инициализация частиц
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2
    }));
    setParticles(newParticles);
  }, []);

  // Анимация частиц
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  // Обработчики событий
  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // WebGL Canvas эффект
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 10) {
          const y = Math.sin((x + scrollY * 0.5 + i * 100) * 0.01) * 50 + canvas.height / 2 + i * 50;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      drawWaves();
      requestAnimationFrame(animate);
    };
    animate();
  }, [scrollY]);

  // Звуковые эффекты
  const playClickSound = () => {
    if (soundEnabled) {
      // Создаем простой звук через Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  // Пасхалка
  const handleLogoClick = () => {
    setEasterEggCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowEasterEgg(true);
        setTimeout(() => setShowEasterEgg(false), 3000);
        return 0;
      }
      return newCount;
    });
    playClickSound();
  };

  const scrollToSection = (sectionId: string) => {
    playClickSound();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono overflow-x-hidden relative">
      {/* WebGL Canvas Background */}
      <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Particles Background */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: particle.x,
              top: particle.y,
              transform: `translate(-50%, -50%) scale(${Math.sin(Date.now() * 0.001 + particle.id) * 0.5 + 1})`
            }}
          />
        ))}
      </div>

      {/* Epic Mouse Follower */}
      <div 
        className="fixed w-8 h-8 bg-gradient-to-r from-white/30 to-transparent rounded-full pointer-events-none z-50 mix-blend-difference transition-all duration-75 animate-pulse"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: 'scale(1.2) rotate(45deg)',
          boxShadow: '0 0 20px rgba(255,255,255,0.3)'
        }}
      />

      {/* Sound Control */}
      

      {/* Easter Egg */}
      {showEasterEgg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center animate-bounce">
            <FaGem className="text-6xl text-white mb-4 mx-auto animate-spin" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              🎉 СЕКРЕТНЫЙ РЕЖИМ АКТИВИРОВАН! 🎉
            </h2>
            <p className="text-xl mt-2 animate-pulse">Добро пожаловать в матрицу транспорта!</p>
          </div>
        </div>
      )}

      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Grid Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${scrollY * 0.5}px, ${scrollY * 0.3}px)`
          }}
        />

        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute animate-float-${i % 3 + 1} opacity-10`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + i * 10}%`,
                transform: `translateY(${scrollY * (0.1 + i * 0.05)}px) rotate(${scrollY * 0.1 + i * 45}deg)`
              }}
            >
              <div className={`w-${8 + i * 2} h-${8 + i * 2} border-2 border-white ${i % 2 === 0 ? 'rotate-45' : ''}`} />
            </div>
          ))}
        </div>

        <div className="relative z-20 text-center max-w-6xl mx-auto px-4">
          {/* Glitch Logo */}
          <div 
            className="mb-8 cursor-pointer group"
            onClick={handleLogoClick}
          >
            <h1 className="text-8xl md:text-9xl font-black mb-4 relative overflow-hidden group-hover:animate-glitch">
              <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent animate-gradient-x">
                ТРАНСПОРТ
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent opacity-0 group-hover:opacity-100 group-hover:animate-glitch-2" style={{transform: 'translateX(2px)'}}>
                ТРАНСПОРТ
              </span>
            </h1>
          </div>

          {/* Typewriter Effect Subtitle */}
          <div className="text-2xl md:text-3xl mb-12 h-20">
            <span className="animate-typewriter border-r-2 border-white">
              БУДУЩЕЕ ЛОГИСТИКИ НАЧИНАЕТСЯ ЗДЕСЬ
            </span>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <Link 
              href="/load" 
              onClick={playClickSound}
              className="group relative px-8 py-4 bg-gradient-to-r from-white to-gray-300 text-black font-bold text-lg rounded-none overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-white/20"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FaBox className="group-hover:animate-bounce" />
                НАЙТИ ГРУЗ
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
            
            <Link 
              href="/search" 
              onClick={playClickSound}
              className="group relative px-8 py-4 border-2 border-white text-white font-bold text-lg rounded-none overflow-hidden transition-all duration-500 hover:scale-105 hover:bg-white hover:text-black"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FaTruck className="group-hover:animate-bounce" />
                НАЙТИ ТРАНСПОРТ
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Quantum Advantages Section */}
      <section id="advantages" className="relative py-20 bg-gradient-to-b from-black to-gray-900">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            КВАНТОВЫЕ ПРЕИМУЩЕСТВА
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FaAtom, title: "НЕЙРО-ПОДХОД", desc: "Искусственный интеллект анализирует каждый запрос" },
              { icon: FaSpaceShuttle, title: "ГИПЕР-ФЛОТ", desc: "Космическая сеть транспортных средств" },
              { icon: FaBolt, title: "КВАНТОВАЯ ЗАЩИТА", desc: "Криптографическая безопасность нового уровня" }
            ].map((item, i) => (
              <div 
                key={i}
                className="group relative p-8 border border-white/20 backdrop-blur-sm hover:border-white/40 transition-all duration-500 hover:scale-105 cursor-pointer"
                onClick={playClickSound}
                style={{
                  transform: `translateY(${scrollY * 0.1 * (i + 1)}px)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <item.icon className="text-5xl mb-6 group-hover:animate-spin transition-all duration-500" />
                <h3 className="text-2xl font-bold mb-4 group-hover:text-gray-300 transition-colors">{item.title}</h3>
                <p className="text-gray-400 group-hover:text-white transition-colors">{item.desc}</p>
                
                {/* Hover Effect Lines */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Process Section */}
      <section className="relative py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ПРОТОКОЛ АКТИВАЦИИ
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {[
              { icon: FaEye, title: "СКАНИРОВАНИЕ", desc: "Анализ потребностей" },
              { icon: FaCog, title: "ОБРАБОТКА", desc: "Квантовые вычисления" },
              { icon: FaFire, title: "АКТИВАЦИЯ", desc: "Мгновенное соединение" }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div 
                  className="relative w-24 h-24 border-2 border-white rounded-full flex items-center justify-center mb-4 group-hover:border-gray-300 transition-all duration-500 cursor-pointer"
                  onClick={playClickSound}
                >
                  <step.icon className="text-3xl group-hover:animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-white/10 scale-0 group-hover:scale-100 transition-transform" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-center">{step.desc}</p>
                
                {/* Animated Arrow */}
                {i < 2 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                    <FaArrowRight className="text-2xl text-white/50 animate-pulse" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with 3D Effect */}
      <section className="relative py-20 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-6xl font-black text-center mb-16 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ГОЛОСА РЕВОЛЮЦИИ
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { text: "Это не просто платформа, это портал в будущее логистики!", author: "Александр К., CEO TechCorp" },
              { text: "Квантовая скорость обработки заказов превзошла все ожидания.", author: "Мария В., LogiMaster" }
            ].map((testimonial, i) => (
              <div 
                key={i}
                className="relative p-8 border border-white/20 backdrop-blur-sm group cursor-pointer"
                onClick={playClickSound}
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.01 - 5}deg) rotateX(${mousePosition.y * 0.01 - 5}deg)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <FaQuoteLeft className="text-3xl mb-4 opacity-50" />
                <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
                <p className="text-gray-400">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action with Particle Effect */}
      <section className="relative py-20 bg-black">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-6xl font-black mb-8 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            ПРИСОЕДИНЯЙТЕСЬ К РЕВОЛЮЦИИ
          </h2>
          <p className="text-xl mb-12 text-gray-300">
            Станьте частью квантовой сети транспортной логистики
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <Link 
              href="/register" 
              onClick={playClickSound}
              className="group relative px-12 py-6 bg-gradient-to-r from-white to-gray-300 text-black font-bold text-xl rounded-none overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-white/30"
            >
              <span className="relative z-10 flex items-center gap-3">
                <FaRocket className="group-hover:animate-bounce" />
                АКТИВИРОВАТЬ АККАУНТ
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 bg-gradient-to-t from-gray-900 to-black border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-8">
            {[FaTruck, FaBox, FaShieldAlt, FaChartLine].map((Icon, i) => (
              <Icon 
                key={i} 
                className="text-2xl text-gray-400 hover:text-white transition-colors cursor-pointer hover:animate-pulse" 
                onClick={playClickSound}
              />
            ))}
          </div>
          <p className="text-gray-400">
            © 2024 QUANTUM TRANSPORT MATRIX. Все права защищены квантовым шифрованием.
          </p>
        </div>
      </footer>
    </div>
  );
}