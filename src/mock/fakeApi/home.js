import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { productGrid, products } from "../data/products"; // ایمپورت داده‌های محصولات
import { categories } from "../data/categories"; // ایمپورت داده‌های دسته‌بندی‌ها
import { banners } from "../data/banners"; // ایمپورت داده‌های بنرها
import { trendProducts } from "../data/products"; // ایمپورت داده‌های محصولات پرطرفدار
import { brands } from "../data/brands"; // ایمپورت داده‌های برندها

export default function Shop(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت داده‌های صفحه اصلی فروشگاه
  server.get(`${apiPrefix}/home`, (schema, { requestBody }) => {
    let data = {}; // ایجاد یک شیء برای ذخیره داده‌ها

    // افزودن داده‌های مختلف به شیء `data`
    data.featured_promo = shuffleArray(products); // محصولات ویژه (تصادفی‌سازی شده)
    data.categories = categories; // دسته‌بندی‌ها
    data.banners = banners; // بنرها
    data.trendProducts = trendProducts; // محصولات پرطرفدار
    data.productGrid = productGrid; // گرید محصولات
    data.brands = brands; // برندها
    data.featured_products = shuffleArray(products); // محصولات ویژه دیگر (تصادفی‌سازی شده)

    // برگرداندن داده‌های صفحه اصلی
    return { message: "ok", data };
  });
}