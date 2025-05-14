import Link from 'next/link';
export default function NotFound() {
  
  return (
    <main className="flex flex-col w-full justify-center items-center text-center h-[70vh] ">
      <div className="flex flex-col gap-8">
        <p className='font-normal text-6xl'>Ошибка 404</p>
        <p className='text-2xl'>Данной страницы не существует или она была удалена</p>
        <button
        className="bg-black p-2 rounded-md"
        
        >
          <Link href="/"><p className="text-white">Вернуться на главную</p></Link>
        </button>
      </div>
    </main>
  );
}
