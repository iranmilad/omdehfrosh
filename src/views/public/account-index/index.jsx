import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridCol,
  Image,
  Loader,
  NumberFormatter,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  useMantineTheme,
  Badge,
  Modal,
  Stack,
  Group,
} from "@mantine/core";
import { IconBasket, IconCreditCard, IconMessage2, IconLogin } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import ProductBox from "../../../components/productBox";
import { useDispatch, useSelector } from "react-redux";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import MyAccountProductBox from "../../../components/myaccountproductbox";
import { clearTicketCreationState } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketSlice";
import {getAllOrdersByUserId} from '../../../redux/orders/orders/getallordersbyuserid/getAllOrdersByUserIdActions'


function Account_Index() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for login modal
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { userAccount, loading, error } = useSelector((state) => state.userMyAccounts);
  const { ordersByUserId, loadingOrdersByUserId, errorOrdersByUserId } = useSelector((state) => state.getAllOrdersByUserId);

  const { primaryColor } = useMantineTheme();

  // Track if data has been fetched to prevent duplicate calls
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    dispatch(clearTicketCreationState())
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
        // User is authenticated, fetch data only once
        if (!hasFetchedData) {
          dispatch(getUserMyAccount());
          dispatch(getAllOrdersByUserId());
          setHasFetchedData(true);
        }
      }
    }
  }, [dispatch, isVerified, user, authLoading, navigate, hasFetchedData]);

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

  // Get status badge color and text
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
            <IconLogin size={80} color="#e9ecef" />
            <Text size="xl" c="dimmed">در حال بررسی وضعیت ورود...</Text>
          </Stack>
        </Center>
      </>
    );
  }

  // Show loading if data is being fetched (only after authentication is confirmed)
  if (loading || loadingOrdersByUserId) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  // Main authenticated content
  return (
    <>
      {/* Only show stats grid if userAccount exists */}
      {userAccount && (
        <Grid grow>
          {/* Only show wallet balance if wallet data exists */}
          {userAccount.wallet && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-red-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-red-600 rounded-xl p-2">
                  <IconCreditCard className="text-zinc-100" />
                </div>
                <div className="text-zinc-50 space-y-1">
                  <div>موجودی حساب</div>
                  <div>
                    <NumberFormatter
                      value={userAccount.wallet.balance || 0}
                      thousandSeparator
                    />{" "}
                    تومان
                  </div>
                </div>
              </div>
            </GridCol>
          )}
          
          {/* Only show total orders if data exists */}
          {typeof userAccount.all_orders !== 'undefined' && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-green-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-green-600 rounded-xl p-2">
                  <IconBasket className="text-zinc-100" />
                </div>
                <div className="text-zinc-100 space-y-1">
                  <div>سفارشات کل</div>
                  <div>{ordersByUserId?.orders?.length || userAccount.all_orders || 0}</div>
                </div>
              </div>
            </GridCol>
          )}
          
          {/* Only show tickets if data exists */}
          {typeof userAccount.tickets !== 'undefined' && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-blue-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-blue-600 rounded-xl p-2">
                  <IconMessage2 className="text-zinc-100" />
                </div>
                <div className="text-zinc-100 space-y-1">
                  <div>پیام ها</div>
                  <div>{userAccount.tickets}</div>
                </div>
              </div>
            </GridCol>
          )}
        </Grid>
      )}
      
      {/* Orders section using ordersByUserId data */}
      <Title my="lg">آخرین سفارشات</Title>
      <ScrollArea type="auto">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th miw={150} c={primaryColor}>
                شماره سفارش
              </Table.Th>
              <Table.Th miw={120} c={primaryColor}>
                تاریخ
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                وضعیت
              </Table.Th>
              <Table.Th miw={130} c={primaryColor}>
                مبلغ کل
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                تخفیف
              </Table.Th>
              <Table.Th miw={120} c={primaryColor}>
                نحوه پرداخت
              </Table.Th>
              <Table.Th miw={100} c={primaryColor} ta="end">
                عملیات
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {ordersByUserId?.orders?.length > 0 ? (
              [...ordersByUserId.orders] // Create a copy to avoid mutating the original array
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest first
                .slice(0, 10) // Show only latest 10 orders
                .map((order) => (
                  <Table.Tr key={order.orderId}>
                    <Table.Td>
                      <Text size="sm" truncate style={{ maxWidth: 150 }}>
                        {String(order.orderId).replace('order_', '')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {formatDate(order.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {(() => {
                        const statusInfo = getStatusBadge(order.status, order.isPaid);
                        return (
                          <Badge color={statusInfo.color} variant="light" size="sm">
                            {statusInfo.text}
                          </Badge>
                        );
                      })()}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        <NumberFormatter
                          value={order.totalPrice}
                          thousandSeparator
                        />{" "}
                        تومان
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="red">
                        <NumberFormatter
                          value={order.totalDiscount}
                          thousandSeparator
                        />{" "}
                        تومان
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="sm">
                        {order.paymentMethod === 'cash' ? 'نقدی' : 
                         order.paymentMethod === 'card' ? 'کارتی' : 
                         order.paymentMethod}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="end">
                      <Button
                        radius="md"
                        component={NavLink}
                        to={`/account/orders/${order.orderId}`}
                        size="sm"
                        variant="light"
                      >
                        مشاهده
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center">
                  <Text c="dimmed" py="xl">
                    هیچ سفارشی یافت نشد
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      
      {/* Show "View All Orders" button if there are more than 10 orders */}
      {ordersByUserId?.orders?.length > 10 && (
        <Center mt="md">
          <Button
            component={NavLink}
            to="/account/orders"
            variant="outline"
          >
            مشاهده همه سفارشات ({ordersByUserId.orders.length})
          </Button>
        </Center>
      )}
      
      {/* Only show favorites section if userAccount exists */}
      {userAccount && (
        <>
          <Title my="lg">محصولات علاقه مندی شما</Title>
          <Swiper
            spaceBetween={10}
            navigation={false}
            slidesPerView={"auto"}
            style={{ paddingBottom: "40px", paddingInlineStart: "10px" }}
          >
            {userAccount?.favorites?.length > 0 ? (
              userAccount.favorites.map((item, index) => (
                <SwiperSlide key={index} style={{ width: "280px" }}>
                  <MyAccountProductBox {...item} />
                </SwiperSlide>
              ))
            ) : (
              <Text ta="center">هیچ محصولی در لیست علاقه‌مندی شما نیست</Text>
            )}
          </Swiper>
        </>
      )}
    </>
  );
}

export default Account_Index;