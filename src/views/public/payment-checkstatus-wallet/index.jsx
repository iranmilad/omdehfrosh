import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Loader,
  Text,
  Paper,
  Stack,
  Button,
  Divider,
  Container,
  Title,
  Card,
  ThemeIcon,
  Group,
  Alert,
  Badge,
} from "@mantine/core";
import {
  IconWallet,
  IconArrowLeft,
  IconAlertCircle,
  IconCircleCheck,
  IconCircleX,
  IconHourglass,
  IconExclamationMark,
} from "@tabler/icons-react";
import { verifyPaymentWallet } from "../../../redux/payment/wallet/verifypaymentwallet/verifyPaymentWalletActions";

const PaymentStatusCheckWallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentData, setPaymentData] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const dataString = queryParams.get("data");

  const { walletPaymentStatus, loading, error } = useSelector(
    (state) => state.walletPaymentStatus
  );

  console.log("walletPaymentSaus", walletPaymentStatus)
  console.log("paymentData", paymentData)

  // Enhanced status determination
  const getPaymentStatus = () => {
    const frontendStatus = paymentData?.status?.toUpperCase();
    const backendStatus = walletPaymentStatus?.status?.toLowerCase();
    const backendPaymentStatus = walletPaymentStatus?.payment?.payment_status?.toLowerCase();
    
    // Check for success conditions
    const successConditions = [
      frontendStatus === "OK",
      backendStatus === "ok",
      backendStatus === "completed",
      backendStatus === "success",
      backendPaymentStatus === "paid",
      backendPaymentStatus === "completed",
      backendPaymentStatus === "success"
    ];
    
    // Check for failure conditions  
    const failureConditions = [
      frontendStatus === "FAILED",
      frontendStatus === "ERROR",
      backendStatus === "failed",
      backendStatus === "error", 
      backendPaymentStatus === "failed",
      backendPaymentStatus === "error",
      backendPaymentStatus === "cancelled"
    ];
    
    // Check for pending conditions
    const pendingConditions = [
      backendStatus === "pending",
      backendPaymentStatus === "pending",
      backendStatus === "processing"
    ];
    
    if (successConditions.some(Boolean)) {
      return "success";
    } else if (failureConditions.some(Boolean)) {
      return "failed";
    } else if (pendingConditions.some(Boolean)) {
      return "pending";
    } else {
      return "unknown";
    }
  };

  const paymentStatus = getPaymentStatus();

  // Parse the payment data from URL parameters
  useEffect(() => {
    console.log("=== FRONTEND URL DEBUG ===");
    console.log("Full URL:", window.location.href);
    console.log("Search params:", location.search);
    console.log("Data string:", dataString);
    
    try {
      if (dataString) {
        const parsedData = JSON.parse(dataString);
        console.log("Parsed URL data:", parsedData);
        console.log("Body keys:", parsedData.body ? Object.keys(parsedData.body) : 'No body');
        if (parsedData.body) {
          console.log("Transaction ID from URL:", parsedData.body.transaction_id);
          console.log("Status from URL:", parsedData.body.status);
        }
        
        setPaymentData(parsedData.body);
        
        // Always send complete payment data to backend for verification
        console.log("Sending to verifyPaymentWallet:", parsedData);
        dispatch(verifyPaymentWallet(parsedData));
      }
    } catch (e) {
      console.error('Error parsing payment data:', e);
    }
  }, [dispatch, dataString, location.search]);

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Card shadow="sm" padding="xl" radius="lg" withBorder>
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" color="blue" variant="light">
              <Loader size="md" />
            </ThemeIcon>
            <Text size="lg" fw={500}>در حال بررسی وضعیت شارژ کیف پول...</Text>
            <Text size="sm" c="dimmed">لطفاً منتظر بمانید</Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  const renderStatusIcon = () => {
    const iconSize = 50;
    const themeIconSize = 100;
    
    switch (paymentStatus) {
      case "success":
        return (
          <ThemeIcon 
            size={themeIconSize} 
            radius="xl" 
            color="green" 
            variant="filled"
            style={{ 
              background: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
              border: '3px solid #51cf66',
              boxShadow: '0 8px 32px rgba(81, 207, 102, 0.3)'
            }}
          >
            <IconCircleCheck size={iconSize} color="white" stroke={2.5} />
          </ThemeIcon>
        );
      
      case "failed":
        return (
          <ThemeIcon 
            size={themeIconSize} 
            radius="xl" 
            color="red" 
            variant="filled"
            style={{ 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%)',
              border: '3px solid #ff6b6b',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
            }}
          >
            <IconCircleX size={iconSize} color="white" stroke={2.5} />
          </ThemeIcon>
        );
      
      case "pending":
        return (
          <div style={{ position: 'relative' }}>
            <ThemeIcon 
              size={themeIconSize} 
              radius="xl" 
              color="orange" 
              variant="filled"
              style={{ 
                background: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
                border: '3px solid #ffd43b',
                boxShadow: '0 8px 32px rgba(255, 212, 59, 0.3)',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <IconHourglass size={iconSize} color="white" stroke={2.5} />
            </ThemeIcon>
            <style jsx>{`
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.8;
                  transform: scale(1.05);
                }
              }
            `}</style>
          </div>
        );
      
      default:
        return (
          <ThemeIcon 
            size={themeIconSize} 
            radius="xl" 
            color="gray" 
            variant="filled"
            style={{ 
              background: 'linear-gradient(135deg, #868e96 0%, #6c757d 100%)',
              border: '3px solid #868e96',
              boxShadow: '0 8px 32px rgba(134, 142, 150, 0.3)'
            }}
          >
            <IconExclamationMark size={iconSize} color="white" stroke={2.5} />
          </ThemeIcon>
        );
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return "شارژ کیف پول با موفقیت انجام شد";
      case "failed":
        return paymentData?.error_message || walletPaymentStatus?.error || "شارژ کیف پول ناموفق بود";
      case "pending":
        return "شارژ کیف پول در حال بررسی است";
      default:
        return walletPaymentStatus?.message || "وضعیت نامشخص";
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case "success": return "green";
      case "pending": return "orange";
      case "failed": return "red";
      default: return "gray";
    }
  };

  const getStatusBadge = () => {
    const badgeProps = {
      size: "lg",
      radius: "md",
      variant: "filled"
    };

    switch (paymentStatus) {
      case "success":
        return (
          <Badge {...badgeProps} color="green">
            ✅ موفق
          </Badge>
        );
      case "failed":
        return (
          <Badge {...badgeProps} color="red">
            ❌ ناموفق  
          </Badge>
        );
      case "pending":
        return (
          <Badge {...badgeProps} color="orange">
            ⏳ در انتظار
          </Badge>
        );
      default:
        return (
          <Badge {...badgeProps} color="gray">
            ❓ نامشخص
          </Badge>
        );
    }
  };

  console.log("paymentStatu", paymentStatus)

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        {/* Main Status Card */}
        <Card shadow="lg" padding="xl" radius="lg" withBorder>
          <Stack align="center" gap="lg">
            <Group gap="sm" align="center">
              <IconWallet size={24} />
              <Title order={2} c="gray.8">نتیجه شارژ کیف پول</Title>
            </Group>

            {renderStatusIcon()}

            <Stack align="center" gap="sm">
              {getStatusBadge()}
              
              <Text size="xl" fw={600} c={getStatusColor()} ta="center">
                {getStatusMessage()}
              </Text>
            </Stack>

            {/* Payment Details */}
            {paymentData && (
              <Card w="100%" bg="gray.0" p="md" radius="sm">
                <Stack gap="sm">
                  <Text size="sm" fw={500} c="gray.7">جزئیات تراکنش:</Text>
                  
                  <Divider />
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">شناسه تراکنش:</Text>
                    <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                      {paymentData?.transaction_id || 'نامشخص'}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">شناسه کاربر:</Text>
                    <Text size="sm" fw={500}>
                      {paymentData?.user_id || 'نامشخص'}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">مبلغ شارژ:</Text>
                    <Text size="lg" fw={700} c="green.8">
                      {paymentData.amount ? 
                        `${parseInt(paymentData.amount).toLocaleString()} تومان` : 
                        'نامشخص'
                      }
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">زمان تراکنش:</Text>
                    <Text size="sm" fw={500}>
                      {paymentData.timestamp ? 
                        new Date(paymentData.timestamp).toLocaleString('fa-IR') : 
                        'نامشخص'
                      }
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">درگاه پرداخت:</Text>
                    <Text size="sm" fw={500}>
                      {paymentData.gateway || 'نامشخص'}
                    </Text>
                  </Group>

                  {/* <Group justify="space-between">
                    <Text size="sm" c="dimmed">وضعیت اولیه:</Text>
                    <Badge 
                      size="sm" 
                      color={paymentData.status === 'OK' ? 'green' : 'red'}
                      variant="light"
                    >
                      {paymentData.status || 'نامشخص'}
                    </Badge>
                  </Group> */}

                  <Divider />
                </Stack>
              </Card>
            )}

            {/* Backend Response Details */}
            {walletPaymentStatus?.payment && (
              <Card w="100%" bg="blue.0" p="md" radius="sm">
                <Stack gap="sm">
                  <Group justify="space-between" align="center">
                    <Text size="sm" fw={500} c="blue.8">تایید:</Text>
                    <Badge 
                      size="sm" 
                      color={paymentStatus === 'success' ? 'green' : paymentStatus === 'pending' ? 'orange' : 'red'}
                      variant="filled"
                    >
                      {walletPaymentStatus.status?.toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </Group>
                  
                  <Divider />
                  
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">شماره سفارش:</Text>
                    <Text size="sm" fw={500} style={{ fontFamily: 'monospace' }}>
                      {walletPaymentStatus.payment.order_id || 'نامشخص'}
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">مبلغ تایید شده:</Text>
                    <Text size="sm" fw={600} c="blue.8">
                      {walletPaymentStatus.payment.payment_amount ? 
                        `${walletPaymentStatus.payment.payment_amount.toLocaleString()} تومان` :
                        'نامشخص'
                      }
                    </Text>
                  </Group>

                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">وضعیت نهایی:</Text>
                    <Badge 
                      size="sm" 
                      color={paymentStatus === 'success' ? 'green' : paymentStatus === 'pending' ? 'orange' : 'red'}
                      variant="filled"
                    >
                      {paymentStatus === 'success' ? 'پرداخت شده' : 
                       paymentStatus === 'pending' ? 'در انتظار' : 'خطا'}
                    </Badge>
                  </Group>

                  {/* Show wallet balance update if successful */}
                  {paymentStatus === 'success' && walletPaymentStatus.wallet_update && (
                    <>
                      <Divider />
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">موجودی جدید:</Text>
                        <Text size="sm" fw={600} c="green.8">
                          {walletPaymentStatus.wallet_update.new_balance?.toLocaleString()} تومان
                        </Text>
                      </Group>
                    </>
                  )}
                </Stack>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="خطا در تایید تراکنش"
                color="red"
                radius="md"
                w="100%"
              >
                {error}
              </Alert>
            )}

            {/* Action Button */}
            <Button
              variant="filled"
              color={paymentStatus === 'success' ? 'green' : 'blue'}
              size="lg"
              leftSection={<IconArrowLeft size={20} />}
              onClick={() => navigate("/account/wallet")}
              mt="md"
            >
              بازگشت به کیف پول
            </Button>
          </Stack>
        </Card>

        {/* Instructions */}
        <Paper bg="gray.0" p="md" radius="md">
          <Text size="xs" ta="center" c="gray.6">
            {paymentStatus === 'success' 
              ? "شارژ کیف پول با موفقیت انجام شد. موجودی جدید در حساب کاربری شما به‌روزرسانی شده است."
              : paymentStatus === 'pending'
              ? "تراکنش شما در حال بررسی است. لطفاً چند دقیقه دیگر مجدداً بررسی کنید."
              : "در صورت بروز مشکل، با پشتیبانی تماس بگیرید."
            }
          </Text>
        </Paper>

      </Stack>
    </Container>
  );
};

export default PaymentStatusCheckWallet;