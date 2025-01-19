export default function EditAccount(server, apiPrefix) {
  // ای‌پی‌آی برای ویرایش اطلاعات حساب کاربری (POST)
  server.post(`${apiPrefix}/edit-account`, (schema, { requestBody }) => {
    // پارس کردن بدنه درخواست
    let body = JSON.parse(requestBody);
    if (body) {
      // اگر بدنه درخواست وجود داشت، پیام موفقیت برگردانده می‌شود
      return { message: "ok" };
    }
  });

  // ای‌پی‌آی برای دریافت اطلاعات حساب کاربری (GET)
  server.get(`${apiPrefix}/edit-account`, (schema, { requestBody }) => {
    // جست‌وجوی کاربر بر اساس شماره موبایل
    const user = schema.db.signInUserData.findBy({
      mobile: "09374039436", // شماره موبایل کاربر
    });
    if (user) {
      // اگر کاربر پیدا شد، اطلاعات کاربر برگردانده می‌شود
      return { message: "ok", data: user };
    }
  });
}