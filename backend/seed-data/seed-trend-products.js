/**
 * Seed 3 TrendProductGroup sections: جاروبرقی, گوشی موبایل, لپ تاپ
 * Run from backend folder: node seed-data/seed-trend-products.js
 */
import mongoose from 'mongoose';
import TrendProductGroup from '../models/TrendProduct.js';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/j2b';

// Product image for trend products
const PRODUCT_IMAGE = 'https://dkstatics-public.digikala.com/digikala-products/0f61dcb2e75bf3ca4b8dae0f26885b8fc07d2d9b_1741518984.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90';

const TREND_PRODUCTS_SECTIONS = [
  {
    title: 'جاروبرقی',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'vacuum-dyson-v15', title: 'جاروبرقی دایسون V15', regularPrice: 25000000, discountedPrice: 21900000, discountPercent: '۱۲٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-samsung-jet', title: 'جاروبرقی سامسونگ جت', regularPrice: 18500000, discountedPrice: 16500000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-lg-cordzero', title: 'جاروبرقی الجی کوردزرو', regularPrice: 12000000, discountedPrice: 10900000, discountPercent: '۹٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-philips-3000', title: 'جاروبرقی فیلیپس 3000', regularPrice: 9500000, discountedPrice: 8900000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-panasonic-mc', title: 'جاروبرقی پاناسونیک', regularPrice: 7800000, discountedPrice: 7200000, discountPercent: '۸٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-rowenta-ro', title: 'جاروبرقی روونتا', regularPrice: 6500000, discountedPrice: 5900000, discountPercent: '۹٪' },
        { image: PRODUCT_IMAGE, url: 'vacuum-bosch-pro', title: 'جاروبرقی بوش پرو', regularPrice: 15500000 },
        { image: PRODUCT_IMAGE, url: 'vacuum-miele-c3', title: 'جاروبرقی میله C3', regularPrice: 32000000, discountedPrice: 28900000, discountPercent: '۱۰٪' },
      ],
    ],
  },
  {
    title: 'گوشی موبایل',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'phone-iphone-15', title: 'آیفون ۱۵ پرو', regularPrice: 75000000, discountedPrice: 69900000, discountPercent: '۷٪' },
        { image: PRODUCT_IMAGE, url: 'phone-samsung-s24', title: 'گوشی سامسونگ S24', regularPrice: 42000000, discountedPrice: 38900000, discountPercent: '۷٪' },
        { image: PRODUCT_IMAGE, url: 'phone-xiaomi-14', title: 'گوشی شیائومی ۱۴', regularPrice: 28000000, discountedPrice: 24900000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'phone-pixel-8', title: 'گوشی گوگل پیکسل ۸', regularPrice: 35000000, discountedPrice: 31900000, discountPercent: '۹٪' },
        { image: PRODUCT_IMAGE, url: 'phone-oneplus-12', title: 'گوشی وان پلاس ۱۲', regularPrice: 32000000, discountedPrice: 29500000, discountPercent: '۸٪' },
        { image: PRODUCT_IMAGE, url: 'phone-honor-magic', title: 'گوشی آنر مجیک', regularPrice: 22000000, discountedPrice: 19900000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'phone-oppo-find', title: 'گوشی اوپو فایند', regularPrice: 45000000 },
        { image: PRODUCT_IMAGE, url: 'phone-realme-gt', title: 'گوشی رلمی جی‌تی', regularPrice: 15000000, discountedPrice: 13900000, discountPercent: '۷٪' },
      ],
    ],
  },
  {
    title: 'لپ تاپ',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'laptop-macbook-pro', title: 'مک‌بوک پرو M3', regularPrice: 125000000, discountedPrice: 118000000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-asus-zenbook', title: 'لپ‌تاپ ایسوس زنبوک', regularPrice: 55000000, discountedPrice: 49900000, discountPercent: '۹٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-lenovo-thinkpad', title: 'لپ‌تاپ لنوو تینک‌پد', regularPrice: 48000000, discountedPrice: 44900000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-dell-xps', title: 'لپ‌تاپ دل ایکس‌پی‌اس', regularPrice: 72000000, discountedPrice: 66900000, discountPercent: '۷٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-hp-spectre', title: 'لپ‌تاپ اچ‌پی اسپکتر', regularPrice: 68000000 },
        { image: PRODUCT_IMAGE, url: 'laptop-msi-gaming', title: 'لپ‌تاپ ام‌اس‌آی گیمینگ', regularPrice: 52000000, discountedPrice: 47900000, discountPercent: '۸٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-acer-swift', title: 'لپ‌تاپ ایسر سوئیفت', regularPrice: 28000000, discountedPrice: 24900000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'laptop-microsoft-surface', title: 'لپ‌تاپ مایکروسافت سرفیس', regularPrice: 89000000, discountedPrice: 82900000, discountPercent: '۷٪' },
      ],
    ],
  },
];

const seedTrendProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove unique constraint issue: url is in subdoc, we use different slugs per section
    await TrendProductGroup.deleteMany({});
    console.log('   - Cleared existing TrendProductGroup documents');

    for (let i = 0; i < TREND_PRODUCTS_SECTIONS.length; i++) {
      const section = TREND_PRODUCTS_SECTIONS[i];
      await TrendProductGroup.create({
        title: section.title,
        products: section.products,
      });
      console.log(`   - Created trendProducts${i + 1}: "${section.title}" with ${section.products.flat().length} products`);
    }

    const count = await TrendProductGroup.countDocuments({});
    console.log('✅ Seed completed. Total TrendProductGroup sections:', count);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedTrendProducts();
