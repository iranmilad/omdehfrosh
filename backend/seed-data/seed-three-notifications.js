/**
 * Seed exactly 3 notification messages in NotificationTable.
 * Run from backend folder: node seed-data/seed-three-notifications.js
 */
import mongoose from 'mongoose';
import NotificationTable from '../models/NotificationsTable.js';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/j2b';

const THREE_MESSAGES = [
  {
    id: 1,
    title: 'خوش آمدید به پیام‌های من',
    description: 'این اولین پیام شماست. با کلیک روی هر پیام می‌توانید جزئیات را ببینید.',
    fullDescription: 'این اولین پیام شماست.\n\nبا کلیک روی هر پیام در لیست، جزئیات کامل و توضیحات بیشتر در پنجره باز می‌شود. پیام‌های خوانده نشده با علامت آبی مشخص می‌شوند.',
    type: 'system',
    priority: 'normal',
    isRead: false,
    userId: null,
    actionUrl: ''
  },
  {
    id: 2,
    title: 'بروزرسانی سامانه',
    description: 'سامانه با امکانات جدید به‌روزرسانی شد.',
    fullDescription: 'سامانه با امکانات جدید به‌روزرسانی شد.\n\nاز این پس می‌توانید پیام‌های خود را در این صفحه مشاهده کنید و با کلیک روی هر پیام آن را به‌عنوان خوانده شده علامت بزنید.',
    type: 'system',
    priority: 'high',
    isRead: false,
    userId: null,
    actionUrl: ''
  },
  {
    id: 3,
    title: 'پشتیبانی در خدمت شما',
    description: 'در صورت نیاز از بخش تیکت‌ها با ما در ارتباط باشید.',
    fullDescription: 'در صورت نیاز از بخش تیکت‌ها با ما در ارتباط باشید.\n\nبرای ارسال تیکت به بخش «پیام‌های من» یا «تیکت‌ها» مراجعه کنید.',
    type: 'support',
    priority: 'normal',
    isRead: false,
    userId: null,
    actionUrl: ''
  }
];

const seedThreeNotifications = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const doc of THREE_MESSAGES) {
      const now = new Date();
      await NotificationTable.updateOne(
        { id: doc.id },
        {
          $set: {
            title: doc.title,
            description: doc.description,
            fullDescription: doc.fullDescription,
            type: doc.type,
            priority: doc.priority,
            isRead: doc.isRead,
            userId: doc.userId,
            actionUrl: doc.actionUrl || undefined,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        { upsert: true }
      );
      console.log(`   - Notification id=${doc.id}: "${doc.title}"`);
    }

    const count = await NotificationTable.countDocuments({});
    console.log('✅ Seed completed. Total notifications in DB:', count);
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedThreeNotifications();
