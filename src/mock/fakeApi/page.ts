/**
 * تکمیل شده
 */

interface Page{
  slug: number | string
}

export default function Page(server:any, apiPrefix: string) {
    // ای‌پی‌آی برای دریافت محتوای یک صفحه بر اساس اسلاگ (POST)
    server.post(`${apiPrefix}/page`, (schema:any, { requestBody }: {requestBody: string}) => {
      // پارس کردن بدنه درخواست و دریافت اسلاگ صفحه
      let { slug } = JSON.parse(requestBody) as Page;
      if (slug) {
        // اگر اسلاگ وجود داشت، محتوای صفحه برگردانده می‌شود
        return { message: "ok", data: "<h2>hello</h2>" };
      }
    });
  }