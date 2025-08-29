import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول


export default function MyAccount(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت لیست محصولات مورد علاقه (GET)
  server.get(`${apiPrefix}/myaccount`, (schema, { requestBody }) => {
    // ساخت داده‌های نمونه برای محصولات مورد علاقه
    const data = {
      account_balance: 75_000,
      all_orders: 4,
      tickets: 15,
      orders: [
        {
          id: "1234",
          date: "1403/12/12",
          status: "درحال بررسی",
          total: "12,000,000",
        },
        {
          id: "1234",
          date: "1403/12/12",
          status: "درحال بررسی",
          total: "12,000,000",
        },
      ],
      favorites: [
        {
          id: "123", // شناسه محصول
          title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده", // عنوان محصول
          slug: "123", // اسلاگ محصول
          regularPrice: 21000000, // قیمت اصلی
          discountedPrice: 9120000, // قیمت تخفیف‌خورده
          discountPercent: "40", // درصد تخفیف
          image: Product1, // تصویر محصول
        },
      ],
    };

    // برگرداندن لیست محصولات مورد علاقه
    return { message: "ok", data };

  });



}
