export default function Fastorder(server, apiPrefix) {
    // ای‌پی‌آی برای ویرایش اطلاعات حساب کاربری (POST)
    server.post(`${apiPrefix}/fastorder/category`, (schema, { requestBody }) => {
      // پارس کردن بدنه درخواست
       const categories = [
        {
            id: 1,
            title: "الکترونیک",
            icon: "📺",
            badge: 3,
            children: 4,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/811055abd27571021d484336b05c3d867993cc4f_1733131393.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "digital"
        },
        {
            id: 2,
            title: "پوشاک",
            icon: "👕",
            children: 2,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/285792b2a54984c4570ba6bd61d5bfb8beb8f3b6_1733131459.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "apparel"
        },
        {
            id: 3,
            title: "لوازم خانگی",
            icon: "🏠",
            children: 20,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/92bd44f2cdb518e533c6bb4d52ea68c3d741f4ea_1733131423.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "home-and-kitched"
        },
        {
            id: 4,
            title: "ورزشی",
            icon: "⚽",
            children: 30,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/18864f7f01629bf782bc6615e42122761ac5c1fe_1733131540.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "sport-and-travel"
        },
        {
            id: 5,
            title: "آرایشی",
            icon: "💄",
            children: 4,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/554f74e939eba973d2f2d9abcd4cd3f8606642f7_1733131506.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "personal-appliance"
        },
        {
            id: 6,
            title: "کتاب",
            icon: "📚",
            children: 4,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/e2ec23cbb06bcf8461eae13e188b1036553da148_1733131406.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "book-and-media"
        },
        {
            id: 7,
            title: "اسباب‌بازی",
            icon: "🧸",
            children: 4,
            image: "https://dkstatics-public.digikala.com/digikala-mega-menu/9617736d06b5bdded22100ae967542e720449c55_1733131617.png?x-oss-process=image/resize,m_lfit,h_300,w_300/quality,q_80",
            url: "mother-and-child"
        }
    ];
      
      return {message: "ok", data: categories};
    });
  
  }