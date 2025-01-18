/**
 * تکمیل شده
 */

// @ts-ignore
import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
// @ts-ignore
import { archive } from "../data/products"; // ایمپورت داده‌های محصولات

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  title: string;
  key: string;
  options: Array<FilterOption>;
}

interface Archive {
  price_min: number;
  price_max: number;
  dynamic: Array<Filter>; // مقادیر فیلتر مثل رنگ ، سایز ، جنس
  limit: number;
  page: number;
  sort: string;
  s: string; // جستجو
}

export default function Shop(server: any, apiPrefix: string) {
  // ای‌پی‌آی برای دریافت محصولات فروشگاه یا آرشیو محصولات (POST)
  server.post(`${apiPrefix}/shop`, (schema:any, { requestBody } : {requestBody: Archive}) => {
    let data = archive; // استفاده از لیست محصولات آرشیو

    data.products = shuffleArray(data.products); // تصادفی‌سازی لیست محصولات
    
    return { message: "ok", data }; // برگرداندن لیست محصولات
  });
}