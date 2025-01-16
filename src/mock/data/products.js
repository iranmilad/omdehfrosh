export const products = [
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
  ]
  
export const archive = {
  totalPages: 20,
  price: { min: 0, max: 15000000 },
  products,
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

export const trendProducts = [
  [
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "123",
      title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده"
    },
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "345",
      title: "گوشی موبایل سامسونگ مدل گلکسی A54 دو سیم‌ کارت"
    },
    {
      image: `https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
      url: "678",
      title: 'ساعت هوشمند اپل سری 8 مدل GPS'
    },
  ],
  [
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "123",
      title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده"
    },
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "345",
      title: "گوشی موبایل سامسونگ مدل گلکسی A54 دو سیم‌ کارت"
    },
    {
      image: `https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
      url: "678",
      title: 'ساعت هوشمند اپل سری 8 مدل GPS'
    },
  ],
  [
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "123",
      title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده"
    },
    {
      image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
      url: "345",
      title: "گوشی موبایل سامسونگ مدل گلکسی A54 دو سیم‌ کارت"
    },
    {
      image: `https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90`,
      url: "678",
      title: 'ساعت هوشمند اپل سری 8 مدل GPS'
    },
  ],
]

export const productGrid = [
  {
    title: "گوشی موبایل",
    url: "mobile",
    children: [
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
    ]
  },
  {
    title: "گوشی موبایل",
    url: "mobile",
    children: [
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
    ]
  },
  {
    title: "گوشی موبایل",
    url: "mobile",
    children: [
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
    ]
  },
  {
    title: "گوشی موبایل",
    url: "mobile",
    children: [
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/ddeaf714d818733ba1d7077a3682aa8ffebde268_1727162245.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/b0af2ec78668c85506c1edc260b42ff447f019c8_1667201885.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
      {
        image: "https://dkstatics-public.digikala.com/digikala-products/c0e079b958167bd0fdef1f0e12440e7fed29b1bd_1727853611.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90",
        url: "123"
      },
    ]
  },
]