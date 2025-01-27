function gen() {
    // Generate a random number of nodes between 5 and 50
    const randomNodeCount = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
  
    const nodes = Array(randomNodeCount).fill().map((_, index) => ({
      id: index.toString(),
      image: "https://placehold.co/600x400",
      name: `آیفون 13 - ${index}`,
      price: "25000000",
      stock: "1",
      minOrder: "2",
      seller: "2",
      deliveryTime: "3",
      action: 3,
      nodes: Array(3).fill().map((_, nodeIndex) => ({
        id: `${index}-${nodeIndex}`,
        image: "https://placehold.co/600x400",
        name: `256 گیگابایت - ${nodeIndex}`,
        price: "25000000",
        stock: "1",
        minOrder: "2",
        seller: "2",
        deliveryTime: "3",
        action: 3,
        nodes: null,
      })), // No nested nodes for simplicity
    }));
  
    return nodes
  }

export default function Fastorder(server, apiPrefix) {
    // لیست دسته‌بندی‌ها و برندها
    const categories = [
      {
        id: "1",
        title: "موبایل",
        image: "https://dkstatics-public.digikala.com/digikala-mega-menu/25804b8cb794b9ff36002f37117c4d84764d0475_1733131384.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80"
      },
      {
        id: "2",
        title: "کالای دیجیتال",
        image: "https://dkstatics-public.digikala.com/digikala-mega-menu/811055abd27571021d484336b05c3d867993cc4f_1733131393.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80"
      },
      {
        id: "3",
        title: "لوازم برقی",
        image: "https://dkstatics-public.digikala.com/digikala-mega-menu/cf66c8ecfdd57549773cc7fd379d7b73cdfebf5a_1733131436.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80"
      },
      {
        id: "4",
        title: "لوازم برقی",
        image: "https://dkstatics-public.digikala.com/digikala-mega-menu/92bd44f2cdb518e533c6bb4d52ea68c3d741f4ea_1733131423.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80"
      },
    ];

    const productTypes = [
        { id: "1", title: "لپ تاپ", image: "https://dkstatics-public.digikala.com/digikala-products/e5dfffed0fe58135b9787887394f4db17be8c5dc_1693397601.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60" },
        { id: "2", title: "تبلت", image: "https://dkstatics-public.digikala.com/digikala-products/f7647791375e7c175b6cfa22d08b5cf50e7c0f81_1712494986.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60" },
        { id: "3", title: "مانیتور", image: "https://dkstatics-public.digikala.com/digikala-products/c9ef18d2dd6445b1a508d1c4237fe6e8dd42d381_1668864213.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60" },
        { id: "4", title: "کنسول خانگی", image: "https://dkstatics-public.digikala.com/digikala-products/1d528607d530a07042e4dfe0df8f0f4086478989_1701611579.jpg?x-oss-process=image/resize,m_lfit,h_350,w_350/quality,q_60" },
    ]
  
    const brands = [
      { id: "1", title: "اپل", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/1a9b7e344205953e482625782e6693e237ee7099_1731404907.png?x-oss-process=image/format,webp" },
      { id: "2", title: "سامسونگ", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/234d00c2b4803551864ce467c5cee07eac731a8e_1731404906.png?x-oss-process=image/format,webp" },
      { id: "3", title: "آنر", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/7306ec396ec8a92a98bfa2e8ae904b1fee415cdd_1731404906.png?x-oss-process=image/format,webp" },
      { id: "4", title: "شیائومی", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/00ddd248586c51028dc181ee3eee8bcb9ec87483_1731404907.png?x-oss-process=image/format,webp" },
    ];
  
    // ای‌پی‌آی برای دریافت دسته‌بندی‌ها
    server.post(`${apiPrefix}/fastorder/category`, (schema, { requestBody }) => {
        const {searchType,subCategory,parent} = JSON.parse(requestBody);
        let data = {};
        if(searchType === "brand"){
            data.brands = brands;
            data.products = gen();
            if(parent && parent?.length > 0){
                let items = parent.map(i => categories.find(item2 => String(item2.id) === String(i)));
                data.categories = items;
            }
        }
        else if(searchType === "category"){
            data.category = categories;
            data.products = gen();
            if(parent && parent?.length > 0){
                let items = parent.map(i => productTypes.find(item2 => String(item2.id) === String(i)));
                data.subCategory = items;
                if(subCategory && subCategory?.length > 0){
                    let newBrands = subCategory.map(i => brands.find(item2 => String(item2.id) === String(i)));
                    data.brands = newBrands;
                }
            }
        }
  
      return {
        message: "ok",
        data
      };
    });
  }
  