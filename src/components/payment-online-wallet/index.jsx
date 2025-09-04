import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Button,
  Center,
  Container,
  Paper,
  Stack,
  Text,
  Title,
  Progress,
  ThemeIcon,
  Group,
  Badge,
  Card,
  Loader,
  Alert,
  Divider,
  Flex,
} from "@mantine/core";
import { IconCreditCard, IconClock, IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { getPaymentLinkWallet } from "../../redux/payment/wallet/getpaymentlinkwallet/getPaymentLinkWalletActions";

const PaymentInfoOnlineWallet = ({ depositData, gateway }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Fallback to location state if props aren't provided
  const finalDepositData = depositData || location.state?.depositData;
  const finalGateway = gateway || location.state?.gateway;

  const { walletPaymentLink, loadingWalletPaymentLink, errorWalletPaymentLink } = 
    useSelector((state) => state.getPaymentLinkWallet);

  const [countdown, setCountdown] = useState(5);
  const progressValue = ((5 - countdown) / 5) * 100;

  // Create stable references using useMemo with proper dependencies
  const locationState = useMemo(() => location.state || {}, [location.state]);
  
  // Create stable string value for depositData comparison
  const depositDataKey = useMemo(() => {
    if (!finalDepositData) return "";
    return JSON.stringify({
      amount: finalDepositData.amount,
      userId: finalDepositData.user_id || finalDepositData.userId,
      description: finalDepositData.description,
    });
  }, [finalDepositData]);

  // Process data only when keys change
  const processedData = useMemo(() => {
    
    if (finalDepositData) {
      const amount = finalDepositData.amount || 0;
      const userId = finalDepositData.user_id || finalDepositData.userId || locationState.user_id;
      const description = finalDepositData.description || "شارژ کیف پول";
      
      return {
        amount,
        userId,
        description,
        depositId: `deposit_${Date.now()}`,
      };
    }
    
    return null;
  }, [depositDataKey, locationState]);

  // Early return if no data
  if (!processedData) {
    return (
      <Container size="sm" py="xl">
        <Card shadow="sm" padding="xl" radius="md" withBorder>
          <Stack align="center" gap="lg">
            <Text size="lg" fw="500">در حال بارگذاری اطلاعات پرداخت...</Text>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
              <p><strong>Has DepositData:</strong> {depositData ? 'Yes' : 'No'}</p>
            </div>
          </Stack>
        </Card>
      </Container>
    );
  }

  const { amount, userId, description, depositId } = processedData;

  // Create stable depositData object for dispatch
  const depositDataForDispatch = useMemo(() => ({
    amount,
    userId,
    description,
    depositId,
  }), [amount, userId, description, depositId]);

  useEffect(() => {
    if (processedData) {
      dispatch(getPaymentLinkWallet({ depositData: depositDataForDispatch, gateway: finalGateway }));
    }
  }, [dispatch, depositDataForDispatch, processedData, finalGateway]);


  // Fixed useEffect to properly handle payment redirect
  useEffect(() => {
    // FIXED: Access the correct structure - walletPaymentLink directly, not walletPaymentLink.walletpaymentlink
    if (walletPaymentLink?.link_url) {
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            
            // For fake gateway, use GET with query parameters
            // For real gateway, use POST form submission
            const linkUrl = walletPaymentLink.link_url;
            
            if (linkUrl.includes('fake-gateway') || finalGateway === 'fake') {
              // Use GET request with query parameters for fake gateway
              const queryParams = new URLSearchParams();
              
              if (walletPaymentLink.body) {
                const bodyData = walletPaymentLink.body;
                Object.keys(bodyData).forEach(key => {
                  if (typeof bodyData[key] === 'object') {
                    queryParams.append(key, JSON.stringify(bodyData[key]));
                  } else {
                    queryParams.append(key, bodyData[key]);
                  }
                });
              }
              
              // Add link_id for wallet tracking
              queryParams.append('link_id', walletPaymentLink.link_id);
              
              const fullUrl = `${linkUrl}?${queryParams.toString()}`;
              window.location.href = fullUrl;
              
            } else {
              // Use POST request for real payment gateways
              try {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = walletPaymentLink.link_url;
                form.style.display = 'none';
                form.target = '_self';

                // Send the whole body object as form data
                if (walletPaymentLink.body) {
                  const bodyData = walletPaymentLink.body;
                  Object.keys(bodyData).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    // Handle nested objects by stringifying them
                    input.value = typeof bodyData[key] === 'object' ? 
                      JSON.stringify(bodyData[key]) : bodyData[key];
                    form.appendChild(input);
                  });
                }

                document.body.appendChild(form);
                form.submit();
                
                // Clean up
                setTimeout(() => {
                  if (document.body.contains(form)) {
                    document.body.removeChild(form);
                  }
                }, 1000);
              } catch (e) {
                console.error('Error submitting wallet payment form:', e);
                // Fallback to direct navigation
                window.location.href = walletPaymentLink.link_url;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [walletPaymentLink, navigate, depositDataForDispatch, amount, userId, description, finalGateway]);

  // Manual redirect for testing - simplified dependencies
  const handleManualRedirect = useCallback(() => {
    const linkUrl = walletPaymentLink?.link_url;
    if (linkUrl) {
      if (linkUrl.includes('fake-gateway') || finalGateway === 'fake') {
        // Use GET request with query parameters for fake gateway
        const queryParams = new URLSearchParams();
        
        if (walletPaymentLink.body) {
          const bodyData = walletPaymentLink.body;
          Object.keys(bodyData).forEach(key => {
            if (typeof bodyData[key] === 'object') {
              queryParams.append(key, JSON.stringify(bodyData[key]));
            } else {
              queryParams.append(key, bodyData[key]);
            }
          });
        }
        
        queryParams.append('link_id', walletPaymentLink.link_id);
        
        const fullUrl = `${linkUrl}?${queryParams.toString()}`;
        window.location.href = fullUrl;
        
      } else {
        // Use POST request for real payment gateways
        try {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = linkUrl;
          form.style.display = 'none';
          form.target = '_self';

          // Send the whole body object as form data
          if (walletPaymentLink.body) {
            const bodyData = walletPaymentLink.body;
            Object.keys(bodyData).forEach(key => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = typeof bodyData[key] === 'object' ? 
                JSON.stringify(bodyData[key]) : bodyData[key];
              form.appendChild(input);
            });
          }

          document.body.appendChild(form);
          form.submit();
          
          setTimeout(() => {
            if (document.body.contains(form)) {
              document.body.removeChild(form);
            }
          }, 1000);
        } catch (e) {
          console.error('Error submitting form:', e);
          window.location.href = linkUrl;
        }
      }
    }
  }, [walletPaymentLink, finalGateway]);

  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Card shadow="sm" padding="xl" radius="lg" withBorder>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="blue" variant="light">
              <IconCreditCard size={32} />
            </ThemeIcon>
            
            <Title order={2} ta="center" fw={600} c="dark.7">
              انتقال به درگاه شارژ کیف پول
            </Title>
            
            <Text ta="center" c="dimmed" size="md">
              لطفاً منتظر بمانید تا به درگاه پرداخت منتقل شوید
            </Text>

            <Badge 
              size="lg" 
              variant="light" 
              color="green"
              leftSection={<IconClock size={14} />}
            >
              پردازش خودکار
            </Badge>
          </Stack>
        </Card>

        {/* Deposit Info */}
        <Card shadow="sm" padding="xl" radius="lg" withBorder>
          <Stack gap="lg">
            <Title order={4} c="gray.7" mb="md">
              جزئیات شارژ کیف پول:
            </Title>

            <Divider />

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                توضیحات:
              </Text>
              <Text size="sm" fw={500}>
                {description}
              </Text>
            </Group>

            <Group justify="space-between" align="center">
              <Text size="sm" c="dimmed">
                شناسه کاربر:
              </Text>
              <Text size="sm" fw={500}>
                {userId || "نامشخص"}
              </Text>
            </Group>

            {/* FIXED: Show transaction ID if available */}
            {walletPaymentLink?.transaction?.transactionId && (
              <Group justify="space-between" align="center">
                <Text size="sm" c="dimmed">
                  شناسه تراکنش:
                </Text>
                <Text size="sm" fw={500} c="blue">
                  {walletPaymentLink.transaction.transactionId}
                </Text>
              </Group>
            )}

            <Divider />

            {/* Amount Summary */}
            <Paper bg="green.0" p="lg" radius="sm">
              <Flex direction="row" justify="space-between" align="center">
                <Text size="lg" c="gray.8" fw="500">
                  مبلغ شارژ:
                </Text>
                <Text size="xl" fw="700" c="green.8">
                  {Number(amount || 0).toLocaleString()} تومان
                </Text>
              </Flex>
            </Paper>
          </Stack>
        </Card>

        {/* Countdown Section - FIXED: Check the correct property */}
        {walletPaymentLink?.link_url && (
          <Card shadow="sm" padding="xl" radius="lg" withBorder bg="orange.0">
            <Stack gap="md" align="center">
              <Group gap="xs" align="center">
                <IconClock size={16} />
                <Text size="sm" fw={500}>
                  انتقال خودکار پس از
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
                style={{ width: '100%' }}
              />

              <Text size="sm" c="gray.6" ta="center">
                لطفاً صبر کنید تا به درگاه پرداخت منتقل شوید
              </Text>
            </Stack>
          </Card>
        )}

        {/* Manual Navigation Button - FIXED: Check the correct property */}
        {walletPaymentLink?.link_url && (
          <Card shadow="sm" padding="md" radius="lg" withBorder bg="gray.0">
            <Group justify="center">
              <Text size="sm" c="dimmed">
                نمی‌خواهید منتظر بمانید؟
              </Text>
              <Button 
                variant="subtle" 
                size="sm"
                rightSection={<IconArrowRight size={14} />}
                onClick={handleManualRedirect}
              >
                انتقال فوری
              </Button>
            </Group>
          </Card>
        )}

        {/* Loading and Error States */}
        {loadingWalletPaymentLink && (
          <Center mt="lg">
            <Stack align="center" gap="sm">
              <Loader size="md" />
              <Text size="sm" c="gray">
                در حال آماده‌سازی درگاه پرداخت...
              </Text>
            </Stack>
          </Center>
        )}

        {errorWalletPaymentLink && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="خطا در دریافت لینک پرداخت"
            color="red"
            radius="md"
          >
            <Text>
              خطا در دریافت لینک پرداخت: {errorWalletPaymentLink}
            </Text>
            <Button 
              variant="light" 
              color="red" 
              size="sm" 
              mt="md"
              onClick={() => window.location.reload()}
            >
              تلاش مجدد
            </Button>
          </Alert>
        )}

        {/* No payment link warning - FIXED: Check the correct property */}
        {!walletPaymentLink?.link_url && !loadingWalletPaymentLink && !errorWalletPaymentLink && (
          <Paper p="md" bg="yellow.0" mt="lg">
            <Text c="yellow.8" size="sm" ta="center" fw="500">
              در حال بررسی اطلاعات پرداخت...
            </Text>
          </Paper>
        )}

        {/* Security Notice */}
        <Paper bg="blue.0" p="md" radius="md">
          <Text size="xs" ta="center" c="blue.7">
            🔒 شارژ کیف پول شما در یک محیط امن انجام می‌شود
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
};

export default PaymentInfoOnlineWallet;