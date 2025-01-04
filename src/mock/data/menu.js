export const menuItems = {
  category: [
    {
      id: "1",
      label: "موبایل",
      url: "/category/mobile",
      links: [
        {
          title: "تجهیزات شبکه",
          path: "/category/network",
          children: [
            { title: "کابل", path: "/category/network/cable" },
            { title: "مودم", path: "/category/network/modem" },
          ],
        },
      ],
    },
    {
      id: "2",
      label: "لپ‌تاپ",
      url: "/category/laptop",
      links: [
        {
          title: "لوازم جانبی",
          path: "/category/laptop/accessories",
          children: [
            { title: "کیبورد", path: "/category/laptop/accessories/keyboard" },
            { title: "ماوس", path: "/category/laptop/accessories/mouse" },
          ],
        },
        {
          title: "برندها",
          path: "/category/laptop/brands",
          children: [
            { title: "ایسر", path: "/category/laptop/brands/acer" },
            { title: "دل", path: "/category/laptop/brands/dell" },
          ],
        },
      ],
    },
    {
      id: "3",
      label: "تلویزیون",
      url: "/category/tv",
      links: [
        {
          title: "تلویزیون‌های هوشمند",
          path: "/category/tv/smart",
          children: [
            { title: "سامسونگ", path: "/category/tv/smart/samsung" },
            { title: "ال‌جی", path: "/category/tv/smart/lg" },
          ],
        },
        {
          title: "لوازم جانبی",
          path: "/category/tv/accessories",
          children: [
            { title: "ریموت کنترل", path: "/category/tv/accessories/remote" },
            { title: "براکت", path: "/category/tv/accessories/bracket" },
          ],
        },
      ],
    },
    {
      id: "4",
      label: "لوازم خانگی",
      url: "/category/house",
      links: [
        {
          title: "یخچال",
          path: "/category/home/fridge",
          children: [
            { title: "دو قلو", path: "/category/home/fridge/twin" },
            { title: "فریزر", path: "/category/home/fridge/freezer" },
          ],
        },
        {
          title: "لباسشویی",
          path: "/category/home/washer",
          children: [
            { title: "اتوماتیک", path: "/category/home/washer/automatic" },
            {
              title: "نیمه اتوماتیک",
              path: "/category/home/washer/semi-automatic",
            },
          ],
        },
      ],
    },
    {
      id: "5",
      label: "دوربین",
      url: "/category/camera",
      links: [
        {
          title: "دوربین عکاسی",
          path: "/category/camera/photo",
          children: [
            { title: "حرفه‌ای", path: "/category/camera/photo/professional" },
            { title: "خانگی", path: "/category/camera/photo/home" },
          ],
        },
        {
          title: "دوربین مداربسته",
          path: "/category/camera/security",
          children: [
            { title: "آنالوگ", path: "/category/camera/security/analog" },
            { title: "دیجیتال", path: "/category/camera/security/digital" },
          ],
        },
      ],
    },
  ],
  other: [
    {
        id: "1",
        label: "وبلاگ",
        path: "/category/mobile",
    },
    {
        id: "2",
        label: "تخفیفات ویژه",
        path: "/page/123",
    },
    {
        id: "2",
        label: "سایر",
        children: [
            {
                id: "3",
                title: "خرید اقساطی",
                path: "https://digikala.com",
            },
            {
                id: "3",
                title: "تماس باما",
                path: "https://digikala.com",
            },
            {
                id: "3",
                title: "سوالات متداول",
                path: "https://digikala.com",
            },
            {
                id: "3",
                title: "درباره ما",
                path: "https://digikala.com",
            },
        ]
    }
  ],
  footer: [
    {
      label: "درباره ما",
      children: [
        { label: "درباره شرکت", path: "/about-us" },
        { label: "تیم ما", path: "/our-team" },
        { label: "مأموریت و ارزش‌ها", path: "/mission-values" },
        { label: "افتخارات", path: "/awards" },
      ],
    },
    {
      label: "خدمات مشتریان",
      children: [
        { label: "پرسش‌های متداول", path: "/faq" },
        { label: "تماس با ما", path: "/contact-us" },
        { label: "شرایط و ضوابط", path: "/terms-conditions" },
        { label: "حریم خصوصی", path: "/privacy-policy" },
      ],
    },
    {
      label: "منابع",
      children: [
        { label: "وبلاگ", path: "/blog" },
        { label: "راهنمای خرید", path: "/buying-guide" },
        { label: "آموزش‌های آنلاین", path: "/online-tutorials" },
        { label: "رویدادها", path: "/events" },
      ],
    },
    {
      label: "شبکه‌های اجتماعی و ارتباطات",
      children: [
        { label: "ما را دنبال کنید", path: "/social-media" },
        { label: "خبرنامه ایمیلی", path: "/newsletter" },
        { label: "اپلیکیشن ما", path: "/app" },
        { label: "لینکدین شرکت", path: "/linkedin" },
      ],
    },
  ]  
};
