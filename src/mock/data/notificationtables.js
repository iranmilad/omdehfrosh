// Updated notification table data with user_id field
export const notificationtables = [
  {
    id: 1,
    title: "پیام تخفیف ویژه",
    description: "تخفیف ۵۰ درصدی محصولات منتخب فروشگاه تا پایان ماه",
    imagePath: "/uploads/notifications/discount-icon.png",
    isRead: false,
    userId: 2, // Specific user notification
    createdAt: new Date('2024-08-20T10:00:00Z'),
    updatedAt: new Date('2024-08-20T10:00:00Z')
  },
  {
    id: 2,
    title: "به‌روزرسانی سیستم",
    description: "سیستم با موفقیت به‌روزرسانی شد و قابلیت‌های جدید اضافه گردید",
    imagePath: "/uploads/notifications/system-update-icon.png",
    isRead: false,
    userId: 2, // Global notification (for all users)
    createdAt: new Date('2024-08-21T09:30:00Z'),
    updatedAt: new Date('2024-08-21T09:30:00Z')
  },
  {
    id: 3,
    title: "پیام خوش‌آمدگویی",
    description: "به پنل کاربری خود خوش آمدید. از امکانات جدید استفاده کنید",
    imagePath: "/uploads/notifications/welcome-icon.png",
    isRead: true,
    userId: 2, // Specific user notification
    createdAt: new Date('2024-08-19T14:15:00Z'),
    updatedAt: new Date('2024-08-22T10:30:00Z')
  },
  {
    id: 4,
    title: "هشدار امنیتی",
    description: "ورود جدید از دستگاه ناشناس شناسایی شد. در صورت عدم اطلاع با پشتیبانی تماس بگیرید",
    imagePath: "/uploads/notifications/security-icon.png",
    isRead: false,
    userId: 2, // Specific user notification
    createdAt: new Date('2024-08-22T16:45:00Z'),
    updatedAt: new Date('2024-08-22T16:45:00Z')
  },
  {
    id: 5,
    title: "پیام سفارش",
    description: "سفارش شما با شماره ۱۲۳۴۵ با موفقیت ثبت شد و در حال آماده‌سازی است",
    imagePath: "/uploads/notifications/order-icon.png",
    isRead: false,
    userId: 12345, // Specific user notification
    createdAt: new Date('2024-08-22T11:20:00Z'),
    updatedAt: new Date('2024-08-22T11:20:00Z')
  },
  {
    id: 6,
    title: "اطلاع رسانی جدید",
    description: "ویژگی‌های جدید به پنل اضافه شده است. آن‌ها را امتحان کنید",
    imagePath: "/uploads/notifications/feature-icon.png",
    isRead: true,
    userId: null, // Global notification (for all users)
    createdAt: new Date('2024-08-18T08:00:00Z'),
    updatedAt: new Date('2024-08-20T12:00:00Z')
  },
  {
    id: 7,
    title: "پیام پشتیبانی",
    description: "پاسخ تیکت شماره ۷۸۹ آماده است. لطفاً بررسی کنید",
    imagePath: "/uploads/notifications/support-icon.png",
    isRead: false,
    userId: 67890, // Different user notification
    createdAt: new Date('2024-08-21T13:30:00Z'),
    updatedAt: new Date('2024-08-21T13:30:00Z')
  },
  {
    id: 8,
    title: "اطلاع رسانی حساب",
    description: "اطلاعات حساب کاربری شما به‌روزرسانی شد",
    imagePath: "/uploads/notifications/account-icon.png",
    isRead: true,
    userId: 12345, // Specific user notification
    createdAt: new Date('2024-08-20T15:45:00Z'),
    updatedAt: new Date('2024-08-21T09:15:00Z')
  },
  {
    id: 9,
    title: "پیام تبریک",
    description: "تبریک! شما به سطح طلایی ارتقا یافتید و از مزایای ویژه بهره‌مند می‌شوید",
    imagePath: "/uploads/notifications/achievement-icon.png",
    isRead: false,
    userId: 12345, // Specific user notification
    createdAt: new Date('2024-08-22T17:00:00Z'),
    updatedAt: new Date('2024-08-22T17:00:00Z')
  },
  {
    id: 10,
    title: "یادآوری پرداخت",
    description: "موعد پرداخت اشتراک شما نزدیک است. لطفاً حساب خود را شارژ کنید",
    imagePath: "/uploads/notifications/payment-icon.png",
    isRead: false,
    userId: 12345, // Specific user notification
    createdAt: new Date('2024-08-22T18:30:00Z'),
    updatedAt: new Date('2024-08-22T18:30:00Z')
  }
];

// Additional sample notifications for different users
export const additionalNotifications = [
  {
    id: 11,
    title: "پیام تایید ایمیل",
    description: "ایمیل شما با موفقیت تایید شد. اکنون می‌توانید از تمام امکانات استفاده کنید",
    imagePath: "/uploads/notifications/email-verified-icon.png",
    isRead: false,
    userId: 67890,
    createdAt: new Date('2024-08-22T19:00:00Z'),
    updatedAt: new Date('2024-08-22T19:00:00Z')
  },
  {
    id: 12,
    title: "اطلاعیه تعطیلات",
    description: "به اطلاع می‌رساند که در روزهای تعطیل پشتیبانی در دسترس نخواهد بود",
    imagePath: "/uploads/notifications/holiday-icon.png",
    isRead: false,
    userId: null, // Global notification
    createdAt: new Date('2024-08-22T20:00:00Z'),
    updatedAt: new Date('2024-08-22T20:00:00Z')
  }
];