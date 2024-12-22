
export default function Account_Tickets(server,apiPrefix){
    server.get(`${apiPrefix}/tickets`, (schema, {requestBody }) => {
        const rows = [
            {
              id: "1234",
              type: "admin",
              title: "حل مشکل سایت",
              status: "closed",
              update: "1403/12/12",
            },
            {
              id: "5678",
              type: "admin",
              title: "حل مشکل سایت",
              status: "closed",
              update: "1403/12/12",
            },
          ];
          return {message: "ok", data: rows}
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
}