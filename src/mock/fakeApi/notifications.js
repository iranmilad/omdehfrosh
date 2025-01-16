import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول

export default function Account_Notifications(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت لیست اطلاعیه‌های کاربر (GET)
  server.get(`${apiPrefix}/notifications`, (schema, { requestBody }) => {
    // ساخت داده‌های نمونه برای اطلاعیه‌ها
    const data = [
      {
        type: "product", // نوع اطلاعیه (محصول)
        title: "محصول مورد نظر شما به فروشگاه اضافه گردید", // عنوان اطلاعیه
        subtitle: "گوشی موبایل اپل مدل iPhone 13 Pro ZAA دو سیم‌ کارت ظرفیت 512 گیگابایت و رم 6 گیگابایت - نات اکتیو ریفربیش پارت", // توضیحات اطلاعیه
        image: Product1, // تصویر محصول
        slug: "13pro_zaa_notactgive_512", // اسلاگ محصول
        date: "(16:59) 1403/12/12", // تاریخ و زمان اطلاعیه
      },
      {
        type: "notification", // نوع اطلاعیه (عمومی)
        title: "تخفیف 50 درصدی به مناسبت شب یلدا - کد تخفیف : YALDA50", // عنوان اطلاعیه
        subtitle: "تمام کالا هایی که لیست شده اند را با 50 درصد تخفیف تهیه کنید", // توضیحات اطلاعیه
        date: "(16:59) 1403/12/12", // تاریخ و زمان اطلاعیه
        link: "https://digikala.com", // لینک مرتبط با اطلاعیه
      },
    ];

    // برگرداندن لیست اطلاعیه‌ها
    return { message: "ok", data };
  });
}