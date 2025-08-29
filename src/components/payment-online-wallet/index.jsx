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
import { useLocation } from "react-router-dom";
import { getPaymentLinkWallet } from "../../redux/payment/wallet/getpaymentlinkwallet/getPaymentLinkWalletActions";



const PaymentInfoOnlineWallet = () => {




  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const { cartfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
  //   (state) => state.cartfinalreceipt
  // );


  const location = useLocation();
  const depositData = location.state;



  const { walletPaymentLink, loadingWalletPaymentLink, errorWalletPaymentLink } = useSelector((state) => state.getPaymentLinkWallet);

  const [ countdown, setCountdown ] = useState(5);


  useEffect(() => {
    if (depositData) {
      dispatch(getPaymentLinkWallet({ depositData: depositData }));
    }
  }, [depositData, dispatch]);



  useEffect(() => {
    if (walletPaymentLink?.walletpaymentlink.link_id) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            navigate("/fake-gateway-wallet", 
              { state: { link_id: walletPaymentLink?.walletpaymentlink.link_id } }
            );
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);

    }
  }, [navigate, walletPaymentLink]);

  if (!depositData) {
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
                          {/* {cartfinalreceipt?.totalPriceToPay} تومان */}
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

export default PaymentInfoOnlineWallet;
