import { Center, Image } from "@mantine/core"
import Error404 from "../../assets/404-error-not-found.png"

const Page404 = () => {
    return (
        <main class="w-full mx-auto px-3 md:px-5 mt-44 md:mt-32">
        <div class="bg-white shadow-xl my-5 lg:my-10 rounded-xl md:rounded-2xl p-3 md:p-5">
            <Center><Image src={Error404} /></Center>
            <div class="text-zinc-800 text-center mt-7 mb-5 text-lg">
              صفحه مورد نظر پیدا نشد!!!
            </div>
            <div class="flex justify-center items-center mb-5">
              <a class="text-zinc-700 hover:text-zinc-600 transition" href="./index.html">
                صفحه اصلی
              </a>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#575757" viewBox="0 0 256 256"><path d="M164.24,203.76a6,6,0,1,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,128Z"></path></svg>
            </div>
        </div>
      </main>
    )
}

export default Page404