// @ts-ignore
import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول اول
// @ts-ignore
import Product6 from "../../assets/products/6.webp"; // ایمپورت تصویر محصول دوم

/**
 * تکمیل شده
 */

interface Compare {
  compare: Array<string | number> // [ 1 , 2 , 3 ] or ['1' , '2' , '3']
}

export default function Compare(server:any, apiPrefix: string) {
  // ای‌پی‌آی برای مقایسه دو محصول
  server.post(`${apiPrefix}/compare`, (schema:any, { requestBody }: {requestBody: Compare}) => {
    // ساخت داده‌های مقایسه
    let data = {
      title: [ // عنوان محصولات
        "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
        "گوشی موبایل سامسونگ مدل Galaxy S24 Ultra دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام",
      ],
      slug: ["123", "456"], // اسلاگ محصولات
      image: [Product1, Product6], // تصاویر محصولات
      rating: ["3", "5"], // امتیاز محصولات
      price: [ // قیمت‌های محصولات
        {
          regularPrice: 21000000, // قیمت اصلی محصول اول
          discountedPrice: 19000000 // قیمت تخفیف‌خورده محصول اول
        },
        {
          regularPrice: 30000000, // قیمت اصلی محصول دوم
        },
      ],
      attributes: [ // ویژگی‌های محصولات
        {
          label: "رنگ ها", // عنوان ویژگی
          value: ["آبی ، قرمز ، مشکی", "مشکی"], // مقادیر ویژگی برای هر محصول
        },
      ],
    };
    
    // برگرداندن داده‌های مقایسه
    return { message: "ok", data };
  });
}