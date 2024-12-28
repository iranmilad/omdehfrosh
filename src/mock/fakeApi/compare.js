import Product1 from "../../assets/products/1.webp";
import Product6 from "../../assets/products/6.webp";

export default function Compare(server, apiPrefix) {
  server.post(`${apiPrefix}/compare`, (schema, { requestBody }) => {
    let data = {
      title: [
        "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
        "گوشی موبایل سامسونگ مدل Galaxy S24 Ultra دو سیم کارت ظرفیت 256 گیگابایت و رم 12 گیگابایت - ویتنام",
      ],
      slug: ["123", "456"],
      image: [Product1,Product6],
      rating: ["3","5"],
      price: [
        {
          regularPrice: 21000000,
          discountedPrice: 19000000
        },
        {
          regularPrice: 30000000,
        },
      ],
      attributes: [
        {
          label: "رنگ ها",
          value: ["آبی ، قرمز ، مشکی", "مشکی"],
        },
      ],
    };
    
    return { message: "ok", data };
  });
}
