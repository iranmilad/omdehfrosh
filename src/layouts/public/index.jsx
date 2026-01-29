import {
  Box,
  Container,
  Flex,
  Loader,
  Overlay,
  Paper,
  Text
} from "@mantine/core";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { PublicRoutes } from "../../routes/public";
import InstallPWA from "../../components/installPWA";
import { useStaticQuery } from "../../Libs/reactQuery";


const Public = (props) => {
  const curr = useLocation();
  const routes = PublicRoutes;
  const loading = useSelector((state) => state.global.loading);

  // Fetch bootstrap data via React Query with static caching + persistence
  const {
    data: bootstrapData,
    loading: loadingBootstrap,
    error: errorBootstrap,
  } = useStaticQuery({
    endpoint: '/bootstrap',
    queryKey: ['bootstrap'],
    // Keep same shape as previous Redux data: { message, data: {...} }
    transformer: (response) => response?.data ?? null,
  });

  // Update page title based on current route
  useEffect(() => {
    let currentRouteTitle = null;
    window.scrollTo(0, 0);
    
    routes.forEach((route) => {
      const childRoute = route.children?.find(
        (item) => item.path === curr.pathname
      );
      if (childRoute) {
        currentRouteTitle = childRoute.title;
      }
    });

    if (currentRouteTitle) {
      document.title = currentRouteTitle;
    }
  }, [curr, routes]);

  // Show error state if bootstrap fetch fails
  if (errorBootstrap) {
    return (
      <Flex
        h="100vh"
        bg="white"
        justify="center"
        align="center"
        direction="column"
      >
        <Text color="red" size="lg" mb="md">
          خطا در دریافت اطلاعات
        </Text>
        <Text color="dimmed">{errorBootstrap}</Text>
      </Flex>
    );
  }

  // Show loading state while bootstrap is being fetched
  if (loadingBootstrap || !bootstrapData) {
    return (
      <Flex
        h="100vh"
        bg="white"
        justify="center"
        align="center"
        direction="column"
      >
        <Loader size="xl" />
        <Text mt="md">منتظر باشید ...</Text>
      </Flex>
    );
  }

  return (
    <>
      {loading && (
        <>
          <Flex
            pos="fixed"
            top="0"
            left="0"
            justify="center"
            align="center"
            h="100%"
            w="100%"
            style={{ zIndex: 99999999999999 }}
          >
            <Paper w="" style={{ zIndex: 999999999999999 }}>
              <Flex direction="column" justify="center" align="center">
                <Loader size="xl" />
                <Text>منتظر باشید ...</Text>
              </Flex>
            </Paper>
            <Overlay color="#000" backgroundOpacity={0.55} />
          </Flex>
        </>
      )}
      
      <Header />
      <InstallPWA />
      
      <Box
        style={{
          width: '100%',
          backgroundColor: '#F0F1F2',
          minHeight: '100vh',
          // 68px header height + spacing below it
          paddingTop: 'calc(68px + 1.5rem)',
          paddingBottom: '1rem'
        }}
      >
        <Box
          style={{
            maxWidth: '1336px',
            width: '100%',
            margin: '0 auto'
          }}
        >
          {curr.pathname === "/" ? (
            <Outlet />
          ) : (
            <Container className="px-3 md:px-5 my-3 lg:my-10">
              <Outlet />
            </Container>
          )}
        </Box>
      </Box>
      
      <Footer />
    </>
  );
};

export default Public;