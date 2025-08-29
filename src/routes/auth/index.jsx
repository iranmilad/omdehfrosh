import { lazy } from "react";
import Auth from "../../layouts/auth";
import Login from "../../views/auth/login"
import Register from "../../views/auth/register";

export const AuthRoutes = [
  {
    element: <Auth />,
    children: [
      {
        title: "ورود",
        path: "/login",
        element: <Login />,
      },
      {
        title: "ثبت نام",
        path: "/register",
        element: <Register />,
      },
    ],
  },
];