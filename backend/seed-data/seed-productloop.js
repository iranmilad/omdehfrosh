/**
 * Seed 3 ProductLoopGroup sections (productloop1, productloop2, productloop3) - like trendProducts
 * Run from backend folder: node seed-data/seed-productloop.js
 */
import mongoose from 'mongoose';
import ProductLoopGroup from '../models/ProductLoop.js';
import dotenv from 'dotenv';

dotenv.config();
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/j2b';

const PRODUCT_IMAGE = 'https://dkstatics-public.digikala.com/digikala-products/0f61dcb2e75bf3ca4b8dae0f26885b8fc07d2d9b_1741518984.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/format,webp/quality,q_90';

const PRODUCTLOOP_SECTIONS = [
  {
    title: 'محصولات منتخب',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'loop-featured-1', title: 'محصول منتخب ۱', regularPrice: 12000000, discountedPrice: 10900000, discountPercent: '۹٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-2', title: 'محصول منتخب ۲', regularPrice: 8500000, discountedPrice: 7900000, discountPercent: '۷٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-3', title: 'محصول منتخب ۳', regularPrice: 15000000, discountedPrice: 13500000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-4', title: 'محصول منتخب ۴', regularPrice: 6200000, discountedPrice: 5800000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-5', title: 'محصول منتخب ۵', regularPrice: 9800000 },
        { image: PRODUCT_IMAGE, url: 'loop-featured-6', title: 'محصول منتخب ۶', regularPrice: 11000000, discountedPrice: 9900000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-7', title: 'محصول منتخب ۷', regularPrice: 7400000, discountedPrice: 6990000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'loop-featured-8', title: 'محصول منتخب ۸', regularPrice: 13200000, discountedPrice: 11900000, discountPercent: '۱۰٪' },
      ],
    ],
  },
  {
    title: 'پیشنهاد ویژه',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'loop-special-1', title: 'پیشنهاد ویژه ۱', regularPrice: 22000000, discountedPrice: 19900000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-2', title: 'پیشنهاد ویژه ۲', regularPrice: 18500000, discountedPrice: 16500000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-3', title: 'پیشنهاد ویژه ۳', regularPrice: 9500000, discountedPrice: 8900000, discountPercent: '۶٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-4', title: 'پیشنهاد ویژه ۴', regularPrice: 32000000, discountedPrice: 28900000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-5', title: 'پیشنهاد ویژه ۵', regularPrice: 14000000 },
        { image: PRODUCT_IMAGE, url: 'loop-special-6', title: 'پیشنهاد ویژه ۶', regularPrice: 7600000, discountedPrice: 6990000, discountPercent: '۸٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-7', title: 'پیشنهاد ویژه ۷', regularPrice: 41000000, discountedPrice: 36900000, discountPercent: '۱۰٪' },
        { image: PRODUCT_IMAGE, url: 'loop-special-8', title: 'پیشنهاد ویژه ۸', regularPrice: 16800000, discountedPrice: 14900000, discountPercent: '۱۱٪' },
      ],
    ],
  },
  {
    title: 'پرفروش‌های هفته',
    products: [
      [
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-1', title: 'پرفروش ۱', regularPrice: 12500000, discountedPrice: 10900000, discountPercent: '۱۳٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-2', title: 'پرفروش ۲', regularPrice: 8900000, discountedPrice: 7900000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-3', title: 'پرفروش ۳', regularPrice: 17500000, discountedPrice: 15500000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-4', title: 'پرفروش ۴', regularPrice: 5400000, discountedPrice: 4800000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-5', title: 'پرفروش ۵', regularPrice: 19800000 },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-6', title: 'پرفروش ۶', regularPrice: 11200000, discountedPrice: 9900000, discountPercent: '۱۲٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-7', title: 'پرفروش ۷', regularPrice: 6400000, discountedPrice: 5690000, discountPercent: '۱۱٪' },
        { image: PRODUCT_IMAGE, url: 'loop-bestseller-8', title: 'پرفروش ۸', regularPrice: 14200000, discountedPrice: 12500000, discountPercent: '۱۲٪' },
      ],
    ],
  },
];

const seedProductLoop = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await ProductLoopGroup.deleteMany({});
    console.log('   - Cleared existing ProductLoopGroup documents');

    for (let i = 0; i < PRODUCTLOOP_SECTIONS.length; i++) {
      const section = PRODUCTLOOP_SECTIONS[i];
      await ProductLoopGroup.create({
        title: section.title,
        products: section.products,
      });
      console.log(`   - Created productloop${i + 1}: "${section.title}" with ${section.products.flat().length} products`);
    }

    const count = await ProductLoopGroup.countDocuments({});
    console.log('✅ Seed completed. Total ProductLoopGroup sections:', count);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedProductLoop();
