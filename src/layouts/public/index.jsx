import {
  Container,
  Flex,
  Loader,
  Overlay,
  Paper,
  Text
} from "@mantine/core";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { setBootstrap } from "../../redux/global"
import { getBootstrap } from "../../redux/bootstrap/bootstrapActions"
import { PublicRoutes } from "../../routes/public";
import InstallPWA from "../../components/installPWA";
import { bootstrap } from "../../mock/data/bootstrap";


const Public = (props) => {
  const curr = useLocation();
  const dispatch = useDispatch();
  const routes = PublicRoutes;
  
  // Get bootstrap data and loading state from Redux
  const { bootstrapData, loadingBootstrap, errorBootstrap } = useSelector(
    (state) => state.bootstrap
  );
  const loading = useSelector((state) => state.global.loading);

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

  // Fetch bootstrap data on component mount
  useEffect(() => {
    // Option 1: Use mock data (for development/testing)
    // dispatch(setBootstrap(bootstrap));
    
    // Option 2: Fetch from API (uncomment when API is ready)
    dispatch(getBootstrap());
  }, [dispatch]);

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
      
      {curr.pathname === "/" ? (
        <Outlet />
      ) : (
        <Container className="px-3 md:px-5 my-3 lg:my-10">
          <Outlet />
        </Container>
      )}
      
      <Footer />
    </>
  );
};

export default Public;