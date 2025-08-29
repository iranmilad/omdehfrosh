export const myAccountData = [
  {
    userId: 2,
    phoneNumber: "09380587367",
    account_balance: 950000,
    all_orders: 4,
    tickets: 15,
    name: "حامد محمدی",
    userType: "کاربر عمده",
    favorites: [
      {
        id: "brand0-category0-subCategory1-item0i0000",
      },
    ],
    wallet: {
      balance: 950000,
      blockedAmount: 300000, // مقدار بلوکه‌شده
      paymentHistory: [
        {
          transactionId: "txn_001",
          date: "13/03/1400",
          amount: 500000,
          type: "deposit",
          typeDescriptionFa: "واریز به کیف پول",
          method: "online_gateway",
          methodDescriptionFa: "پرداخت آنلاین",
          description: "شارژ کیف پول از درگاه پرداخت"
        },
        {
          transactionId: "txn_002",
          date: "13/03/1400",
          amount: -150000,
          type: "purchase",
          typeDescriptionFa: "خرید از کیف پول",
          method: "wallet_payment",
          methodDescriptionFa: "پرداخت با کیف پول",
          description: "خرید از فروشگاه دیجیتال"
        }
      ],
      transfers: [
        {
          transferId: "trf_001",
          senderId: 2,
          receiverId: 5,
          amount: 100000,
          date: "13/03/1400",
          status: "completed",
          statusDescriptionFa: "تکمیل‌شده",
          note: "پرداخت برای سفارش خاص"
        },
        {
          transferId: "trf_002",
          senderId: 8,
          receiverId: 2,
          amount: 200000,
          date: "13/03/1400",
          status: "completed",
          statusDescriptionFa: "تکمیل‌شده",
          note: "بازگشت مبلغ"
        }
      ],
      pendingWithdrawals: [
        {
          requestId: "req_123",
          date: "13/03/1400",
          amount: 200000,
          status: "pending",
          statusDescriptionFa: "در انتظار بررسی",
          note: "منتظر بمانید"
        }
      ],
      lastTransaction: {
        transactionId: "txn_002",
        date: "13/03/1400",
        amount: -150000,
        type: "purchase",
        typeDescriptionFa: "خرید از کیف پول"
      }
    }
  }
];
