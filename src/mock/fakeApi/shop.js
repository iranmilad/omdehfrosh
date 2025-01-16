import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { archive } from "../data/products"; // ایمپورت داده‌های محصولات

export default function Shop(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محصولات فروشگاه یا آرشیو محصولات (POST)
  server.post(`${apiPrefix}/shop`, (schema, { requestBody }) => {
    let data = archive; // استفاده از لیست محصولات آرشیو

    data.products = shuffleArray(data.products); // تصادفی‌سازی لیست محصولات
    
    return { message: "ok", data }; // برگرداندن لیست محصولات
  });
}