import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { products } from "../data/products"; // ایمپورت داده‌های محصولات

export default function Product(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محصولات مرتبط (GET)
  server.get(`${apiPrefix}/product/related`, (schema, { requestBody }) => {
    let data = products; // استفاده از لیست محصولات

    // برگرداندن لیست محصولات مرتبط به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });
}