// GET /bootstrap
export const getBootstrap = async (req, res) => {
  try {
    const bootstrap = {
      siteTitle: "فروشگاه ما",
      logo: "/uploads/assets/logo.png",
      banner: {
        link: "https://myshop.com",
        src: "",
      },
      menu: {
        main: [
          {
            id: "146",
            label: "منوی اصلی",
            icon: "/uploads/bootstrap/icons/menu.webp",
            mega: true,
            url: null,
            links: [
              { id: 380, label: "موبایل", icon: "/uploads/bootstrap/icons/mobile.webp", mega: false, url: "/fastorder/category/mobile", links: [] },
              { id: 381, label: "لپ تاپ", icon: "/uploads/bootstrap/icons/laptop.webp", mega: false, url: "/fastorder/category/laptop", links: [] },
              { id: 382, label: "هدفون", icon: "/uploads/bootstrap/icons/headphones.webp", mega: false, url: "/fastorder/category/headphone", links: [] },
              { id: 383, label: "کنسول بازی", icon: "/uploads/bootstrap/icons/gamepad.webp", mega: false, url: "/fastorder/category/game-console", links: [] },
              { id: 384, label: "هارد و حافظه", icon: "/uploads/bootstrap/icons/storage.webp", mega: false, url: "/fastorder/category/storage", links: [] },
              { id: 385, label: "تبلت", icon: "/uploads/bootstrap/icons/tablet.webp", mega: false, url: "/fastorder/category/tablet", links: [] },
              { id: 386, label: "ساعت هوشمند", icon: "/uploads/bootstrap/icons/smartwatch.webp", mega: false, url: "/fastorder/category/smartwatch", links: [] },
              { id: 387, label: "پرینتر", icon: "/uploads/bootstrap/icons/printer.webp", mega: false, url: "/fastorder/category/printer", links: [] },
              { id: 388, label: "اسپیکر", icon: "/uploads/bootstrap/icons/speaker.webp", mega: false, url: "/fastorder/category/speaker", links: [] },
              { id: 389, label: "پاور بانک", icon: "/uploads/bootstrap/icons/powerbank.webp", mega: false, url: "/fastorder/category/powerbank", links: [] },
              { id: 390, label: "مانیتور", icon: "/uploads/bootstrap/icons/monitor.webp", mega: false, url: "/fastorder/category/monitor", links: [] },
            ],
          },
        ],
        social: [
          {
            id: "214",
            label: "شبکه‌های اجتماعی",
            icon: "bi bi-share",
            mega: false,
            url: null,
            links: [
              { id: 265, label: "Instagram", icon: "bi bi-instagram", mega: false, url: "https://www.instagram.com/", links: [] },
              { id: 267, label: "LinkedIn", icon: "bi bi-linkedin", mega: false, url: "https://www.linkedin.com/", links: [] },
              { id: 269, label: "Telegram", icon: "bi bi-telegram", mega: false, url: "https://telegram.org/", links: [] },
              { id: 266, label: "Twitter", icon: "bi bi-twitter-x", mega: false, url: "https://twitter.com/", links: [] },
              { id: 268, label: "WhatsApp", icon: "bi bi-whatsapp", mega: false, url: "https://web.whatsapp.com/", links: [] },
            ],
          },
        ]
      },
      footerAbout: "متن درباره‌ی سایت",
      footer: {
        // Scroll to top button text
        scrollButtonText: "برو به بالا",
        
        // Features section (the icons that were hardcoded)
        // features: [
        //   { 
        //     icon: "/uploads/services/cash-on-delivery.svg", 
        //     label: "پرداخت درب منزل" 
        //   },
        //   { 
        //     icon: "/uploads/services/days-return.svg", 
        //     label: "ضمانت 7 روزه" 
        //   },
        //   { 
        //     icon: "/uploads/services/express-delivery.svg", 
        //     label: "پست سریع" 
        //   },
        //   { 
        //     icon: "/uploads/services/original-products.svg", 
        //     label: "ضمانت کالا" 
        //   },
        //   { 
        //     icon: "/uploads/services/support.svg", 
        //     label: "پشتیبانی 24 ساعته" 
        //   },
        // ],
        
        // Footer menu links (moved from menu.footer)
        menuLinks: [
          {
            id: "188",
            label: "دسته 1",
            icon: "/uploads/bootstrap/icons/category.webp",
            mega: false,
            url: null,
            links: [
              { id: 197, label: "راهنمای خرید و مرجوعی", icon: "/uploads/bootstrap/icons/mirror.webp", mega: false, url: "#", links: [] },
              { id: 198, label: "سوالات متداول", icon: "/uploads/bootstrap/icons/mirror.webp", mega: false, url: "#", links: [] },
              { id: 189, label: "محاسبه مالیات", icon: "/uploads/bootstrap/icons/curtain.webp", mega: false, url: "#", links: [] },
            ],
          },
          {
            id: "189",
            label: "دسته 2",
            icon: "/uploads/bootstrap/icons/category.webp",
            mega: false,
            url: null,
            links: [
              { id: 198, label: "تماس با ما", icon: "/uploads/bootstrap/icons/mirror.webp", mega: false, url: "#", links: [] },
              { id: 189, label: "درباره ما", icon: "/uploads/bootstrap/icons/curtain.webp", mega: false, url: "#", links: [] },
            ],
          },
        ],
        
        // Certificates/Trust badges with links
        certificates: [
          {
            image: "/uploads/footer/enamad.png",
            alt: "enamad",
            url: "https://trustseal.enamad.ir/"
          },
          {
            image: "/uploads/footer/samandehi.jpg",
            alt: "samandehi",
            url: "https://logo.samandehi.ir/"
          }
        ],
        
        // Bottom bar texts
        contactPhone: "تلفن واحد صدای مشتریان 021-43802000",
        copyrightText: "تمامی حقوق برای این فروشگاه محفوظ است"
      }
    };

    res.json({
      message: "Bootstrap data fetched successfully",
      state: "ok",
      data: bootstrap,
    });
  } catch (err) {
    console.error("Error fetching bootstrap data:", err);
    res.status(500).json({
      status: 500,
      message: "Server error while fetching bootstrap data",
    });
  }
};