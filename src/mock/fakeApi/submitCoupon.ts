/**
 * تکمیل شده
 */

interface Coupon{
  code: string
}

export default function SubmitCoupon(server:any, apiPrefix: string) {
    // ای‌پی‌آی برای اعمال کد تخفیف (POST)
    server.post(`${apiPrefix}/submitcoupon`, (schema:any, { requestBody } : {requestBody: string}) => {
      // پارس کردن بدنه درخواست و دریافت کد تخفیف
      let { code } = JSON.parse(requestBody) as Coupon;
  
      // بررسی وجود کد تخفیف
      if (code) {
        // بررسی معتبر بودن کد تخفیف
        if (code !== "farhad") {
          // اگر کد تخفیف معتبر نباشد، خطا برگردانده می‌شود
          return { error: "کد تخفیف معتبر نیست" };
        } else {
          // اگر کد تخفیف معتبر باشد، پیام موفقیت برگردانده می‌شود
          return { message: "کد تخفیف اعمال شد" };
        }
      }
    });
  }