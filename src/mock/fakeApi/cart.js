import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import Image1 from "../../assets/products/1.webp";

export default function Cart(server, apiPrefix) {
  // In-memory cart storage
  let cartData = [
    {
      "productId": 126,
      "attributes": [
          {
              "color": "#ff00ff",
              "material": "نخی"
          }
      ],
      "seller": {
          "id": 1,
          "label": ""
      },
      "count": 1,
      "max": 94,
      "price": {
          "regularPrice": 1000000,
          "discountedPrice": 950000,
          "discountPercent": null
      },
      "combinationsID": 19,
      "image": "/static/image/1.812d88ff.webp",
      "name": "پرده جدید 4"
  }
  ];

  // **Update API: Updates count if item exists, otherwise adds new item**
  server.post(`${apiPrefix}/cart/update`, async (schema, { requestBody }) => {

    let body = JSON.parse(requestBody);


    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/cart/update"), {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });
    
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update cart");
      }

      try {
        const response = await fetch(getApiUrl("/cart"), {
          headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          }),          });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart data");
        }
        const serverD = await response.json();
    
        return {
          message: "ok",
          cart: serverD.cart || [], // Ensure cart exists
          total: serverD.cart
            ? serverD.cart.reduce(
                (sum, item) => sum + item.price.discountedPrice * item.count,
                0
              )
            : 0,
        };
      } catch (error) {
        return {
          message: "error",
          cart: [],
          total: 0,
        };
      }
      


      } catch (error) {
        return { message: "error", cart: [], total: 0 };
      }
    
  
  });

  // **Remove API: Removes item from cart**
  server.post(`${apiPrefix}/cart/remove`, async (schema, { requestBody }) => {

    const token = localStorage.getItem("user");

    let body = JSON.parse(requestBody);

    try {
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),        
      });
    
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update cart");
      }

      try {
        const response = await fetch(getApiUrl("/cart"), {
          headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          }),  
                });
        
        if (!response.ok) {
          throw new Error("Failed to fetch cart data");
        }
        const serverD = await response.json();
    
        return {
          message: "ok",
          cart: serverD.cart || [], // Ensure cart exists
          total: serverD.cart
            ? serverD.cart.reduce(
                (sum, item) => sum + item.price.discountedPrice * item.count,
                0
              )
            : 0,
        };
      } catch (error) {
        return {
          message: "error",
          cart: [],
          total: 0,
        };
      }
      


      } catch (error) {
        return { message: "error", cart: [], total: 0 };
      }


  });

  // **Get API: Returns current cart data**
  server.get(`${apiPrefix}/cart`, async () => {

    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),        
      });

      
      
      if (!response.ok) {
        localStorage.removeItem("user"); // ✅ Remove token if not present

        throw new Error("Failed to fetch cart data");
      }
      const serverD = await response.json();

  
      return {
        message: "ok",
        cart: serverD.cart || [], // Ensure cart exists
        totalPrice: serverD.total || 0
      };
    } catch (error) {
      return {
        message: "error",
        cart: [],
        totalPrice: 0,
      };
    }
  });


  server.get(`${apiPrefix}/cart/getfinalreceipt`, async (req) => {

    const token = localStorage.getItem("user");

    try {


        const response = await fetch(getApiUrl("/cart/getfinalreceipt"), {
            method: "GET",
            headers: new Headers({
              'Authorization': `Bearer ${token}`, 
              "Content-Type": "application/json"      
            }),  
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cart data");
        }

        const serverD = await response.json();

        return {
            message: "ok",
            // cart: serverD.cart || [],
            // total: serverD.cart
            //     ? serverD.cart.reduce(
            //           (sum, item) => sum + item.price.discountedPrice * item.count,
            //           0
            //       )
            //     : 0,
        };
    } catch (error) {
        return {
            message: "error",
            cart: [],
            total: 0,
        };
    }
});


  
}  
