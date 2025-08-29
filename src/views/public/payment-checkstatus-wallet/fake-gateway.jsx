import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, TextInput, Loader, Text, Paper, Stack } from "@mantine/core";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

const FakeGatewayWallet = () => {

  const location = useLocation();

  const [link_id, setlink_id] = useState(location.state?.link_id || ""); // Get receiptId from navigation state


  const [loading, setLoading] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");

  const [countdown, setCountdown] = useState(5);


  const checkWalletPaymentStatus = async () => {
    try {
      const response = await fetch(getApiUrl("/payment/wallet/paymentwebhook"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ link_id: link_id, status: "OK" }),
      });

      const data = await response.json();

      if (data.redirectUrl) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            window.location.href = data.redirectUrl; 
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
      }
    } catch (error) {
    }
  };



  useEffect(() => {
    if (link_id) {
      checkWalletPaymentStatus();
    }
  }, [link_id]);



  return (
    <Paper padding="md" shadow="xs" radius="md" style={{ backgroundColor: "#f8f9fa" }}>
      <Stack spacing="lg">
        <Text>
            درگاه پرداخت
        </Text>
        <br />
        <br />
        <Text style={{ color: "green" }}>
          تایید پرداخت
        </Text>
        <br />  
        <br />
        <Text>
          پس از {countdown} ثانیه به صفحه فروشگاه منتقل می شوید.
        </Text>
      </Stack>
    </Paper>
  );
};

export default FakeGatewayWallet;
