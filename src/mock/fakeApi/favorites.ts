/**
 * تکمیل شده
 */
// @ts-ignore
import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول

interface Product {
  id: number | string
}

export default function Favorites(server:any, apiPrefix:string) {
  // ای‌پی‌آی برای دریافت لیست محصولات مورد علاقه (GET)
  server.get(`${apiPrefix}/favorites`, () => {
    // ساخت داده‌های نمونه برای محصولات مورد علاقه
    const data = [
      {
        id: 123, // شناسه محصول
        title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده", // عنوان محصول
        slug: "123", // اسلاگ محصول
        regularPrice: 21000000, // قیمت اصلی
        discountedPrice: 9120000, // قیمت تخفیف‌خورده
        discountPercent: "40", // درصد تخفیف
        image: Product1, // تصویر محصول
      },
    ];

    // برگرداندن لیست محصولات مورد علاقه
    return { message: "ok", data };
  });

  // ای‌پی‌آی برای افزودن محصول به لیست مورد علاقه (POST)
  server.post(`${apiPrefix}/favorites`, (schema:any, { requestBody }: {requestBody: string}) => {
    // پارس کردن بدنه درخواست و دریافت شناسه محصول
    let { id } = JSON.parse(requestBody) as Product;
    if (id) {
      // اگر شناسه محصول وجود داشت، پیام موفقیت برگردانده می‌شود
      return { message: "ok" };
    }
  });

  // ای‌پی‌آی برای حذف محصول از لیست مورد علاقه (DELETE)
  server.delete(`${apiPrefix}/favorites`, (schema: any, { requestBody }: {requestBody: string}) => {
    // پارس کردن بدنه درخواست و دریافت شناسه محصول
    let { id } = JSON.parse(requestBody) as Product;
    if (id) {
      // اگر شناسه محصول وجود داشت، پیام موفقیت برگردانده می‌شود
      return { message: "ok" };
    }
  });
}