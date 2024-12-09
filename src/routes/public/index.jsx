import Public from "../../layouts/public"
import Page404 from "../../views/auth/404"
import Product from "../../views/public/product"

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
            }
        ]
    }
]