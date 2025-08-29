import Product1 from "../../assets/products/1.webp";

export const commentTexts = [
    "محصول عالی بود، کاملاً راضی هستم!",
    "کیفیت ساخت بسیار بالا، من خیلی خوشحالم که این رو خریدم.",
    "مورد پسند من نبود، متاسفانه برای من مناسب نبود.",
    "ارسال سریع بود و بسته بندی خوبی داشت.",
    "انتظارم از محصول بیشتر بود، اما در کل خوب بود.",
    "دقیقاً همون چیزی که نیاز داشتم.",
    "کاملاً برام مفید بود و راضی هستم.",
    "متاسفانه کالا با تصویر متفاوت بود.",
    "محصول خیلی باکیفیتی بود، حتماً دوباره میخرم.",
    "همه چیز عالی بود به جز کمی تاخیر در ارسال.",
    "قیمت مناسب و کیفیت خوب، توصیه می‌کنم.",
    "خریدم و هیچ مشکلی نداشتم، خیلی خوب بود.",
    "اصلاً فکر نمی‌کردم اینقدر راضی باشم.",
    "کاملاً با توضیحات مطابقت داشت.",
    "برای استفاده روزمره عالیه، ارزش خرید داره."
  ];

 export const c = [
    {
      productId: "brand0-category0-subCategory1-item0i0000",
      productCombinations: [
        {
          combinationId: 19,
          suppliers: [
            {
              supplierId: 1, 
              supplierName: "دیجی کالا",
              comments: [
                {
                  commentId: "pid126-comid19-sid1-cid2", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3", // امتیاز کاربر
                  status: "agreed",
                  commentText: "بد بود"
                },
                {
                  commentId: "pid126-comid19-sid1-cid3", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "2", // امتیاز کاربر
                  status: "agreed",
                  commentText: "عالی بود"
                },
                {
                  commentId: "pid126-comid19-sid1-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "4", // امتیاز کاربر
                  status: "agreed",
                  commentText: "خوب بود"
                }
              ]
            },
            {
              supplierId: 9, 
              supplierName: "مشهد کالا",
              comments: [
                {
                  commentId: "pid126-comid19-sid9-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3.5", // امتیاز کاربر
                  status: "agreed",
                  commentText: "دیر رسید"
                }
              ]
            },
            {
              supplierId: 3, 
              supplierName: "زنبیل",
              comments: [
                {
                  commentId: "pid126-comid19-sid3-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3", // امتیاز کاربر
                  status: "agreed",
                  commentText: "سریعتر بفرستید"
                }
              ]
            }
          ],
        },
        {
          combinationId: 21,
          suppliers: [
            {
              supplierId: 1, 
              supplierName: "دیجی کالا",
              comments: [
                {
                  commentId: "pid126-comid21-sid1-cid2", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3", // امتیاز کاربر
                  status: "agreed",
                  commentText: "بدک بود"
                },
                {
                  commentId: "pid126-comid21-sid1-cid3", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "2", // امتیاز کاربر
                  status: "agreed",
                  commentText: "بود نبود"
                },
                {
                  commentId: "pid126-comid21-sid1-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "4", // امتیاز کاربر
                  status: "agreed",
                  commentText: "معلوم نیست چی فرستادن"
                }
              ]
            },
            {
              supplierId: 9, 
              supplierName: "مشهد کالا",
              comments: [
                {
                  commentId: "pid126-comid21-sid9-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3.5", // امتیاز کاربر
                  status: "agreed",
                  commentText: "دیر رسید"
                }
              ]
            },
            {
              supplierId: 3, 
              supplierName: "زنبیل",
              comments: [
                {
                  commentId: "pid126-comid21-sid3-cid1", 
                  name: "فرهاد باقری", // نام کاربر
                  date: "15 آبان 1403", // تاریخ نظر
                  rating: "3", // امتیاز کاربر
                  status: "agreed",
                  commentText: "سریعتر بفرستید"
                }
              ]
            }
          ],
        }
      ]
      }
  ]
  
export let comments = {
    rating: "3", // میانگین امتیاز نظرات
    count: 20, // تعداد نظرات نمایش داده شده
    total: 200, // کل نظرات
    comments: [
      {
        name: "فرهاد باقری", // نام کاربر
        date: "15 آبان 1403", // تاریخ نظر
        rating: "4", // امتیاز کاربر
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)], // متن نظر (تصادفی)
        status: "agreed", // وضعیت نظر (موافق/مخالف)
        product: { // اطلاعات محصول مرتبط با نظر
          image: Product1,
          title: "آیفون 16 نرمال"
        }
      },
      // سایر نظرات به همین شکل اضافه می‌شوند
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "سامسونگ S24 Ultra 256"
        }
      },
      {
        name: "سارا احمدی",
        date: "16 آبان 1403",
        rating: "5",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "پیکسل 9"
        }
      },
      {
        name: "سینا توکلی",
        date: "17 آبان 1403",
        rating: "3",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "شیائومی می 13"
        }
      },
      {
        name: "لیلا حسینی",
        date: "18 آبان 1403",
        rating: "4",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "گوشی سامسونگ A54"
        }
      },
      {
        name: "محمود رضایی",
        date: "19 آبان 1403",
        rating: "5",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "هوآوی پی 50 پرو"
        }
      },
      {
        name: "آیدا شاهی",
        date: "20 آبان 1403",
        rating: "4",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "اپل واچ 8"
        }
      },
      {
        name: "آرش زمانی",
        date: "21 آبان 1403",
        rating: "5",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "لپ‌تاپ لنوو مدل Y700"
        }
      },
      {
        name: "زهره موسوی",
        date: "22 آبان 1403",
        rating: "2",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "disagreed",
        product: {
          image: Product1,
          title: "لپ‌تاپ ایسوس X512"
        }
      },
      {
        name: "محمد جعفری",
        date: "23 آبان 1403",
        rating: "3",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "کنسول بازی پلی استیشن 5"
        }
      },
      {
        name: "مهسا فرامرزی",
        date: "24 آبان 1403",
        rating: "4",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "تلویزیون سامسونگ 65 اینچ"
        }
      },
      {
        name: "رضا اکبری",
        date: "25 آبان 1403",
        rating: "5",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "دوربین کانن EOS R"
        }
      },
      {
        name: "فاطمه نظری",
        date: "26 آبان 1403",
        rating: "4",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "agreed",
        product: {
          image: Product1,
          title: "یخچال ساید بای ساید ال جی"
        }
      },
      {
        name: "امیر حسین غفوری",
        date: "27 آبان 1403",
        rating: "3",
        comment: commentTexts[Math.floor(Math.random() * commentTexts.length)],
        status: "disagreed",
        product: {
          image: Product1,
          title: "ماشین لباسشویی بوش"
        }
      }
    ]
  };

export const cc = [
  {
        "productId": "brand0-category0-subCategory1-item0i0000",
                "comments": [
                    {
                        "commentId": "pid126-comid19-sid1-cid2",
                        "name": "فرهاد باقری",
                        "date": "15 آبان 1403",
                        "rating": "3",
                        "status": "agreed",
                        "commentText": "بد بود",
                        "_id": "67e8030f60352647680d1b77",
                        "supplierName": "دیجی کالا",
                        "supplierId": 1,
                    },
                    {
                        "commentId": "pid126-comid19-sid1-cid3",
                        "name": "فرهاد باقری",
                        "date": "15 آبان 1403",
                        "rating": "2",
                        "status": "agreed",
                        "commentText": "عالی بود",
                        "_id": "67e8030f60352647680d1b78",
                        "supplierName": "دیجی کالا",
                        "supplierId": 1,
                    },
                    {
                        "commentId": "pid126-comid19-sid1-cid1",
                        "name": "فرهاد باقری",
                        "date": "15 آبان 1403",
                        "rating": "4",
                        "status": "agreed",
                        "commentText": "خوب بود",
                        "_id": "67e8030f60352647680d1b79",
                        "supplierName": "دیجی کالا",
                        "supplierId": 1,
                    },
                    {
                        "commentId": "pid126-comid19-sid9-cid1",
                        "name": "فرهاد باقری",
                        "date": "15 آبان 1403",
                        "rating": "3.5",
                        "status": "agreed",
                        "commentText": "دیر رسید",
                        "_id": "67e8030f60352647680d1b7b",
                        "supplierName": "مشهد کالا",
                        "supplierId": 9,
                    },
                    {
                        "commentId": "pid126-comid19-sid3-cid1",
                        "name": "فرهاد باقری",
                        "date": "15 آبان 1403",
                        "rating": "3",
                        "status": "agreed",
                        "commentText": "سریعتر بفرستید",
                        "_id": "67e8030f60352647680d1b7d",
                        "supplierName": "زنبیل",
                        "supplierId": 3,
                    }
                ],
                "suppliers": [
                    {
                        "supplierId": 1,
                        "supplierName": "دیجی کالا",
                        "commentsCount": 3,
                        "averageRating": 108
                    },
                    {
                        "supplierId": 9,
                        "supplierName": "مشهد کالا",
                        "commentsCount": 1,
                        "averageRating": 3.5
                    },
                    {
                        "supplierId": 3,
                        "supplierName": "زنبیل",
                        "commentsCount": 1,
                        "averageRating": 3
                    }
                ],
                "totalComments": 5,
                "averageRating": 648.7
            },
          
        ]