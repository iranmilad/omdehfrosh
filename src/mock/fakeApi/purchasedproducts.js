import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول

export default function PurchasedProducts(server, apiPrefix) {

  // اضافه کردن کاربر جدید
  server.post(`${apiPrefix}/purchasedproducts/add`, async (schema, {requestBody}) => {

    let body = JSON.parse(requestBody);

    try {

      const fakeUser = {
        userId: 1,
        purchasedProducts: [
          {
            product_id: "brand0-category0-subCategory0-item0i0001",
            sellerId: 1,
            combinationsID: 19,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 1,
            combinationsID: 19,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 1,
            combinationsID: 23,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 4,
            combinationsID: 19,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 1,
            combinationsID: 21,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 1,
            combinationsID: 19,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
          {
            product_id: "brand0-category0-subCategory0-item0i0000",
            sellerId: 1,
            combinationsID: 19,
            title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            regularPrice: 21000000,
            discountedPrice: 9120000,
            discountPercent: "40",
            image: "/assets/products/1.webp",
          },
        ],
      };

      const requestBody = {
        body: body,
        fakeUser: fakeUser,  
      };
      

      const response = await fetch(getApiUrl("/purchasedproducts/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody), // <-- Use fakeUser here
      });

      const data = await response.json();

      if (response.ok) {
        return { message: "User added successfully", data };
      } else {
        console.error("Failed to add user:", data);
        return { message: "Failed to add user", error: data };
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return { message: "Internal Server Error", error };
    }
  }
  
  );


  server.post(`${apiPrefix}/purchasedproducts`, async (schema, { requestBody }) => {

    
    let body = JSON.parse(requestBody);
    const token = localStorage.getItem("user");



    try {
        const response = await fetch(getApiUrl("/purchasedproducts"), {
          method: "POST",
          body: JSON.stringify(body),
          headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          }),        
        });
      
        const data = await response.json();

      if (response?.ok) {
        return { message: "purchased products got successfully", data };
      } else {
        console.error("Failed to add user:", data);
        return { message: "Failed to add user", error: data };
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return { message: "Internal Server Error", error };
    }
  }
  
  );



  
}
