/**
 * تکمیل شده
 */
// @ts-ignore
import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه

interface SendTicket {
  title: string, // عنوان
  department: string, // دپارتمان
  description: string, // توضیحات
}

export default function Account_Tickets(server:any, apiPrefix:string) {
  // ای‌پی‌آی برای دریافت لیست تیکت‌های کاربر (GET)
  server.get(`${apiPrefix}/tickets`, () => {
    const data = [
      {
        id: "1234",
        type: "پشتیبانی فنی",
        title: "حل مشکل سایت",
        status: "closed",
        update: "1403/12/12",
      },
      {
        id: "5678",
        type: "مالی و حسابداری",
        title: "پیگیری فاکتور",
        status: "open",
        update: "1403/12/10",
      },
      {
        id: "9101",
        type: "مدیریت کاربران",
        title: "بازیابی حساب کاربری",
        status: "closed",
        update: "1403/11/01",
      },
      {
        id: "1121",
        type: "ارتباط با مشتریان",
        title: "پیشنهاد محصول جدید",
        status: "open",
        update: "1403/10/25",
      },
      {
        id: "3141",
        type: "پشتیبانی فنی",
        title: "رفع اشکال",
        status: "closed",
        update: "1403/09/15",
      },
      {
        id: "5161",
        type: "مدیریت سفارشات",
        title: "بررسی وضعیت سفارش",
        status: "open",
        update: "1403/08/20",
      },
      {
        id: "7181",
        type: "پشتیبانی فنی",
        title: "درخواست پشتیبانی",
        status: "closed",
        update: "1403/07/10",
      },
      {
        id: "9202",
        type: "مالی و حسابداری",
        title: "گزارش پرداخت ناموفق",
        status: "open",
        update: "1403/06/12",
      },
      {
        id: "2232",
        type: "ارتباط با مشتریان",
        title: "نظر درباره خدمات",
        status: "closed",
        update: "1403/05/18",
      },
      {
        id: "3243",
        type: "مدیریت کاربران",
        title: "تغییر رمز عبور",
        status: "open",
        update: "1403/04/25",
      },
    ];

    // برگرداندن لیست تیکت‌ها به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });

  // ای‌پی‌آی برای دریافت جزئیات یک تیکت خاص (GET)
  server.get(`${apiPrefix}/tickets/:id`, () => {
    const data = {
      id: "123",
      info: {
        requester: "فرهاد باقری", // درخواست‌کننده
        department: "پشتیبانی محصول", // بخش مربوطه
        sentDate: "۱۴۰۳/۱۲/۰۷ (۱۷:۱۵)", // تاریخ ارسال
        lastUpdate: "۱ هفته پیش", // آخرین به‌روزرسانی
        title: "حل مشکل محصول", // عنوان تیکت
        status: "open", // وضعیت تیکت
        priority: "متوسط", // اولویت
      },
      messages: [ // لیست پیام‌های تیکت
        {
          sender: "ادمین پشتیبانی", // ارسال‌کننده
          date: "(16:59) 1403/4/23", // تاریخ ارسال
          body: "سلام ، جزئیات را ارسال کنید", // متن پیام
          you: false, // آیا پیام از طرف کاربر است؟
        },
        {
          sender: "فرهاد باقری",
          date: "(16:59) 1403/4/23",
          body: "سلام من یک مشکل در ارسال محصول دارم",
          you: true,
        },
      ],
    };

    // برگرداندن جزئیات تیکت
    return { message: "ok", data };
  });

  // ای‌پی‌آی برای ارسال پیام جدید به تیکت (POST)
  server.post(`${apiPrefix}/tickets/send`, (schema:any, { requestBody }: {requestBody: SendTicket}) => {
    // در اینجا می‌توانید پیام جدید را به تیکت اضافه کنید
    return { message: "ok" }; // برگرداندن پیام موفقیت
  });
}