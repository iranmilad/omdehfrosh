export default function Page(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محتوای یک صفحه بر اساس اسلاگ (POST)
  server.post(`${apiPrefix}/page`, (schema, { requestBody }) => {
    // پارس کردن بدنه درخواست و دریافت اسلاگ صفحه
    let { slug } = JSON.parse(requestBody);
    if (slug) {
      // اگر اسلاگ وجود داشت، محتوای صفحه برگردانده می‌شود
      return { message: "ok", data: "<h2>hello</h2>" };
    }
  });
}