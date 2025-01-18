/**
 * تکمیل شده
 */

interface Search{
  s: string
}

export default function SearchApi(server:any, apiPrefix: string) {
  // ای‌پی‌آی برای جست‌وجو (GET)
  server.get(`${apiPrefix}/search`, (schema:any, { requestBody }: { requestBody: Search }) => {
    // ساخت داده‌های نمونه برای نتایج جست‌وجو
    const data = {
      category: [ // دسته‌بندی‌های مرتبط با جست‌وجو
        {
          title: "موبایل", // عنوان دسته‌بندی
          slug: "mobile", // اسلاگ دسته‌بندی
        },
      ],
      products: [ // محصولات مرتبط با جست‌وجو
        {
          title: "آیفون 16", // عنوان محصول
          slug: "iphone-16", // اسلاگ محصول
        },
      ],
    };

    // برگرداندن نتایج جست‌وجو
    return { message: "ok", data };
  });
}