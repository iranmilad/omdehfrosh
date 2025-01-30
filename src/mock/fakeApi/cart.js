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
}
