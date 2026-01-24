import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Title,
  Alert,
  Group,
  Button,
  Divider,
  Flex,
  Text,
  Badge,
  Stack,
  Center,
  Loader,
  LoadingOverlay,
  Transition,
  Modal,
  Box,
  Card,
  NumberFormatter,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Product from "./product";
import PriceText from "../../../components/priceText";
import { useDispatch, useSelector } from "react-redux";
import { getOrderByID } from "../../../redux/orders/orders/getorderbyid/getOrderByIDActions";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import { updateOrderDelivered } from "../../../redux/orders/orders/updateorderdelivered/updateOrderDeliveredActions";
import { getAllOrdersByUserId } from '../../../redux/orders/orders/getallordersbyuserid/getAllOrdersByUserIdActions';


function Account_Order() {

  const dispatch = useDispatch();

  const [modalOpened, setModalOpened] = useState(false);

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const { id } = useParams();

  // Get orders from Redux state
  const { ordersByUserId, loadingOrdersByUserId, errorOrdersByUserId } = useSelector((state) => state.getAllOrdersByUserId);
  
  const { order, loading, error } = useSelector((state) => state.orders)

  const { userInfo, errorUserInfo, loadingUserInfo } = useSelector((state) => state.user)
  
  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();

  const [delivered, setDelivered] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // Helper function to safely format order ID
  const formatOrderId = (orderId) => {
    if (!orderId) return 'نامشخص';
    if (typeof orderId !== 'string') return String(orderId);
    return orderId.replace('order_', '');
  };

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

  // Get delivery method text
  const getDeliveryMethodText = (deliveryType) => {
    switch (deliveryType) {
      case 'store_delivery':
        return 'تحویل در فروشگاه';
      case 'home_delivery':
        return 'تحویل در منزل';
      case 'post':
        return 'ارسال پستی';
      default:
        return deliveryType || 'نامشخص';
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
    case 'delivered':
      return { color: 'green', text: 'تحویل داده شد' }; // ✅ new
    default:
      return { color: 'gray', text: status || 'نامشخص' };
  }
};

  // Fetch orders if not already in Redux
  useEffect(() => {
    if (user && !ordersByUserId?.orders) {
      dispatch(getAllOrdersByUserId());
    }
  }, [dispatch, user, ordersByUserId]);

  useEffect(() => {
    if (user && id) {
      dispatch(getOrderByID({orderId: id}))
    }
  }, [dispatch, user, id])

  useEffect(() => {
    if (user) {
      dispatch(fetchUserInfo())
    }
  }, [dispatch, user])

  // Find the current order from the orders list
  useEffect(() => {
    if (ordersByUserId?.orders?.length > 0 && id) {
      const foundOrder = ordersByUserId.orders.find(order => order.orderId === id);
      setCurrentOrder(foundOrder);
      if (foundOrder) {
        setDelivered(foundOrder.delivered || false);
        setShowAlert(!(foundOrder.delivered || false) && foundOrder.isPaid === 'paid');
      }
    }
  }, [ordersByUserId, id]);

  const handleDeliveryConfirmation = async (val) => {
    dispatch(updateOrderDelivered(
      { 
        orderId: id, 
        deliveredStatus: val
      }
    ))

    if (user) {
      dispatch(getOrderByID({orderId: id}))
      dispatch(getAllOrdersByUserId());
    }
  };

  if (loadingOrdersByUserId || loading) return <Center><Loader /></Center>;

  function DeliveryConfirmationModal({ opened, onClose }) {
    const handleConfirmDelivery = () => {
      dispatch(updateOrderDelivered({ orderId: id, deliveredStatus: true }));
      dispatch(getOrderByID({orderId: id}))
      dispatch(getAllOrdersByUserId());
      onClose();
    };
  
    return (
      <Modal opened={opened} onClose={onClose} title="تایید تحویل سفارش">
        <Text>آیا از تحویل سفارش اطمینان دارید؟</Text>
        <Group position="right" mt="md">
          <Button onClick={onClose} variant="outline" color="gray">
            لغو
          </Button>
          <Button onClick={handleConfirmDelivery} color="green">
            تایید
          </Button>
        </Group>
      </Modal>
    );
  }

  // Use order from getOrderByID as primary source, fallback to currentOrder
  const detailedOrder = order?.order;
  const basicOrder = currentOrder;
  
  if (!detailedOrder && !basicOrder) {
    return (
      <Center>
        <Stack align="center">
          <Loader />
          <Text c="dimmed">در حال بارگذاری اطلاعات سفارش...</Text>
        </Stack>
      </Center>
    );
  }

  // Merge data from both sources
  const displayOrder = {
    // Basic info from getAllOrdersByUserId or getOrderByID
    orderId: detailedOrder?.id || basicOrder?.orderId,
    customerName: detailedOrder?.customer_name || basicOrder?.customerName,
    customerEmail: detailedOrder?.customer_email || basicOrder?.customerEmail,
    customerPhone: detailedOrder?.customer_phone_number || basicOrder?.customerPhone,
    totalPrice: detailedOrder?.total_price || basicOrder?.totalPrice,
    totalDiscount: detailedOrder?.total_discount || basicOrder?.totalDiscount,
    isPaid: detailedOrder?.isPaid || basicOrder?.isPaid,
    status: detailedOrder?.status || basicOrder?.status,
    deliveryType: detailedOrder?.delivery_type || basicOrder?.deliveryType,
    paymentMethod: detailedOrder?.payment_method || basicOrder?.paymentMethod,
    createdAt: detailedOrder?.createdAt || basicOrder?.createdAt,
    updatedAt: detailedOrder?.updatedAt || basicOrder?.updatedAt,
    discountCodeId: detailedOrder?.discount_code_id || basicOrder?.discountCodeId,
    delivered: detailedOrder?.delivered || basicOrder?.delivered,
    // Items from detailed order
    items: detailedOrder?.items || []
  };

  const paymentStatus = getPaymentStatusBadge(displayOrder.isPaid);
  const orderStatus = getOrderStatusBadge(displayOrder.status);

  return (
    <>
      <Title display="flex" style={{ alignItems: "center" }}>
        <IconArrowRight style={{ marginLeft: "10px" }} /> جزئیات سفارش
      </Title>

      {/* Order Summary Card */}
      <Box p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }} mt="md">
        <Flex columnGap={30} rowGap={15} wrap="wrap">
          <Flex gap="xs">
            <Text c="gray" fw={500}>شماره سفارش:</Text>
            <Text>{formatOrderId(displayOrder.orderId)}</Text>
          </Flex>
          {displayOrder.createdAt && (
            <Flex gap="xs">
              <Text c="gray" fw={500}>تاریخ ثبت:</Text>
              <Text>{formatDate(displayOrder.createdAt)}</Text>
            </Flex>
          )}
          {displayOrder.updatedAt && (
            <Flex gap="xs">
              <Text c="gray" fw={500}>آخرین بروزرسانی:</Text>
              <Text>{formatDate(displayOrder.updatedAt)}</Text>
            </Flex>
          )}
          <Flex gap="xs">
            <Text c="gray" fw={500}>نحوه تحویل:</Text>
            <Badge variant="outline">{getDeliveryMethodText(displayOrder.deliveryType)}</Badge>
          </Flex>
          <Flex gap="xs">
            <Text c="gray" fw={500}>روش پرداخت:</Text>
            <Badge variant="outline">{getPaymentMethodText(displayOrder.paymentMethod)}</Badge>
          </Flex>
        </Flex>
      </Box>

      {/* Status Badges */}
      <Group position="right" mt="md">
        <Badge
          color={paymentStatus.color}
          variant="light"
          radius="md"
          size="lg"
          px="md"
          py={6}
          style={{ textAlign: 'center', whiteSpace: 'normal' }}
        >
          {paymentStatus.text}
        </Badge>
        
        <Badge
          color={orderStatus.color}
          variant="light"
          radius="md"
          size="lg"
          px="md"
          py={6}
        >
          {orderStatus.text}
        </Badge>
      </Group>
      
      <DeliveryConfirmationModal opened={modalOpened} onClose={() => setModalOpened(false)} />

      {/* Delivery Confirmation Alert */}
      {displayOrder.status !== "delivered" && displayOrder.isPaid === "paid" && (
        <Transition mounted={showAlert} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              <Alert mt="md" title="آیا سفارش به دستتان رسیده است؟">
                <LoadingOverlay visible={loading || loadingOrdersByUserId} zIndex={1000} />
                <Group>
                  <Button onClick={() => setModalOpened(true)}>تایید تحویل</Button>
                </Group>
              </Alert>
            </div>
          )}
        </Transition>
      )}


      <Divider my="xl" />
      
      {/* Customer Information */}
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">تحویل گیرنده:</Text>
          <Text>{displayOrder.customerName || 'نامشخص'}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">شماره موبایل:</Text>
          <Text>{displayOrder.customerPhone || 'نامشخص'}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">ایمیل:</Text>
          <Text>{displayOrder.customerEmail || 'نامشخص'}</Text>
        </Flex>
      </Flex>
      
      <Divider my="xl" />
      
      {/* Financial Information */}
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">مبلغ کل:</Text>
          <Text fw={500}>
            <NumberFormatter
              value={displayOrder.totalPrice || 0}
              thousandSeparator
            />{" "}
            تومان
          </Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">مقدار تخفیف:</Text>
          {displayOrder.totalDiscount > 0 ? (
            <Text c="red" fw={500}>
              <NumberFormatter
                value={displayOrder.totalDiscount}
                thousandSeparator
              />{" "}
              تومان
            </Text>
          ) : (
            <Text c="dimmed">بدون تخفیف</Text>
          )}
        </Flex>
        <Flex gap="xs">
          <Text c="gray">مبلغ نهایی:</Text>
          <Text fw={700} c="green">
            <NumberFormatter
              value={(displayOrder.totalPrice || 0) - (displayOrder.totalDiscount || 0)}
              thousandSeparator
            />{" "}
            تومان
          </Text>
        </Flex>
        <Flex gap="xs" align="center">
          <Text c="gray">کد تخفیف استفاده شده:</Text>
          <Badge variant="outline">
            {displayOrder.discountCodeId ? displayOrder.discountCodeId : "بدون تخفیف"}
          </Badge>
        </Flex>
      </Flex>
      
      <Divider my="xl" />
      <Title mb="lg">اقلام سفارش</Title>
      
      {/* Order Items */}
      {displayOrder.items && displayOrder.items.length > 0 ? (
        <Stack>
          {displayOrder.items.map((item, index) => (
            <Card key={index} shadow="sm" p="md" withBorder>
              <Flex direction="column" gap="md">
                {/* Item Header */}
                <Flex justify="space-between" align="start">
                  <Flex direction="column" gap="xs">
                    {/* <Text fw={500} size="lg">
                      آیتم #{item.id?.replace('item_', '').substring(0, 8) || index + 1}
                    </Text> */}
                    <Group>
                      <Badge
                        color={getPaymentStatusBadge(item.isPaid).color}
                        variant="light"
                        size="sm"
                      >
                        {getPaymentStatusBadge(item.isPaid).text}
                      </Badge>
                      <Badge
                        color={getOrderStatusBadge(item.status).color}
                        variant="light"
                        size="sm"
                      >
                        {getOrderStatusBadge(item.status).text}
                      </Badge>
                    </Group>
                  </Flex>
                  
                  {/* VAT Invoice Link */}
                  {item.vatRequested && item.vatLink && (item.isPaid === "paid" || item.isPaid === "selfprepaid") && (
                    <Badge
                      component="a"
                      href={item.vatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      p="sm"
                      color="blue"
                      variant="outline"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e0f0ff"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      دریافت فاکتور رسمی
                    </Badge>
                  )}
                </Flex>

                {/* Item Financial Details */}
                <Flex columnGap={30} rowGap={15} wrap="wrap">
                  <Flex gap="xs">
                    <Text c="gray">تعداد:</Text>
                    <Text fw={500}>{item.quantity || 1}</Text>
                  </Flex>
                  <Flex gap="xs">
                    <Text c="gray">قیمت واحد:</Text>
                    <Text>
                      <NumberFormatter
                        value={item.price || 0}
                        thousandSeparator
                      />{" "}
                      تومان
                    </Text>
                  </Flex>
                  {item.discount_price > 0 && (
                    <Flex gap="xs">
                      <Text c="gray">تخفیف:</Text>
                      <Text c="red">
                        <NumberFormatter
                          value={item.discount_price}
                          thousandSeparator
                        />{" "}
                        تومان
                      </Text>
                    </Flex>
                  )}
                  <Flex gap="xs">
                    <Text c="gray">قیمت کل:</Text>
                    <Text fw={700} c="green">
                      <NumberFormatter
                        value={item.totalPrice || 0}
                        thousandSeparator
                      />{" "}
                      تومان
                    </Text>
                  </Flex>
                  {item.vatRequested && (
                    <Flex gap="xs">
                      <Text c="gray">قیمت با مالیات:</Text>
                      <Text fw={500}>
                        <NumberFormatter
                          value={item.priceWithVat || 0}
                          thousandSeparator
                        />{" "}
                        تومان
                      </Text>
                    </Flex>
                  )}
                </Flex>

                {/* Product Details */}
                {item.product_id && item.product_id.length > 0 && (
                  <Box>
                    <Text fw={500} mb="xs">محصولات:</Text>
                    {item.product_id.map((product, idx) => (
                      <Badge key={idx} variant="outline" mr="xs" mb="xs">
                        {product.id} {product.combinationId && `(ترکیب: ${product.combinationId})`}
                      </Badge>
                    ))}
                  </Box>
                )}

                {/* Payment Method */}
                {item.paymentMethod && (
                  <Flex gap="xs">
                    <Text c="gray">روش پرداخت:</Text>
                    <Badge variant="outline">
                      {item.paymentMethod.name} - {getPaymentMethodText(item.paymentMethod.paymentMethod)}
                    </Badge>
                  </Flex>
                )}
              </Flex>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <Text c="dimmed" ta="center">
            اطلاعات اقلام سفارش در حال بارگذاری...
          </Text>
          <Text c="dimmed" ta="center" size="sm" mt="xs">
            اطلاعات کلی سفارش در بالا نمایش داده شده است
          </Text>
        </Box>
      )}

      {/* Payment Button for Unpaid Orders */}
      {(displayOrder.isPaid === "unpaid" || displayOrder.isPaid === "prepaid") && (
        <Flex 
          justify={{ base: "center", md: "flex-end" }}
          w="100%"
          mt="xl"
        >
        <Button
          onClick={() => navigate(`/payment-statuscheck?order_id=${displayOrder.orderId}`)}
          size="lg"
        >
          مراجعه به صفحه پرداخت
        </Button>
        </Flex>
      )}
    </>
  );
}

export default Account_Order;