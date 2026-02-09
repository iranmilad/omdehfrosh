import React, { useEffect, useState } from 'react'
import { 
  Table, 
  Title, 
  ScrollArea, 
  Button, 
  useMantineTheme, 
  Center, 
  Loader, 
  LoadingOverlay, 
  Pagination,
  Badge,
  Text,
  NumberFormatter,
  Group,
  Stack,
  Modal,
  Flex
} from '@mantine/core'
import { NavLink, useNavigate } from 'react-router';
import InfoBox from "../../../components/InfoBox"
import { useDispatch, useSelector } from 'react-redux';
import { useSessionQuery } from '../../../Libs/reactQuery';

function Account_Orders() {
    const { primaryColor } = useMantineTheme();
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 10;

    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const { isVerified, loading: authLoading, user } = useSelector((state) => state.auth);

    const { data: ordersData, isLoading: loadingOrdersByUserId, error: errorOrdersByUserId } = useSessionQuery({
      endpoint: "/orders/allordersbyuserid",
      queryKey: ["ordersByUserId"],
      enabled: !!token,
      queryOptions: { refetchOnMount: true }, // refetch when stale so coming from payment-listener shows updated list
      retry: (failureCount, error) => {
        const msg = typeof error === "string" ? error : error?.message || String(error);
        if (msg.includes("401")) return false;
        return failureCount < 2;
      },
    });

    const ordersByUserId = ordersData?.data ?? ordersData ?? {};
    const ordersList = ordersByUserId?.orders ?? [];

    // Format date function
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Get status badge info
    const getStatusBadge = (status, isPaid) => {
      if (isPaid === 'paid') {
        return { color: 'green', text: 'پرداخت شده' };
      }
      
      switch (status) {
        case 'processing':
          return { color: 'blue', text: 'در حال پردازش' };
        case 'completed':
          return { color: 'green', text: 'تکمیل شده' };
        case 'cancelled':
          return { color: 'red', text: 'لغو شده' };
        case 'pending':
          return { color: 'yellow', text: 'در انتظار' };
        default:
          return { color: 'gray', text: status };
      }
    };

    useEffect(() => {
      if (!authLoading && (!isVerified || !user)) {
        setLoginModalOpen(true);
        const timer = setTimeout(() => navigate("/login"), 3000);
        return () => clearTimeout(timer);
      }
      setLoginModalOpen(false);
    }, [isVerified, user, authLoading, navigate]);

    // Handle immediate redirect to login page
    const handleGoToLogin = () => {
      navigate('/login');
    };

    // Show loading while checking authentication
    if (authLoading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }

    // Show login modal if user is not authenticated
    if (!isVerified || !user) {
      return (
        <>
          <Modal
            opened={loginModalOpen}
            onClose={() => {}} // Prevent closing by clicking outside
            closeOnClickOutside={false}
            closeOnEscape={false}
            withCloseButton={false}
            title="ورود به حساب کاربری"
            centered
            overlayProps={{
              backgroundOpacity: 0,
              blur: 0,
            }}
          >
            <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
            <Text size="sm" c="dimmed" mb="md">
              در حال انتقال به صفحه ورود...
            </Text>
            <Flex gap="sm" justify="flex-end">
              <Button 
                onClick={handleGoToLogin}
              >
                رفتن به صفحه ورود
              </Button>
            </Flex>
          </Modal>
          
          {/* Show a placeholder content while modal is open */}
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">در حال بررسی وضعیت ورود...</Text>
            </Stack>
          </Center>
        </>
      );
    }

    // Get orders array and sort by date (newest first)
    const ordersArray = ordersList || [];
    const sortedOrders = [...ordersArray].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Calculate pagination
    const totalOrders = sortedOrders.length;
    const totalPages = Math.ceil(totalOrders / itemsPerPage);
    const startIndex = (activePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentOrders = sortedOrders.slice(startIndex, endIndex);

    if (loadingOrdersByUserId) return <Center><Loader /></Center>

    return (
      <>
        <Title my="lg" style={{ textAlign: 'right' }}>تمام سفارشات ({totalOrders})</Title>
        
        {totalOrders > 0 ? (
          <>
            <ScrollArea type="auto">
              <Table highlightOnHover style={{ direction: 'rtl' }}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th miw={150} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl' }}>
                      شماره سفارش
                    </Table.Th>
                    <Table.Th miw={120} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl' }}>
                      تاریخ ثبت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor} style={{ direction: 'rtl', whiteSpace: 'nowrap' }}>
                      وضعیت پرداخت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor} style={{ direction: 'rtl', whiteSpace: 'nowrap' }}>
                      وضعیت سفارش
                    </Table.Th>
                    <Table.Th miw={130} c={primaryColor} style={{ direction: 'rtl' }}>
                      مبلغ کل
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor} style={{ direction: 'rtl' }}>
                      تخفیف
                    </Table.Th>
                    <Table.Th miw={120} c={primaryColor} style={{ direction: 'rtl' }}>
                      روش پرداخت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl' }}>
                      عملیات
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {currentOrders.map((order) => (
                    <ItemRow key={order.orderId} {...order} />
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Center mt="xl">
                <Group>
                  <Text size="sm" c="dimmed">
                    نمایش {startIndex + 1} تا {Math.min(endIndex, totalOrders)} از {totalOrders} سفارش
                  </Text>
                  <Pagination 
                    total={totalPages} 
                    value={activePage} 
                    onChange={setActivePage}
                    size="sm"
                  />
                </Group>
              </Center>
            )}
          </>
        ) : (
          <InfoBox shadow='0'>
            <Stack align="center" gap="md">
              <Text size="lg" c="dimmed">سفارشی یافت نشد</Text>
              <Text size="sm" c="dimmed">هنوز هیچ سفارشی ثبت نکرده‌اید</Text>
              <Button component={NavLink} to="/shop" variant="light">
                شروع خرید
              </Button>
            </Stack>
          </InfoBox>
        )}
        
        {errorOrdersByUserId && (
          <InfoBox shadow='0' color="red">
            خطا در بارگذاری سفارشات. لطفاً دوباره تلاش کنید.
          </InfoBox>
        )}
      </>
    )
}

function ItemRow(props) {
    // Format date function
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Get payment status badge
    const getPaymentStatusBadge = (isPaid) => {
      switch (isPaid) {
        case 'paid':
          return { color: 'green', text: 'پرداخت شده' };
        case 'prepaid':
          return { color: 'blue', text: 'پیش‌پرداخت شده' };
        case 'selfprepaid':
          return { color: 'orange', text: 'مبلغ اولیه پرداخت شده' };
        case 'unpaid':
        default:
          return { color: 'red', text: 'پرداخت نشده' };
      }
    };

    // Get order status badge
    const getOrderStatusBadge = (status) => {
      switch (status) {
        case 'processing':
          return { color: 'blue', text: 'در حال پردازش' };
        case 'completed':
          return { color: 'green', text: 'تکمیل شده' };
        case 'cancelled':
          return { color: 'red', text: 'لغو شده' };
        case 'pending':
          return { color: 'yellow', text: 'در انتظار' };
        default:
          return { color: 'gray', text: status || 'نامشخص' };
      }
    };

    // Get payment method text
    const getPaymentMethodText = (paymentMethod) => {
      switch (paymentMethod) {
        case 'cod':
        case 'COD':
        case 'cash':
          return 'پرداخت در محل';
        case 'wallet':
          return 'کیف پول';
        case 'gateway':
          return 'درگاه پرداخت';
        case 'card':
          return 'کارتی';
        case 'online':
          return 'آنلاین';
        default:
          return paymentMethod || 'نامشخص';
      }
    };

    // Helper function to safely format order ID
    const formatOrderId = (orderId) => {
      if (!orderId) return 'نامشخص';
      // Convert to string first, then apply replace
      const orderIdStr = String(orderId);
      return orderIdStr.replace('order_', '');
    };

    const paymentStatus = getPaymentStatusBadge(props.isPaid);
    const orderStatus = getOrderStatusBadge(props.status);

    return (
      <Table.Tr>
        <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
          <Text size="sm" truncate style={{ maxWidth: 150 }}>
            {formatOrderId(props.orderId)}
          </Text>
        </Table.Td>
        <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
          <Text size="sm">
            {formatDate(props.createdAt)}
          </Text>
        </Table.Td>
        <Table.Td style={{ direction: 'rtl' }}>
          <Badge color={paymentStatus.color} variant="light" size="sm">
            {paymentStatus.text}
          </Badge>
        </Table.Td>
        <Table.Td style={{ direction: 'rtl' }}>
          <Badge color={orderStatus.color} variant="light" size="sm">
            {orderStatus.text}
          </Badge>
        </Table.Td>
        <Table.Td style={{ direction: 'rtl' }}>
          <Text size="sm" fw={500}>
            <NumberFormatter
              value={props.totalPrice || 0}
              thousandSeparator
            />{" "}
            تومان
          </Text>
        </Table.Td>
        <Table.Td style={{ direction: 'rtl' }}>
          <Text size="sm" c={props.totalDiscount > 0 ? "red" : "dimmed"}>
            {props.totalDiscount > 0 ? (
              <>
                <NumberFormatter
                  value={props.totalDiscount}
                  thousandSeparator
                />{" "}
                تومان
              </>
            ) : (
              "بدون تخفیف"
            )}
          </Text>
        </Table.Td>
        <Table.Td style={{ direction: 'rtl' }}>
          <Badge variant="outline" size="sm">
            {getPaymentMethodText(props.paymentType || props.paymentMethod)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: 'center', direction: 'rtl' }}>
          <Button
            radius="md"
            component={NavLink}
            to={`/account/orders/${props.orderId}`}
            size="sm"
            variant="light"
          >
            مشاهده
          </Button>
        </Table.Td>
      </Table.Tr>
    );
}

export default Account_Orders