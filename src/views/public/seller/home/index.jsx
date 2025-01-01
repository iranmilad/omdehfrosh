import { Paper } from '@mantine/core';
import React from 'react'

const text = `<h1>درباره ما</h1> <center><img src="https://www.digikala.com/brand/full-horizontal.svg" alt="لوگوی شرکت"></center> <p> شرکت <strong>فناوران آریا</strong> یکی از پیشروترین واردکنندگان محصولات کامپیوتری در ایران است. ما با بیش از یک دهه تجربه در زمینه تأمین انواع تجهیزات سخت‌افزاری، نرم‌افزاری و لوازم جانبی کامپیوتر، در تلاش هستیم تا جدیدترین و پیشرفته‌ترین محصولات را به مشتریان خود ارائه دهیم. </p> <h2>مأموریت ما</h2> <p>مأموریت ما ارائه راه‌حل‌های هوشمندانه، تجهیزات با کیفیت و پشتیبانی قوی به کاربران و سازمان‌ها است. ما به اصول زیر پایبند هستیم:</p> <ul> <li><strong>کیفیت بالا:</strong> تضمین اصالت و کیفیت محصولات.</li> <li><strong>قیمت مناسب:</strong> ارائه بهترین قیمت‌ها در بازار.</li> <li><strong>پشتیبانی مشتریان:</strong> خدمات پس از فروش سریع و قابل‌اعتماد.</li> </ul> <h2>محصولات ما</h2> <ul> <li>لپ‌تاپ و کامپیوترهای شخصی</li> <li>قطعات سخت‌افزاری (مانند کارت گرافیک، مادربرد، پردازنده)</li> <li>تجهیزات شبکه و سرورها</li> <li>لوازم جانبی کامپیوتر (مانند موس، کیبورد و مانیتور)</li> </ul> <center><img src="https://www.digikala.com/mag/wp-content/uploads/2020/09/digikala-29.jpg" alt="محصولات کامپیوتری"></center> <h2>چرا ما را انتخاب کنید؟</h2> <ul> <li><strong>تضمین اصالت کالا:</strong> تمامی محصولات با گارانتی معتبر عرضه می‌شوند.</li> <li><strong>ارسال سریع:</strong> ارسال به تمام نقاط کشور در کوتاه‌ترین زمان ممکن.</li> <li><strong>پشتیبانی حرفه‌ای:</strong> تیم متخصص ما آماده پاسخگویی به نیازهای شماست.</li> </ul> <p> ما در <strong>فناوران آریا</strong> افتخار می‌کنیم که شریک مطمئن شما در دنیای فناوری باشیم. </p>`;

function Seller_Home() {
  return (
    <Paper p="xl">
      <article className='prose-sm' dangerouslySetInnerHTML={{__html: text}} />
    </Paper>
  )
}

export default Seller_Home