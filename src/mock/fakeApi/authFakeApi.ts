/**
 * تکمیل شده
 */

import { Response } from "miragejs";

interface AuthSmsRequest {
  mobile: string;
}

interface Login {
  mobile: string,
  code : string
}

export default function authFake(server:any, apiPrefix:string) {
  server.post(`${apiPrefix}/auth/sms`, (schema:any, { requestBody } : {requestBody: string }) => {
    const { mobile } = JSON.parse(requestBody) as AuthSmsRequest;

    if (mobile) {
      const user = schema.db.signInUserData.findBy({
        mobile,
      });

      if (user) {
        // اگر کاربر وجود داشت، کد اس‌ام‌اس برگردانده می‌شود
        return { sms: 2020 };
      } else {
        // اگر کاربری با این شماره موبایل وجود نداشت، خطا برگردانده می‌شود
        return new Response(
          200,
          {},
          { error: "کاربری با این شماره موبایل یافت نشد" }
        );
      }
    }

    // اگر شماره موبایل ارسال نشده باشد، خطای ۴۰۱ برگردانده می‌شود
    return new Response(401, { some: "header" }, { message: "NOTHING" });
  });

  /**
   * @property {string} mobile
   * @property {string} code
   */
  // ای‌پی‌آی برای لاگین با استفاده از شماره موبایل و کد اس‌ام‌اس
  server.post(`${apiPrefix}/auth/login`, (schema:any, { requestBody }:{requestBody: string }) => {
    const { mobile, code } = JSON.parse(requestBody) as Login;
    if (mobile && code) {
      if (code === "2020") {
        const user = schema.db.signInUserData.findBy({
          mobile,
        });
        // اگر کد اس‌ام‌اس صحیح بود، اطلاعات کاربر و توکن برگردانده می‌شود
        return {
          user,
          token: "TOKEN wVYrxaeNa9OxdnULvde1Au5m5w63",
          maxAge: 30 * 24 * 60 * 60,
        };
      } else {
        // اگر کد اس‌ام‌اس اشتباه بود، خطا برگردانده می‌شود
        return new Response(
          200,
          { some: "header" },
          { error: "کد وارد شده اشتباه است" }
        );
      }
    }
    // اگر شماره موبایل یا کد اس‌ام‌اس ارسال نشده باشد، خطای ۴۰۱ برگردانده می‌شود
    return new Response(401, { some: "header" }, { message: "NOTHING" });
  });
}
