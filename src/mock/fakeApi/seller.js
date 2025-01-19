/**
 * تکمیل شده
 */
// @ts-ignore
import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول
// @ts-ignore
import Seller from "../../assets/seller.jpg"; // ایمپورت تصویر فروشنده
// @ts-ignore
import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
// @ts-ignore
import { archive } from "../data/products"; // ایمپورت داده‌های محصولات

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  title: string;
  key: string;
  options: Array<FilterOption>;
}

interface SellerProducts {
  price_min: number;
  price_max: number;
  dynamic: Array<Filter>; // مقادیر فیلتر مثل رنگ ، سایز ، جنس
  limit: number;
  page: number;
  sort: string;
  s: string; // جستجو
}

interface SellerComments{
  limit: number | string,
  page: number | string
}


export default function Compare(server:any, apiPrefix: string) {

  // ای‌پی‌آی برای دریافت اطلاعات فروشنده (GET)
  server.get(`${apiPrefix}/seller/:id`, () => {
    const data = {
      name: "دیجیکالا", // نام فروشنده
      province: "تهران", // استان فروشنده
      rating: 4.2, // امتیاز فروشنده
      userComments: 250, // تعداد نظرات کاربران
      image: Seller, // تصویر فروشنده
      others: [ // سایر اطلاعات فروشنده
        {
          label: "محل ارسال",
          value: "شیراز"
        },
        {
          label: "زمان تحویل",
          value: "۲ تا ۴ روز کاری"
        },
        {
          label: "گارانتی",
          value: "۱۸ ماهه"
        },
        {
          label: "روش‌های پرداخت",
          value: "نقدی"
        },
        {
          label: "خدمات پس از فروش",
          value: "دارد"
        },
        {
          label: "امکان بازگشت کالا",
          value: "تا ۷ روز"
        }
      ]
    };
    return { message: "ok", data }; // برگرداندن اطلاعات فروشنده
  });

  // ای‌پی‌آی برای دریافت محصولات فروشنده (POST)
  server.post(`${apiPrefix}/seller/:id/products`, (schema:any, { requestBody }: {requestBody: SellerProducts}) => {
    let data = archive; // استفاده از لیست محصولات

    data.products = shuffleArray(data.products); // تصادفی‌سازی لیست محصولات
    
    return { message: "ok", data }; // برگرداندن لیست محصولات
  });

// ای‌پی‌آی برای دریافت نظرات کاربران درباره فروشنده (GET)
  server.get(`${apiPrefix}/seller/:id/comments`, (schema: any, { requestBody } : {requestBody: SellerComments}) => {
    const commentTexts = [ // لیست متن‌های نمونه برای نظرات
      "محصول عالی بود، کاملاً راضی هستم!",
      "کیفیت ساخت بسیار بالا، من خیلی خوشحالم که این رو خریدم.",
      "مورد پسند من نبود، متاسفانه برای من مناسب نبود.",
      "ارسال سریع بود و بسته بندی خوبی داشت.",
      "انتظارم از محصول بیشتر بود، اما در کل خوب بود.",
      "دقیقاً همون چیزی که نیاز داشتم.",
      "کاملاً برام مفید بود و راضی هستم.",
      "متاسفانه کالا با تصویر متفاوت بود.",
      "محصول خیلی باکیفیتی بود، حتماً دوباره میخرم.",
      "همه چیز عالی بود به جز کمی تاخیر در ارسال.",
      "قیمت مناسب و کیفیت خوب، توصیه می‌کنم.",
      "خریدم و هیچ مشکلی نداشتم، خیلی خوب بود.",
      "اصلاً فکر نمی‌کردم اینقدر راضی باشم.",
      "کاملاً با توضیحات مطابقت داشت.",
      "برای استفاده روزمره عالیه، ارزش خرید داره."
    ];
    
    let data = {
      rating: "3", // میانگین امتیاز نظرات
      count: 20, // تعداد نظرات نمایش داده شده
      total: 200, // کل نظرات
      comments: [
        {
          name: "فرهاد باقری", // نام کاربر
          date: "15 آبان 1403", // تاریخ نظر
          rating: "4", // امتیاز کاربر
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)], // متن نظر (تصادفی)
          status: "agreed", // وضعیت نظر (موافق/مخالف)
          product: { // اطلاعات محصول مرتبط با نظر
            image: Product1,
            title: "آیفون 16 نرمال"
          }
        },
        // سایر نظرات به همین شکل اضافه می‌شوند
        {
          name: "فرهاد باقری",
          date: "15 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "سامسونگ S24 Ultra 256"
          }
        },
        {
          name: "سارا احمدی",
          date: "16 آبان 1403",
          rating: "5",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "پیکسل 9"
          }
        },
        {
          name: "سینا توکلی",
          date: "17 آبان 1403",
          rating: "3",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "شیائومی می 13"
          }
        },
        {
          name: "لیلا حسینی",
          date: "18 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "گوشی سامسونگ A54"
          }
        },
        {
          name: "محمود رضایی",
          date: "19 آبان 1403",
          rating: "5",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "هوآوی پی 50 پرو"
          }
        },
        {
          name: "آیدا شاهی",
          date: "20 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "اپل واچ 8"
          }
        },
        {
          name: "آرش زمانی",
          date: "21 آبان 1403",
          rating: "5",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "لپ‌تاپ لنوو مدل Y700"
          }
        },
        {
          name: "زهره موسوی",
          date: "22 آبان 1403",
          rating: "2",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "disagreed",
          product: {
            image: Product1,
            title: "لپ‌تاپ ایسوس X512"
          }
        },
        {
          name: "محمد جعفری",
          date: "23 آبان 1403",
          rating: "3",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "کنسول بازی پلی استیشن 5"
          }
        },
        {
          name: "مهسا فرامرزی",
          date: "24 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "تلویزیون سامسونگ 65 اینچ"
          }
        },
        {
          name: "رضا اکبری",
          date: "25 آبان 1403",
          rating: "5",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "دوربین کانن EOS R"
          }
        },
        {
          name: "فاطمه نظری",
          date: "26 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "یخچال ساید بای ساید ال جی"
          }
        },
        {
          name: "امیر حسین غفوری",
          date: "27 آبان 1403",
          rating: "3",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "disagreed",
          product: {
            image: Product1,
            title: "ماشین لباسشویی بوش"
          }
        }
      ]
    };
    return { message: "ok", data }; // برگرداندن نظرات
  });
  
}
