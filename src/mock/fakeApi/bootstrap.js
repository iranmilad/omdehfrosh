/**
 * تکمیل شده
 * این آدرس هیچ مقدار ورودی ندارد
 */

import { Response } from 'miragejs';
import Banner from '../../assets/banner.webp'; // ایمپورت بنر سایت
import { menuItems } from "../data/menu"; // ایمپورت آیتم‌های منو
import Logo from '../../assets/logo.png'; // ایمپورت لوگو سایت

export default function Bootstrap(server, apiPrefix) {
    // ای‌پی‌آی برای دریافت اطلاعات اولیه سایت (بوت‌استرپ)
    server.get(`${apiPrefix}/bootstrap`, (schema, request) => {
        // بررسی توکن احراز هویت برای صفحات غیر از لاگین و ثبت‌نام
        // request.requestHeaders['url'] faghat dar halat development ersal mishavad va ba php address darkhast shode ra mitavan daryaft kard
        const token = request.requestHeaders["Authorization"] || request.requestHeaders["Authorization"];
        if (request.requestHeaders['url'] !== "/login" && request.requestHeaders['url'] !== "/register") {
            if (!token) {
                // اگر توکن وجود نداشت، خطای ۴۰۱ برگردانده می‌شود
                return new Response(401, { some: "header" }, { error: "Authorization token missing." });
            }
        }

        // ساخت داده‌های اولیه سایت
        let data = {
            siteTitle: "فروشگاه اینترنتی مدکالا", // عنوان سایت
            logo: Logo, // لوگو سایت
            banner: {
                link: "https://digikala.com", // لینک بنر
                src: Banner // آدرس تصویر بنر
            },
            menu: menuItems, // آیتم‌های منو
            footerAbout: "یک خرید اینترنتی مطمئن، نیازمند فروشگاهی است که بتواند کالاهایی متنوع، باکیفیت و دارای قیمت مناسب را در مدت زمان ی کوتاه به دست مشتریان خود برساند و ضمانت بازگشت کالا هم داشته باشد؛ ویژگی‌هایی که فروشگاه اینترنتی دیجی‌کالا سال‌هاست بر روی آن‌ها کار کرده و توانسته از این طریق مشتریان ثابت خود را داشته باشد. یکی از مهم‌ترین دغدغه‌های کاربران دیجی‌کالا یا هر فروشگاه‌ اینترنتی دیگری، این است که کالای خریداری شده چه زمانی به دستشان می‌رسد. دیجی‌کالا شیوه‌های مختلفی از ارسال را متناسب با فروشنده کالا،‌ مقصد کالا و همچنین نوع کالا در اختیار کاربران خود قرار می‌دهد.", // متن درباره‌ی سایت در فوتر
            /**
             * تایپ های مجاز
             * instagram,telegram,x,facebook,linkedin,youtube,twitter,pinterest,snapchat,whatsapp
             */
            socialMedia: [ // لیست شبکه‌های اجتماعی
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
        };
        // برگرداندن داده‌های اولیه سایت
        return { message: "ok", data };
    });
}