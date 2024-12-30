import Product1 from "../../assets/products/1.webp";
import Product6 from "../../assets/products/6.webp";

function shuffleArray(array) {
  const shuffledArray = [...array]; // Create a copy to avoid modifying the original array
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
  }
  return shuffledArray;
}


export default function Compare(server, apiPrefix) {
  server.get(`${apiPrefix}/seller/:id/products`, (schema, { requestBody }) => {
    let data = {
      totalPages: 20,
      price: [0, 20_000_000],
      products: [
        {
          id: 123,
          title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
          slug: "123",
          regularPrice: 21000000,
          discountedPrice: 9120000,
          discountPercent: "40",
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
    let data = {
        rating: "3",
        count: 20,
        total: 200,
        comments: [
          {
            name: "فرهاد باقری",
            date: "15 آبان 1403",
            rating: "4",
            comment: "محصول خوبی بود",
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
            comment: "محصول خوبی بود",
            status: "agreed",
            product: {
                image: Product6,
                title: "سامسونگ S24 Ultra 256"
            }
          },
        ],
      };
    
    return { message: "ok", data };
  });
}
