"use client"
import Car from "~/public/car.png";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
export default function Search(){

    const pathname = usePathname();
    const scrollTo = (distance:number) => {
        window.scrollBy({
          top: distance,
          left: 0,
          behavior: 'smooth',
        });
      };
      const [currentPage, setCurrentPage] = useState("load");
          const active = (path: string) =>
            path == pathname ? "opacity-50" : "border-transparent hover:font-normal";


    function Gazel(){
        return(
        <div className="w-full max-w-[1366px] mx-auto max-[660px]:flex-col max-[660px]:items-center justify-between border rounded-lg shadow-md flex p-4 space-x-4 ">
            <div className="flex-shrink-0">
                <Image src={Car} alt="Газель next" className="rounded-lg w-48 h-48 object-cover"/>
                    
                <div className="text-sm text-gray-500 mt-2">Дата создания: 19.12.2024</div>
            </div>
            <div className="flex-grow">
                <h2 className="text-lg font-bold">Газель next в поисках работы</h2>
                <div className="flex  max-[940px]:grid max-[940px]:grid-cols-2 gap-3 max-[678px]:grid-cols-1">
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">Лёгковые и микроавтобусы</p>
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">Цена договорная</p>
                    <p className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-xl ">Минимум 2ч.</p>
                </div>
                <div className="mt-4">
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">Грузоподъёмность, т</div>
                    <div>- 2,5</div>
                </div>
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">Длина платформы, м</div>
                    <div>- 6</div>
                </div>
                <div className="flex text-sm text-gray-800">
                    <div className="w-48">Ширина платформы, м</div>
                    <div>- 2,3</div>
                </div>
                <div className="text-sm text-gray-500 mt-2">Перевозка грузов на газели</div>
                </div>
            </div>
            <div className="max-[660px]:gap-7  flex flex-col justify-between items-end max-[660px]:w-full max-[660px]:items-center max-w-[400px] max-[660px]:text-center">
                <div className="text-gray-500 text-sm">С 19.12.2024 - По 22.12.2024</div>
                <div className="flex flex-col space-y-2 max-[660px]:items-center justify-center max-[660px]:w-full">
                <button className="bg-black text-white w-full px-4 py-2 rounded hover:bg-gray-800">Связаться</button>
                <button className="bg-gray-200 text-gray-800 w-full px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                </div>
                <div className="text-sm text-gray-500 mt-2">Рязань, Рязанская обл.</div>
            </div>
        </div>
        )
    }
    function Forma1(){
        return(
            <>
            <form className="flex flex-col gap-3">
                <div className="flex-col lex ">
                    <div>
                        <p>Маршрут</p>
                        <div className="flex gap-2 justify-between">
                            <input 
                            
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                            }}
                            className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="Рязань"/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 flex-col">
                    <div className="w-full">
                        <p>Вид транспорта</p>
                        <select defaultValue={"all"} className="w-full px-3 py-2 bg-[#D9D9D9]">
                            <option value="all" >Все виды </option>
                            <option value="truck">Грузовик</option>
                            <option value="truck_with_trailer">Фура</option>
                            <option value="car">Автомобиль</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <p>Дата</p>
                        <input className="w-full px-3 py-2 bg-[#D9D9D9]" type="date" id="start-date" name="start-date"/>
                    </div>
                </div>
                <div className="flex justify-center gap-5">
                    <button type="reset" 
                    className="px-4 py-2 border-4 border-[#D9D9D9] bg-white text-black shadow-md hover:bg-gray-200">
                        <p>Сбросить</p>
                    </button>
                    <button 
                    type="submit"
                    className="px-4 py-2  bg-[#D9D9D9] text-black shadow-md hover:bg-gray-100">
                        <p>Подтвердить</p>
                    </button>
                </div>
                
            </form>
            </>
        )
    }
    
    function Forma2(){
        return(
            
            <form className="flex flex-col gap-3">
                <div className="flex-col lex">
                    <div>
                        <p>ФИО водителя</p>
                        <div className="flex gap-2 justify-between">
                            <input 
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z\s]/g, '');
                            }}
                            className="w-full px-3 py-2 bg-[#D9D9D9]" 
                            type="text" 
                            placeholder="Иванов Иван Иванович"
                            required
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div className="w-full">
                        <p>Номер телефона</p>
                        <input 
                            type="tel"
                            pattern="^\+?[0-9]{10,11}$"
                            className="w-full px-3 py-2 bg-[#D9D9D9]"
                            placeholder="+7 (999) 999-99-99"
                            required
                            maxLength={12}
                        />
                    </div>
                    <div className="w-full">
                        <p>Стаж вождения (лет)</p>
                        <input 
                            type="number"
                            min="0"
                            max="50"
                            className="w-full px-3 py-2 bg-[#D9D9D9]"
                            placeholder="5"
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div className="w-full">
                        <p>Тип транспорта</p>
                        <select defaultValue={"all"} className="w-full px-3 py-2 bg-[#D9D9D9]" required>
                            <option value="all" disabled>Выберите тип</option>
                            <option value="truck">Грузовик</option>
                            <option value="truck_with_trailer">Фура</option>
                            <option value="car">Легковой автомобиль</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <p>Грузоподъёмность (тонн)</p>
                        <input 
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-3 py-2 bg-[#D9D9D9]"
                            placeholder="1.5"
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div className="w-full">
                        <p>Габариты кузова (м)</p>
                        <div className="flex gap-2">
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-2 bg-[#D9D9D9]"
                                placeholder="Длина"
                                required
                            />
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-2 bg-[#D9D9D9]"
                                placeholder="Ширина"
                                required
                            />
                            <input 
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-3 py-2 bg-[#D9D9D9]"
                                placeholder="Высота"
                                required
                            />
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <p>Дополнительная информация</p>
                    <textarea 
                        className="w-full px-3 py-2 bg-[#D9D9D9] resize-none" 
                        rows={4}
                        placeholder="Опишите ваш опыт работы, предпочтительные маршруты и другую важную информацию"
                    ></textarea>
                </div>
                <div className="w-full">
                    <p>Фото транспорта</p>
                    <input 
                        className="w-full px-3 py-2 bg-[#D9D9D9] border-black border-2" 
                        type="file" 
                        accept=".jpg,.jpeg,.png"
                        
                    />
                </div>
                <div className="flex justify-center gap-5">
                    <button type="reset" 
                    className="px-4 py-2 border-4 border-[#D9D9D9] bg-white text-black shadow-md hover:bg-gray-200">
                        <p>Сбросить</p>
                    </button>
                    <button 
                    type="submit"
                    className="px-4 py-2 bg-[#D9D9D9] text-black shadow-md hover:bg-gray-100">
                        <p>Отправить заявку</p>
                    </button>
                </div>
            </form>
            
        )
    }
    return(
        <>
        <div className="flex flex-col  justify-center items-center p-5">
            <h1 className="text-center font-normal text-xl">Найти машину</h1>

            <section className="flex max-w-[1366px]  gap-4 items-center max-[768px]:flex-col-reverse">
            {currentPage=='load'?<Forma1/>:<Forma2/>}
            
            <div className="w-1 h-[200px] rounded-xl max-[768px]:h-1 max-[768px]:w-[300px] bg-[#D9D9D9]"></div>
            <div className="flex flex-col justify-center gap-3 p-5 items-center ">
           
                <button
                className={`px-4 py-2  bg-[#D9D9D9] text-black shadow-md w-[245px] hover:bg-gray-100 ${active("load")}`}
                 onClick={()=>setCurrentPage("load")}
                >Найти машину</button>
                <button
                className={`px-4 py-2  bg-[#D9D9D9] text-black shadow-md w-[245px] hover:bg-gray-100 ${active("upload")}`}
                 onClick={()=>setCurrentPage("upload")}
                >Оставить вакансию</button>
            </div>
            </section>
            <div 
            onClick={()=>scrollTo(800)}
            className="w-64 h-1 my-3 bg-black mt-6 rounded-md">
        
            </div>
            <h2 className="my-4">По результату поиска было найдено: 3 заказов</h2>
            

            <div className='flex flex-col gap-5 w-full'>

            <Gazel/>
            <Gazel/>
            <Gazel/>

            </div>
        </div>
        </>
    )
}