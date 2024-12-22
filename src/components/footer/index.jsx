import { Center, Container, Image, Text } from "@mantine/core"
import cashDelivery from "../../assets/services/cash-on-delivery.svg";
import daysReturn from "../../assets/services/days-return.svg";
import expressDelivery from "../../assets/services/express-delivery.svg";
import originalProducts from "../../assets/services/original-products.svg";
import support from "../../assets/services/support.svg";
import Logo from "../../assets/logo.png"




const Footer = (props) => {
    return (
          <div className="border-t pt-10 mt-32 bg-white">
              <Container>
              <div className="flex flex-wrap gap-y-4 justify-between items-center px-6">
          <div className="flex flex-col">
            <div>
              <Image className="w-32 md:w-48" src={Logo} alt="" />
            </div>
            <div className="text-xs text-zinc-600 mt-3">
              تلفن پشتیبانی 44444444-021
            </div>
          </div>
          <div>
            <button onClick={() =>  window.scrollTo({ top: 0, behavior: "smooth" })} type="button" className="flex items-center gap-x-1 border rounded-lg px-3 py-2 text-zinc-500 text-sm md:text-base" id="btn-back-to-top">
              برو به بالا
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#9c9c9c" viewBox="0 0 256 256"><path d="M128,26A102,102,0,1,0,230,128,102.12,102.12,0,0,0,128,26Zm0,192a90,90,0,1,1,90-90A90.1,90.1,0,0,1,128,218Zm44.24-78.24a6,6,0,1,1-8.48,8.48L128,112.49,92.24,148.24a6,6,0,0,1-8.48-8.48l40-40a6,6,0,0,1,8.48,0Z"></path></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-y-5 justify-around my-10">
            <div className="flex justify-center items-center flex-col rounded-3xl w-28 h-24">
              <Image className="w-12 md:w-14" src={cashDelivery} alt="" />
              <span className="text-xs text-zinc-600">
              پرداخت درب منزل
              </span>
            </div>
            <div className="flex justify-center items-center flex-col rounded-3xl w-28 h-24">
              <Image className="w-12 md:w-14" src={daysReturn} alt="" />
              <span className="text-xs text-zinc-600">
              ضمانت 7 روزه
              </span>
            </div>
            <div className="flex justify-center items-center flex-col rounded-3xl w-28 h-24">
              <Image className="w-12 md:w-14" src={expressDelivery} alt="" />
              <span className="text-xs text-zinc-600">
              پست سریع
              </span>
            </div>
            <div className="flex justify-center items-center flex-col rounded-3xl w-28 h-24">
              <Image className="w-12 md:w-14" src={originalProducts} alt="" />
              <span className="text-xs text-zinc-600">
              ضمانت کالا
              </span>
            </div>
            <div className="flex justify-center items-center flex-col rounded-3xl w-28 h-24">
              <Image className="w-12 md:w-14" src={support} alt="" />
              <span className="text-xs text-zinc-600">
              پشتیبانی 24 ساعته
              </span>
            </div>
        </div>

        <div className="mx-auto">
          <div className="flex flex-wrap">
            <div className="px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className="mb-3 text-zinc-700">با مدکالا</h4>
                <ul className="grid gap-y-3">
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    وبلاگ مدکالا
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    فروش در مدکالا
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    گزارش تخلف در مدکالا
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    تماس با مدکالا
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    درباره مدکالا
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className="mb-3 text-zinc-700">خدمات مشتریان</h4>
                <ul className="grid gap-y-3">
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    پرسش های متداول
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    رویه مرجوع کردن کالا
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    شرایط استفاده
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    حریم خصوصی
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    گزارش باگ
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className="mb-3 text-zinc-700">راهنمای خرید از مدکالا</h4>
                <ul className="grid gap-y-3">
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    نحوه ثبت سفارش
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    رویه ارسال سفارش
                    </a>
                  </li>
                  <li>
                    <a
                      href="./index.html"
                      className="mb-2 hover:text-zinc-600 transition text-zinc-500 text-xs md:text-sm">
                    شیوه های پرداخت
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="px-4 sm:w-1/2 lg:w-3/12">
              <div className="mb-10 w-full">
                <h4 className="mb-2 text-right text-zinc-700">همراه ما باشید!</h4>
                <div className="mb-5 flex items-center justify-start">
                  <a href="#" title="instagram" className="mr-3 flex h-11 md:h-12 w-11 md:w-12 items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#575757" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg>                </a>
                  <a href="#" title="telegram" className="mr-3 flex h-11 md:h-12 w-11 md:w-12 items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#575757" viewBox="0 0 256 256"><path d="M236.88,26.19a9,9,0,0,0-9.16-1.57L25.06,103.93a14.22,14.22,0,0,0,2.43,27.21L80,141.45V200a15.92,15.92,0,0,0,10,14.83,15.91,15.91,0,0,0,17.51-3.73l25.32-26.26L173,220a15.88,15.88,0,0,0,10.51,4,16.3,16.3,0,0,0,5-.79,15.85,15.85,0,0,0,10.67-11.63L239.77,35A9,9,0,0,0,236.88,26.19Zm-61.14,36L86.15,126.35l-49.6-9.73ZM96,200V152.52l24.79,21.74Zm87.53,8L100.85,135.5l119-85.29Z"></path></svg>                </a>
                  <a href="#" title="whatsapp" className="mr-3 flex h-11 md:h-12 w-11 md:w-12 items-center justify-center p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#575757" viewBox="0 0 256 256"><path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"></path></svg>                </a>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 lg:flex pb-5">
            <div className="w-full">
              <p className="mb-2 text-lg text-zinc-700">
                فروشگاه اینترنتی مدکالا
              </p>
              <p className="mb-7 text-zinc-600 text-sm leading-7">
                یک خرید اینترنتی مطمئن، نیازمند فروشگاهی است که بتواند کالاهایی متنوع، باکیفیت و دارای قیمت مناسب را در مدت زمان ی کوتاه به دست مشتریان خود برساند و ضمانت بازگشت کالا هم داشته باشد؛ ویژگی‌هایی که فروشگاه اینترنتی دیجی‌کالا سال‌هاست بر روی آن‌ها کار کرده و توانسته از این طریق مشتریان ثابت خود را داشته باشد.
                یکی از مهم‌ترین دغدغه‌های کاربران دیجی‌کالا یا هر فروشگاه‌ اینترنتی دیگری، این است که کالای خریداری شده چه زمانی به دستشان می‌رسد. دیجی‌کالا شیوه‌های مختلفی از ارسال را متناسب با فروشنده کالا،‌ مقصد کالا و همچنین نوع کالا در اختیار کاربران خود قرار می‌دهد.</p>
            </div>
          </div>
        </div>
        
          <Center className="border-t py-5"><Text size="xs" c="gray">تمامی حقوق برای این فروشگاه محفوظ است</Text></Center>
              </Container>
          </div>
    )
}

export default Footer