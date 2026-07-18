/**
 * Seed multiple homepage section instances (wideslider x3, banners x4, brands x2, etc.)
 * Run from backend folder: node seed-data/seed-homepage-sections.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import HomePageSection from "../models/HomePageSection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const MONGODB_URI =
  process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/j2b";

const SLIDE_IMAGE =
  "https://dkstatics-public.digikala.com/digikala-products/0f61dcb2e75bf3ca4b8dae0f26885b8fc07d2d9b_1741518984.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90";
const BANNER_IMAGE =
  "https://dkstatics-public.digikala.com/digikala-adservice-banners/1000009960.jpg?x-oss-process=image/resize,m_lfit,h_300,w_300/format,webp/quality,q_90";
const BRAND_IMAGE =
  "https://dkstatics-public.digikala.com/digikala-brands/3360.png?x-oss-process=image/resize,m_lfit,h_160,w_160/format,webp/quality,q_90";

const makeSlide = (id, label) => ({
  url: `/promo/${id}`,
  desktopImage: SLIDE_IMAGE,
  tabletImage: SLIDE_IMAGE,
  mobileImage: SLIDE_IMAGE,
  label,
});

const makeBanner = (id, label) => ({
  image: BANNER_IMAGE,
  url: `/banner/${id}`,
  label,
});

const makeBrand = (id, label) => ({
  image: BRAND_IMAGE,
  url: `/brands/${id}`,
  label,
});

const makePromoProduct = (id, title, regularPrice, discountedPrice, discountPercent) => ({
  id,
  combinationId: Math.floor(Math.random() * 9000) + 1000,
  title,
  slug: id,
  regularPrice,
  discountedPrice,
  discountPercent,
  image: SLIDE_IMAGE,
  seller: { id: 1, label: "دیجیکالا" },
  attributes: [{ name: "سایر", nameEng: "other", value: "-" }],
});

const makeLoopProduct = (id, title, regularPrice, discountedPrice, discountPercent) => ({
  id,
  combinationId: Math.floor(Math.random() * 9000) + 1000,
  title,
  slug: id,
  regularPrice,
  discountedPrice,
  discountPercent,
  image: SLIDE_IMAGE,
  seller: { id: 1, label: "دیجیکالا" },
  attributes: [{ name: "سایر", nameEng: "other", value: "-" }],
});

const makeTrendRow = (prefix, titles) =>
  titles.map((title, index) => ({
    image: SLIDE_IMAGE,
    url: `${prefix}-${index + 1}`,
    title,
    regularPrice: 5000000 + index * 750000,
    discountedPrice: 4500000 + index * 700000,
    discountPercent: "۱۰٪",
  }));

const makeCategory = (url, title) => ({
  image: SLIDE_IMAGE,
  title,
  url,
  display: true,
  subscriptionModel: { modelId: "basic" },
});

const makePriceTable = (id, title, rows) => ({
  id,
  title,
  tablelist: rows.map((row, index) => ({
    product: row,
    price: `${(index + 1) * 1250000}`,
  })),
});

const HOME_PAGE_SECTIONS = [
  {
    type: "wideslider",
    title: "اسلایدر اصلی",
    order: 10,
    data: {
      slides: [
        makeSlide("hero-main-1", "پیشنهاد اصلی ۱"),
        makeSlide("hero-main-2", "پیشنهاد اصلی ۲"),
      ],
    },
  },
  {
    type: "categories",
    title: "دسته‌بندی‌های محبوب",
    order: 20,
    data: {
      items: [
        makeCategory("mobile", "موبایل"),
        makeCategory("laptop", "لپ‌تاپ"),
        makeCategory("tablet", "تبلت"),
        makeCategory("headphone", "هدفون"),
      ],
    },
  },
  {
    type: "featured_promo",
    title: "پیشنهاد شگفت‌انگیز",
    order: 30,
    checkalllink: "/shop/samsung",
    backgroundColor: "linear-gradient(to bottom left, #1e3a5f, #0a1628)",
    data: {
      products: [
        makePromoProduct("promo-a-1", "پیشنهاد ویژه ۱", 12000000, 10900000, "۹٪"),
        makePromoProduct("promo-a-2", "پیشنهاد ویژه ۲", 8500000, 7900000, "۷٪"),
        makePromoProduct("promo-a-3", "پیشنهاد ویژه ۳", 15000000, 13500000, "۱۰٪"),
        makePromoProduct("promo-a-4", "پیشنهاد ویژه ۴", 6200000, 5800000, "۶٪"),
      ],
    },
  },
  {
    type: "banners",
    title: "بنرهای فروش ویژه - ردیف ۱",
    order: 40,
    data: {
      items: [
        makeBanner("sale-row1-1", "بنر ۱"),
        makeBanner("sale-row1-2", "بنر ۲"),
        makeBanner("sale-row1-3", "بنر ۳"),
        makeBanner("sale-row1-4", "بنر ۴"),
      ],
    },
  },
  {
    type: "wideslider",
    title: "اسلایدر میانی",
    order: 50,
    data: {
      slides: [
        makeSlide("hero-mid-1", "میانی ۱"),
        makeSlide("hero-mid-2", "میانی ۲"),
        makeSlide("hero-mid-3", "میانی ۳"),
      ],
    },
  },
  {
    type: "prices",
    title: "لیست قیمت روز - بخش ۱",
    order: 60,
    data: {
      items: [
        makePriceTable("price-1", "قیمت موبایل", ["آیفون ۱۵", "گلکسی S24", "شیائومی ۱۴"]),
        makePriceTable("price-2", "قیمت لپ‌تاپ", ["مک‌بوک", "ایسوس", "لنوو"]),
      ],
    },
  },
  {
    type: "banners",
    title: "بنرهای فروش ویژه - ردیف ۲",
    order: 70,
    data: {
      items: [
        makeBanner("sale-row2-1", "بنر ۱"),
        makeBanner("sale-row2-2", "بنر ۲"),
      ],
    },
  },
  {
    type: "trendProducts",
    title: "جاروبرقی",
    order: 80,
    data: {
      products: [
        makeTrendRow("vacuum", [
          "جاروبرقی دایسون",
          "جاروبرقی سامسونگ",
          "جاروبرقی ال‌جی",
          "جاروبرقی فیلیپس",
        ]),
      ],
    },
  },
  {
    type: "brands",
    title: "محبوب‌ترین برندها - بخش ۱",
    order: 90,
    data: {
      children: [
        makeBrand("samsung", "سامسونگ"),
        makeBrand("apple", "اپل"),
        makeBrand("xiaomi", "شیائومی"),
        makeBrand("sony", "سونی"),
        makeBrand("lg", "ال‌جی"),
        makeBrand("asus", "ایسوس"),
      ],
    },
  },
  {
    type: "productloop",
    title: "محصولات منتخب",
    order: 100,
    data: {
      products: [
        makeLoopProduct("loop-1-1", "منتخب ۱", 12000000, 10900000, "۹٪"),
        makeLoopProduct("loop-1-2", "منتخب ۲", 8500000, 7900000, "۷٪"),
        makeLoopProduct("loop-1-3", "منتخب ۳", 15000000, 13500000, "۱۰٪"),
        makeLoopProduct("loop-1-4", "منتخب ۴", 6200000, 5800000, "۶٪"),
      ],
    },
  },
  {
    type: "wideslider",
    title: "اسلایدر پایانی",
    order: 110,
    data: {
      slides: [makeSlide("hero-bottom-1", "پایانی ۱"), makeSlide("hero-bottom-2", "پایانی ۲")],
    },
  },
  {
    type: "categories",
    title: "دسته‌بندی‌های دیجital",
    order: 120,
    data: {
      items: [
        makeCategory("speaker", "اسپیکر"),
        makeCategory("watch", "ساعت هوشمند"),
        makeCategory("camera", "دوربین"),
        makeCategory("gaming", "گیمینگ"),
      ],
    },
  },
  {
    type: "featured_promo",
    title: "پیشنهادهای امروز",
    order: 130,
    checkalllink: "/incredible-offers",
    backgroundColor: "linear-gradient(to bottom left, #0f5132, #052e1f)",
    data: {
      products: [
        makePromoProduct("promo-b-1", "پیشنهاد امروز ۱", 9800000, 8900000, "۹٪"),
        makePromoProduct("promo-b-2", "پیشنهاد امروز ۲", 7200000, 6500000, "۱۰٪"),
        makePromoProduct("promo-b-3", "پیشنهاد امروز ۳", 5400000, 4900000, "۹٪"),
      ],
    },
  },
  {
    type: "banners",
    title: "بنرهای فروش ویژه - ردیف ۳",
    order: 140,
    data: {
      items: [
        makeBanner("sale-row3-1", "بنر ۱"),
        makeBanner("sale-row3-2", "بنر ۲"),
        makeBanner("sale-row3-3", "بنر ۳"),
      ],
    },
  },
  {
    type: "prices",
    title: "لیست قیمت روز - بخش ۲",
    order: 150,
    data: {
      items: [
        makePriceTable("price-3", "قیمت تبلت", ["آیپد", "گلکسی تب", "لنوو تب"]),
      ],
    },
  },
  {
    type: "banners",
    title: "بنرهای فروش ویژه - ردیف ۴",
    order: 160,
    data: {
      items: [
        makeBanner("sale-row4-1", "بنر ۱"),
        makeBanner("sale-row4-2", "بنر ۲"),
        makeBanner("sale-row4-3", "بنر ۳"),
        makeBanner("sale-row4-4", "بنر ۴"),
      ],
    },
  },
  {
    type: "trendProducts",
    title: "گوشی موبایل",
    order: 170,
    data: {
      products: [
        makeTrendRow("phone", ["آیفون ۱۵", "گلکسی S24", "شیائومی ۱۴", "پیکسل ۸"]),
      ],
    },
  },
  {
    type: "brands",
    title: "محبوب‌ترین برندها - بخش ۲",
    order: 180,
    data: {
      children: [
        makeBrand("dyson", "دایسون"),
        makeBrand("bosch", "بوش"),
        makeBrand("philips", "فیلیپس"),
        makeBrand("lenovo", "لنوو"),
        makeBrand("hp", "اچ‌پی"),
        makeBrand("dell", "دل"),
      ],
    },
  },
  {
    type: "trendProducts",
    title: "لپ‌تاپ",
    order: 190,
    data: {
      products: [
        makeTrendRow("laptop", ["مک‌بوک پرو", "ایسوس زنبوک", "لنوو تینک‌پد", "دل XPS"]),
      ],
    },
  },
  {
    type: "productloop",
    title: "پیشنهاد ویژه",
    order: 200,
    data: {
      products: [
        makeLoopProduct("loop-2-1", "ویژه ۱", 22000000, 19900000, "۱۰٪"),
        makeLoopProduct("loop-2-2", "ویژه ۲", 18500000, 16500000, "۱۱٪"),
        makeLoopProduct("loop-2-3", "ویژه ۳", 9500000, 8900000, "۶٪"),
      ],
    },
  },
  {
    type: "productloop",
    title: "پرفروش‌های هفته",
    order: 210,
    data: {
      products: [
        makeLoopProduct("loop-3-1", "پرفروش ۱", 12500000, 10900000, "۱۳٪"),
        makeLoopProduct("loop-3-2", "پرفروش ۲", 8900000, 7900000, "۱۱٪"),
        makeLoopProduct("loop-3-3", "پرفروش ۳", 17500000, 15500000, "۱۱٪"),
        makeLoopProduct("loop-3-4", "پرفروش ۴", 5400000, 4800000, "۱۱٪"),
      ],
    },
  },
];

const seedHomePageSections = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    await HomePageSection.deleteMany({});
    console.log("   - Cleared existing HomePageSection documents");

    await HomePageSection.insertMany(HOME_PAGE_SECTIONS);
    console.log(`✅ Seed completed. Inserted ${HOME_PAGE_SECTIONS.length} homepage sections.`);

    const counts = HOME_PAGE_SECTIONS.reduce((acc, section) => {
      acc[section.type] = (acc[section.type] || 0) + 1;
      return acc;
    }, {});

    console.log("   Section counts:", counts);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
};

seedHomePageSections();
