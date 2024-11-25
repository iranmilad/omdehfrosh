import { Center, Image,Button } from "@mantine/core"
import { NavLink } from "react-router"
import Error404 from "../../assets/404-error-not-found.png"
import { IconArrowLeft, IconChevronLeft } from "@tabler/icons-react"

const Page404 = () => {
    return (
        <main class="w-full mx-auto px-3">
        <div class="bg-white shadow-xl my-5 lg:my-10 rounded-xl md:rounded-2xl p-3 md:p-5">
            <Center><Image src={Error404} /></Center>
            <div class="text-zinc-800 text-center mt-7 mb-5 text-lg">
              صفحه مورد نظر پیدا نشد!!!
            </div>
            <div class="flex justify-center items-center mb-5">
              <Button to="/" component={NavLink} rightSection={<IconChevronLeft />}>صفحه اصلی</Button>
            </div>
        </div>
      </main>
    )
}

export default Page404