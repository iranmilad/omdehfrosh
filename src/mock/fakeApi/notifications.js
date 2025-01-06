import Product1 from "../../assets/products/1.webp";


export default function Account_Notifications(server,apiPrefix){
    server.get(`${apiPrefix}/notifications`, (schema, {requestBody }) => {
        const data = [
            {
                type: "product",
                title: "محصول مورد نظر شما به فروشگاه اضافه گردید",
                subtitle: "گوشی موبایل اپل مدل iPhone 13 Pro ZAA دو سیم‌ کارت ظرفیت 512 گیگابایت و رم 6 گیگابایت - نات اکتیو ریفربیش پارت",
                image: Product1,
                slug: "13pro_zaa_notactgive_512",
                date: "(16:59) 1403/12/12",
            },
            {
                type: "notification",
                title: "تخفیف 50 درصدی به مناسبت شب یلدا - کد تخفیف : YALDA50",
                subtitle: "تمام کالا هایی که لیست شده اند را  با 50 درصد تخفیف تهیه کنید",
                date: "(16:59) 1403/12/12",
                link: "https://digikala.com"
            }
        ]
          return {message: "ok", data}
    })
}