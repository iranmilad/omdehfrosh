import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه

import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";


export default function Shop(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت داده‌های صفحه اصلی فروشگاه
  server.get(`${apiPrefix}/home`, async (schema, { requestBody }) => {
   
    const token = localStorage.getItem("user"); // Your auth token

    let categories = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallhomepagecategoriesbyuserid"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch categories");

      categories = await response.json();



    } catch (err) {
      console.error("Error fetching categories:", err);
      categories = []; // Fallback to empty array
    }

    let prices = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallpricelist"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch prices");

      prices = await response.json();



    } catch (err) {
      console.error("Error fetching prices:", err);
      prices = []; // Fallback to empty array
    }
   
    let widesliders = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallwidesliders"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch widesliders");

      widesliders = await response.json();



    } catch (err) {
      console.error("Error fetching prices:", err);
      widesliders = []; // Fallback to empty array
    }

        let fps = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallfeaturedproducts"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch fps");

      fps = await response.json();



    } catch (err) {
      console.error("Error fetching prices:", err);
      fps = []; // Fallback to empty array
    }

    let bannersd = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallbanners"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch banners");

      bannersd = await response.json();



    } catch (err) {
      console.error("Error fetching prices:", err);
      bannersd = []; // Fallback to empty array
    }

        let pg = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallproductgrids"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch pg");

      pg = await response.json();



    } catch (err) {
      console.error("Error fetching pg:", err);
      pg = []; // Fallback to empty array
    }


        let tp = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getalltrendingproducts"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch pg");

      tp = await response.json();



    } catch (err) {
      console.error("Error fetching tp:", err);
      tp = []; // Fallback to empty array
    }

        let br = [];

    try {
      const response = await fetch(getApiUrl("/homepage/getallbrands"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),      
      });

      if (!response.ok) throw new Error("Failed to fetch br");

      br = await response.json();



    } catch (err) {
      console.error("Error fetching br:", err);
      br = []; // Fallback to empty array
    }


    let data = [
        { type: "wideslider", data: widesliders},
        { type: "featured_promo", data: shuffleArray(fps) },
        { type: "categories", data: categories.filteredCategories },
        { type: "banners", data: bannersd },
        { type: "prices", data: prices },  
        { type: "featured_promo", data: shuffleArray(fps) },
        { type: "productGrid", data: pg },
        { type: "trendProducts", data: tp },
        { type: "brands", data: br },
        { type: "featured_products", data: shuffleArray(fps) }
    ];

    return { message: "ok", data };
});
}