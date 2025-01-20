import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { products } from "../data/products"; // ایمپورت داده‌های محصولات
import Image1 from "../../assets/products/1.webp"
import Image2 from "../../assets/products/2.webp"
import Image3 from "../../assets/products/3.webp"
import Image4 from "../../assets/products/4.webp"
import Image5 from "../../assets/products/5.webp"

export default function Product(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محصولات مرتبط (GET)
  server.post(`${apiPrefix}/product/related`, (schema, { requestBody }) => {
    let data = products; // استفاده از لیست محصولات

    // برگرداندن لیست محصولات مرتبط به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });

  server.post(`${apiPrefix}/product/:id`,(schema,{requstBody}) => {
    let data = {
      id: "123",
      slug: "iphone_16_promax_zaa",
      title: "گوشی موبایل اپل مدل iPhone 16 Pro Max ZAA",
      english_title: "Apple iPhone 16 Pro Max ZAA Dual SIM Storage 1TB And RAM 8GB Mobile Phone",
      options: [
        {
          id: "1",
          label: "رنگ",
          slug: "color",
          children: [
            {
              id: "10",
              label: "مشکی",
              value: "black" // slug
            },
            {
              id: "11",
              label: "تیتانیوم",
              value: "titanium" // slug
            },
            {
              id: "12",
              label: "white",
              value: "black" // slug
            },
          ]
        },
        {
          id: "2",
          label: "گارانتی",
          slug: "color",
          children: [
            {
              id: "20",
              label: "3 ماهه",
              value: "3month" // slug
            },
            {
              id: "21",
              label: "5 ماهه",
              value: "5month" // slug
            },
            {
              id: "22",
              label: "8 ماهه",
              value: "8month" // slug
            },
          ]
        },
      ],
      addedToFavorite: true,
      images: [Image1,Image2,Image3,Image4,Image5],
      description: "<p>آیفون 16 پرو مکس، جدیدترین شاهکار اپل، با طراحی شیک، دوربین‌های بی‌نظیر و عملکردی فوق‌العاده، استانداردهای جدیدی را برای گوشی‌های هوشمند تعریف می‌کند. نمایشگر 6.9 اینچی Super Retina XDR OLED با وضوح بالا و نرخ نوسازی 120 هرتز، تجربه بصری کم‌نظیری را ارائه می‌دهد و بدنه‌ مقاوم از جنس شیشه و تیتانیوم، زیبایی و دوام را در کنار هم به ارمغان می‌آورد. چیپست قدرتمند A18 Bionic با فناوری 3 نانومتری، به کاربران امکان می‌دهد تا بازی‌ها و اپلیکیشن‌های سنگین را به راحتی اجرا کنند. دوربین‌های 48، 12 و 48 مگاپیکسلی این گوشی، به ویژه دوربین تله‌فوتو با زوم 5 برابری اپتیکال، تصاویری خیره‌کننده و ویدیوهایی با کیفیت سینمایی ثبت می‌کنند. باتری 4685 میلی‌آمپر ساعتی با پشتیبانی از شارژ سریع هم به صورت باسیم و هم به صورت بی‌سیم، طول عمر بالایی داشته و شارژدهی بسیار خوبی دارد. همچنین، با iOS 18، تجربه کاربری بهینه‌تر و امنیت بیشتری خواهید داشت. اگر به دنبال بهترین عملکرد و عکاسی حرفه‌ای در یک گوشی هوشمند هستید، آیفون 16 پرو مکس ترکیبی بی‌نظیر از تکنولوژی پیشرفته و طراحی لوکس است که تمام انتظارات شما را برآورده می‌کند. همانطور که می‌دانید گوشی‌های آیفون با پارت نامبرهای مختلفی از جمله CH، ZAA، LLA ،ZPAو ... در بازار وجود دارند. پارت نامبر ZAA مربوط به کشور سنگاپور است. این پارت نامبر هیچ محدودیت نرم افزاری‌ای ندارد و با پشتیبانی از دو سیم‌کارت فیزیکی به صورت همزمان، پارت نامبر بسیار مناسبی است. این گوشی، مانند تمامی گوشی‌های عرضه‌شده در دیجی‌کالا، به صورت قانونی و تجاری وارد کشور شده و با رجیستر رسمی، کارت گارانتی معتبر و کد فعال‌سازی به شما تحویل داده می‌شود.</p>", // html
      sellers: [
        {
          id: "123",
          name: "دیجیکالا",
          rating: 4,
          payment_type: ["نقدی","اقساط"], //نوع پرداخت 
          delivery: ["تهران","کرج"], // مکان های ارسال
          buy_type: ["آنی", "پیش فروش"], // نوع تحویل
          price: {
            regularPrice: 15000000,
            discountedPrice: 10500000,
            discountPercent: "30",
          },
          sku: "123", // کد محصول
          inventory: 3, //موجودی انبار,
          min_order: 1, // حداقل سفارش
          max_order: 5, // حداکثر سفارش
        }
      ],
      specifications: [
        {
          label: "سیستم عامل",
          value: "iOS 18"
        },
        {
          label: "صفحه نمایش",
          value: "6.9 اینچ، Super Retina XDR"
        },
        {
          label: "پردازنده",
          value: "A18 Bionic"
        },
        {
          label: "دوربین اصلی",
          value: "48 مگاپیکسل، سه لنز"
        },
        {
          label: "دوربین سلفی",
          value: "12 مگاپیکسل"
        },
        {
          label: "حافظه داخلی",
          value: "1TB, 512GB, 256GB"
        },
        {
          label: "RAM",
          value: "8GB"
        },
        {
          label: "باتری",
          value: "5000 میلی‌آمپر ساعت"
        },
        {
          label: "شارژ",
          value: "شارژ سریع 45W، شارژ بی‌سیم"
        },
        {
          label: "رنگ‌ها",
          value: "مشکی، نقره‌ای، طلایی، آبی"
        }
      ]
    };


    return {message: "ok" , data}
  })
}