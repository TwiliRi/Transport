'use client';
import Image from "next/image";
import Icon from "~/public/ico.png";
import Head from "~/public/head.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Session } from "next-auth";

interface NavProps {
  session: Session | null;
}

export default function Nav({ session }: NavProps) {
  const pathname = usePathname();
  const active = (path: string) =>
    path === pathname ? "border-black text-red" : "border-transparent hover:font-normal";
  
  return (
    <header>
      <div className="flex justify-between px-3 py-2 items-center max-[660px]:flex-col-reverse gap-4">
        <Link href="/"><Image src={Icon} className="max-w-16" alt="иконка" /></Link>
        <nav>
          <ul className="text-base flex gap-6 font-light">
            <li><Link className={`border-b-2 ${active("/load")}`} href="/load">Грузы</Link></li>
            <li><Link className={`border-b-2 ${active("/search")}`} href="/search">Найти машину</Link></li>
            <li><Link className={`border-b-2 ${active("/")}`} href="/">Информация</Link></li>
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <div>{session ? 

            <div className="flex items-center gap-6">
                {session.user.name}
              <Image src={Head} alt="иконка" />
            </div>   
            : 
            <div className="flex gap-4">
              <Link href={'/api/auth/signin'}>Вход</Link>
              <Link href={'/registration'}>Регистрация</Link>
            </div>
            }
            </div>
        </div>
      </div>
    </header>
  );
}
