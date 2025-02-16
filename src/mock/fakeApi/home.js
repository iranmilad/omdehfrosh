import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { productGrid, products } from "../data/products"; // ایمپورت داده‌های محصولات
import { categories } from "../data/categories"; // ایمپورت داده‌های دسته‌بندی‌ها
import { banners } from "../data/banners"; // ایمپورت داده‌های بنرها
import { trendProducts } from "../data/products"; // ایمپورت داده‌های محصولات پرطرفدار
import { brands } from "../data/brands"; // ایمپورت داده‌های برندها
import Desktop1 from "../../assets/sliders/1-desktop.gif";
import Mobile1 from "../../assets/sliders/1-mobile.gif";
import Desktop2 from "../../assets/sliders/2-desktop.webp";
import Mobile2 from "../../assets/sliders/2-mobile.jpg";

const wideslider = [
  {
    url: "/link1",
    mobileImage: Mobile1,
    tabletImage: Desktop1,
    desktopImage: Desktop1,
  },
  {
    url: "/link2",
    mobileImage: Mobile2,
    tabletImage: Desktop2,
    desktopImage: Desktop2,
  },
];

export default function Shop(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت داده‌های صفحه اصلی فروشگاه
  server.get(`${apiPrefix}/home`, (schema, { requestBody }) => {
    let data = [
        {type: "wideslider", data: wideslider},
        { type: "featured_promo", data: shuffleArray(products) },
        { type: "categories", data: categories },
        { type: "banners", data: banners },
        { type: "productGrid", data: productGrid },
        { type: "trendProducts", data: trendProducts },
        { type: "brands", data: brands },
        { type: "featured_products", data: shuffleArray(products) }
    ];

    return { message: "ok", data };
});
}