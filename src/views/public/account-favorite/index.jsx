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
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSessionQuery, useQueryClient } from "../../../Libs/reactQuery";

function Account_Favorite() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const { isVerified, loading: authLoading, user: userVerified } = useSelector((state) => state.auth);

  const { data: userAccountData, isLoading: loading } = useSessionQuery({
    endpoint: "/user-myaccounts",
    queryKey: ["userMyAccount"],
    enabled: !!token,
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const userAccount = userAccountData?.data ?? userAccountData;

  useEffect(() => {
    if (!authLoading && (!isVerified || !userVerified)) {
      setLoginModalOpen(true);
      const timer = setTimeout(() => navigate("/login"), 3000);
      setRedirectTimer(timer);
      return () => clearTimeout(timer);
    }
    setLoginModalOpen(false);
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
  }, [isVerified, userVerified, authLoading, navigate]);

  const handleGoToLogin = () => {
    if (redirectTimer) clearTimeout(redirectTimer);
    navigate("/login");
  };

  const handleModalClose = () => {
    if (redirectTimer) clearTimeout(redirectTimer);
    setLoginModalOpen(false);
    navigate("/login");
  };

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
  };

  if (authLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Title order={3} style={{ textAlign: 'right' }}>در حال بررسی وضعیت ورود...</Title>
          </Stack>
        </Center>
      </Container>
    );
  }

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
        <Title style={{ textAlign: 'right' }}>محصولات علاقه مندی</Title>
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