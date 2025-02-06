import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { products } from "../data/products"; // ایمپورت داده‌های محصولات
import Image1 from "../../assets/products/1.webp"
import Image2 from "../../assets/products/2.webp"
import Image3 from "../../assets/products/3.webp"
import Image4 from "../../assets/products/4.webp"
import Image5 from "../../assets/products/5.webp"
import { comments } from "../data/comments";

export default function Product(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محصولات مرتبط (GET)
  server.post(`${apiPrefix}/product/related`, (schema, { requestBody }) => {
    let data = products; // استفاده از لیست محصولات

    // برگرداندن لیست محصولات مرتبط به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });

  server.post(`${apiPrefix}/product/:id`,(schema,{requstBody}) => {
    let data ={
      "id": 4,
      "general": {
          "slug": null,
          "title": "گوشی موبایل اپل مدل iPhone 16 Pro Max ZAA",
          "english_title": "Apple iPhone 16 Pro Max ZAA Dual SIM Storage 1TB And RAM 8GB Mobile Phone",
          "addedToFavorite": true,
          "images": [
            Image1,
            Image2,
              Image3,
              Image4,
              Image5
          ],
          "description": "<p>توضیحات نمونه برای محصول 4</p>",
          "specifications": null,
          "priceHistory": [
              {
                  "date": "2024-02-01",
                  "minPrice": 900000,
                  "maxPrice": 1150000
              },
              {
                  "date": "2024-03-01",
                  "minPrice": 870000,
                  "maxPrice": 1100000
              },
              {
                  "date": "2024-04-01",
                  "minPrice": 880000,
                  "maxPrice": 1080000
              },
              {
                  "date": "2024-05-01",
                  "minPrice": 860000,
                  "maxPrice": 1050000
              },
              {
                  "date": "2024-01-01",
                  "minPrice": 950000,
                  "maxPrice": 1200000
              }
          ]
      },
      "options": [
          {
              "id": 1,
              "label": "رنگ",
              "slug": "color",
              "type": "color",
              "children": [
                  {
                      "id": 16,
                      "label": "صورتی",
                      "value": "#ec4899"
                  },
                  {
                      "id": 17,
                      "label": "قرمز",
                      "value": "#ef4444"
                  },
                  {
                      "id": 33,
                      "label": "آبي",
                      "value": "#3b82f6"
                  },
                  {
                      "id": 36,
                      "label": "سبز",
                      "value": "#10b981"
                  },
              ]
          },
          {
              "id": 81,
              "label": "جنس",
              "slug": "material",
              "type": "select",
              "children": [
                  {
                      "id": 18,
                      "label": "نخی",
                      "value": "نخی"
                  },
                  {
                      "id": 19,
                      "label": "پارچه ای",
                      "value": "پارچه ای"
                  }
              ]
          }
      ],
      "combinations": [
          {
              "id": 19,
              "options": [
                  {
                      "id": 16,
                      "value": "pink",
                      "attribute_name": "رنگ",
                      "attribute_id": 1
                  },
                  {
                      "id": 18,
                      "value": "نخی",
                      "attribute_name": "جنس",
                      "attribute_id": 81
                  }
              ],
              "suppliers": [
                  {
                      "id": 1,
                      "name": "دیجی کالا",
                      "payment_type": "Cash",
                      "delivery": "Area 1, Area 2",
                      "buy_type": "Retail",
                      "price": {
                          "regularPrice": "100.00",
                          "discountedPrice": "120.00",
                          "discountPercent": null
                      },
                      "sku": "SKU-001",
                      "inventory": 10,
                      "min_order": 1,
                      "max_order": 100,
                      "rating": "4.50",
                      "reviews_count": 0,
                      "reviews": []
                  },
                  {
                      "id": 2,
                      "name": "تک اسیا",
                      "payment_type": "Credit",
                      "delivery": "Area 3, Area 4",
                      "buy_type": "Wholesale",
                      "price": {
                          "regularPrice": "110.00",
                          "discountedPrice": "130.00",
                          "discountPercent": null
                      },
                      "sku": "SKU-002",
                      "inventory": 15,
                      "min_order": 2,
                      "max_order": 150,
                      "rating": "4.80",
                      "reviews_count": 0,
                      "reviews": []
                  }
              ]
          },
          {
              "id": 20,
              "options": [
                  {
                      "id": 16,
                      "value": "pink",
                      "attribute_name": "رنگ",
                      "attribute_id": 1
                  },
                  {
                      "id": 19,
                      "value": "پارچه ای",
                      "attribute_name": "جنس",
                      "attribute_id": 81
                  }
              ],
              "suppliers": [
                  {
                      "id": 2,
                      "name": "تک اسیا",
                      "payment_type": "Credit",
                      "delivery": "Area 3, Area 4",
                      "buy_type": "Wholesale",
                      "price": {
                          "regularPrice": "110.00",
                          "discountedPrice": "130.00",
                          "discountPercent": null
                      },
                      "sku": "SKU-002",
                      "inventory": 15,
                      "min_order": 2,
                      "max_order": 150,
                      "rating": "4.80",
                      "reviews_count": 0,
                      "reviews": []
                  }
              ]
          },
          {
              "id": 21,
              "options": [
                  {
                      "id": 17,
                      "value": "red",
                      "attribute_name": "رنگ",
                      "attribute_id": 1
                  },
                  {
                      "id": 18,
                      "value": "نخی",
                      "attribute_name": "جنس",
                      "attribute_id": 81
                  }
              ],
              "suppliers": [
                  {
                      "id": 1,
                      "name": "دیجی کالا",
                      "payment_type": "Cash",
                      "delivery": "Area 1, Area 2",
                      "buy_type": "Retail",
                      "price": {
                          "regularPrice": "100.00",
                          "discountedPrice": "120.00",
                          "discountPercent": null
                      },
                      "sku": "SKU-001",
                      "inventory": 10,
                      "min_order": 1,
                      "max_order": 100,
                      "rating": "4.50",
                      "reviews_count": 0,
                      "reviews": []
                  }
              ]
          }
      ]
  }

    return {message: "ok" , data}
  })

  server.post(`${apiPrefix}/product/:id/comments` , (schema,{requestBody}) => {
    let data = comments;
    data.comments = shuffleArray(comments.comments);

    return {message: "ok",data}
  })
}