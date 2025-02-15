function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function gen() {
    const brands = [
        { label: "آیفون", key: "apple" },
        { label: "سامسونگ", key: "samsung" }
    ];

    const allNodes = brands.map(brand => ({
        label: brand.label,
        items: Array(5).fill().map((_, index) => ({
            id: generatePassword(),
            image: "https://placehold.co/600x400",
            name: `${brand.label} مدل ${index}<br/>شیراز`,
            price: "25",
            stock: "1",
            minOrder: "2",
            seller: {
                id: 1,
                label: "دیجیکالا"
            },
            attributes: [
                {
                    id: 1,
                    label: "آبی",
                    type: 'color',
                    value: '#2b7fff'
                },
                {
                    id: 2,
                    label: "گارانتی 3 ماهه",
                    type: "warranty"
                }
            ],
            deliveryTime: "3",
            action: 3,
            nodes: Array(3).fill().map((_, nodeIndex) => ({
                id: generatePassword(),
                image: "https://placehold.co/600x400",
                name: `256 گیگابایت - ${nodeIndex}`,
                price: "25",
                stock: "1",
                minOrder: "2",
                seller: {
                    id: 1,
                    label: "دیجیکالا"
                },
                attributes: [
                    {
                        id: 1,
                        label: "قرمز",
                        type: 'color',
                        value: '#fb2c36'
                    },
                    {
                        id: 2,
                        label: "گارانتی 3 ماهه",
                        type: "warranty"
                    }
                ],
                deliveryTime: "3",
                action: 3,
                nodes: null,
            }))
        }))
    }));

    return {
        products: allNodes,
    };
}

export default function Fastorder(server, apiPrefix) {
  const categories = [
      { id: "1", title: "موبایل", image: "https://dkstatics-public.digikala.com/digikala-mega-menu/25804b8cb794b9ff36002f37117c4d84764d0475_1733131384.png" },
      { id: "2", title: "کالای دیجیتال", image: "https://dkstatics-public.digikala.com/digikala-mega-menu/811055abd27571021d484336b05c3d867993cc4f_1733131393.png" },
      { id: "3", title: "لوازم برقی", image: "https://dkstatics-public.digikala.com/digikala-mega-menu/cf66c8ecfdd57549773cc7fd379d7b73cdfebf5a_1733131436.png" },
      { id: "4", title: "لوازم برقی", image: "https://dkstatics-public.digikala.com/digikala-mega-menu/92bd44f2cdb518e533c6bb4d52ea68c3d741f4ea_1733131423.png" },
  ];

  const productTypes = [
      { id: "1", title: "لپ تاپ", image: "https://dkstatics-public.digikala.com/digikala-products/e5dfffed0fe58135b9787887394f4db17be8c5dc_1693397601.jpg" },
      { id: "2", title: "تبلت", image: "https://dkstatics-public.digikala.com/digikala-products/f7647791375e7c175b6cfa22d08b5cf50e7c0f81_1712494986.jpg" },
      { id: "3", title: "مانیتور", image: "https://dkstatics-public.digikala.com/digikala-products/c9ef18d2dd6445b1a508d1c4237fe6e8dd42d381_1668864213.jpg" },
      { id: "4", title: "کنسول خانگی", image: "https://dkstatics-public.digikala.com/digikala-products/1d528607d530a07042e4dfe0df8f0f4086478989_1701611579.jpg" },
  ];

  const brands = [
      { id: "1", title: "اپل", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/1a9b7e344205953e482625782e6693e237ee7099_1731404907.png" },
      { id: "2", title: "سامسونگ", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/234d00c2b4803551864ce467c5cee07eac731a8e_1731404906.png" },
      { id: "3", title: "آنر", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/7306ec396ec8a92a98bfa2e8ae904b1fee415cdd_1731404906.png" },
      { id: "4", title: "شیائومی", image: "https://dkstatics-public.digikala.com/digikala-admin-landing/00ddd248586c51028dc181ee3eee8bcb9ec87483_1731404907.png" },
  ];

  server.post(`${apiPrefix}/fastorder`, (schema, { requestBody }) => {
      const { searchType, subCategory, parent, pageSize = 10, currentPage = 1 } = JSON.parse(requestBody);
      let data = {};

      if (searchType === "brand") {
          data.brands = brands;
          const { products, totalItems } = gen(pageSize, currentPage);
          data.products = products;
          data.totalItems = totalItems;

          if (parent && parent.length > 0) {
              let items = parent.map(i => categories.find(item2 => String(item2.id) === String(i)));
              data.categories = items;
          }
      } else if (searchType === "category") {
          data.category = categories;
          const { products, totalItems } = gen(pageSize, currentPage);
          data.products = products;
          data.totalItems = totalItems;

          if (parent && parent.length > 0) {
              let items = parent.map(i => productTypes.find(item2 => String(item2.id) === String(i)));
              data.subCategory = items;

              if (subCategory && subCategory.length > 0) {
                  let newBrands = subCategory.map(i => brands.find(item2 => String(item2.id) === String(i)));
                  data.brands = newBrands;
              }
          }
      }

      return {
          message: "ok",
          data,
      };
  });
}
