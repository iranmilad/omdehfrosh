import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Button,
  Loader,
  Text,
  Paper,
  Stack,
  Container,
  Card,
  ThemeIcon,
  Group,
  Progress,
  Badge,
  Alert,
  Center,
  Divider,
  Title,
} from "@mantine/core";
import {
  IconCheck,
  IconCreditCard,
  IconClock,
  IconHome,
  IconShield,
  IconAlertCircle,
} from "@tabler/icons-react";

const FakeGatewayWallet = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();


  const [countdown, setCountdown] = useState(5);
  const [walletData, setWalletData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const progressValue = ((5 - countdown) / 5) * 100;

        console.log("ddiu", location.state)
      console.log("ddssgi", walletData)

  // Extract wallet payment data from URL parameters or location state
  useEffect(() => {
    const extractedData = {};
    
    // Get data from URL search params (if sent via GET)
    for (const [key, value] of searchParams.entries()) {
      extractedData[key] = value;
    }




    // Get data from location state (if sent via POST form)
    if (location.state) {
      Object.assign(extractedData, location.state);
    }

    // Handle the specific data structure for wallet payments
    const linkId = extractedData.link_id || searchParams.get('link_id');
    const amount = extractedData.amount || searchParams.get('amount');
    const userId = extractedData.user_id || searchParams.get('user_id');
    
    setWalletData({
      ...extractedData,
      link_id: linkId,
      amount: amount,
      user_id: userId
    });

    // Simulate initial loading time
    setTimeout(() => {
      setLoading(false);
    }, 2000);

  }, [location, searchParams]);

  // Simulate sending payment result to wallet payment webhook
  const sendWalletPaymentResult = async (paymentStatus) => {
    setProcessing(true);
    
    try {
      const linkIdToUse = walletData.link_id || searchParams.get('link_id');
      const transaction_id = walletData.transactionId;
      
      // Prepare the complete data object with status and body together
      const completePaymentData = {
        status: paymentStatus === 'success' ? "OK" : "FAILED",
        body: {
          link_id: linkIdToUse,
          transaction_id: transaction_id,
          amount: walletData.amount || '0',
          user_id: walletData.user_id || '',
          timestamp: new Date().toISOString(),
          gateway: 'fake_gateway_wallet',
          payment_method: 'wallet_deposit',
          ...(paymentStatus === 'failed' && { 
            error_message: 'Wallet payment was cancelled by user',
            error_code: 'USER_CANCELLED_WALLET'
          })
        }
      };

      // Send the complete data as a single JSON string
      const queryString = new URLSearchParams({
        data: JSON.stringify(completePaymentData)
      }).toString();
      
      // Navigate to wallet payment status check with complete data
      const targetUrl = `${window.location.origin}/payment-statuscheck-wallet?${queryString}`;
      
      window.location.href = targetUrl;
      
    } catch (error) {
      console.error('Error sending wallet payment result:', error);
      setProcessing(false);
      setError(true);
    }
  };

  // Auto-send success result after countdown
  useEffect(() => {
    if (!loading && (walletData.link_id || searchParams.get('link_id'))) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            sendWalletPaymentResult('success');
            clearInterval(timer);
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [loading, walletData, searchParams]);

  // Handle manual payment confirmation (for testing)
  const handleManualConfirm = () => {
    sendWalletPaymentResult('success');
  };

  // Handle payment failure simulation
  const handleFailPayment = () => {
    sendWalletPaymentResult('failed');
  };

  // Loading state
  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Card shadow="lg" padding="xl" radius="lg" withBorder>
          <Stack align="center" gap="xl">
            <ThemeIcon size={80} radius="xl" color="blue" variant="light">
              <IconCreditCard size={40} />
            </ThemeIcon>

            <Title order={2} ta="center" fw={600}>
              درگاه پرداخت کیف پول
            </Title>

            <Paper bg="blue.0" p="lg" radius="md" w="100%">
              <Stack align="center" gap="md">
                <Loader size="lg" color="blue" />
                <Text size="lg" fw={500} ta="center">
                  در حال پردازش شارژ کیف پول...
                </Text>
                <Text size="sm" c="dimmed" ta="center">
                  لطفاً منتظر بمانید
                </Text>
              </Stack>
            </Paper>

            <Paper bg="gray.0" p="md" radius="md" w="100%">
              <Group justify="center" gap="xs">
                <IconShield size={16} />
                <Text size="xs" c="dimmed">
                  محیط امن پرداخت کیف پول
                </Text>
              </Group>
            </Paper>
          </Stack>
        </Card>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container size="sm" py="xl">
        <Alert
          icon={<IconAlertCircle size={20} />}
          title="خطا در پردازش شارژ کیف پول"
          color="red"
          radius="lg"
          variant="light"
        >
          <Stack gap="md">
            <Text>متاسفانه در پردازش شارژ کیف پول خطایی رخ داده است</Text>
            <Button
              variant="light"
              color="red"
              onClick={() => window.history.back()}
              leftSection={<IconHome size={16} />}
            >
              بازگشت به کیف پول
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        {/* Bank Header */}
        <Card shadow="lg" padding="xl" radius="lg" withBorder bg="gradient-to-r from-green-500 to-green-600">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="white" variant="filled">
              <IconCreditCard size={32} />
            </ThemeIcon>
            <Title order={2} ta="center" fw={600} c="white">
              درگاه شارژ کیف پول
            </Title>
            <Text ta="center" c="white" opacity={0.9}>
              سیستم پرداخت الکترونیک کیف پول
            </Text>
          </Stack>
        </Card>

        {/* Payment Details */}
        {walletData.link_id && (
          <Card shadow="sm" padding="lg" radius="lg" withBorder>
            <Stack gap="sm">
              <Text size="sm" c="gray.7" fw="500">جزئیات شارژ کیف پول:</Text>
              {walletData.user_id && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">شناسه کاربر:</Text>
                  <Text size="xs">{walletData.user_id}</Text>
                </Group>
              )}
              {walletData.link_id && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">شناسه تراکنش:</Text>
                  <Text size="xs">{walletData.link_id.slice(-8).toUpperCase()}</Text>
                </Group>
              )}
              {walletData.amount && (
                <Group justify="space-between">
                  <Text size="sm" fw="500" c="green.8">مبلغ شارژ:</Text>
                  <Text size="sm" fw="600" c="green.8">
                    {parseInt(walletData.amount)?.toLocaleString()} تومان
                  </Text>
                </Group>
              )}
            </Stack>
          </Card>
        )}

        {!processing ? (
          <>
            {/* Countdown */}
            <Paper bg="blue.0" p="lg" radius="md">
              <Stack gap="md" align="center">
                <Group gap="xs" align="center">
                  <IconClock size={16} />
                  <Text size="sm" fw={500}>
                    تأیید خودکار پس از
                  </Text>
                  <Text size="xl" fw={700} c="blue">
                    {countdown}
                  </Text>
                  <Text size="sm" fw={500}>
                    ثانیه
                  </Text>
                </Group>

                <Progress
                  value={progressValue}
                  size="lg"
                  radius="xl"
                  color="blue"
                  animated
                  style={{ width: "100%" }}
                />

                <Text size="xs" ta="center" c="dimmed">
                  نتیجه به سیستم کیف پول ارسال می‌شود
                </Text>
              </Stack>
            </Paper>

            {/* Manual confirmation buttons for testing */}
            <Stack gap="sm">
              <Button 
                onClick={handleManualConfirm} 
                variant="filled"
                color="green"
                size="md"
                leftSection={<IconCheck size={16} />}
              >
                تأیید شارژ کیف پول (موفق)
              </Button>

              <Button 
                onClick={handleFailPayment} 
                variant="filled"
                color="red"
                size="md"
                leftSection={<IconAlertCircle size={16} />}
              >
                لغو شارژ کیف پول (ناموفق)
              </Button>
            </Stack>
          </>
        ) : (
          <Stack align="center" gap="sm">
            <Loader size="md" color="green" />
            <Text size="sm" c="green">در حال ارسال نتیجه به سیستم کیف پول...</Text>
          </Stack>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <Paper p="sm" bg="yellow.0" radius="sm">
            <Text size="xs" c="gray.6">Debug - Wallet Data:</Text>
            <Text size="xs" c="gray.6" style={{ wordBreak: 'break-all' }}>
              {JSON.stringify(walletData, null, 2)}
            </Text>
          </Paper>
        )}

        {/* Instructions for testing */}
        <Paper p="sm" bg="gray.0" radius="sm">
          <Text size="xs" c="gray.6" ta="center">
            این شبیه‌ساز درگاه خارجی کیف پول است که نتیجه شارژ را به سیستم شما ارسال می‌کند.
          </Text>
        </Paper>

        {/* Security Footer */}
        <Paper bg="gray.0" p="md" radius="md">
          <Group justify="center" gap="xs">
            <IconShield size={16} color="green" />
            <Text size="xs" ta="center" c="dimmed">
              این تراکنش در یک محیط کاملاً امن انجام شده است
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
};

export default FakeGatewayWallet