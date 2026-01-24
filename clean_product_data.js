// Script to remove all _id fields from product JSON data

const productData = [
    {
        "general": {
            "slug": null,
            "title": "گوشی موبایل اپل مدل پرومکس دو سیم\u200c کارت نات اکتیو سیزده",
            "english_title": "iphone 13 pro 256 zaa black",
            "brandId": "brand0",
            "brandName": "apple",
            "brandNamePer": "اپل",
            "categoryName": "phone",
            "categoryNamePer": "موبایل",
            "categoryId": "category0",
            "subCategoryName": "smartphone",
            "subCategoryNamePer": "گوشی هوشمند",
            "subCategoryId": "category0-subCategory1",
            "addedToFavorite": true,
            "images": [
                "/static/image/1.812d88ff.webp",
                "/static/image/2.7f34a781.webp",
                "/static/image/3.8f0e971a.webp",
                "/static/image/4.df3f6e8e.webp",
                "/static/image/5.894dec69.webp"
            ],
            "description": "<p>توضیحات نمونه برای محصول 4</p>",
            "specifications": [
                {
                    "id": 1,
                    "category": "مشخصات کلی",
                    "items": [
                        {
                            "label": "ابعاد",
                            "value": "146.7 × 71.5 × 7.65 میلی\u200cمتر",
                        },
                        {
                            "label": "وزن",
                            "value": "204 گرم",
                        },
                        {
                            "label": "تعداد سیم\u200cکارت",
                            "value": "دو سیم\u200cکارت",
                        },
                        {
                            "label": "نوع سیم\u200cکارت",
                            "value": "نانو سیم و eSIM",
                        }
                    ],
                },
                {
                    "id": 2,
                    "category": "صفحه نمایش",
                    "items": [
                        {
                            "label": "اندازه",
                            "value": "6.1 اینچ",
                        },
                        {
                            "label": "رزولوشن",
                            "value": "2532 × 1170 پیکسل",
                        },
                        {
                            "label": "نوع صفحه نمایش",
                            "value": "Super Retina XDR OLED",
                        },
                        {
                            "label": "نرخ تازه\u200cسازی",
                            "value": "120 هرتز (ProMotion)",
                        },
                        {
                            "label": "تراکم پیکسل",
                            "value": "460 پیکسل در اینچ",
                        },
                        {
                            "label": "محافظت",
                            "value": "Ceramic Shield",
                        }
                    ],
                },
                {
                    "id": 3,
                    "category": "سخت\u200cافزار",
                    "items": [
                        {
                            "label": "پردازنده",
                            "value": "Apple A15 Bionic",
                            "_id": "6941c3c7ae4abb9e26ae55ea"
                        },
                        {
                            "label": "پردازنده گرافیکی",
                            "value": "Apple GPU (5 هسته\u200cای)",
                            "_id": "6941c3c7ae4abb9e26ae55eb"
                        },
                        {
                            "label": "حافظه RAM",
                            "value": "6 گیگابایت",
                            "_id": "6941c3c7ae4abb9e26ae55ec"
                        },
                        {
                            "label": "حافظه داخلی",
                            "value": "128/256/512 گیگابایت/1 ترابایت",
                            "_id": "6941c3c7ae4abb9e26ae55ed"
                        }
                    ],
                    "_id": "6941c3c7ae4abb9e26ae55e9"
                },
                {
                    "id": 4,
                    "category": "دوربین",
                    "items": [
                        {
                            "label": "دوربین اصلی",
                            "value": "سه دوربین 12 مگاپیکسل",
                            "_id": "6941c3c7ae4abb9e26ae55ef"
                        },
                        {
                            "label": "دوربین اصلی اول",
                            "value": "12 مگاپیکسل، دیافراگم f/1.5، لنز واید",
                            "_id": "6941c3c7ae4abb9e26ae55f0"
                        },
                        {
                            "label": "دوربین اصلی دوم",
                            "value": "12 مگاپیکسل، دیافراگم f/1.8، لنز اولترا واید",
                            "_id": "6941c3c7ae4abb9e26ae55f1"
                        },
                        {
                            "label": "دوربین اصلی سوم",
                            "value": "12 مگاپیکسل، دیافراگم f/2.8، تله\u200cفوتو، زوم اپتیکال 3 برابر",
                            "_id": "6941c3c7ae4abb9e26ae55f2"
                        },
                        {
                            "label": "ویدیو",
                            "value": "4K تا 60 فریم بر ثانیه، ProRes، سینمایی",
                            "_id": "6941c3c7ae4abb9e26ae55f3"
                        },
                        {
                            "label": "دوربین سلفی",
                            "value": "12 مگاپیکسل، دیافراگم f/2.2",
                            "_id": "6941c3c7ae4abb9e26ae55f4"
                        }
                    ],
                    "_id": "6941c3c7ae4abb9e26ae55ee"
                },
                {
                    "id": 5,
                    "category": "باتری",
                    "items": [
                        {
                            "label": "ظرفیت باتری",
                            "value": "3095 میلی\u200cآمپر ساعت",
                            "_id": "6941c3c7ae4abb9e26ae55f6"
                        },
                        {
                            "label": "شارژ سریع",
                            "value": "20 وات (50 درصد در 30 دقیقه)",
                            "_id": "6941c3c7ae4abb9e26ae55f7"
                        },
                        {
                            "label": "شارژ بی\u200cسیم",
                            "value": "MagSafe 15 وات، Qi 7.5 وات",
                            "_id": "6941c3c7ae4abb9e26ae55f8"
                        }
                    ],
                    "_id": "6941c3c7ae4abb9e26ae55f5"
                },
                {
                    "id": 6,
                    "category": "ارتباطات",
                    "items": [
                        {
                            "label": "شبکه",
                            "value": "5G، 4G LTE",
                            "_id": "6941c3c7ae4abb9e26ae55fa"
                        },
                        {
                            "label": "Wi-Fi",
                            "value": "Wi-Fi 6 (802.11ax)",
                            "_id": "6941c3c7ae4abb9e26ae55fb"
                        },
                        {
                            "label": "بلوتوث",
                            "value": "5.0",
                            "_id": "6941c3c7ae4abb9e26ae55fc"
                        },
                        {
                            "label": "NFC",
                            "value": "دارد",
                            "_id": "6941c3c7ae4abb9e26ae55fd"
                        }
                    ],
                    "_id": "6941c3c7ae4abb9e26ae55f9"
                },
                {
                    "id": 7,
                    "category": "سایر امکانات",
                    "items": [
                        {
                            "label": "سیستم عامل",
                            "value": "iOS 15 (قابل ارتقا)",
                            "_id": "6941c3c7ae4abb9e26ae55ff"
                        },
                        {
                            "label": "حسگر اثر انگشت",
                            "value": "ندارد",
                            "_id": "6941c3c7ae4abb9e26ae5600"
                        },
                        {
                            "label": "تشخیص چهره",
                            "value": "Face ID",
                            "_id": "6941c3c7ae4abb9e26ae5601"
                        },
                        {
                            "label": "مقاومت",
                            "value": "IP68 (تا 6 متر، 30 دقیقه)",
                            "_id": "6941c3c7ae4abb9e26ae5602"
                        },
                        {
                            "label": "سنسورها",
                            "value": "LiDAR، شتاب\u200cسنج، ژیروسکوپ، قطب\u200cنما، فشارسنج",
                            "_id": "6941c3c7ae4abb9e26ae5603"
                        }
                    ],
                    "_id": "6941c3c7ae4abb9e26ae55fe"
                }
            ],
            "priceHistory": [
                {
                    "date": "2024-02-01T00:00:00.000Z",
                    "minPrice": 900000,
                    "maxPrice": 1150000,
                    "_id": "6941c3c7ae4abb9e26ae5604"
                },
                {
                    "date": "2024-03-01T00:00:00.000Z",
                    "minPrice": 870000,
                    "maxPrice": 1100000,
                    "_id": "6941c3c7ae4abb9e26ae5605"
                },
                {
                    "date": "2024-04-01T00:00:00.000Z",
                    "minPrice": 880000,
                    "maxPrice": 1080000,
                    "_id": "6941c3c7ae4abb9e26ae5606"
                },
                {
                    "date": "2024-05-01T00:00:00.000Z",
                    "minPrice": 860000,
                    "maxPrice": 1050000,
                    "_id": "6941c3c7ae4abb9e26ae5607"
                },
                {
                    "date": "2024-01-01T00:00:00.000Z",
                    "minPrice": 950000,
                    "maxPrice": 1200000,
                    "_id": "6941c3c7ae4abb9e26ae5608"
                }
            ]
        },
        "_id": "6941c3c7ae4abb9e26ae55dc",
        "id": "brand0-category0-subCategory1-item0i0000",
        "options": [
            {
                "id": 1,
                "label": "رنگ",
                "slug": "color",
                "type": "color",
                "children": [
                    {
                        "id": 16,
                        "label": "صورتی",
                        "value": "#ff00ff",
                        "selected": true,
                        "_id": "6941c3c7ae4abb9e26ae560a"
                    },
                    {
                        "id": 17,
                        "label": "قرمز",
                        "value": "#ff0000",
                        "selected": false,
                        "_id": "6941c3c7ae4abb9e26ae560b"
                    },
                    {
                        "id": 33,
                        "label": "آبي",
                        "value": "#0000ff",
                        "selected": false,
                        "_id": "6941c3c7ae4abb9e26ae560c"
                    },
                    {
                        "id": 36,
                        "label": "سبز",
                        "value": "#00ff00",
                        "selected": false,
                        "_id": "6941c3c7ae4abb9e26ae560d"
                    }
                ],
                "_id": "6941c3c7ae4abb9e26ae5609"
            },
            {
                "id": 81,
                "label": "گارانتی",
                "slug": "warranty",
                "type": "select",
                "children": [
                    {
                        "id": 18,
                        "label": "گارانتی",
                        "value": "3 ماه",
                        "selected": true,
                        "_id": "6941c3c7ae4abb9e26ae560f"
                    },
                    {
                        "id": 19,
                        "label": "گارانتی",
                        "value": "4 ماه",
                        "selected": false,
                        "_id": "6941c3c7ae4abb9e26ae5610"
                    }
                ],
                "_id": "6941c3c7ae4abb9e26ae560e"
            }
        ],
        "combinations": [
            {
                "id": 19,
                "selected": true,
                "options": [
                    {
                        "id": 16,
                        "value": "#ff00ff",
                        "attribute_name": "رنگ",
                        "type": "color",
                        "attribute_id": 1,
                        "_id": "6941c3c7ae4abb9e26ae5612"
                    },
                    {
                        "id": 18,
                        "value": "3 ماه",
                        "attribute_name": "گارانتی",
                        "type": "warranty",
                        "attribute_id": 81,
                        "_id": "6941c3c7ae4abb9e26ae5613"
                    }
                ],
                "suppliers": [
                    {
                        "price": {
                            "regularPrice": 123,
                            "discountedPrice": 950000,
                            "discountPercent": null,
                            "foreignCurrencyPrice": 434,
                            "secondaryCost": 124,
                            "percentagePrice1": 13,
                            "percentagePrice2": 142,
                            "percentagePrice3": 12,
                            "ICPrice": []
                        },
                        "id": 1,
                        "name": "دیجی کالا",
                        "action": 3,
                        "deliveryTime": {
                            "label": "کمتر از 3 روز",
                            "value": "in3days"
                        },
                        "images": [],
                        "psid": "brand0-category0-subCategory1-item0i0000-c19-s1",
                        "shortName": "applepromaxk4z8n",
                        "payment_type": "Credit",
                        "delivery": [
                            {
                                "locationName": "Shiraz",
                                "locationId": 0,
                                "locationLabel": "شیراز"
                            },
                            {
                                "locationName": "Mashhad",
                                "locationId": 3,
                                "locationLabel": "مشهد"
                            },
                            {
                                "locationName": "Qom",
                                "locationId": 6,
                                "locationLabel": "قم"
                            },
                            {
                                "locationName": "Ahvaz",
                                "locationId": 5,
                                "locationLabel": "اهواز"
                            },
                            {
                                "locationName": "Tabriz",
                                "locationId": 4,
                                "locationLabel": "تبریز"
                            },
                            {
                                "locationName": "Karaj",
                                "locationId": 7,
                                "locationLabel": "کرج"
                            },
                            {
                                "locationName": "Kermanshah",
                                "locationId": 9,
                                "locationLabel": "کرمانشاه"
                            },
                            {
                                "locationName": "Rasht",
                                "locationId": 8,
                                "locationLabel": "رشت"
                            }
                        ],
                        "buy_type": "Retail",
                        "sku": "SKU-001",
                        "stock": 11,
                        "minOrder": 22,
                        "maxOrder": 23,
                        "rating": "4.50",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": true,
                        "special_offer": "1404-12-29T00:00:00.000Z",
                        "_id": "6941c3c7ae4abb9e26ae5614"
                    },
                    {
                        "price": {
                            "regularPrice": 1606,
                            "discountedPrice": 1879,
                            "discountPercent": null,
                            "ICPrice": [
                                {
                                    "ICID": "IC1",
                                    "label": "usd",
                                    "name": "دلار آمریکا",
                                    "amount": 10,
                                    "_id": "6941c3c7ae4abb9e26ae5618"
                                },
                                {
                                    "ICID": "IC2",
                                    "label": "AED",
                                    "name": "دینار امارات",
                                    "amount": 250,
                                    "_id": "6941c3c7ae4abb9e26ae5619"
                                }
                            ],
                            "foreignCurrencyPrice": 0,
                            "secondaryCost": 0,
                            "percentagePrice1": 0,
                            "percentagePrice2": 0,
                            "percentagePrice3": 0
                        },
                        "id": 2,
                        "name": "تک اسیا",
                        "action": 3,
                        "deliveryTime": {
                            "label": "کمتر از 1 روز",
                            "value": "in1day"
                        },
                        "images": [],
                        "psid": "brand0-category0-subCategory1-item0i0000-c19-s2",
                        "shortName": "applepromaxk4z8a",
                        "payment_type": "Credit",
                        "delivery": [
                            {
                                "locationName": "Shiraz",
                                "locationId": 0,
                                "locationLabel": "شیراز"
                            },
                            {
                                "locationName": "Esfahan",
                                "locationId": 1,
                                "locationLabel": "اصفهان"
                            }
                        ],
                        "buy_type": "Wholesale",
                        "sku": "SKU-002",
                        "stock": 15,
                        "minOrder": 2,
                        "maxOrder": 150,
                        "rating": "4.80",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": false,
                        "special_offer": "1404-12-29T00:00:00.000Z",
                        "_id": "6941c3c7ae4abb9e26ae5617"
                    },
                    {
                        "price": {
                            "regularPrice": 123,
                            "discountedPrice": 950000,
                            "discountPercent": null,
                            "foreignCurrencyPrice": 434,
                            "secondaryCost": 124,
                            "percentagePrice1": 13,
                            "percentagePrice2": 142,
                            "percentagePrice3": 12,
                            "ICPrice": []
                        },
                        "id": 1,
                        "name": "دیجی کالا",
                        "action": 3,
                        "deliveryTime": {
                            "label": "کمتر از 3 روز",
                            "value": "in3days"
                        },
                        "images": [],
                        "psid": "brand0-category0-subCategory1-item0i0000-c19-s1",
                        "shortName": "applepromaxk4z8v",
                        "payment_type": "Credit",
                        "delivery": [
                            {
                                "locationName": "Shiraz",
                                "locationId": 0,
                                "locationLabel": "شیراز"
                            },
                            {
                                "locationName": "Mashhad",
                                "locationId": 3,
                                "locationLabel": "مشهد"
                            },
                            {
                                "locationName": "Qom",
                                "locationId": 6,
                                "locationLabel": "قم"
                            },
                            {
                                "locationName": "Ahvaz",
                                "locationId": 5,
                                "locationLabel": "اهواز"
                            },
                            {
                                "locationName": "Tabriz",
                                "locationId": 4,
                                "locationLabel": "تبریز"
                            },
                            {
                                "locationName": "Karaj",
                                "locationId": 7,
                                "locationLabel": "کرج"
                            },
                            {
                                "locationName": "Kermanshah",
                                "locationId": 9,
                                "locationLabel": "کرمانشاه"
                            },
                            {
                                "locationName": "Rasht",
                                "locationId": 8,
                                "locationLabel": "رشت"
                            }
                        ],
                        "buy_type": "Retail",
                        "sku": "SKU-001",
                        "stock": 11,
                        "minOrder": 22,
                        "maxOrder": 23,
                        "rating": "4.50",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": true,
                        "special_offer": "1404-12-29T00:00:00.000Z",
                        "_id": "6941c3c7ae4abb9e26ae561a"
                    }
                ],
                "_id": "6941c3c7ae4abb9e26ae5611"
            },
            {
                "id": 20,
                "selected": false,
                "options": [
                    {
                        "id": 16,
                        "value": "#ff00ff",
                        "attribute_name": "رنگ",
                        "type": "color",
                        "attribute_id": 1,
                        "_id": "6941c3c7ae4abb9e26ae561e"
                    },
                    {
                        "id": 19,
                        "value": "پلاستیک",
                        "attribute_name": "جنس",
                        "type": "material",
                        "attribute_id": 81,
                        "_id": "6941c3c7ae4abb9e26ae561f"
                    }
                ],
                "suppliers": [
                    {
                        "price": {
                            "regularPrice": 1606,
                            "discountedPrice": 1879,
                            "discountPercent": null,
                            "ICPrice": [
                                {
                                    "ICID": "IC1",
                                    "label": "usd",
                                    "name": "دلار آمریکا",
                                    "amount": 10,
                                    "_id": "6941c3c7ae4abb9e26ae5621"
                                },
                                {
                                    "ICID": "IC2",
                                    "label": "AED",
                                    "name": "دینار امارات",
                                    "amount": 250,
                                    "_id": "6941c3c7ae4abb9e26ae5622"
                                }
                            ],
                            "foreignCurrencyPrice": 0,
                            "secondaryCost": 0,
                            "percentagePrice1": 0,
                            "percentagePrice2": 0,
                            "percentagePrice3": 0
                        },
                        "id": 4,
                        "name": "ترب",
                        "action": 3,
                        "deliveryTime": {
                            "label": "کمتر از یک هفته",
                            "value": "in1week"
                        },
                        "images": [],
                        "psid": "brand0-category0-subCategory1-item0i0000-c20-s4",
                        "shortName": "applepromaxk4z8q",
                        "payment_type": "Credit",
                        "delivery": [
                            {
                                "locationName": "Shiraz",
                                "locationId": 0,
                                "locationLabel": "شیراز"
                            },
                            {
                                "locationName": "Esfahan",
                                "locationId": 1,
                                "locationLabel": "اصفهان"
                            }
                        ],
                        "buy_type": "Wholesale",
                        "sku": "SKU-002",
                        "stock": 15,
                        "minOrder": 2,
                        "maxOrder": 150,
                        "rating": "4.80",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": false,
                        "special_offer": "1404-12-29T00:00:00.000Z",
                        "_id": "6941c3c7ae4abb9e26ae5620"
                    }
                ],
                "_id": "6941c3c7ae4abb9e26ae561d"
            },
            {
                "id": 21,
                "selected": false,
                "options": [
                    {
                        "id": 17,
                        "value": "#ff0000",
                        "attribute_name": "رنگ",
                        "type": "color",
                        "attribute_id": 1,
                        "_id": "6941c3c7ae4abb9e26ae5624"
                    },
                    {
                        "id": 18,
                        "value": "فلزی",
                        "attribute_name": "جنس",
                        "type": "material",
                        "attribute_id": 81,
                        "_id": "6941c3c7ae4abb9e26ae5625"
                    }
                ],
                "suppliers": [
                    {
                        "price": {
                            "regularPrice": 1459,
                            "discountedPrice": 1735,
                            "discountPercent": null,
                            "ICPrice": [
                                {
                                    "ICID": "IC1",
                                    "label": "usd",
                                    "name": "دلار آمریکا",
                                    "amount": 10,
                                    "_id": "6941c3c7ae4abb9e26ae5627"
                                },
                                {
                                    "ICID": "IC2",
                                    "label": "AED",
                                    "name": "دینار امارات",
                                    "amount": 250,
                                    "_id": "6941c3c7ae4abb9e26ae5628"
                                }
                            ],
                            "foreignCurrencyPrice": 0,
                            "secondaryCost": 0,
                            "percentagePrice1": 0,
                            "percentagePrice2": 0,
                            "percentagePrice3": 0
                        },
                        "id": 1,
                        "name": "دیجی کالا",
                        "action": 3,
                        "deliveryTime": {
                            "label": "کمتر از 1 روز",
                            "value": "in1day"
                        },
                        "images": [],
                        "psid": "brand0-category0-subCategory1-item0i0000-c21-s1",
                        "shortName": "applepromaxk4z8b",
                        "payment_type": "Cash",
                        "delivery": [
                            {
                                "locationName": "Shiraz",
                                "locationId": 0,
                                "locationLabel": "شیراز"
                            },
                            {
                                "locationName": "Esfahan",
                                "locationId": 1,
                                "locationLabel": "اصفهان"
                            }
                        ],
                        "buy_type": "Retail",
                        "sku": "SKU-001",
                        "stock": 10,
                        "minOrder": 1,
                        "maxOrder": 46,
                        "rating": "4.50",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": false,
                        "special_offer": null,
                        "_id": "6941c3c7ae4abb9e26ae5626"
                    }
                ],
                "_id": "6941c3c7ae4abb9e26ae5623"
            }
        ],
        "__v": 0
    }
];

// Function to recursively remove all _id fields
function removeAllIdFields(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => removeAllIdFields(item));
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
        const newObj = {};
        for (const key in obj) {
            // Skip _id and __v fields
            if (key !== '_id' && key !== '__v') {
                newObj[key] = removeAllIdFields(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

// Clean the data
const cleanedData = removeAllIdFields(productData);

// Write to file
const fs = require('fs');
fs.writeFileSync('cleaned_product_data.json', JSON.stringify(cleanedData, null, 2), 'utf8');
console.log('Cleaned product data saved to cleaned_product_data.json');
