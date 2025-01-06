import Product1 from "../../assets/products/1.webp";
import Product6 from "../../assets/products/6.webp";
import Seller from "../../assets/seller.jpg"
import { shuffleArray } from "../../Libs/helper";
import { archive } from "../data/products";

export default function Compare(server, apiPrefix) {


  server.get(`${apiPrefix}/seller/:id`, (schema, {requestBody }) => {
    const data = {
      name: "دیجیکالا",
      province: "تهران",
      rating: 4.2,
      userComments: 250,
      image: Seller,
    }
    return {message: "ok", data}
})

  server.get(`${apiPrefix}/seller/:id/products`, (schema, { requestBody }) => {
    let data = archive;

    data.products = shuffleArray(data.products);
    
    return { message: "ok", data };
  });
  server.get(`${apiPrefix}/seller/:id/comments`, (schema, { requestBody }) => {
    const commentTexts = [
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
      rating: "3",
      count: 20,
      total: 200,
      comments: [
        {
          name: "فرهاد باقری",
          date: "15 آبان 1403",
          rating: "4",
          comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          status: "agreed",
          product: {
            image: Product1,
            title: "آیفون 16 نرمال"
          }
        },
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
    return { message: "ok", data };
  });
  
}
