import { Box, Breadcrumbs, Center, Container, Flex, Image, Loader, LoadingOverlay, Overlay, Paper } from "@mantine/core";
import { Suspense, useContext, useEffect, useReducer, useState } from "react";
import { Outlet, useLocation } from "react-router";
import routes from "../../routes";
import { Helmet } from "react-helmet";
import Header from "../../components/header";
import { IconChevronLeft } from "@tabler/icons-react";
import XBreadcrumbs from "../../components/xbreadcrumbs"
import { PublicRoutes } from "../../routes/public";
import Footer from "../../components/footer";
import Logo from "../../assets/logo.png"
import { useSelector } from "react-redux";


const Public = (props) => {
  const curr = useLocation();
  const loading = useSelector((state) => state.global.loading);
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
      {loading ? ( 
        <>
          <Flex pos="fixed" top="0" left="0" justify="center" align="center" h="100%" w="100%" style={{zIndex: 99999999999999}}>
            <Paper w="400" style={{zIndex: 999999999999999}}>
              <Flex direction="column" justify="center" align="center">
                <Image src={Logo} w={200} />
                <Loader size="lg" />
              </Flex>
            </Paper>
          <Overlay  color="#000" backgroundOpacity={0.55} />
          </Flex>
        </>
      ) : null}
      <Header />
      <Container className="px-3 md:px-5 my-10">
        <Outlet />
      </Container>
      <Footer />
    </>
  );
};

export default Public;
