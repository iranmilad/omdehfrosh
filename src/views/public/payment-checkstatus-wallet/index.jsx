import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Loader,
  Text,
  Paper,
  Stack,
  Button,
  Flex,
  Divider,
  Container,
  Box,
  Title,
  Grid,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
} from "@tabler/icons-react";
import { verifyPaymentWallet } from "../../../redux/payment/wallet/verifypaymentwallet/verifyPaymentWalletActions";

const PaymentStatusCheckWallet = () => {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const order_id = queryParams.get("order_id");
  const statusQuery = queryParams.get("status");

  const { walletPaymentStatus, loading, error } = useSelector(
    (state) => state.walletPaymentStatus
  );

  useEffect(() => {
    if (order_id && statusQuery === "OK") {
      dispatch(verifyPaymentWallet({ order_id }));
    }
  }, [dispatch, order_id, statusQuery]);

  if (loading) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Loader variant="dots" size="lg" />
      </Flex>
    );
  }

  const payment = walletPaymentStatus?.payment;
  const apiStatus = walletPaymentStatus?.status; // "ok", "failed", etc.
  const message = walletPaymentStatus?.message;

  const renderStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return <IconCheck size={48} color="green" />;
      case "pending":
        return <IconClock size={48} color="orange" />;
      case "failed":
      default:
        return <IconX size={48} color="red" />;
    }
  };

  return (
    <Container size="sm" mt="xl">
      <Paper p="xl" radius="md" shadow="md" withBorder bg="gray.0">
        <Stack spacing="xl" align="center">
          <Title order={3}>وضعیت پرداخت</Title>

          {renderStatusIcon(apiStatus)}

          <Text size="lg" fw={600}>
            {message || "نتیجه‌ای یافت نشد"}
          </Text>

          {payment && (
            <Box w="100%">
              <Divider my="md" />
              <Grid>
                <Grid.Col span={6}>
                  <Text>شماره سفارش:</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={600}>{payment.order_id}</Text>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Text>مبلغ پرداخت:</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={600}>
                    {payment.payment_amount.toLocaleString()} {payment.payment_currency}
                  </Text>
                </Grid.Col>

                <Grid.Col span={6}>
                  <Text>وضعیت:</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={600}>{payment.payment_status}</Text>
                </Grid.Col>
              </Grid>
              <Divider my="md" />
            </Box>
          )}

          <Button variant="light" color="blue" onClick={() => navigate("/account/wallet")}>
            بازگشت به کیف پول
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentStatusCheckWallet;
