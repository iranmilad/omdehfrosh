// GET /bootstrap
export const getBootstrap = async (req, res) => {
  try {
    const menuItems = {
      main: [
        {
          id: "146",
          label: "منوی اصلی",
          icon: "/uploads/bootstrap/icons/menu.webp",
          mega: true,
          url: null,
          links: [
            { id: 380, label: "موبایل", icon: "/uploads/bootstrap/icons/mobile.webp", mega: false, url: "/category/mobile", links: [] },
            { id: 381, label: "لپ تاپ", icon: "/uploads/bootstrap/icons/laptop.webp", mega: false, url: "/category/laptop", links: [] },
            { id: 382, label: "هدفون", icon: "/uploads/bootstrap/icons/headphones.webp", mega: false, url: "/category/headphone", links: [] },
            { id: 383, label: "کنسول بازی", icon: "/uploads/bootstrap/icons/gamepad.webp", mega: false, url: "/category/game-console", links: [] },
            { id: 384, label: "هارد و حافظه", icon: "/uploads/bootstrap/icons/storage.webp", mega: false, url: "/category/storage", links: [] },
            { id: 385, label: "تبلت", icon: "/uploads/bootstrap/icons/tablet.webp", mega: false, url: "/category/tablet", links: [] },
            { id: 386, label: "ساعت هوشمند", icon: "/uploads/bootstrap/icons/smartwatch.webp", mega: false, url: "/category/smartwatch", links: [] },
            { id: 387, label: "پرینتر", icon: "/uploads/bootstrap/icons/printer.webp", mega: false, url: "/category/printer", links: [] },
            { id: 388, label: "اسپیکر", icon: "/uploads/bootstrap/icons/speaker.webp", mega: false, url: "/category/speaker", links: [] },
            { id: 389, label: "پاور بانک", icon: "/uploads/bootstrap/icons/powerbank.webp", mega: false, url: "/category/powerbank", links: [] },
            { id: 390, label: "مانیتور", icon: "/uploads/bootstrap/icons/monitor.webp", mega: false, url: "/category/monitor", links: [] },
          ],
        },
      ],
      footer: [
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
    };

    const bootstrap = {
      siteTitle: "فروشگاه ما",
      logo: "/uploads/assets/logo.png",
      banner: {
        link: "https://myshop.com",
        src: "",
      },
      menu: menuItems,
      footerAbout: "متن درباره‌ی سایت",
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