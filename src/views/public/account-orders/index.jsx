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
import { verifyToken } from '../../../redux/auth/authusers/auth';
import { getUserMyAccount } from '../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrdersByUserId } from '../../../redux/orders/orders/getallordersbyuserid/getAllOrdersByUserIdActions';

function Account_Orders() {
    const { primaryColor } = useMantineTheme();
    const [activePage, setActivePage] = useState(1);
    const itemsPerPage = 10;
    
    // State for login modal
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
    const { order, loading, error } = useSelector((state) => state.orders)
    const { ordersByUserId, loadingOrdersByUserId, errorOrdersByUserId } = useSelector((state) => state.getAllOrdersByUserId)

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
      dispatch(verifyToken());
    }, [dispatch]);

    // Check authentication status and show modal, then redirect
    useEffect(() => {
      // Only check after auth loading is complete
      if (!authLoading) {
        if (!isVerified || !user) {
          setLoginModalOpen(true);
          // Auto redirect to login after 3 seconds
          const timer = setTimeout(() => {
            navigate('/login');
          }, 3000);
          
          // Cleanup timer if component unmounts
          return () => clearTimeout(timer);
        } else {
          setLoginModalOpen(false);
          // User is authenticated, fetch data
          dispatch(getUserMyAccount({userId: user.id}));
          dispatch(getAllOrdersByUserId());
        }
      }
    }, [dispatch, isVerified, user, authLoading, navigate]);

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
    const ordersArray = ordersByUserId?.orders || [];
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
        <Title my="lg">تمام سفارشات ({totalOrders})</Title>
        
        {totalOrders > 0 ? (
          <>
            <ScrollArea type="auto">
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th miw={150} c={primaryColor}>
                      شماره سفارش
                    </Table.Th>
                    <Table.Th miw={120} c={primaryColor}>
                      تاریخ ثبت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor}>
                      وضعیت پرداخت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor}>
                      وضعیت سفارش
                    </Table.Th>
                    <Table.Th miw={130} c={primaryColor}>
                      مبلغ کل
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor}>
                      تخفیف
                    </Table.Th>
                    <Table.Th miw={120} c={primaryColor}>
                      روش پرداخت
                    </Table.Th>
                    <Table.Th miw={100} c={primaryColor} ta="end">
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
        case 'cash':
          return 'نقدی';
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
        <Table.Td>
          <Text size="sm" truncate style={{ maxWidth: 150 }}>
            {formatOrderId(props.orderId)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm">
            {formatDate(props.createdAt)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge color={paymentStatus.color} variant="light" size="sm">
            {paymentStatus.text}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={orderStatus.color} variant="light" size="sm">
            {orderStatus.text}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500}>
            <NumberFormatter
              value={props.totalPrice || 0}
              thousandSeparator
            />{" "}
            تومان
          </Text>
        </Table.Td>
        <Table.Td>
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
        <Table.Td>
          <Badge variant="outline" size="sm">
            {getPaymentMethodText(props.paymentMethod)}
          </Badge>
        </Table.Td>
        <Table.Td ta="end">
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