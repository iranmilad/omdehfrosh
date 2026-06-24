import {
  Alert,
  Box,
  Button,
  Container,
  Flex,
  Loader,
  Overlay,
  Paper,
  Stack,
  Text
} from "@mantine/core";
import { IconRefresh, IconWifiOff } from "@tabler/icons-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { PublicRoutes } from "../../routes/public";
import InstallPWA from "../../components/installPWA";
import { useStaticQuery } from "../../Libs/reactQuery";
import { getFriendlyErrorMessage } from "../../Libs/utils/getFriendlyErrorMessage";


const Public = (props) => {
  const curr = useLocation();
  const routes = PublicRoutes;
  const loading = useSelector((state) => state.global.loading);
  const isPaymentListener = curr.pathname.startsWith('/payment-listener');

  // Fetch bootstrap data via React Query with static caching + persistence
  // Skip bootstrap for payment-listener so it works without auth (user returns from gateway)
  const {
    data: bootstrapData,
    loading: loadingBootstrap,
    error: errorBootstrap,
    refetch: refetchBootstrap,
    fetching: fetchingBootstrap,
  } = useStaticQuery({
    endpoint: '/bootstrap',
    queryKey: ['bootstrap'],
    enabled: !isPaymentListener,
    transformer: (response) => response?.data ?? null,
    meta: { showErrorNotification: false },
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

  // Payment-listener: no auth, no bootstrap – render outlet only
  if (isPaymentListener) {
    return (
      <>
        <Header />
        <InstallPWA />
        <Box
          style={{
            width: '100%',
            backgroundColor: '#F0F1F2',
            minHeight: '100vh',
            paddingTop: 'calc(68px + 25px)',
            paddingBottom: '1rem'
          }}
        >
          <Box style={{ maxWidth: '1336px', width: '100%', margin: '0 auto' }}>
            <Box className="px-3 md:px-5" style={{ marginTop: 0, paddingTop: 0 }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
        <Footer />
      </>
    );
  }

  // Show error state if bootstrap fetch fails
  if (errorBootstrap) {
    const bootstrapErrorMessage = getFriendlyErrorMessage(
      errorBootstrap,
      'امکان برقراری ارتباط با سرور وجود ندارد.'
    );

    return (
      <Flex
        h="100vh"
        bg="white"
        justify="center"
        align="center"
        direction="column"
        p="md"
      >
        <Alert
          color="red"
          variant="light"
          title="خطا در دریافت اطلاعات"
          icon={<IconWifiOff size={20} />}
          maw={420}
          w="100%"
        >
          <Stack gap="md" align="center">
            <Text size="sm" ta="center" c="dimmed">
              {bootstrapErrorMessage}
            </Text>
            <Button
              leftSection={<IconRefresh size={16} />}
              variant="light"
              color="red"
              loading={fetchingBootstrap}
              onClick={() => refetchBootstrap()}
            >
              تلاش مجدد
            </Button>
          </Stack>
        </Alert>
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
          // Grey gap below header: 0 for fast-order/fast-edit; 25px for payment-listener; else 68px + 1.5rem
          paddingTop: (curr.pathname.startsWith('/fastorder') || curr.pathname.startsWith('/fastedit'))
            ? 0
            : curr.pathname.startsWith('/payment-listener')
              ? 'calc(68px + 25px)'
              : 'calc(68px + 1.5rem)',
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
          ) : (curr.pathname.startsWith('/fastorder') || curr.pathname.startsWith('/fastedit')) ? (
            <Box className="px-3 md:px-5" style={{ marginBottom: '1rem' }}>
              <Outlet />
            </Box>
          ) : curr.pathname.startsWith('/payment-listener') ? (
            <Box className="px-3 md:px-5" style={{ marginTop: 0, paddingTop: 0 }}>
              <Outlet />
            </Box>
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