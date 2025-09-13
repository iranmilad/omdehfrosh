import {
  Box,
  Button,
  Center,
  Grid,
  GridCol,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconCircleCheckFilled, IconAlertTriangle } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import XTitle from "../../../components/title";
import { useDispatch, useSelector } from "react-redux";
import { getsubscriptionPlansGet } from "../../../redux/usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansActions";
import ProductPrice from "../../../components/ProductPrice";
import { updateCart } from "../../../redux/cart/cartupdate/cartUpdateActions";
import { setInitial } from "../../../redux/cart";
import { clearCartUpdateState } from "../../../redux/cart/cartupdate/cartUpdateSlice";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import DelayedFullScreenLoader from "../../../components/centerloading";
import { getSubscriptionByUserId } from "../../../redux/usermyaccounts/usermyaccounts/getsubscriptionbyuserid/getSubscriptionByUserIdActions";
import { purchaseSubscriptionByModelId } from "../../../redux/usermyaccounts/usermyaccounts/purchasesubscriptions/purchaseSubscriptionsActions";
import { getSubscriptionInfoByModelId } from "../../../redux/usermyaccounts/usermyaccounts/purchasesubscriptions/getsubscriptioninfo/getSubscriptionInfoActions";
import { setShowSubscriptionModal } from "../../../redux/usermyaccounts/usermyaccounts/purchasesubscriptions/getsubscriptioninfo/getSubscriptionInfoSlice"; 

function Subscription() {
  const theme = useMantineTheme();
  const dispatch = useDispatch();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [balanceModal, setBalanceModal] = useState({
    opened: false,
    planTitle: "",
    planPrice: 0,
    accountBalance: 0,
  });
  const [confirmModal, setConfirmModal] = useState({
    opened: false,
    plan: null,
  });

  const { user } = useSelector((state) => state.auth);


  const {
  subscriptionInfo,
  loadingSubscriptionInfo,
  showSubscriptionModal,
  errorSubscriptionInfo,
} = useSelector((state) => state.getSubscriptionInfo);





  const { subscriptionPlansGet, loadingsubscriptionPlansGet } = useSelector(
    (state) => state.subscriptionsPlansGet
  );
  const { cartUpdate, loadingUpdate } = useSelector((state) => state.cartUpdate);
  const cartItems = useSelector((state) => state.cart?.items || []);

  const {
    subscriptionByUserId,
    loadingSubscriptionByUserId,
  } = useSelector((state) => state.getSubscriptionByUserId);

  useEffect(() => {
    if (user) {
      dispatch(getSubscriptionByUserId());
    }
  }, [dispatch, user]);

  useEffect(() => {
    dispatch(verifyToken()).finally(() => {
      setHasCheckedAuth(true);
    });
    dispatch(getsubscriptionPlansGet());
  }, [dispatch, loadingUpdate, cartUpdate]);

  useEffect(() => {
    if (hasCheckedAuth && user === null) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [user, hasCheckedAuth]);

const handlePurchaseClick = (plan) => {
  const accountBalance = subscriptionByUserId?.account_balance || 0;
  const planPrice = plan.price.discountedPrice;

  if (accountBalance < planPrice) {
    setBalanceModal({
      opened: true,
      planTitle: plan.title,
      planPrice: planPrice,
      accountBalance: accountBalance,
    });
  } else {
    // Fetch subscription info first
    dispatch(getSubscriptionInfoByModelId({ modelId: plan.modelId }));

  }
};

    console.log(subscriptionInfo)

  // const handleConfirmPurchase = () => {
  //   purchaseSubscription(confirmModal.plan);
  //   setConfirmModal({ opened: false, plan: null });
  // };

// Update the handleConfirmPurchase function
const handleConfirmPurchase = () => {
  if (!subscriptionInfo?.plan) return;
  
  // Pass both the plan and the transactionId
  purchaseSubscription(subscriptionInfo.plan, subscriptionInfo.transactionId);
  dispatch(setShowSubscriptionModal(false));
};

// Update the purchaseSubscription function to accept transactionId
const purchaseSubscription = async (plan, transactionId) => {
  try {
    // Wait for the purchase to complete with transactionId
    await dispatch(purchaseSubscriptionByModelId({ 
      modelId: plan.modelId,
      transactionId: transactionId 
    }));
    
    // Then fetch updated subscription data
    dispatch(getSubscriptionByUserId());
  } catch (error) {
    console.error('Purchase error:', error);
  }
};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fa-IR').format(price);
  };

  if (loadingUpdate) {
    return <DelayedFullScreenLoader showR={true} />;
  }

  return (
    <>
      {hasCheckedAuth && !user && (
        <Box
          pos="fixed"
          top={0}
          left={0}
          w="100%"
          h="100%"
          style={{
            backdropFilter: "blur(5px)",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            zIndex: 10,
          }}
        />
      )}

      {/* Login Modal */}
      <Modal
        opened={showLoginModal}
        onClose={() => {}}
        title="ورود به حساب کاربری"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={20}
      >
        <Text>برای مشاهده پلن ها ابتدا وارد سایت شوید.</Text>
      </Modal>

      {/* Confirmation Modal */}
      {/* <Modal
        opened={confirmModal.opened}
        onClose={() => setConfirmModal({ opened: false, plan: null })}
        title="تایید خرید اشتراک"
        centered
        size="sm"
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={60} color="blue" variant="light">
            <IconCircleCheckFilled size={30} />
          </ThemeIcon>
          
          <Text ta="center" size="lg" fw={500}>
            آیا از خرید این اشتراک اطمینان دارید؟
          </Text>
          
          {confirmModal.plan && (
            <Box w="100%">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">پلن انتخابی:</Text>
                <Text size="sm" fw={500}>{confirmModal.plan.title}</Text>
              </Group>
              
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">مدت زمان:</Text>
                <Text size="sm" fw={500}>{confirmModal.plan.duration}</Text>
              </Group>
              
              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">قیمت:</Text>
                <Text size="sm" fw={500} c="green">
                  {formatPrice(confirmModal.plan.price.discountedPrice)} تومان
                </Text>
              </Group>
            </Box>
          )}

          <Group gap="xs" mt="md">
            <Button 
              variant="filled" 
              color="blue"
              onClick={handleConfirmPurchase}
            >
              تایید خرید
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setConfirmModal({ opened: false, plan: null })}
            >
              انصراف
            </Button>
          </Group>
        </Stack>
      </Modal> */}

      {/* Confirmation Modal (now uses subscriptionInfo) */}
      <Modal
        opened={showSubscriptionModal}
        onClose={() => dispatch(setShowSubscriptionModal(false))}
        title="تایید خرید اشتراک"
        centered
        size="sm"
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={60} color="blue" variant="light">
            <IconCircleCheckFilled size={30} />
          </ThemeIcon>
          
          <Text ta="center" size="lg" fw={500}>
            آیا از خرید این اشتراک اطمینان دارید؟
          </Text>

          {loadingSubscriptionInfo && (
            <Text c="dimmed" size="sm">در حال بارگذاری...</Text>
          )}

          {subscriptionInfo?.plan && (
            <Box w="100%">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">پلن انتخابی:</Text>
                <Text size="sm" fw={500}>{subscriptionInfo.plan.title}</Text>
              </Group>

              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">مدت زمان:</Text>
                <Text size="sm" fw={500}>{subscriptionInfo.plan.duration}</Text>
              </Group>

              <Group justify="space-between" mb="md">
                <Text size="sm" c="dimmed">قیمت:</Text>
                <Text size="sm" fw={500} c="green">
                  {formatPrice(subscriptionInfo.plan.price?.discountedPrice || 0)} تومان
                </Text>
              </Group>
            </Box>
          )}
          <Group gap="xs" mt="md">
            <Button 
              variant="filled" 
              color="blue"
              onClick={handleConfirmPurchase}
              disabled={!subscriptionInfo?.plan}
            >
              تایید خرید
            </Button>
            <Button 
              variant="outline" 
              onClick={() => dispatch(setShowSubscriptionModal(false))}
            >
              انصراف
            </Button>
          </Group>
        </Stack>
      </Modal>


      {/* Insufficient Balance Modal */}
      <Modal
        opened={balanceModal.opened}
        onClose={() => setBalanceModal(prev => ({ ...prev, opened: false }))}
        title="موجودی ناکافی"
        centered
        size="sm"
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={60} color="red" variant="light">
            <IconAlertTriangle size={30} />
          </ThemeIcon>
          
          <Text ta="center" size="lg" fw={500}>
            موجودی حساب شما برای خرید این پلن کافی نیست
          </Text>
          
          <Box w="100%">
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">پلن انتخابی:</Text>
              <Text size="sm" fw={500}>{balanceModal.planTitle}</Text>
            </Group>
            
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">قیمت پلن:</Text>
              <Text size="sm" fw={500} c="red">
                {formatPrice(balanceModal.planPrice)} تومان
              </Text>
            </Group>
            
            <Group justify="space-between" mb="md">
              <Text size="sm" c="dimmed">موجودی حساب:</Text>
              <Text size="sm" fw={500} c="blue">
                {formatPrice(balanceModal.accountBalance)} تومان
              </Text>
            </Group>
            
            <Group justify="space-between" pt="xs" style={{ borderTop: '1px solid #e9ecef' }}>
              <Text size="sm" c="dimmed">مبلغ مورد نیاز:</Text>
              <Text size="sm" fw={500} c="orange">
                {formatPrice(balanceModal.planPrice - balanceModal.accountBalance)} تومان
              </Text>
            </Group>
          </Box>

          <Group gap="xs" mt="md">
            <Button 
              variant="filled" 
              color="blue"
              onClick={() => {
                setBalanceModal(prev => ({ ...prev, opened: false }));
                window.location.href = '/account/wallet';
              }}
            >
              شارژ کیف پول
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setBalanceModal(prev => ({ ...prev, opened: false }))}
            >
              انصراف
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Box style={{ pointerEvents: !user ? "none" : "auto" }}>
        <Center>
          <XTitle>اشتراک ویژه</XTitle>
        </Center>
        <Grid mt="xl">
          {subscriptionPlansGet.map((plan) => {
            const itemInCart = cartItems.find((item) => item.productId === plan.modelId);
            const isPurchased = subscriptionByUserId?.subscriptions?.find((sub) => sub.modelId === plan.modelId)?.purchased;
            const accountBalance = subscriptionByUserId?.account_balance || 0;
            const planPrice = plan.price.discountedPrice;
            const hasInsufficientBalance = accountBalance < planPrice;
          
            return (
              <GridCol key={plan._id} span={{ lg: "auto" }}>
                <Paper
                  display="flex"
                  style={{ justifyContent: "center" }}
                  radius="lg"
                  withBorder
                  shadow="0"
                  py="30px"
                  pb="35px"
                  px="xl"
                >
                  <Box w={300}>
                    <Center style={{ flexDirection: "column" }}>
                      <Stack align="center">
                        <Title c="dark" size="25px">
                          {plan.title}
                        </Title>
                        <Title c="dark" size="18px">
                          {plan.duration}
                        </Title>
                        <Text
                          style={{ display: "flex", alignItems: "end", gap: "5px" }}
                          c={theme.primaryColor}
                          size="14px"
                          fw="600"
                          component="span"
                        >
                          <ProductPrice
                            regularPrice={plan.price.regularPrice}
                            discountPercent={plan.price.discountPercent}
                            discountedPrice={plan.price.discountedPrice}
                          />
                        </Text>
                      </Stack>
                    </Center>
                    <Stack mt="xl">
                      {plan.features.map((feature, index) => (
                        <Group key={index} align="center">
                          <ThemeIcon size="sm" variant="transparent" color="orange">
                            <IconCircleCheckFilled />
                          </ThemeIcon>
                          <Text component="span" size="sm" fw="700" c="dark">
                            {feature}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                    <Center mt="xl">
                      {plan.subscription !== "free" && (
                        <Button
                          h={30}
                          disabled={!!itemInCart || isPurchased}
                          onClick={() => handlePurchaseClick(plan)}
                          variant={isPurchased || itemInCart ? "outline" : "filled"}
                          color={
                            isPurchased || itemInCart 
                              ? "gray" 
                              : hasInsufficientBalance 
                                ? "orange" 
                                : "blue"
                          }
                        >
                          {isPurchased
                            ? "خریداری شده"
                            : itemInCart
                            ? "در انتظار پرداخت سبد"
                            : hasInsufficientBalance
                            ? "موجودی ناکافی"
                            : "خرید"}
                        </Button>
                      )}
                    </Center>
                  </Box>
                </Paper>
              </GridCol>
            );
          })}
        </Grid>
      </Box>
    </>
  );
}

export default Subscription;