export default function Upload(server, apiPrefix) {
  // ای‌پی‌آی برای آپلود فایل (POST)
  server.post(`${apiPrefix}/upload`, (schema, { requestBody }) => {
    // لاگ کردن بدنه درخواست برای دیباگ
    console.log(requestBody);

    // برگرداندن پاسخ موفقیت‌آمیز همراه با URL فایل آپلود شده
    return { message: "ok", data: { url: "https://placehold.co/400" } };
  });
}