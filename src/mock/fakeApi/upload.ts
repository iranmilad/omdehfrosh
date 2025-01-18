/**
 * تکمیل شده
 */

export default function Upload(server:any, apiPrefix:string) {
    // ای‌پی‌آی برای آپلود فایل (POST)
    server.post(`${apiPrefix}/upload`, (schema:any, { requestBody }: {requestBody: File}) => {
      // لاگ کردن بدنه درخواست برای دیباگ
  

      // مسیر کامل فایل آپلود شده و آیدی آن
      return { message: "ok", data: { url: "https://placehold.co/400",id: "123" } };
    });
  }