import { Box, Breadcrumbs, Center, Container, Flex, Image, Loader, LoadingOverlay, Overlay, Paper, Text } from "@mantine/core";
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
import { useDispatch, useSelector } from "react-redux";
import { useData } from "../../Libs/api";
import { setBootstrap } from "../../redux/global";
import EditorHeader from "../../views/editor/header";


const Public = (props) => {
  const curr = useLocation();
  const loading = useSelector((state) => state.global.loading);
  const {data,isLoading} = useData({url:"/bootstrap",queryKey:['bootstrap']});
  const dispatch = useDispatch();
  const routes = PublicRoutes;
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

  useEffect(() => {
    if(!isLoading){
      if(data){
        dispatch(setBootstrap(data))
      }
    }
  },[isLoading])

  return (
    <>
      {data && !isLoading ? (
        <>
        {loading ? ( 
          <>
            <Flex pos="fixed" top="0" left="0" justify="center" align="center" h="100%" w="100%" style={{zIndex: 99999999999999}}>
              <Paper w="400" style={{zIndex: 999999999999999}}>
                <Flex direction="column" justify="center" align="center">
                  <Loader size="xl" />
                  <Text>منتظر باشید ...</Text>
                </Flex>
              </Paper>
            <Overlay  color="#000" backgroundOpacity={0.55} />
            </Flex>
          </>
        ) : null}
        <Header />
        {curr.pathname === '/' ? <Outlet /> : (
          <Container className="px-3 md:px-5 my-10">
            <Outlet />
          </Container>
        )}
        <Footer />
      </>
      ) : (
        <Flex h="100vh" bg="white" justify="center" align="center" direction="column">
            <Loader size="xl" />
            <Text>منتظر باشید ...</Text>
        </Flex>
      )}
    </>
  );
};

export default Public;
