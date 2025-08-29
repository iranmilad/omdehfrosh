export const brandsData = {
  apple: {
    id: 1,
    name: "اپل",
    slug: "apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    tagline: "Think Different",
    description: `
      <p>اپل شرکت آمریکایی است که در زمینه طراحی، توسعه و فروش محصولات الکترونیکی مصرفی، نرم‌افزارهای کامپیوتری و خدمات آنلاین فعالیت می‌کند.</p>
      
      <p>این شرکت در سال ۱۹۷۶ توسط استیو جابز، استیو وزنیاک و رونالد وین تأسیس شد و امروزه یکی از بزرگترین شرکت‌های فناوری جهان محسوب می‌شود.</p>
      
      <p>محصولات اپل شامل آیفون، آیپد، مک، اپل واچ، ایرپاد و خدمات مختلفی مانند آیتونز، اپ استور و آیکلود می‌باشد.</p>
    `,
    established_year: 1976,
    origin_country: "آمریکا",
    headquarters: "کوپرتینو، کالیفرنیا",
    features: [
      "طراحی منحصر به فرد و مدرن",
      "اکوسیستم یکپارچه محصولات",
      "امنیت و حریم شخصی بالا",
      "کیفیت ساخت پریمیوم",
      "نوآوری مداوم در فناوری",
      "پشتیبانی طولانی مدت نرم‌افزار",
      "تجربه کاربری بی‌نظیر",
      "مواد باکیفیت و دوام بالا"
    ],
    total_products: 180,
    rating: 4.8,
    total_sales: 95000,
    market_share: "15.8%",
    global_rank: 2,
    website: "https://www.apple.com",
    email: "info@apple.com",
    phone: "+1-408-996-1010",
    social_media: {
      twitter: "@Apple",
      instagram: "@apple",
      facebook: "Apple"
    },
    ceo: "Tim Cook",
    employees: "164,000+",
    revenue: "$394.3 بیلیون (2022)",
    popular_products: ["iPhone 15", "MacBook Air", "iPad Pro", "Apple Watch", "AirPods Pro"]
  },

  samsung: {
    id: 2,
    name: "سامسونگ",
    slug: "samsung", 
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    tagline: "Inspire the World, Create the Future",
    description: `
      <p>سامسونگ الکترونیکس یکی از بزرگترین تولیدکنندگان محصولات الکترونیکی در جهان است که در زمینه‌های مختلفی از جمله تلفن‌های هوشمند، تبلت، تلویزیون، یخچال، ماشین لباسشویی و سایر لوازم خانگی فعالیت می‌کند.</p>
      
      <p>این شرکت کره‌ای در سال ۱۹۳۸ تأسیس شد و امروزه در بیش از ۷۰ کشور جهان دفتر دارد و محصولات آن در سراسر جهان عرضه می‌شود.</p>
      
      <p>سامسونگ همچنین یکی از پیشروان در صنعت نیمه‌هادی و حافظه‌های دیجیتال محسوب می‌شود و تکنولوژی‌های نوآورانه‌ای مانند صفحات نمایش OLED و QLED را توسعه داده است.</p>
    `,
    established_year: 1938,
    origin_country: "کره جنوبی",
    headquarters: "سئول، کره جنوبی",
    features: [
      "تکنولوژی پیشرفته صفحه نمایش",
      "کیفیت ساخت بی‌نظیر",
      "تنوع گسترده محصولات",
      "نوآوری در طراحی",
      "گارانتی معتبر و خدمات پس از فروش",
      "قیمت مناسب در رده‌های مختلف",
      "عملکرد بالا و سرعت مناسب",
      "سازگاری با استانداردهای جهانی"
    ],
    total_products: 450,
    rating: 4.5,
    total_sales: 125000,
    market_share: "22.1%",
    global_rank: 1,
    website: "https://www.samsung.com",
    email: "info@samsung.com",
    phone: "+82-2-2255-0114",
    social_media: {
      twitter: "@Samsung",
      instagram: "@samsung",
      facebook: "Samsung"
    },
    ceo: "Jong-Hee (JH) Han",
    employees: "267,000+",
    revenue: "$244.2 بیلیون (2022)",
    popular_products: ["Galaxy S24", "Galaxy Note", "QLED TV", "Galaxy Watch", "Galaxy Buds"]
  },

  huawei: {
    id: 3,
    name: "هواوی",
    slug: "huawei",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/Huawei_Standard_logo.svg",
    tagline: "Make it Possible",
    description: `
      <p>هواوی تکنولوژیز شرکت چینی است که در زمینه تجهیزات ارتباطی، تلفن‌های هوشمند، تبلت و سایر محصولات فناوری اطلاعات فعالیت می‌کند.</p>
      
      <p>این شرکت در سال ۱۹۸۷ تأسیس شد و امروزه یکی از بزرگترین تولیدکنندگان تجهیزات مخابراتی در جهان محسوب می‌شود.</p>
      
      <p>هواوی در زمینه فناوری ۵G، هوش مصنوعی، اینترنت اشیاء و محاسبات ابری پیشرو بوده و سرمایه‌گذاری عظیمی در تحقیق و توسعه انجام می‌دهد.</p>
    `,
    established_year: 1987,
    origin_country: "چین",
    headquarters: "شنژن، چین",
    features: [
      "تکنولوژی دوربین پیشرفته",
      "باتری با ظرفیت بالا و شارژ سریع",
      "طراحی شیک و مدرن",
      "عملکرد قوی پردازشگر",
      "صفحه نمایش با کیفیت بالا",
      "قیمت رقابتی",
      "امکانات پیشرفته عکاسی",
      "مقاومت در برابر آب و غبار"
    ],
    total_products: 280,
    rating: 4.3,
    total_sales: 75000,
    market_share: "10.5%",
    global_rank: 4,
    website: "https://www.huawei.com",
    email: "info@huawei.com",
    phone: "+86-755-28780808",
    social_media: {
      twitter: "@Huawei",
      instagram: "@huawei",
      facebook: "Huawei"
    },
    ceo: "Ren Zhengfei",
    employees: "207,000+",
    revenue: "$99.9 بیلیون (2022)",
    popular_products: ["Mate 60 Pro", "P60 Pro", "MateBook", "Watch GT", "FreeBuds Pro"]
  },

  xiaomi: {
    id: 4,
    name: "شیائومی",
    slug: "xiaomi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg",
    tagline: "Innovation for Everyone",
    description: `
      <p>شیائومی شرکت چینی است که در سال ۲۰۱۰ تأسیس شد و به سرعت به یکی از بزرگترین تولیدکنندگان تلفن‌های هوشمند در جهان تبدیل شده است.</p>
      
      <p>این شرکت با شعار "نوآوری برای همه" محصولات باکیفیت و مقرون به صرفه‌ای را ارائه می‌دهد که شامل تلفن‌های هوشمند، لپ‌تاپ، تلویزیون، لوازم خانگی هوشمند و اکسسوری‌های متنوع می‌شود.</p>
      
      <p>شیائومی همچنین در زمینه اینترنت اشیاء، خانه‌های هوشمند و خدمات اینترنتی فعال است و یکی از برندهای محبوب در بازار جهانی محسوب می‌شود.</p>
    `,
    established_year: 2010,
    origin_country: "چین",
    headquarters: "پکن، چین",
    features: [
      "نسبت کیفیت به قیمت عالی",
      "مشخصات فنی بالا",
      "طراحی جذاب و مدرن",
      "MIUI با امکانات گسترده",
      "باتری پرظرفیت",
      "دوربین با کیفیت مناسب",
      "به‌روزرسانی منظم نرم‌افزار",
      "تنوع در رنگ‌بندی"
    ],
    total_products: 320,
    rating: 4.4,
    total_sales: 95000,
    market_share: "12.8%",
    global_rank: 3,
    website: "https://www.mi.com",
    email: "info@xiaomi.com",
    phone: "+86-10-60606666",
    social_media: {
      twitter: "@Xiaomi",
      instagram: "@xiaomi.global",
      facebook: "XiaomiGlobal"
    },
    ceo: "Lei Jun",
    employees: "35,000+",
    revenue: "$42.1 بیلیون (2022)",
    popular_products: ["Xiaomi 14", "Redmi Note 13", "Mi TV", "Mi Band", "Redmi Buds"]
  },

  asus: {
    id: 5,
    name: "ایسوس",
    slug: "asus",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg",
    tagline: "In Search of Incredible",
    description: `
      <p>ایسوس شرکت تایوانی است که در سال ۱۹۸۹ تأسیس شد و در زمینه تولید لپ‌تاپ، کامپیوتر رومیزی، مادربرد، کارت گرافیک، تلفن‌های هوشمند و سایر تجهیزات کامپیوتری فعالیت می‌کند.</p>
      
      <p>این شرکت به خصوص در بازار گیمینگ و محصولات تخصصی کامپیوتری شهرت جهانی دارد و محصولات آن توسط گیمرها و متخصصان IT مورد استفاده قرار می‌گیرند.</p>
      
      <p>ایسوس همچنین در زمینه تولید روتر، مانیتور گیمینگ و سایر تجهیزات شبکه نیز فعال است و کیفیت و نوآوری از ویژگی‌های اصلی محصولات این برند محسوب می‌شود.</p>
    `,
    established_year: 1989,
    origin_country: "تایوان",
    headquarters: "تایپه، تایوان",
    features: [
      "کیفیت ساخت صنعتی",
      "عملکرد بالا برای گیمینگ",
      "طراحی حرفه‌ای و شیک",
      "تکنولوژی خنک‌کاری پیشرفته",
      "قطعات باکیفیت و مقاوم",
      "پشتیبانی فنی قوی",
      "نرم‌افزارهای مخصوص",
      "گارانتی معتبر جهانی"
    ],
    total_products: 220,
    rating: 4.6,
    total_sales: 45000,
    market_share: "7.2%",
    global_rank: 6,
    website: "https://www.asus.com",
    email: "info@asus.com",
    phone: "+886-2-2894-3447",
    social_media: {
      twitter: "@ASUS",
      instagram: "@asus",
      facebook: "ASUS"
    },
    ceo: "Samson Hu",
    employees: "17,000+",
    revenue: "$15.3 بیلیون (2022)",
    popular_products: ["ROG Phone 8", "ZenBook Pro", "ROG Strix", "TUF Gaming", "ZenFone 11"]
  }
};

// Helper function to get brand by slug
export const getBrandBySlug = (slug) => {
  return brandsData[slug] || null;
};

// Helper function to get all brands as array
export const getAllBrands = () => {
  return Object.values(brandsData);
};

// Helper function to search brands
export const searchBrands = (query) => {
  return Object.values(brandsData).filter(brand => 
    brand.name.includes(query) || 
    brand.slug.includes(query.toLowerCase())
  );
};