import { Box, Flex, Loader } from "@mantine/core";
import { Suspense,useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import routes from "../../routes";
import { Helmet } from "react-helmet";

const Auth = (props) => {
  const curr = useLocation();
  useEffect(() => {
    // پیدا کردن مسیر فعلی از لیست مسیرها
    let currentRouteTitle = null;

    routes.forEach(route => {
      const childRoute = route.children?.find(item => item.path === curr.pathname);
      if (childRoute) {
        currentRouteTitle = childRoute.title;
      }
    });

    // بررسی وجود عنوان و نمایش در کنسول
    if (currentRouteTitle) {
      document.title = currentRouteTitle
    } else {

    }
  }, [curr]);

  
  return (
    <>
      <div>
        <Suspense fallback={<Box h="100vh"><Flex h="100%" w="100%" justify="center" align="center"><Loader /></Flex></Box>}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
};

export default Auth;