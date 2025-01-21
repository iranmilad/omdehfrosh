export const menuItems = {
  category: [
    {
      id: "1",
      label: "موبایل",
      url: "/category/mobile",
      children: [
        {
          label: "تجهیزات شبکه",
          url: "/category/network",
          children: [
            { label: "کابل", url: "/category/network/cable" },
            { label: "مودم", url: "/category/network/modem" },
          ],
        },
      ],
    },
    {
      id: "2",
      label: "لپ‌تاپ",
      url: "/category/laptop",
      children: [
        {
          label: "لوازم جانبی",
          url: "/category/laptop/accessories",
          children: [
            { label: "کیبورد", url: "/category/laptop/accessories/keyboard" },
            { label: "ماوس", url: "/category/laptop/accessories/mouse" },
          ],
        },
        {
          label: "برندها",
          url: "/category/laptop/brands",
          children: [
            { label: "ایسر", url: "/category/laptop/brands/acer" },
            { label: "دل", url: "/category/laptop/brands/dell" },
          ],
        },
      ],
    },
    {
      id: "3",
      label: "تلویزیون",
      url: "/category/tv",
      children: [
        {
          label: "تلویزیون‌های هوشمند",
          url: "/category/tv/smart",
          children: [
            { label: "سامسونگ", url: "/category/tv/smart/samsung" },
            { label: "ال‌جی", url: "/category/tv/smart/lg" },
          ],
        },
        {
          label: "لوازم جانبی",
          url: "/category/tv/accessories",
          children: [
            { label: "ریموت کنترل", url: "/category/tv/accessories/remote" },
            { label: "براکت", url: "/category/tv/accessories/bracket" },
          ],
        },
      ],
    },
    {
      id: "4",
      label: "لوازم خانگی",
      url: "/category/house",
      children: [
        {
          label: "یخچال",
          url: "/category/home/fridge",
          children: [
            { label: "دو قلو", url: "/category/home/fridge/twin" },
            { label: "فریزر", url: "/category/home/fridge/freezer" },
          ],
        },
        {
          label: "لباسشویی",
          url: "/category/home/washer",
          children: [
            { label: "اتوماتیک", url: "/category/home/washer/automatic" },
            {
              label: "نیمه اتوماتیک",
              url: "/category/home/washer/semi-automatic",
            },
          ],
        },
      ],
    },
    {
      id: "5",
      label: "دوربین",
      url: "/category/camera",
      children: [
        {
          label: "دوربین عکاسی",
          url: "/category/camera/photo",
          children: [
            { label: "حرفه‌ای", url: "/category/camera/photo/professional" },
            { label: "خانگی", url: "/category/camera/photo/home" },
          ],
        },
        {
          label: "دوربین مداربسته",
          url: "/category/camera/security",
          children: [
            { label: "آنالوگ", url: "/category/camera/security/analog" },
            { label: "دیجیتال", url: "/category/camera/security/digital" },
          ],
        },
      ],
    },
  ],
  other: [
    {
      id: "2",
      label: "فروشگاه",
      url: "/shop",
    },
    {
      id: "1",
      label: "وبلاگ",
      url: "/category/mobile",
    },
    {
      id: "2",
      label: "تخفیفات ویژه",
      url: "/page/123",
    },
    {
      id: "2",
      label: "سایر",
      children: [
        {
          id: "3",
          label: "خرید اقساطی",
          url: "https://digikala.com",
        },
        {
          id: "3",
          label: "تماس باما",
          url: "https://digikala.com",
        },
        {
          id: "3",
          label: "سوالات متداول",
          url: "https://digikala.com",
        },
        {
          id: "3",
          label: "درباره ما",
          url: "https://digikala.com",
        },
      ],
    },
  ],
  footer: [
    {
      label: "درباره ما",
      children: [
        { label: "درباره شرکت", url: "/about-us" },
        { label: "تیم ما", url: "/our-team" },
        { label: "مأموریت و ارزش‌ها", url: "/mission-values" },
        { label: "افتخارات", url: "/awards" },
      ],
    },
    {
      label: "خدمات مشتریان",
      children: [
        { label: "پرسش‌های متداول", url: "/faq" },
        { label: "تماس با ما", url: "/contact-us" },
        { label: "شرایط و ضوابط", url: "/terms-conditions" },
        { label: "حریم خصوصی", url: "/privacy-policy" },
      ],
    },
    {
      label: "منابع",
      children: [
        { label: "وبلاگ", url: "/blog" },
        { label: "راهنمای خرید", url: "/buying-guide" },
        { label: "آموزش‌های آنلاین", url: "/online-tutorials" },
        { label: "رویدادها", url: "/events" },
      ],
    },
    {
      label: "شبکه‌های اجتماعی و ارتباطات",
      children: [
        { label: "ما را دنبال کنید", url: "/social-media" },
        { label: "خبرنامه ایمیلی", url: "/newsletter" },
        { label: "اپلیکیشن ما", url: "/app" },
        { label: "لینکدین شرکت", url: "/linkedin" },
      ],
    },
  ],
  /**
   * تایپ های مجاز
   * instagram,telegram,x,facebook,linkedin,youtube,twitter,pinterest,snapchat,whatsapp
   */
  socialMedia: [
    // لیست شبکه‌های اجتماعی
    {
      link: "https://ig.me/instagram",
      type: "instagram",
    },
    {
      link: "https://t.me/telegram",
      type: "telegram",
    },
    {
      link: "https://x.com/x",
      type: "x",
    },
  ],
};
