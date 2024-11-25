import Public from "../../layouts/public"
import Page404 from "../../views/auth/404"

export const PublicRoutes = [
    {
        element: <Public />,
        children: [
            {
                path: "*",
                element: <Page404 />
            }
        ]
    }
]