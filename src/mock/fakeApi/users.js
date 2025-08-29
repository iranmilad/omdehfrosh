import getHttpCodeMessage from "../../Libs/httpcodes/httpcodes";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import Product1 from "../../assets/products/1.webp"; // ایمپورت تصویر محصول

export default function Users(server, apiPrefix) {

  // اضافه کردن کاربر جدید
  server.post(`${apiPrefix}/users/add`, async (schema, request) => {

    try {
      const requestBody = JSON.parse(request.requestBody);

      // Fake user data
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

      // ارسال درخواست به API خارجی
      const response = await fetch(getApiUrl("/users/add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fakeUser), // <-- Use fakeUser here
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

  server.post(`${apiPrefix}/users`, async (schema, { requestBody }) => {

    
    let body = JSON.parse(requestBody);


    try {
        const response = await fetch(getApiUrl("/users"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      
        const data = await response.json();

      if (response?.ok) {
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

  server.post(`${apiPrefix}/users/getuserinfo`, async (schema, {requestBody}) => {

    let body = JSON.parse(requestBody);

    const token = localStorage.getItem("user");

    try {

      // ارسال درخواست به API خارجی
      const response = await fetch(getApiUrl("/users/getuserinfo"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),         });

      const data = await response.json();

      if (response.ok) {
        return { message: "User Info Retrieved successfully", data };
      } else {
        console.error("Failed to Retrieve User Info", data);
        return { message: "Failed to Retrieve User Info", error: data };
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return { message: "Internal Server Error", error };
    }
  }
  
  );

  server.post(`${apiPrefix}/users/update`, async (schema, {requestBody}) => {

    const token = localStorage.getItem("user");

    let body = JSON.parse(requestBody);

    try {

      // ارسال درخواست به API خارجی
      const response = await fetch(getApiUrl("/users/update"), {
        method: "POST",
        body: JSON.stringify(body), // <-- Use fakeUser here
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),               
      });

	  
			const text = await response.text(); // get raw response first
			const data = text ? JSON.parse(text) : null; // parse only if not empty
		
			if (!response.ok) {
			  const error = {
				status: response.status,
				message: data?.message || getHttpCodeMessage(response.status),
			  };
		
			  return {
				message: "خطایی در ویرایش اطلاعات کاربر رخ داده است",
				error,
			  };
			}

			return { message: "موفقیت در ویرایش اطلاعات کاربر", data};


    } catch (error) {
      console.error("Error processing request:", error);
      return { message: "Internal Server Error", error };
    }
  }
  
  );

server.get(`${apiPrefix}/users/userstockalertinfoget/:product_id`, async (schema, request) => {
  const token = localStorage.getItem("user");
  const product_id = request.params.product_id; // Extract product_id from URL parameters

  try {
    const response = await fetch(getApiUrl(`/users/userstockalertinfoget/${product_id}`), {
      method: "GET",
      headers: new Headers({
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json"      
      }),              
    });
  
    const data = await response.json();

    if (response?.ok) {
      return { message: "Get User Info successful", data };
    } else {
      console.error("Failed to Get User Info:", data);
      return { message: "Failed to Get User Info", error: data };
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return { message: "Internal Server Error", error };
  }
});
  
  server.post(`${apiPrefix}/users/userstockalertinfoset`, async (schema, { requestBody }) => {
    let body = JSON.parse(requestBody);
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/users/userstockalertinfoset"), {
        method: "POST",
          headers: new Headers({
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          }),  
          body: JSON.stringify(body),
        });

        const data = await response.json();

      if (response?.ok) {
        return { message: "Set User Info successfull", data };
      } else {
        console.error("Failed to Set User Info:", data);
        return { message: "Failed to Set User Info", error: data };
      }
    } catch (error) {
      console.error("Error processing request:", error);
      return { message: "Internal Server Error", error };
    }
  }
  
  );

server.get(`${apiPrefix}/users/userstockalertinforemove/:product_id`, async (schema, request) => {
  const token = localStorage.getItem("user");
  const product_id = request.params.product_id; // Extract product_id from URL parameters

  try {
    const response = await fetch(getApiUrl(`/users/userstockalertinforemove/${product_id}`), {
      method: "GET",
      headers: new Headers({
        'Authorization': `Bearer ${token}`, 
        "Content-Type": "application/json"      
      }),                
    });
  
    const data = await response.json();

    if (response?.ok) {
      return { message: "Remove User Info successful", data };
    } else {
      console.error("Failed to Remove User Info:", data);
      return { message: "Failed to Remove User Info", error: data };
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return { message: "Internal Server Error", error };
  }
});
  

}
