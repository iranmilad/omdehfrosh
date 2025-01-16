import { Box, Breadcrumbs, Center, Container, Flex, Image, Loader, LoadingOverlay, Overlay, Paper, Text } from "@mantine/core";
import { Suspense,useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import routes from "../../routes";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { useData } from "../../Libs/api";
import { setBootstrap } from "../../redux/global";
import Logo from "../../assets/logo.png"

const Auth = (props) => {
  const curr = useLocation();
  const loading = useSelector((state) => state.global.loading);
  const dispatch = useDispatch();
  const {data,isLoading} = useData({url:"/bootstrap",queryKey:['bootstrap']});
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
        ) : <Outlet />}

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

export default Auth;