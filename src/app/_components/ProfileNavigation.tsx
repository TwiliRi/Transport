'use client';

import { FaUser, FaBox, FaTruck, FaHistory } from "react-icons/fa";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ProfileNavigation() {
  const pathname = usePathname();
  
  return (
    <div className="border-t border-gray-200 pt-4">
      <nav className="flex flex-col space-y-2">
        <Link 
          href="/profile" 
          className={`flex items-center py-2 px-3 ${pathname === '/profile' ? 'bg-gray-100 text-gray-800 font-medium' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'} rounded-md transition-colors`}
        >
          <FaUser className="mr-3" /> Профиль
        </Link>
        <Link 
          href="/profile/orders" 
          className={`flex items-center py-2 px-3 ${pathname.startsWith('/profile/orders') ? 'bg-gray-100 text-gray-800 font-medium' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'} rounded-md transition-colors`}
        >
          <FaBox className="mr-3" /> Мои заказы
        </Link>
        <Link 
          href="/profile/shipments" 
          className={`flex items-center py-2 px-3 ${pathname.startsWith('/profile/shipments') ? 'bg-gray-100 text-gray-800 font-medium' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'} rounded-md transition-colors`}
        >
          <FaTruck className="mr-3" /> Мои перевозки
        </Link>
        <Link 
          href="/profile/history" 
          className={`flex items-center py-2 px-3 ${pathname.startsWith('/profile/history') ? 'bg-gray-100 text-gray-800 font-medium' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'} rounded-md transition-colors`}
        >
          <FaHistory className="mr-3" /> История
        </Link>
      </nav>
    </div>
  );
}