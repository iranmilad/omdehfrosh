// @ts-ignore
import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
// @ts-ignore
import { products } from "../data/products"; // ایمپورت داده‌های محصولات

interface RelatedProducts{
  slug: number | string
}


export default function Product(server:any, apiPrefix: string) {

  /**
   * محصولات مرتبط تکمیل شده 
   */
  // ای‌پی‌آی برای دریافت محصولات مرتبط (GET)
  server.post(`${apiPrefix}/product/related`, (schema:any, { requestBody }: {requestBody: RelatedProducts}) => {
    let data = products; // استفاده از لیست محصولات

    // برگرداندن لیست محصولات مرتبط به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });
}