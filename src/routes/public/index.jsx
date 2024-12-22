import Public from "../../layouts/public"
import Page404 from "../../views/auth/404"
import Product from "../../views/public/product"
import Basket from "../../views/public/basket"
import BasketInfo from "../../views/public/basket-info"
import PaymentMethod from "../../views/public/payment-method"
import Account from "../../layouts/account"
import Account_Index from "../../views/public/account-index"
import Account_Orders from "../../views/public/account-orders"
import Account_Order from "../../views/public/account-order"
import Account_EditAccount from "../../views/public/account-editaccount"
import Account_Messages from "../../views/public/account-messages"
import Account_Message from "../../views/public/account-message"
import Account_Notifications from "../../views/public/account-notifications"
import Account_Favorite from "../../views/public/account-favorite"
import Compare from "../../views/public/compare"

export const PublicRoutes = [
    {
        element: <Public />,
        path: "/",
        breadcrumb: "خانه",
        children: [
            {
                path: "*",
                element: <Page404 />
            },
            {
                path: "/product/:slug",
                element: <Product />
            },
            {
                path: "/basket",
                element: <Basket />
            },
            {
                path: "/basket-info",
                element: <BasketInfo />
            },
            {
                path: "/payment",
                element: <PaymentMethod />
            },
            {
                path: "/compare",
                element: <Compare />
            },
            {
                path: "/account",
                element: <Account />,
                children: [
                    {
                        path: '',
                        element: <Account_Index />
                    },
                    {
                        path: 'orders',
                        element: <Account_Orders />,
                    },
                    {
                        path: 'orders/:id',
                        element: <Account_Order/>
                    },
                    {
                        path: 'edit-account',
                        element: <Account_EditAccount />,
                    },
                    {
                        path: 'tickets',
                        element: <Account_Messages />,
                    },
                    {
                        path: 'tickets/:id',
                        element: <Account_Message />,
                    },
                    {
                        path: 'notifications',
                        element: <Account_Notifications />,
                    },
                    {
                        path: 'favorites',
                        element: <Account_Favorite />,
                    },
                ]
            }
        ]
    }
]