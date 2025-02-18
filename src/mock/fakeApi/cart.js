import Image1 from "../../assets/products/1.webp"

export default function Cart(server, apiPrefix) {
    server.post(`${apiPrefix}/cart/update`, (schema, { requestBody }) => {
        let body = JSON.parse(requestBody);
        let response = { message: "ok", cart: [] };
    
        let { productId, attributes, seller, count, max } = body;
    
        if (!productId || !seller || !attributes || typeof attributes !== "object") {
            return { message: "Invalid data", cart: formatCart(schema.carts.all().models) };
        }
    
        // بررسی وجود آیتم در سبد خرید (با در نظر گرفتن همه فیلدهای مهم)
        let existingItem = schema.carts.where(cartItem =>
            cartItem.productId === productId &&
            JSON.stringify(cartItem.attributes) === JSON.stringify(attributes) &&
            JSON.stringify(cartItem.seller) === JSON.stringify(seller)
        ).models[0];
    
        if (existingItem) {
            // مقدار جدید را به مقدار قبلی اضافه کنید
            let newCount = existingItem.count + count;
    
            // اگر `max` مشخص بود، مقدار را محدود کنید
            if (max && newCount > 30) {
                newCount = 30;
            }
    
            existingItem.update({ count: newCount });
        } else {
            let finalCount = max ? Math.min(30, count) : count;
    
            schema.carts.create({
                productId,
                attributes,
                seller,
                count: finalCount
            });
        }
    
        response.cart = formatCart(schema.carts.all().models, seller, attributes);
    
        if (max) {
            response.max = 30;
        }
    
        return response;
    });
    

    server.post(`${apiPrefix}/cart/remove`, (schema, { requestBody }) => {
        let req = JSON.parse(requestBody);
        let { productId, attributes, seller } = req;

        if (!productId || !seller || Array.isArray(attributes)) {
            return { message: "Invalid ID", cart: formatCart(schema.carts.all().models) };
        }

        // پیدا کردن و حذف آیتم (بر اساس تمامی فیلدهای مهم)
        let item = schema.carts.where(cartItem =>
            cartItem.productId === productId &&
            JSON.stringify(cartItem.attributes) === JSON.stringify(attributes) &&
            JSON.stringify(cartItem.seller) === JSON.stringify(seller)
        ).models[0];

        if (item) {
            item.destroy();
        }

        return { message: "ok", cart: formatCart(schema.carts.all().models,seller,attributes) };
    });

    server.get(`${apiPrefix}/cart`, (schema) => {
        // return { message: "ok", cart: formatCart(schema.carts.all().models) };
        return {message: "ok",cart: [
            {
              "name": "دیجی کالا",
              "image": "Image1",
              "productId": 4,
              "attributes": [
                "آبی",
                "سه ماهه"
              ],
              "combinationsID": 19,
              "seller": {
                "id": 1,
                "label": "دیجیکالا"
              },
              "count": 1,
              "price": {
                "regularPrice": 1000000,
                "discountedPrice": 950000,
                "discountPercent": 5
              }
            },
            {
              "name": "دیجی کالا",
              "image": "Image1",
              "productId": 4,
              "attributes": [
                "آبی",
                "سه ماهه"
              ],
              "combinationsID": 19,
              "seller": {
                "id": 2,
                "label": "تک اسیا"
              },
              "count": 5,
              "price": {
                "regularPrice": 1000000,
                "discountedPrice": 950000,
                "discountPercent": 5
              }
            }
          ],
          total: 20_000_000
        }
    });

    // تابعی برای تبدیل سبد خرید به فرمت استاندارد
    function formatCart(cartModels,seller=1,combinationsID) {
        return cartModels.map(item => ({
            name: "دیجی کالا",
            image: "Image1",
            productId: item.productId,
            attributes: ["آبی" , "سه ماهه"],
            combinationsID,
            seller: {
                id:seller,
                label: "دیجیکالا"
            },
            count: item.count,
            price: {
                regularPrice: 1_000_000,
                discountedPrice: 950_000,
                discountPercent: 5
            }
        }));
    }
}

