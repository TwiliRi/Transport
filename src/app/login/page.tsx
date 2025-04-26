import Image from "next/image";
import Icon from "~/public/ico.png";
export default function Login() {

  return (
<>
    <form className="flex flex-col justify-center items-center h-[80vh]  gap-[50px]">
        <a href="/"><Image src={Icon}  className="max-w-16" alt="иконка" /></a>
        <div className="flex flex-col gap-4">
            <h1 className="text-center font-normal text-xl"> Вход</h1>
            <div>
                <p  className="font-normal ">Логин</p>
                <input className=" w-[270px]  px-3 py-2 bg-[#D9D9D9]"  placeholder="Логин" type="text" />
            </div>
            <div>
                <div className="flex justify-between">
                    <p className="font-normal ">Пароль</p>
                    <p>Забыли пароль?</p>
                </div>
                <input className="w-full px-3 py-2 bg-[#D9D9D9]"  placeholder="Логин" type="text" />
            </div>
            <label className="flex gap-2">
              <input type="checkbox" />
              Забыли пароль?
            </label>
            <button
        className="bg-black p-2 w-full rounded-md"
        type="submit"
        >
          <p className="text-white">Войти</p>
        </button>
        <a href="/registration"><p>Нет аккаунта? Регистрация</p></a>
        </div>
    </form>
</>
  )

}