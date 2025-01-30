import Product1 from "../../assets/products/1.webp"
import Product2 from "../../assets/products/6.webp"

export default function Orders(server, apiPrefix) {
    server.post(`${apiPrefix}/orders`, (schema, { requestBody }) => {
      
      let { page } = JSON.parse(requestBody);
      if (page) {
        const data = {
            items: [
                {
                  id: "1234",
                  date: "1403/12/12",
                  status: "درحال بررسی",
                  total: "12,000,000",
                },
                {
                  id: "1234",
                  date: "1403/12/12",
                  status: "درحال بررسی",
                  total: "12,000,000",
                },
            ],
            totalPage: 10
        };
        return { message: "ok", data };
      }
    });

    server.post(`${apiPrefix}/orders/:id` , (schema,{requestBody}) => {
      const orderDetails = {
        deliveryConfirmation: false,
        recipient: "فرهاد باقری",
        phoneNumber: "09374039436",
        address: "فارس - شیراز - بلوار ارم - نبش کوچه 4 - پلاک 596 - درب سفید مشکی",
        totalAmount: 2000000,
        discountAmount: 2000000,
        discountCode: "XCODE",
        products: [
          {
            id: "123",
            imageUrl: Product1,
            name: "آیفون 16",
            description: "Apple iPhone 16",
            price: 2000000,
            options: ["سفید"],
            seller: {
              name: "دیجکالا",
              id: "123"
            }
          },
          {
            id: "123",
            imageUrl: Product1,
            name: "آیفون 16",
            description: "Apple iPhone 16",
            price: 2000000,
            options: ["آبی"],
            seller: {
              name: "دیجکالا",
              id: "123"
            }
          },
          {
            id: "123",
            imageUrl: Product2,
            name: "سامسونگ S24",
            description: "Samsung",
            price: 2000000,
            options: ["مشکی"],
            seller: {
              name: "دیجکالا",
              id: "123"
            }
          },
        ],
      };
      return { message: "ok", data: orderDetails};
    })

    server.post(`${apiPrefix}/order-confirm`, (schema,{reuestBody}) => {
      return {message: 'ok', data: {status: 'pending'}}
    })
  }