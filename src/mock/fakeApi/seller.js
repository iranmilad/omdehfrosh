import Product1 from "../../assets/products/1.webp";
import Product6 from "../../assets/products/6.webp";
import Seller from "../../assets/seller.jpg"

function shuffleArray(array) {
  const shuffledArray = [...array]; // Create a copy to avoid modifying the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
}


export default function Compare(server, apiPrefix) {


  server.get(`${apiPrefix}/seller/:id`, (schema, {requestBody }) => {
    const data = {
      name: "دیجیکالا",
      province: "تهران",
      rating: 4.2,
      userComments: 250,
      image: Seller,
    }
    return {message: "ok", data:undefined}
})

  server.get(`${apiPrefix}/seller/:id/products`, (schema, { requestBody }) => {
    let data = {
      totalPages: 20,
      price: {min: 0,max: 15000000},
      products: [
        {
          id: 123,
          title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
          slug: "123",
          regularPrice: 21000000,
          image: `https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
        {
          id: 124,
          title: "گوشی موبایل سامسونگ مدل گلکسی A54 دو سیم‌ کارت",
          slug: "124",
          regularPrice: 15000000,
          discountedPrice: 10500000,
          discountPercent: "30",
          image: `https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
        {
          id: 125,
          title: "ساعت هوشمند اپل سری 8 مدل GPS",
          slug: "125",
          regularPrice: 20000000,
          discountedPrice: 18000000,
          discountPercent: "10",
          image: `https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
        {
          id: 126,
          title: "تلویزیون هوشمند ال جی مدل OLED55C1GI",
          slug: "126",
          regularPrice: 40000000,
          discountedPrice: 36000000,
          discountPercent: "10",
          image: `https://dkstatics-public.digikala.com/digikala-products/3cca1d5f59bfe07ba8d27a8c8c60ef1956ff2291_1734332212.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
        {
          id: 127,
          title: "لپ تاپ ایسوس مدل TUF Dash F15",
          slug: "127",
          regularPrice: 50000000,
          discountedPrice: 45000000,
          discountPercent: "10",
          image: `https://dkstatics-public.digikala.com/digikala-products/2abc557175aac1753bfbe11bed27ebb55ab4633a_1724603081.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
        {
          id: 128,
          title: "هدفون بی سیم بیتس مدل Studio 3 – The Beats Skyline Collection",
          slug: "128",
          regularPrice: 8000000,
          discountedPrice: 6400000,
          discountPercent: "20",
          image: `https://dkstatics-public.digikala.com/digikala-products/4528651.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
        },
      ],
      filters: [
        {
          title: "برندها",
          key: "brands",
          options: [
            { label: "اپل", value: "apple" },
            { label: "سامسونگ", value: "samsung" },
            { label: "ایسوس", value: "asus" },
            { label: "بیتس", value: "beats" },
            { label: "ال جی", value: "lg" },
          ],
        },
        {
          title: "رنگ‌ها",
          key: "colors",
          options: [
            { label: "قرمز", value: "red" },
            { label: "آبی", value: "blue" },
            { label: "سبز", value: "green" },
            { label: "مشکی", value: "black" },
            { label: "سفید", value: "white" },
          ],
        },
        {
          title: "محدوده ارسال",
          key: "delivery_areas",
          options: [
            { label: "تهران", value: "tehran" },
            { label: "کرج", value: "karaj" },
            { label: "فارس", value: "fars" },
          ],
        },
      ],
    };

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
