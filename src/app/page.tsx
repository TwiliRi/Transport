import Individual1 from "~/public/individual1.png";
import Individual2 from "~/public/individual2.png";
import Individual3 from "~/public/individual3.png";
import Big from "~/public/big.png";
import Security1 from "~/public/security1.png";
import Security2 from "~/public/security2.png";
import Security3 from "~/public/security3.png";
import Boxes from "~/public/boxes.png";
import Cars from "~/public/cars.png";
import Image from "next/image";
import Link from "next/link";
import { FaTruck, FaBoxOpen, FaShieldAlt, FaUserFriends } from "react-icons/fa";

export default function Home() {
  const scrollTo = (distance: number) => {
    window.scrollBy({
      top: distance,
      left: 0,
      behavior: 'smooth',
    });
  };
  
  return (
    <>
      {/* Герой-секция */}
      <section className="relative bg-gradient-to-b from-gray-50 to-white py-12 md:py-20">
        <div className="max-w-[1366px] mx-auto px-4 sm:px-5 flex flex-col items-center">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">Грузоперевозки для всех задач</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Надежная доставка грузов по всей России. Быстро, безопасно, выгодно.
            </p>
          </div>
          
          <div className="flex justify-center gap-4 sm:gap-8 mb-8 md:mb-12 flex-wrap">
            <Link href="/search?type=cargo" className="group w-full sm:w-auto max-w-[280px]">
              <div className="bg-white hover:bg-black text-black hover:text-white transition-colors duration-300 shadow-lg rounded-lg p-6 sm:p-8 w-full sm:w-[280px] text-center border border-gray-100 group-hover:border-black">
                <FaBoxOpen className="text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4 text-black group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Найти грузы</h3>
                <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-300">Для перевозчиков</p>
              </div>
            </Link>
            
            <Link href="/search?type=transport" className="group w-full sm:w-auto max-w-[280px]">
              <div className="bg-white hover:bg-black text-black hover:text-white transition-colors duration-300 shadow-lg rounded-lg p-6 sm:p-8 w-full sm:w-[280px] text-center border border-gray-100 group-hover:border-black">
                <FaTruck className="text-4xl sm:text-5xl mx-auto mb-3 sm:mb-4 text-black group-hover:text-white transition-colors duration-300" />
                <h3 className="text-xl sm:text-2xl font-semibold mb-1 sm:mb-2">Найти машину</h3>
                <p className="text-gray-600 group-hover:text-gray-200 transition-colors duration-300">Для грузоотправителей</p>
              </div>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-4xl mt-4 sm:mt-8 gap-6 sm:gap-0">
            <div className="w-full sm:w-1/2 flex justify-center">
              <Image 
                
                src={Boxes} 
                className="max-w-full sm:max-w-[90%] md:max-w-[400px] max-h-[200px] sm:max-h-[300px] object-contain transform hover:scale-105 transition-transform duration-300" 
                alt="Грузы" 
              />
            </div>
            <div className="w-full sm:w-1/2 flex justify-center">
              <Image 
                src={Cars} 
                className="max-w-full sm:max-w-[90%] md:max-w-[400px] max-h-[200px] sm:max-h-[300px] object-contain transform hover:scale-105 transition-transform duration-300" 
                alt="Транспорт" 
              />
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black to-transparent opacity-20"></div>
      </section>
      
      {/* О нас */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-[1366px] mx-auto px-4 sm:px-5">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">О нашей платформе</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Мы — динамично развивающаяся компания, специализирующаяся на предоставлении высококачественных услуг в области перевозок.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-20">
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
              <FaUserFriends className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-black" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Индивидуальный подход</h3>
              <p className="text-gray-600">
                Каждый клиент для нас важен. Мы разрабатываем оптимальные маршруты, учитываем специфику вашего груза и предоставляем персонализированные решения.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center">
              <FaTruck className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-black" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Огромный автопарк</h3>
              <p className="text-gray-600">
                Наш автопарк состоит из современных автомобилей различной грузоподъемности. Это позволяет нам перевозить грузы любых размеров и типов.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none">
              <FaShieldAlt className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-black" />
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Безопасность</h3>
              <p className="text-gray-600">
                Каждый водитель тщательно следит за техническим состоянием автомобилей, а также соблюдает все нормы и стандарты безопасности.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Преимущества с изображениями */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-[1366px] mx-auto px-4 sm:px-5">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Почему выбирают нас?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
              Наши преимущества, которые делают нас лидерами в сфере грузоперевозок
            </p>
          </div>
          
          {/* Индивидуальный подход */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 mb-16 md:mb-24">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Индивидуальный подход</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 md:mb-6">
                Каждый клиент для нас важен. Мы разрабатываем оптимальные маршруты, учитываем специфику вашего груза и предоставляем персонализированные решения.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Персональный менеджер</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Оптимальные маршруты</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Учет специфики груза</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 relative h-[300px] md:h-[400px] mt-6 md:mt-0">
              <Image src={Individual1} alt="Индивидуальный подход" className="absolute top-0 right-0 w-[60%] md:w-[250px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
              <Image src={Individual2} alt="Индивидуальный подход" className="absolute bottom-0 left-0 w-[60%] md:w-[250px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
              <Image src={Individual3} alt="Индивидуальный подход" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] md:w-[250px] rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
          
          {/* Огромный автопарк */}
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8 md:gap-12 mb-16 md:mb-24">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Огромный автопарк</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 md:mb-6">
                Наш автопарк состоит из современных автомобилей различной грузоподъемности. Это позволяет нам перевозить грузы любых размеров и типов – от небольших посылок до крупногабаритных грузов.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Современные автомобили</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Различная грузоподъемность</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Регулярное техобслуживание</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
              <Image src={Big} alt="Огромный автопарк" className="max-w-full sm:max-w-[80%] md:max-w-full rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
            </div>
          </div>
          
          {/* Безопасность */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="w-full md:w-1/2">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 md:mb-4">Безопасность</h3>
              <p className="text-base sm:text-lg text-gray-600 mb-4 md:mb-6">
                Каждый водитель тщательно следит за техническим состоянием автомобилей, а также соблюдает все нормы и стандарты, чтобы ваш груз прибыл в целости и сохранности.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Опытные водители</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>Страхование грузов</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-black rounded-full mr-2"></span>
                  <span>GPS-мониторинг</span>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-3 sm:gap-4 mt-6 md:mt-0">
              <Image src={Security3} alt="Безопасность" className="rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
              <Image src={Security1} alt="Безопасность" className="rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300" />
              <Image src={Security2} alt="Безопасность" className="rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 col-span-2" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Призыв к действию */}
      <section className="py-12 md:py-16 bg-black text-white">
        <div className="max-w-[1366px] mx-auto px-4 sm:px-5 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-6">Готовы начать работу с нами?</h2>
          <p className="text-base sm:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Присоединяйтесь к тысячам довольных клиентов, которые уже оценили качество наших услуг
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 flex-wrap">
            <Link href="/registration" className="bg-white text-black py-3 px-6 sm:px-8 rounded-md font-semibold hover:bg-gray-200 transition-colors duration-300 w-full sm:w-auto">
              Зарегистрироваться
            </Link>
            <Link href="/search" className="bg-transparent border-2 border-white text-white py-3 px-6 sm:px-8 rounded-md font-semibold hover:bg-white hover:text-black transition-colors duration-300 w-full sm:w-auto">
              Найти перевозчика
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
