import Image from "next/image";
import Link from "next/link";
import Icon from "../../public/ico.png";
import Tg from "../../public/tg.png";
import Vk from "../../public/vk.png";

export default function Footer() {
  return (
    <footer className="bg-special-gray grid">
      <div className="flex pb-2 pt-8 px-5 justify-between max-[660px]:flex-col max-[660px]:gap-5">
        <div className="flex gap-8 flex-col items-center text-white w-full">
          <Image 
            src={Icon} 
            alt="Машина В пути"
            className="max-w-16"
          />
          <ul className="grid grid-cols-2 gap-5">
            <li><Link href="/load">Грузы</Link></li>
            <li><Link href="/search">Предложения</Link></li>
            <li><Link href="/">Информация</Link></li>
            <li><Link href="/profile">Профиль</Link></li>
            <li><Link href="/login">Вход</Link></li>
            <li><Link href="/registration">Регистрация</Link></li>
          </ul>
        </div>
        <div className="w-1 h-32 rounded-xl bg-white max-[660px]:hidden"></div>
        <div className="flex flex-col gap-1 text-white items-center w-full">
          <p className="font-medium">Связаться с нами</p>
          <p>+ 7 910 572 11 19</p>
          <p>Время работы: круглосуточно</p>
          <p>rinatlausin449@gmail.com</p>
          <div className="flex gap-1">
            <Link href="/asd"><Image src={Tg} alt="" /></Link>
            <Link href="/asd"><Image src={Vk} alt="" /></Link>
          </div>
        </div>
      </div>
      <div className="bg-white text-center">
        <p>product by TwiliRi</p>
      </div>
    </footer>
  );
}
