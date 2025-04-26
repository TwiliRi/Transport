"use client"
import { useState } from "react";
import { usePathname } from "next/navigation";
export default function Load(){
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
    function Forma(){
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
                            className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="Откуда"/>
                            <input
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                            }}
                            className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="Куда"/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div>
                        <p>Вес.т</p>
                        <div className="flex gap-2">
                            <input 
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number' className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="1" />
                            <input 
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number' className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="1.5" />
                        </div>
                    </div>
                    <div>
                        <p>Макс. габарит, м</p>
                        <input className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="3" />
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div>
                        <p>Объём м3</p>
                        <div className="flex gap-2">
                            <input 
                             onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number'
                            className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="11" />
                            <input 
                             onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number'
                            className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="25" />
                        </div>
                    </div>
                    <div>
                        <p>Длина маршрута, км</p>
                        <div className="flex gap-2">
                            <input
                             onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 3000 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number'
                            className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="1000" />
                            <input
                             onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 3000 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number'
                            className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="1011" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div className="w-full">
                        <p>Вид транспорта</p>
                        <select defaultValue={'all'} className="w-full px-3 py-2 bg-[#D9D9D9]">
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
                            className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="Откуда"/>
                            <input
                            onChange={(e) => {
                                e.target.value = e.target.value.replace(/[^а-яА-Яa-zA-Z]/g, '');
                            }}
                            className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="Куда"/>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div>
                        <p>Вес.т</p>
                        <div className="flex gap-2">
                            <input 
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number' className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="1" />
                            
                        </div>
                    </div>
                    <div>
                        <p>Макс. габарит, м</p>
                        <input
                        
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value < 0 || value > 100 || isNaN(value)) {
                                e.target.value = '';
                            }
                        }}
                        className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" placeholder="3" />
                    </div>
                </div>
                <div className="flex gap-4 justify-between">
                    <div>
                        <p>Объём м3</p>
                        <div className="flex gap-2">
                            <input 
                             onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0 || value > 100 || isNaN(value)) {
                                    e.target.value = '';
                                }
                            }}
                            type='number'
                            className="w-full px-3 py-2 bg-[#D9D9D9]" placeholder="11" />
                           
                        </div>
                    </div>
                    
                </div>
                <div className="flex gap-4 justify-between">
                    <div className="w-full">
                        <p>Вид транспорта</p>
                        <select defaultValue={'all'} className="w-full px-3 py-2 bg-[#D9D9D9]">
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
                <div className="w-full">
                        <p>Комментарий</p>
                        <input placeholder="Эйфелевая башня" className="w-full px-3 py-2 bg-[#D9D9D9]" type="text" id="start-date" name="start-date"/>
                </div>
                <div className="w-full">
                <p>Файл</p>
                <input
                    className="w-full px-3 py-2 bg-[#D9D9D9] border-black border-2"
                    type="file"
                    id="start-date"
                    name="start-date"
                    accept="image/jpeg,image/png"
                />
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
    return(
        <>
        <div className="flex flex-col  justify-center items-center p-5">
            <h1 className="text-center font-normal text-xl">Найти груз для перевозки</h1>

            <section className="flex max-w-[1366px]  gap-4 items-center max-[768px]:flex-col-reverse">
            {currentPage=='load'?<Forma/>:<Forma2/>}
            
            <div className="w-1 h-[300px] max-[768px]:h-1 max-[768px]:w-[300px] bg-[#D9D9D9]"></div>
            <div className="flex flex-col justify-center gap-3 p-5 items-center ">
           
                <button
                className={`px-4 py-2  bg-[#D9D9D9] text-black shadow-md w-[245px] hover:bg-gray-100 ${active("load")}`}
                 onClick={()=>setCurrentPage("load")}
                >Найти груз для перевозки</button>
                <button
                className={`px-4 py-2  bg-[#D9D9D9] text-black shadow-md w-[245px] hover:bg-gray-100 ${active("upload")}`}
                 onClick={()=>setCurrentPage("upload")}
                >Создать груз для перевозки</button>
            </div>
         </section>

            <div 
            onClick={()=>scrollTo(800)}
            className="w-64 h-1 my-3 bg-black mt-6 rounded-md">
        
            </div>

            <h2 className="my-4">По результату поиска было найдено: 5 заказов</h2>
            <div className="flex flex-col gap-4 w-full">
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[1366px] border rounded-lg p-4 flex justify-between items-center shadow-md max-[786px]:grid max-[786px]:justify-center max-[786px]:w-auto max-[786px]:gap-3 ">
                    <div>
                        <div className="text-lg font-bold text-center">Маршрут</div>
                        <div className="flex items-center space-x-2">
                        <div>
                            <div className="font-semibold">Москва</div>
                            <div className="text-sm text-gray-500">Московская обл.</div>
                        </div>
                        <div className="text-xl">→</div>
                        <div>
                            <div className="font-semibold">Рязань</div>
                            <div className="text-sm text-gray-500">Рязанская обл.</div>
                        </div>
                        </div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="text-center">
                        <div className="text-gray-500 text-sm">Дата отправки</div>
                        <div className="text-lg font-semibold">19.12.2024</div>
                        <div className="text-sm text-green-600">Сегодня</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div>
                        <div className="text-gray-500 text-sm">О заказе</div>
                        <div className="text-lg font-semibold">1.5т, 30м²</div>
                        <div className="text-sm text-gray-500">Старый диван</div>
                        <div className="text-lg font-bold text-gray-800">15,000 руб</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="flex flex-col space-y-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Откликнуться</button>
                    </div>
                    </div>

            </div>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[1366px] border rounded-lg p-4 flex justify-between items-center shadow-md max-[786px]:grid max-[786px]:justify-center max-[786px]:w-auto max-[786px]:gap-3 ">
                    <div>
                        <div className="text-lg font-bold text-center">Маршрут</div>
                        <div className="flex items-center space-x-2">
                        <div>
                            <div className="font-semibold">Москва</div>
                            <div className="text-sm text-gray-500">Московская обл.</div>
                        </div>
                        <div className="text-xl">→</div>
                        <div>
                            <div className="font-semibold">Рязань</div>
                            <div className="text-sm text-gray-500">Рязанская обл.</div>
                        </div>
                        </div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="text-center">
                        <div className="text-gray-500 text-sm">Дата отправки</div>
                        <div className="text-lg font-semibold">19.12.2024</div>
                        <div className="text-sm text-green-600">Сегодня</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div>
                        <div className="text-gray-500 text-sm">О заказе</div>
                        <div className="text-lg font-semibold">1.5т, 30м²</div>
                        <div className="text-sm text-gray-500">Старый диван</div>
                        <div className="text-lg font-bold text-gray-800">15,000 руб</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="flex flex-col space-y-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Откликнуться</button>
                    </div>
                    </div>

            </div>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[1366px] border rounded-lg p-4 flex justify-between items-center shadow-md max-[786px]:grid max-[786px]:justify-center max-[786px]:w-auto max-[786px]:gap-3 ">
                    <div>
                        <div className="text-lg font-bold text-center">Маршрут</div>
                        <div className="flex items-center space-x-2">
                        <div>
                            <div className="font-semibold">Москва</div>
                            <div className="text-sm text-gray-500">Московская обл.</div>
                        </div>
                        <div className="text-xl">→</div>
                        <div>
                            <div className="font-semibold">Рязань</div>
                            <div className="text-sm text-gray-500">Рязанская обл.</div>
                        </div>
                        </div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="text-center">
                        <div className="text-gray-500 text-sm">Дата отправки</div>
                        <div className="text-lg font-semibold">19.12.2024</div>
                        <div className="text-sm text-green-600">Сегодня</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div>
                        <div className="text-gray-500 text-sm">О заказе</div>
                        <div className="text-lg font-semibold">1.5т, 30м²</div>
                        <div className="text-sm text-gray-500">Старый диван</div>
                        <div className="text-lg font-bold text-gray-800">15,000 руб</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="flex flex-col space-y-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Откликнуться</button>
                    </div>
                    </div>

            </div>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[1366px] border rounded-lg p-4 flex justify-between items-center shadow-md max-[786px]:grid max-[786px]:justify-center max-[786px]:w-auto max-[786px]:gap-3 ">
                    <div>
                        <div className="text-lg font-bold text-center">Маршрут</div>
                        <div className="flex items-center space-x-2">
                        <div>
                            <div className="font-semibold">Москва</div>
                            <div className="text-sm text-gray-500">Московская обл.</div>
                        </div>
                        <div className="text-xl">→</div>
                        <div>
                            <div className="font-semibold">Рязань</div>
                            <div className="text-sm text-gray-500">Рязанская обл.</div>
                        </div>
                        </div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="text-center">
                        <div className="text-gray-500 text-sm">Дата отправки</div>
                        <div className="text-lg font-semibold">19.12.2024</div>
                        <div className="text-sm text-green-600">Сегодня</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div>
                        <div className="text-gray-500 text-sm">О заказе</div>
                        <div className="text-lg font-semibold">1.5т, 30м²</div>
                        <div className="text-sm text-gray-500">Старый диван</div>
                        <div className="text-lg font-bold text-gray-800">15,000 руб</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="flex flex-col space-y-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Откликнуться</button>
                    </div>
                    </div>

            </div>
            <div className="w-full flex justify-center">
                <div className="w-full max-w-[1366px] border rounded-lg p-4 flex justify-between items-center shadow-md max-[786px]:grid max-[786px]:justify-center max-[786px]:w-auto max-[786px]:gap-3 ">
                    <div>
                        <div className="text-lg font-bold text-center">Маршрут</div>
                        <div className="flex items-center space-x-2">
                        <div>
                            <div className="font-semibold">Москва</div>
                            <div className="text-sm text-gray-500">Московская обл.</div>
                        </div>
                        <div className="text-xl">→</div>
                        <div>
                            <div className="font-semibold">Рязань</div>
                            <div className="text-sm text-gray-500">Рязанская обл.</div>
                        </div>
                        </div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="text-center">
                        <div className="text-gray-500 text-sm">Дата отправки</div>
                        <div className="text-lg font-semibold">19.12.2024</div>
                        <div className="text-sm text-green-600">Сегодня</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div>
                        <div className="text-gray-500 text-sm">О заказе</div>
                        <div className="text-lg font-semibold">1.5т, 30м²</div>
                        <div className="text-sm text-gray-500">Старый диван</div>
                        <div className="text-lg font-bold text-gray-800">15,000 руб</div>
                    </div>
                    <div className="w-1 rounded-xl h-full bg-[#D9D9D9]"></div>
                    <div className="flex flex-col space-y-2">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Подробнее</button>
                        <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Откликнуться</button>
                    </div>
                    </div>

            </div>
            </div>
        
        </div>
        </>
    )
}