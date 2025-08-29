import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Loader,
  Text,
  Paper,
  Stack,
  Button,
  Grid,
  Flex,
  Divider,
  Container,
  Box,
} from "@mantine/core";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import { verifyPayment } from "../../../redux/payment/verifypayment/verifyPaymentActions";

const PaymentStatusCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const receiptId = queryParams.get("receiptId");
  const status = queryParams.get("status");

  const { paymentStatus, loading, error } = useSelector((state) => state.verifypayment);


  useEffect(() => {
    if (receiptId && status === "OK") {
      dispatch(verifyPayment({ receiptId }));
    }
  }, [dispatch, receiptId, status]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Loader variant="dots" size="lg" />
      </Flex>
    );
  }

  return (
    <Container size="sm" mt="xl">
      <Paper p="xl" radius="md" shadow="md" withBorder bg="gray.0">
        <Stack spacing="xl" align="center">
          <Text size="xl" weight={700}>
            وضعیت پرداخت
          </Text>

          {paymentStatus?.status === "pending" && (
            <Flex align="center" gap="xs" color="orange">
              <IconClock color="orange" />
              <Text color="orange" size="lg">
                در حال بررسی وضعیت پرداخت...
              </Text>
            </Flex>
          )}

          {paymentStatus?.status === "paid" && (
            <Flex align="center" gap="xs">
              <IconCheck color="green" />
              <Text color="green" size="lg" weight={500}>
                پرداخت با موفقیت انجام شد!
              </Text>
            </Flex>
          )}

          {paymentStatus?.status === "failed" && (
            <Flex align="center" gap="xs">
              <IconX color="red" />
              <Text color="red" size="lg" weight={500}>
                پرداخت ناموفق بود. لطفاً دوباره تلاش کنید.
              </Text>
            </Flex>
          )}

          {error && <Text color="red" align="center">{error}</Text>}

          <Divider my="" />

          {
            paymentStatus?.status === "pending" && (
              <Text align="center" color="orange">
                برای پرداخت به بخش سفارش‌ها مراجعه کنید.
              </Text>
            )
          }

          {paymentStatus?.status === "paid" && (
            <Box w="100%">
              <Stack spacing="sm">
                <Text align="center" color="blue">
                  شماره سفارش: {paymentStatus?.order.order_id}
                </Text>
                {/* <Text align="center" color="purple">
                  مبلغ پرداخت: {paymentStatus?.order.totalPriceToPay} تومان
                </Text> */}

                {paymentStatus?.order.sellers.map((seller, index) => (
                  <Paper
                    key={index}
                    withBorder
                    radius="md"
                    p="md"
                    bg="gray.1"
                  >
                  <Stack spacing={4}>
                    <Text color="teal">فروشنده: {seller.seller.label}</Text>
                    <Text color={
                      seller.isPaid === "paid" ? "green" :
                      seller.isPaid === "prepaid" || seller.isPaid === "selfprepaid" ? "orange" :
                      "red"
                    }>
                      وضعیت پرداخت:{" "}
                      {{
                        paid: "پرداخت شده",
                        prepaid: "مبلغ اولیه پرداخت شده",
                        unpaid: "پرداخت نشده",
                        selfprepaid: "مبلغ اولیه پرداخت شده است برای نهایی کردن با تامین کننده در تماس باشید"
                      }[seller.isPaid] || "نامشخص"}
                    </Text>
                    {seller.paymentComment && (
                      <Text color="teal">پیام: {seller.paymentComment}</Text>
                    )}
                  </Stack>

                  </Paper>
                ))}
              </Stack>

            </Box>
            
          )}

          {
            paymentStatus?.order.paymentComment &&
            <Flex w="100%" justify="flex-start">
              <Paper
                withBorder
                radius="md"
                p="md"
                bg="gray.1"
                w="100%"
                >
                <Text align="right">
                  پیام پرداخت:{" "}
                  {paymentStatus?.order.paymentComment}
                </Text>
              </Paper>
            </Flex>
          }

          {
            paymentStatus?.order.status === "failed" && (
              <Text align="center" color="red" size="lg" weight={500}>
                پرداخت ناموفق بود. برای تلاش دوباره به بخش سفارش‌ها مراجعه کنید.
              </Text>
            )
          }





          {
            paymentStatus?.order?.isPaid === "prepaid" &&
              paymentStatus?.order?.sellers?.some(
                (seller) => seller.isPaid === "prepaid" || seller.isPaid === "unpaid"
              ) ? (
                <Grid w="100%" mt="lg">
                  <Grid.Col span={12}>
                    <Button
                      fullWidth
                      size="md"
                      variant="light"
                      color="blue"
                      radius="md"
                      onClick={() => navigate(`/payment-sellers/${receiptId}`)}
                    >
                      پرداخت اقلام
                    </Button>
                  </Grid.Col>
                </Grid>
            )
            :
            (
              <Grid w="100%" mt="lg">
                <Grid.Col span={12}>
                  <Button
                    fullWidth
                    size="md"
                    variant="light"
                    color="blue"
                    radius="md"
                    onClick={() => navigate(`/account/orders`)}
                  >
                     مراجعه به بخش سفارش‌ها
                  </Button>
                </Grid.Col>
              </Grid>
          )
          }





        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentStatusCheck;
