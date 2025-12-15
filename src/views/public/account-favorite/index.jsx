import {
  LoadingOverlay,
  Flex,
  Title,
  Button,
  Grid,
  GridCol,
  Modal,
  Text,
  Container,
  Center,
  Stack,
  Loader
} from "@mantine/core";

import ProductBox from "../account-favorite/productBox/index"
import { verifyToken } from '../../../redux/auth/authusers/auth';

import { useDispatch, useSelector } from "react-redux";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

function Account_Favorite() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();

  const { isVerified, loading: authLoading, error: authError, user: userVerified } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();

  const { userAccount, loading, error } = useSelector((state) => state.userMyAccounts);

  const { 
    user
  } = useSelector(state => ({
    user: state.auth?.user
  }));

  // Initial auth check - only verify token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(verifyToken()).unwrap();
      } catch (error) {
      } finally {
        setAuthCheckComplete(true);
      }
    };

    if (!authCheckComplete) {
      checkAuth();
    }
  }, [dispatch, authCheckComplete]);

  // Handle auth state changes after initial check
  useEffect(() => {
    // Only proceed after auth check is complete
    if (!authCheckComplete) return;

    const isAuthenticated = isVerified && userVerified;

    if (!isAuthenticated) {
      // Clear any existing timer
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }

      // Show modal first
      setLoginModalOpen(true);
      
      // Set up redirect timer
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      setRedirectTimer(timer);
    } else {
      // User is authenticated
      setLoginModalOpen(false);
      
      // Clear redirect timer if it exists
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        setRedirectTimer(null);
      }
      
      // Add 1-2 second delay before dispatching user account data
      const loadDataWithDelay = async () => {
        try {
          // Add 1.5 second delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Load user account data (which includes favorites)
          if (user?.id) {
            await dispatch(getUserMyAccount({userId: user.id}));
          } else {
            await dispatch(getUserMyAccount());
          }
          
        } catch (error) {
          console.error('Error loading user favorites:', error);
        }
      };

      loadDataWithDelay();
    }

    // Cleanup function
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [dispatch, isVerified, userVerified, authCheckComplete, navigate, user?.id]);

  // Handle immediate redirect to login page
  const handleGoToLogin = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    navigate('/login');
  };

  // Handle modal close (if needed)
  const handleModalClose = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setLoginModalOpen(false);
    // Optionally redirect immediately or allow user to stay
    navigate('/login');
  };

  // Create a refetch function
  const refetch = () => {
    if (user?.id) {
      dispatch(getUserMyAccount({userId: user.id}));
    } else {
      dispatch(getUserMyAccount());
    }
  };

  // Show loading while checking auth
  if (!authCheckComplete || authLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Title order={3}>در حال بررسی وضعیت ورود...</Title>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Show modal and placeholder if not authenticated
  if (!isVerified || !userVerified) {
    return (
      <>
        <Modal
          opened={loginModalOpen}
          onClose={handleModalClose}
          closeOnClickOutside={false}
          closeOnEscape={false}
          withCloseButton={true}
          title="ورود به حساب کاربری"
          centered
          overlayProps={{
            backgroundOpacity: 0.6,
            blur: 3,
          }}
        >
          <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
          <Text size="sm" c="dimmed" mb="md">
            در حال انتقال به صفحه ورود در 3 ثانیه...
          </Text>
          <Flex gap="sm" justify="flex-end">
            <Button 
              onClick={handleGoToLogin}
              variant="filled"
            >
              رفتن به صفحه ورود
            </Button>
          </Flex>
        </Modal>
        
        {/* Show a placeholder content while modal is open */}
        <Container size="md" py="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">در حال بررسی وضعیت ورود...</Text>
              <Loader size="md" />
            </Stack>
          </Center>
        </Container>
      </>
    );
  }

  return (
    <>
      <Flex justify="space-between" align="center" mb="xl">
        <Title>محصولات علاقه مندی</Title>
        <Button onClick={refetch} variant="light" size="sm">
          بروزرسانی
        </Button>
      </Flex>
      {!loading ? (
        <Grid>
          {userAccount && userAccount?.favorites && userAccount.favorites.length > 0 ? (
            userAccount.favorites.map((item, index) => (
              <GridCol key={index} span={{ lg: 4 }}>
                <ProductBox {...item} favoriteAdded={true} skeleton={false} refetchParent={refetch} />
              </GridCol>
            ))
          ) : (
            <GridCol span={12}>
              <Center h={200}>
                <Stack align="center" gap="md">
                  <Text size="lg" c="dimmed">
                    محصول مورد علاقه‌ای وجود ندارد
                  </Text>
                  <Text size="sm" c="dimmed">
                    محصولات مورد علاقه خود را از فروشگاه اضافه کنید
                  </Text>
                </Stack>
              </Center>
            </GridCol>
          )}
        </Grid>
      ) : (
        <Grid>
          {Array(3)
            .fill(0)
            .map((item, index) => (
              <GridCol key={index} span={{ lg: 4 }}>
                <ProductBox id="12" favoriteAdded={false} skeleton={true} />
              </GridCol>
            ))}
        </Grid>
      )}
    </>
  );
}

export default Account_Favorite;