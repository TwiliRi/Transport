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
export default function Home() {
  const scrollTo = (distance:number) => {
    window.scrollBy({
      top: distance,
      left: 0,
      behavior: 'smooth',
    });
  };
  return (
    <>
    <section className="text-base flex flex-col items-center justify-center mt-20 mb-10  p-5">
      <div className="max-w-[1366px] flex flex-col justify-between items-center gap-4">
        <div className={`flex justify-between h-[50vh] `}>
          <Image src={Boxes}className="max-w-[400px] max-h-[300px] max-[880px]:max-w-[300px] max-[620px]:max-w-[250px] object-contain" alt="" />
          <Image src={Cars} className="max-w-[400px] max-h-[300px] max-[880px]:max-w-[300px] max-[620px]:max-w-[250px] object-contain"alt="" />
        </div>

        <div className="text-center flex flex-col gap-2">
          <h1 className="text-4xl">Добро пожаловать на наш сайт</h1>
          <p>Что вы хотите найти?</p>
        </div>
        
        <div className="flex gap-20 justify-center">
          <button 
          className="bg-[#D9D9D9] cursor-pointer w-[200px] p-3">
            <p>Грузы</p>
          </button>
         
          <button 
          className="bg-[#D9D9D9] cursor-pointer  w-[200px] p-3">
            <p>Машину</p>
          </button>
         
        </div>
        <div 
          className="w-64 h-1 bg-black mt-6 rounded-md"></div>
        </div>

    </section>
    <section className="text-base flex flex-col items-center justify-center p-5">
      <div className="max-w-[1366px] flex flex-col gap-10 text-center">
        <h2 className="text-2xl font-normal">Что представляет собой сайт?</h2>
        <p className='text-base text-center'>Мы — динамично развивающаяся компания, специализирующаяся на предоставлении высококачественных услуг в области перевозок. </p>
        <p className="font-normal text-lg">Почему выбирают нас?</p>

        <div className="flex justify-center gap-[200px]">
          <div className="flex flex-col items-center max-w-[400px] justify-center">
            <p className='font-normal  items-center'>Индивидуальный подход</p>
            <p>Каждый клиент для нас важен. Мы разрабатываем оптимальные маршруты, учитываем специфику вашего груза и предоставляем персонализированные решения.</p>
          </div>
          <div className="flex gap-10 flex-wrap flex-col">
            <Image src={Individual1} alt="" className="translate-y-[50px]"/>
            <Image src={Individual2} alt="" className="relatabive translate-x-[-170px]  rounded-lg"/>
            <Image src={Individual3} alt="" className="translate-y-[-100px]"/>
          </div>
        </div>

        <div className="flex flex-col gap-2 justify-center items-center text-center">
          <Image src={Big} alt="" />
          <p className="font-normal text-lg ">Огромный автопарк</p>
          <p className="max-w-[800px]">Наш автопарк состоит из современных автомобилей различной грузоподъемности. Это позволяет нам перевозить грузы любых размеров и типов – от небольших посылок до крупногабаритных грузов.</p>
        </div>

        <div className="flex justify-center items-center">
          <div className="grid grid-cols-2 gap-10">
            <Image src={Security3} className="max-h-[164px]" alt="" />
            <Image src={Security1} className="max-h-[164px]" alt="" />
            <Image src={Security2} className="max-h-[164px] mt-[-100px]  translate-x-[125px] " alt="" />
          </div>
          <div>
            <p className="font-normal text-lg">Безопасность</p>
            <p className="max-w-[400px]">Каждый водитель тщательно следит за техническим состоянием  автомобилей, а также соблюдает все нормы и стандарты, чтобы ваш груз прибыл в целости и сохранности.</p>
          </div>
        </div>

        <div>
        
        </div>
      </div>
    </section>
    </>
  );
}
