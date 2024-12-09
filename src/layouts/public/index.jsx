import { Box, Breadcrumbs, Container, Flex, Loader } from "@mantine/core";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import routes from "../../routes";
import { Helmet } from "react-helmet";
import Header from "../../components/header";
import { IconChevronLeft } from "@tabler/icons-react";
import XBreadcrumbs from "../../components/xbreadcrumbs"
import { PublicRoutes } from "../../routes/public";

const Public = (props) => {
  const curr = useLocation();
  const routes = PublicRoutes
  useEffect(() => {
    // پیدا کردن مسیر فعلی از لیست مسیرها
    let currentRouteTitle = null;

    routes.forEach((route) => {
      const childRoute = route.children?.find(
        (item) => item.path === curr.pathname
      );
      if (childRoute) {
        currentRouteTitle = childRoute.title;
      }
    });

    // بررسی وجود عنوان و نمایش در کنسول
    if (currentRouteTitle) {
      document.title = currentRouteTitle;
    } else {
    }
  }, [curr]);

  return (
    <>
      <Header />
      <Container className="px-3 md:px-5 mt-10">
        <Breadcrumbs separator={<IconChevronLeft size={15} />}>
          {XBreadcrumbs({routes})}
        </Breadcrumbs>
        <Outlet />
      </Container>
    </>
  );
};

export default Public;
