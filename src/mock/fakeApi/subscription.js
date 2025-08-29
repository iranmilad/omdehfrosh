import Product1 from "../../assets/products/1.webp"
import Product2 from "../../assets/products/6.webp"

export default function Subscription(server, apiPrefix) {
    server.post(`${apiPrefix}/subscription`, (schema, { requestBody }) => {
      
      let { page } = JSON.parse(requestBody);
      if (page) {
        const data = {
            items: [
                {
                  id: "1234",
                  title: "یک ماهه",
                  price: 25
                },
            ],
            totalPage: 10
        };
        return { message: "ok", data };
      }
    });
}