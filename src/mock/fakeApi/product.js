import Image1 from "../../assets/products/1.webp";
import Image2 from "../../assets/products/2.webp";
import Image3 from "../../assets/products/3.webp";
import Image4 from "../../assets/products/4.webp";
import Image5 from "../../assets/products/5.webp";

import Image6 from "../../assets/products/brand0-category0-subCategory0-item0i0001/1.jpg"
import Image7 from "../../assets/products/brand0-category0-subCategory0-item0i0001/2.webp"
import Image8 from "../../assets/products/brand0-category0-subCategory0-item0i0001/3.jpg"

import Image9 from "../../assets/products/brand0-category0-subCategory0-item0i0002/1.jpg"
import Image10 from "../../assets/products/brand0-category0-subCategory0-item0i0002/2.jpg"
import Image11 from "../../assets/products/brand0-category0-subCategory0-item0i0002/3.jpg"

import Image12 from "../../assets/products/brand0-category0-subCategory0-item0i0004/1.jpg"
import Image13 from "../../assets/products/brand0-category0-subCategory0-item0i0004/2.jpg"
import Image14 from "../../assets/products/brand0-category0-subCategory0-item0i0004/3.jpg"

import Image15 from "../../assets/products/brand0-category0-subCategory0-item0i0003/1.avif"
import Image16 from "../../assets/products/brand0-category0-subCategory0-item0i0003/2.avif"
import Image17 from "../../assets/products/brand0-category0-subCategory0-item0i0003/3.avif"

import Image18 from "../../assets/products/brand0-category0-subCategory0-item0i0005/1.webp"
import Image19 from "../../assets/products/brand0-category0-subCategory0-item0i0005/2.jpg"
import Image20 from "../../assets/products/brand0-category0-subCategory0-item0i0005/3.jpg"


import { shuffleArray } from "../../Libs/helper"; // ایمپورت تابع برای تصادفی‌سازی آرایه
import { comments } from "../data/comments";
import { products } from "../data/products"; // ایمپورت داده‌های محصولات
import { c } from "../data/comments";


export default function Product(server, apiPrefix) {
  // ای‌پی‌آی برای دریافت محصولات مرتبط (GET)
  server.post(`${apiPrefix}/product/related`, (schema, { requestBody }) => {
    let data = products; // استفاده از لیست محصولات

    // برگرداندن لیست محصولات مرتبط به صورت تصادفی
    return { message: "ok", data: shuffleArray(data) };
  });


  server.get(`${apiPrefix}/product/:id`, (schema, { params }) => {
    let data = [
        {
        "id": "brand0-category0-subCategory1-item0i0000",
        "general": {
            "slug": null,
            "title": "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
            "english_title": "iphone 13 pro 256 zaa black",
            "addedToFavorite": true,
            "images": [
                Image1,
                Image2,
                Image3,
                Image4,
                Image5
            ],
            "description": "<p>توضیحات نمونه برای محصول 4</p>",
            "specifications": null,
            "priceHistory": [
                {
                    "date": "2024-02-01",
                    "minPrice": 900000,
                    "maxPrice": 1150000
                },
                {
                    "date": "2024-03-01",
                    "minPrice": 870000,
                    "maxPrice": 1100000
                },
                {
                    "date": "2024-04-01",
                    "minPrice": 880000,
                    "maxPrice": 1080000
                },
                {
                    "date": "2024-05-01",
                    "minPrice": 860000,
                    "maxPrice": 1050000
                },
                {
                    "date": "2024-01-01",
                    "minPrice": 950000,
                    "maxPrice": 1200000
                }
            ]
        },
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
                        "selected": true
                    },
                    {
                        "id": 17,
                        "label": "قرمز",
                        "value": "#ff0000"
                    },
                    {
                        "id": 33,
                        "label": "آبي",
                        "value": "#0000ff"
                    },
                    {
                        "id": 36,
                        "label": "سبز",
                        "value": "#00ff00"
                    },
                ]
            },
            {
                "id": 81,
                "label": "جنس",
                "slug": "material",
                "type": "select",
                "children": [
                    {
                        "id": 18,
                        "label": "فلزی",
                        "value": "فلزی",
                        "selected": true
                    },
                    {
                        "id": 19,
                        "label": "پلاستیک",
                        "value": "پلاستیک"
                    }
                ]
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
                        "attribute_id": 1
                    },
                    {
                        "id": 18,
                        "value": "فلزی",
                        "attribute_name": "جنس",
                        "attribute_id": 81
                    }
                ],
                "suppliers": [
                    {
                        "id": 1,
                        "name": "دیجی کالا",
                        "payment_type": "Cash",
                        "delivery": "Area 1, Area 2",
                        "buy_type": "Retail",
                        "price": {
                            "regularPrice": 1_000_000,
                            "discountedPrice": 950_000,
                            "discountPercent": null
                        },
                        "sku": "SKU-001",
                        "inventory": 10,
                        "min_order": 10,
                        "max_order": 94,
                        "rating": "4.50",
                        "reviews_count": 0,
                        "reviews": [],
                        "selected": true,
                        "special_offer": "1403-12-29",
                    },
                    {
                        "id": 2,
                        "name": "تک اسیا",
                        "payment_type": "Credit",
                        "delivery": "Area 3, Area 4",
                        "buy_type": "Wholesale",
                        "price": {
                            "regularPrice": "110.00",
                            "discountedPrice": "130.00",
                            "discountPercent": null
                        },
                        "sku": "SKU-002",
                        "inventory": 15,
                        "min_order": 2,
                        "max_order": 150,
                        "rating": "4.80",
                        "reviews_count": 0,
                        "reviews": []
                    }
                ]
            },
            {
                "id": 20,
                "options": [
                    {
                        "id": 16,
                        "value": "#ff00ff",
                        "attribute_name": "رنگ",
                        "attribute_id": 1
                    },
                    {
                        "id": 19,
                        "value": "پلاستیک",
                        "attribute_name": "جنس",
                        "attribute_id": 81
                    }
                ],
                "suppliers": [
                    {
                        "id": 4,
                        "name": "ترب",
                        "payment_type": "Credit",
                        "delivery": "Area 3, Area 4",
                        "buy_type": "Wholesale",
                        "price": {
                            "regularPrice": "110.00",
                            "discountedPrice": "130.00",
                            "discountPercent": null
                        },
                        "sku": "SKU-002",
                        "inventory": 15,
                        "min_order": 2,
                        "max_order": 150,
                        "rating": "4.80",
                        "reviews_count": 0,
                        "reviews": []
                    }
                ]
            },
            {
                "id": 21,
                "options": [
                    {
                        "id": 17,
                        "value": "#ff0000",
                        "attribute_name": "رنگ",
                        "attribute_id": 1
                    },
                    {
                        "id": 18,
                        "value": "فلزی",
                        "attribute_name": "جنس",
                        "attribute_id": 81
                    }
                ],
                "suppliers": [
                    {
                        "id": 1,
                        "name": "دیجی کالا",
                        "payment_type": "Cash",
                        "delivery": "Area 1, Area 2",
                        "buy_type": "Retail",
                        "price": {
                            "regularPrice": "100.00",
                            "discountedPrice": "120.00",
                            "discountPercent": null
                        },
                        "sku": "SKU-001",
                        "inventory": 10,
                        "min_order": 1,
                        "max_order": 46,
                        "rating": "4.50",
                        "reviews_count": 0,
                        "reviews": []
                    }
                ]
            }
        ]
        },
        {
            "id": "brand0-category0-subCategory0-item0i0001",
            "general": {
                "slug": null,
                "title": "گوشی موبایل سامسونگ مدل گلکسی A54 دو سیم کارت",
                "english_title": "samsung A54 2 SIM",
                "addedToFavorite": true,
                "images": [
                    Image8,
                    Image6,
                    Image7,
                ],
                "description": "<p>توضیحات نمونه برای محصول 4</p>",
                "specifications": null,
                "priceHistory": [
                    {
                        "date": "2024-02-01",
                        "minPrice": 900000,
                        "maxPrice": 1150000
                    },
                    {
                        "date": "2024-03-01",
                        "minPrice": 870000,
                        "maxPrice": 1100000
                    },
                    {
                        "date": "2024-04-01",
                        "minPrice": 880000,
                        "maxPrice": 1080000
                    },
                    {
                        "date": "2024-05-01",
                        "minPrice": 860000,
                        "maxPrice": 1050000
                    },
                    {
                        "date": "2024-01-01",
                        "minPrice": 950000,
                        "maxPrice": 1200000
                    }
                ]
            },
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
                            "selected": true
                        },
                        {
                            "id": 17,
                            "label": "قرمز",
                            "value": "#ff0000"
                        },
                        {
                            "id": 33,
                            "label": "آبي",
                            "value": "#0000ff"
                        },
                        {
                            "id": 36,
                            "label": "سبز",
                            "value": "#00ff00"
                        },
                    ]
                },
                {
                    "id": 81,
                    "label": "جنس",
                    "slug": "material",
                    "type": "select",
                    "children": [
                        {
                            "id": 18,
                            "label": "فلزی",
                            "value": "فلزی",
                            "selected": true
                        },
                        {
                            "id": 19,
                            "label": "پلاستیک",
                            "value": "پلاستیک"
                        }
                    ]
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
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": 1_000_000,
                                "discountedPrice": 950_000,
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 10,
                            "max_order": 94,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": [],
                            "selected": true,
                            "special_offer": "1403-12-29",
                        },
                        {
                            "id": 2,
                            "name": "تک اسیا",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 20,
                    "options": [
                        {
                            "id": 16,
                            "value": "#ff00ff",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 19,
                            "value": "پلاستیک",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 4,
                            "name": "ترب",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 21,
                    "options": [
                        {
                            "id": 17,
                            "value": "#ff0000",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": "100.00",
                                "discountedPrice": "120.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 1,
                            "max_order": 46,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                }
            ]
        },
        {
            "id": "brand0-category0-subCategory0-item0i0002",
            "general": {
                "slug": null,
                "title": "ساعت هوشمند اپل سری 8 مدل GPS",
                "english_title": "Apple Watch 8 Series GPS",
                "addedToFavorite": true,
                "images": [
                    Image9,
                    Image10,
                    Image11,
                ],
                "description": "<p>توضیحات نمونه برای محصول 4</p>",
                "specifications": null,
                "priceHistory": [
                    {
                        "date": "2024-02-01",
                        "minPrice": 900000,
                        "maxPrice": 1150000
                    },
                    {
                        "date": "2024-03-01",
                        "minPrice": 870000,
                        "maxPrice": 1100000
                    },
                    {
                        "date": "2024-04-01",
                        "minPrice": 880000,
                        "maxPrice": 1080000
                    },
                    {
                        "date": "2024-05-01",
                        "minPrice": 860000,
                        "maxPrice": 1050000
                    },
                    {
                        "date": "2024-01-01",
                        "minPrice": 950000,
                        "maxPrice": 1200000
                    }
                ]
            },
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
                            "selected": true
                        },
                        {
                            "id": 17,
                            "label": "قرمز",
                            "value": "#ff0000"
                        },
                        {
                            "id": 33,
                            "label": "آبي",
                            "value": "#0000ff"
                        },
                        {
                            "id": 36,
                            "label": "سبز",
                            "value": "#00ff00"
                        },
                    ]
                },
                {
                    "id": 81,
                    "label": "جنس",
                    "slug": "material",
                    "type": "select",
                    "children": [
                        {
                            "id": 18,
                            "label": "فلزی",
                            "value": "فلزی",
                            "selected": true
                        },
                        {
                            "id": 19,
                            "label": "پلاستیک",
                            "value": "پلاستیک"
                        }
                    ]
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
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": 1_000_000,
                                "discountedPrice": 950_000,
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 10,
                            "max_order": 94,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": [],
                            "selected": true,
                            "special_offer": "1403-12-29",
                        },
                        {
                            "id": 2,
                            "name": "تک اسیا",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 20,
                    "options": [
                        {
                            "id": 16,
                            "value": "#ff00ff",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 19,
                            "value": "پلاستیک",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 4,
                            "name": "ترب",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 21,
                    "options": [
                        {
                            "id": 17,
                            "value": "#ff0000",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": "100.00",
                                "discountedPrice": "120.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 1,
                            "max_order": 46,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                }
            ]
        },
        {
            "id": "brand0-category0-subCategory0-item0i0004",
            "general": {
                "slug": null,
                "title": "هدفون بی سیم بیتس مدل Sklyline",
                "english_title": "Beats Headphone Skyline",
                "addedToFavorite": true,
                "images": [
                    Image12,
                    Image13,
                    Image14,
                ],
                "description": "<p>توضیحات نمونه برای محصول 4</p>",
                "specifications": null,
                "priceHistory": [
                    {
                        "date": "2024-02-01",
                        "minPrice": 900000,
                        "maxPrice": 1150000
                    },
                    {
                        "date": "2024-03-01",
                        "minPrice": 870000,
                        "maxPrice": 1100000
                    },
                    {
                        "date": "2024-04-01",
                        "minPrice": 880000,
                        "maxPrice": 1080000
                    },
                    {
                        "date": "2024-05-01",
                        "minPrice": 860000,
                        "maxPrice": 1050000
                    },
                    {
                        "date": "2024-01-01",
                        "minPrice": 950000,
                        "maxPrice": 1200000
                    }
                ]
            },
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
                            "selected": true
                        },
                        {
                            "id": 17,
                            "label": "قرمز",
                            "value": "#ff0000"
                        },
                        {
                            "id": 33,
                            "label": "آبي",
                            "value": "#0000ff"
                        },
                        {
                            "id": 36,
                            "label": "سبز",
                            "value": "#00ff00"
                        },
                    ]
                },
                {
                    "id": 81,
                    "label": "جنس",
                    "slug": "material",
                    "type": "select",
                    "children": [
                        {
                            "id": 18,
                            "label": "فلزی",
                            "value": "فلزی",
                            "selected": true
                        },
                        {
                            "id": 19,
                            "label": "پلاستیک",
                            "value": "پلاستیک"
                        }
                    ]
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
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": 1_000_000,
                                "discountedPrice": 950_000,
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 10,
                            "max_order": 94,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": [],
                            "selected": true,
                            "special_offer": "1403-12-29",
                        },
                        {
                            "id": 2,
                            "name": "تک اسیا",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 20,
                    "options": [
                        {
                            "id": 16,
                            "value": "#ff00ff",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 19,
                            "value": "پلاستیک",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 4,
                            "name": "ترب",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 21,
                    "options": [
                        {
                            "id": 17,
                            "value": "#ff0000",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": "100.00",
                                "discountedPrice": "120.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 1,
                            "max_order": 46,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                }
            ]
        },
        {
            "id": "brand0-category0-subCategory0-item0i0003",
            "general": {
                "slug": null,
                "title": "تلویزیون هوشمند ال جی مدل OLED55C1G1",
                "english_title": "OLED LG TV 55C1G1",
                "addedToFavorite": true,
                "images": [
                    Image15,
                    Image16,
                    Image17,
                ],
                "description": "<p>توضیحات نمونه برای محصول 4</p>",
                "specifications": null,
                "priceHistory": [
                    {
                        "date": "2024-02-01",
                        "minPrice": 900000,
                        "maxPrice": 1150000
                    },
                    {
                        "date": "2024-03-01",
                        "minPrice": 870000,
                        "maxPrice": 1100000
                    },
                    {
                        "date": "2024-04-01",
                        "minPrice": 880000,
                        "maxPrice": 1080000
                    },
                    {
                        "date": "2024-05-01",
                        "minPrice": 860000,
                        "maxPrice": 1050000
                    },
                    {
                        "date": "2024-01-01",
                        "minPrice": 950000,
                        "maxPrice": 1200000
                    }
                ]
            },
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
                            "selected": true
                        },
                        {
                            "id": 17,
                            "label": "قرمز",
                            "value": "#ff0000"
                        },
                        {
                            "id": 33,
                            "label": "آبي",
                            "value": "#0000ff"
                        },
                        {
                            "id": 36,
                            "label": "سبز",
                            "value": "#00ff00"
                        },
                    ]
                },
                {
                    "id": 81,
                    "label": "جنس",
                    "slug": "material",
                    "type": "select",
                    "children": [
                        {
                            "id": 18,
                            "label": "فلزی",
                            "value": "فلزی",
                            "selected": true
                        },
                        {
                            "id": 19,
                            "label": "پلاستیک",
                            "value": "پلاستیک"
                        }
                    ]
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
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": 1_000_000,
                                "discountedPrice": 950_000,
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 10,
                            "max_order": 94,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": [],
                            "selected": true,
                            "special_offer": "1403-12-29",
                        },
                        {
                            "id": 2,
                            "name": "تک اسیا",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 20,
                    "options": [
                        {
                            "id": 16,
                            "value": "#ff00ff",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 19,
                            "value": "پلاستیک",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 4,
                            "name": "ترب",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 21,
                    "options": [
                        {
                            "id": 17,
                            "value": "#ff0000",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": "100.00",
                                "discountedPrice": "120.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 1,
                            "max_order": 46,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                }
            ]
        },
        {
            "id": "brand0-category0-subCategory0-item0i0005",
            "general": {
                "slug": null,
                "title": "لپ تاپ گیمینگ TUF F15",
                "english_title": "TUF F15 ASUS",
                "addedToFavorite": true,
                "images": [
                    Image18,
                    Image19,
                    Image20,
                ],
                "description": "<p>توضیحات نمونه برای محصول 4</p>",
                "specifications": null,
                "priceHistory": [
                    {
                        "date": "2024-02-01",
                        "minPrice": 900000,
                        "maxPrice": 1150000
                    },
                    {
                        "date": "2024-03-01",
                        "minPrice": 870000,
                        "maxPrice": 1100000
                    },
                    {
                        "date": "2024-04-01",
                        "minPrice": 880000,
                        "maxPrice": 1080000
                    },
                    {
                        "date": "2024-05-01",
                        "minPrice": 860000,
                        "maxPrice": 1050000
                    },
                    {
                        "date": "2024-01-01",
                        "minPrice": 950000,
                        "maxPrice": 1200000
                    }
                ]
            },
            "options": [
                {
                    "id": 1,
                    "label": "رنگ",
                    "slug": "color",
                    "type": "color",
                    "children": [
                        {
                            "id": 16,
                            "label": "قهوه ای",
                            "value": "#332e1d",
                            "selected": true
                        },
                        {
                            "id": 17,
                            "label": "خاکستری",
                            "value": "#879996"
                        },
                    ]
                },
                {
                    "id": 81,
                    "label": "جنس",
                    "slug": "material",
                    "type": "select",
                    "children": [
                        {
                            "id": 18,
                            "label": "فلزی",
                            "value": "فلزی",
                            "selected": true
                        },
                        {
                            "id": 19,
                            "label": "پلاستیک",
                            "value": "پلاستیک"
                        }
                    ]
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
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": 1_000_000,
                                "discountedPrice": 950_000,
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 10,
                            "max_order": 94,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": [],
                            "selected": true,
                            "special_offer": "1403-12-29",
                        },
                        {
                            "id": 2,
                            "name": "تک اسیا",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 20,
                    "options": [
                        {
                            "id": 16,
                            "value": "#ff00ff",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 19,
                            "value": "پلاستیک",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 4,
                            "name": "ترب",
                            "payment_type": "Credit",
                            "delivery": "Area 3, Area 4",
                            "buy_type": "Wholesale",
                            "price": {
                                "regularPrice": "110.00",
                                "discountedPrice": "130.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-002",
                            "inventory": 15,
                            "min_order": 2,
                            "max_order": 150,
                            "rating": "4.80",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                },
                {
                    "id": 21,
                    "options": [
                        {
                            "id": 17,
                            "value": "#ff0000",
                            "attribute_name": "رنگ",
                            "attribute_id": 1
                        },
                        {
                            "id": 18,
                            "value": "فلزی",
                            "attribute_name": "جنس",
                            "attribute_id": 81
                        }
                    ],
                    "suppliers": [
                        {
                            "id": 1,
                            "name": "دیجی کالا",
                            "payment_type": "Cash",
                            "delivery": "Area 1, Area 2",
                            "buy_type": "Retail",
                            "price": {
                                "regularPrice": "100.00",
                                "discountedPrice": "120.00",
                                "discountPercent": null
                            },
                            "sku": "SKU-001",
                            "inventory": 10,
                            "min_order": 1,
                            "max_order": 46,
                            "rating": "4.50",
                            "reviews_count": 0,
                            "reviews": []
                        }
                    ]
                }
            ]
        }
]

    const productId = params.id;  // Accessing the product ID from the URL

    // Find the product by ID (in a real app, you'd query a database or an array of products)
    let product = data.find(p => p.id === productId);
    

    if (!product) {
      return { message: "Product not found", data: null };
    }
  
    return { message: "ok", data: product };
  })

  server.post(`${apiPrefix}/product/:id/comments`, (schema, { requestBody, params }) => {
    const { id } = params; // Extract productId from URL
    const { combinationId } = JSON.parse(requestBody); // Extract combinationId from request body


    const newId = id

    // Find the product and combination
    const product = c.find(p => p.productId === newId);
    if (!product) return { message: "Product not found", data: null };

    const combination = product.productCombinations.find(com => com.combinationId === combinationId);
    if (!combination) return { message: "Combination not found", data: null };

    // Extract comments from all suppliers in the combination
    const comments = combination.suppliers.flatMap(sup => sup.comments.map(comment => ({
        ...comment,
        supplierName: sup.supplierName,
        supplierId: sup.supplierId
    })));

    return { message: "ok", data: { comments } };
});

}