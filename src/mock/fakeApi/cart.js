import Image1 from "../../assets/products/1.webp"

export default function Cart(server, apiPrefix) {
    server.post(`${apiPrefix}/cart/update`, (schema, { requestBody }) => {
        let body = JSON.parse(requestBody);
        let response = { message: 'ok', cart: [] };
  
        let { productId, attributes, seller, count, max } = body;
  
        if (!productId || !seller || !Array.isArray(attributes)) {
            return { message: "Invalid data", cart: schema.carts.all().models };
        }
  
        // بررسی وجود آیتم در سبد خرید
        let existingItem = schema.carts.where(cartItem =>
            cartItem.productId === productId &&
            cartItem.seller === seller &&
            JSON.stringify(cartItem.attributes) === JSON.stringify(attributes)
        ).models[0]; // اولین آیتمی که مطابق باشد
  
        let finalCount = max ? 30 : count; // اگر max ارسال شده باشد، count را ۳۰ تنظیم کن
  
        if (existingItem) {
            existingItem.update({ count: finalCount });
        } else {
            schema.carts.create({
                productId,
                attributes,
                seller,
                count: finalCount
            });
        }
  
        // دریافت سبد خرید جدید بعد از تغییرات
        response.cart = schema.carts.all().models;
  
        // اگر max ارسال شده بود، مقدار آن را در پاسخ قرار بده
        if (max) {
            response.max = 30;
        }
  
        return response;
    });
  
    server.post(`${apiPrefix}/cart/remove`, (schema, { requestBody }) => {
        let req = JSON.parse(requestBody);
        // let response = { message: "ok", cart: [] };

        console.log(req);

        return {}
  
        // if (!id) {
        //     return { message: "Invalid ID", cart: schema.carts.all().models };
        // }
  
        // // حذف آیتم از سبد خرید
        // let item = schema.carts.find(id);
        // if (item) {
        //     item.destroy();
        // }
  
        // // دریافت سبد خرید جدید بعد از حذف
        // response.cart = schema.carts.all().models;
  
        // response = {
        //     "message": "ok",
        //     "cart": [
        //         {
        //             "name": "دیجی کالا",
        //             "image": "",
        //             "productId": 4,
        //             "attributes": ["آبی" , "سه ماهه"],
        //             "combinationsID": 20,
        //             "seller": {
        //                 "id": 1,
        //                 "label": "دیجیکالا"
        //             },
        //             "count": 3,
        //             "price": {
        //                 "regularPrice": 1000000,
        //                 "discountedPrice": 950000,
        //                 "discountPercent": 5
        //             }
        //         }
        //     ],
        //     "total": 15000000
        // }
        return response;
    });
  
    server.get(`${apiPrefix}/cart`, (schema) => {
        // let cartItems = schema.carts.all().models.map(item => ({
        //     id: item.id,
        //     title: `محصول شماره ${item.productId}`, // عنوان آزمایشی
        //     image: Image1, // تصویر آزمایشی
        //     price: 1_000_000, // قیمت آزمایشی
        //     quantity: item.count,
        // }));
  
        // let total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
        // return { message: "ok", data: { total, items: cartItems } };

        return {
            "message": "ok",
            "cart": [
                {
                    "name": "دیجی کالا",
                    "image": Image1,
                    "productId": 4,
                    "attributes": ["آبی" , "سه ماهه"],
                    "combinationsID": 19,
                    "seller": {
                        "id": 1,
                        "label": "دیجیکالا"
                    },
                    "count": 3,
                    "price": {
                        "regularPrice": 1000000,
                        "discountedPrice": 950000,
                        "discountPercent": 5
                    }
                }
            ],
            "total": 15000000
        }
    });
  }
  