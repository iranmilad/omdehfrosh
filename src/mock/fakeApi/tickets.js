import { shuffleArray } from "../../Libs/helper";

export default function Account_Tickets(server,apiPrefix){
    server.get(`${apiPrefix}/tickets`, (schema, {requestBody }) => {
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
      
      
          return {message: "ok", data: shuffleArray(data)}
    })
    server.get(`${apiPrefix}/tickets/:id`, (schema, {requestBody }) => {
        const data = {
          id: "123",
          info: {
            requester: "فرهاد باقری",
            department: "پشتیبانی محصول",
            sentDate: "۱۴۰۳/۱۲/۰۷ (۱۷:۱۵)",
            lastUpdate: "۱ هفته پیش",
            title: "حل مشکل محصول",
            status: "open",
            priority: "متوسط"
          },
          messages: [
            {
              sender: "ادمین پشتیبانی",
              date: "(16:59) 1403/4/23",
              body: "سلام ، جزئیات را ارسال کنید",
              you: false
            },
            {
              sender: "فرهاد باقری",
              date: "(16:59) 1403/4/23",
              body: "سلام من یک مشکل در ارسال محصول دارم",
              you: true
            },
          ]
        }
          return {message: "ok", data}
    })
    server.post(`${apiPrefix}/tickets/send`, (schema,{requestBody}) => {
      return {message: "ok"}
    })
}