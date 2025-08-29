import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import {
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  GridCol,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getPaymentLink } from "../../redux/payment/getpaymentlink/getPaymentLinkActions";

const PaymentInfoOnline = () => {

  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
    (state) => state.cartfinalreceipt
  );
  
  const { paymentLink, loading, error } = useSelector((state) => state.getPaymentLink);

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    dispatch(fetchFinalReceipt());
  }, [dispatch]);

  useEffect(() => {
    if (cartfinalreceipt) {
      dispatch(getPaymentLink({ cartfinalreceipt }));
    }
  }, [cartfinalreceipt, dispatch]);

  useEffect(() => {
    if (paymentLink?.receipt_id) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            navigate("/fake-gateway", { state: { receiptId: paymentLink.receipt_id, receipt_id_seller: "" } });
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [navigate, paymentLink]);

  if (!cartfinalreceipt) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

    return (
      <Grid mt="md" gutter="lg">
        <GridCol span={12}>
          <Paper p="md" shadow="xs" fullWidth>
            <Divider my="sm" />
            <Stack>
              <Grid mt="md" gutter="lg">
                <GridCol span={12}>
                  <Title fw="600" c="gray.8" mb="sm">
                    در حال انتقال به درگاه پرداخت هستید ...
                  </Title>
                  <Paper py="xl" pos="relative" fullWidth>
                    <Stack gap="lg">
                      <Flex direction="row" justify="space-between">
                        <Text size="sm" c="gray">
                          مبلغ قابل پرداخت:
                        </Text>
                        <Text size="sm" fw="bold">
                          {cartfinalreceipt?.totalPriceToPay} تومان
                        </Text>
                      </Flex>
                    </Stack>
                    <Divider my="lg" />
                    <Text align="center" mt="md">
                      انتقال شما به درگاه پرداخت بعد از {countdown} ثانیه انجام خواهد شد.
                    </Text>
                  </Paper>
                </GridCol>
              </Grid>
            </Stack>
          </Paper>
        </GridCol>
      </Grid>
    );
  

  return null;
};

export default PaymentInfoOnline;
