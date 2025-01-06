import { Response } from 'miragejs';
import Banner from '../../assets/banner.webp'
import {menuItems} from "../data/menu";
import Logo from '../../assets/logo.png'

export default function Bootstrap(server,apiPrefix){
    server.get(`${apiPrefix}/bootstrap`, (schema, {requestBody,requestHeaders }) => {
        const token = requestHeaders["Authorization"] || requestHeaders["Authorization"];
        if (!token) {
          return new Response(401, {some: "header"}, { error: "Authorization token missing." });
        }


        let data = {
          siteTitle: "فروشگاه اینترنتی مدکالا",
          logo: Logo,
            banner: {
                link: "https://digikala.com",
                src: Banner
            },
            menu: menuItems,
            footerAbout: "یک خرید اینترنتی مطمئن، نیازمند فروشگاهی است که بتواند کالاهایی متنوع، باکیفیت و دارای قیمت مناسب را در مدت زمان ی کوتاه به دست مشتریان خود برساند و ضمانت بازگشت کالا هم داشته باشد؛ ویژگی‌هایی که فروشگاه اینترنتی دیجی‌کالا سال‌هاست بر روی آن‌ها کار کرده و توانسته از این طریق مشتریان ثابت خود را داشته باشد. یکی از مهم‌ترین دغدغه‌های کاربران دیجی‌کالا یا هر فروشگاه‌ اینترنتی دیگری، این است که کالای خریداری شده چه زمانی به دستشان می‌رسد. دیجی‌کالا شیوه‌های مختلفی از ارسال را متناسب با فروشنده کالا،‌ مقصد کالا و همچنین نوع کالا در اختیار کاربران خود قرار می‌دهد.",
            socialMedia: [
                {
                    link: "https://ig.me/instagram",
                    type: "instagram"
                },
                {
                    link: "https://t.me/telegram",
                    type: "telegram"
                },
                {
                    link: "https://x.com/x",
                    type: "x"
                },
            ]
        }
        return { message: "ok", data }
    })
}