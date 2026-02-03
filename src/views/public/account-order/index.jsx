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
  Container,
  SimpleGrid,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import Product from "./product";
import PriceText from "../../../components/priceText";
import OrderItemComment from "./OrderItemComment";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderDelivered } from "../../../redux/orders/orders/updateorderdelivered/updateOrderDeliveredActions";
import { useSessionQuery, useQueryClient } from "../../../Libs/reactQuery";

function Account_Order() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const [modalOpened, setModalOpened] = useState(false);

  const { isVerified, loading: authLoading, user } = useSelector((state) => state.auth);
  const { id } = useParams();

  const { data: orderData, isLoading: loading, error } = useSessionQuery({
    endpoint: `/orders/get/${id}`,
    queryKey: ["orderById", id],
    enabled: !!token && !!id,
    retry: (failureCount, err) => {
      const msg = typeof err === "string" ? err : err?.message || String(err);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const { data: ordersListData, isLoading: loadingOrdersByUserId } = useSessionQuery({
    endpoint: "/orders/allordersbyuserid",
    queryKey: ["ordersByUserId"],
    enabled: !!token,
    retry: (failureCount, err) => {
      const msg = typeof err === "string" ? err : err?.message || String(err);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const order = orderData?.data ?? orderData;
  const ordersByUserId = ordersListData?.data ?? ordersListData ?? {};
  const ordersList = ordersByUserId?.orders ?? [];

  const [currentOrder, setCurrentOrder] = useState(null);

  const navigate = useNavigate();

  const [delivered, setDelivered] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  // One comment per (order, product): hide "ثبت دیدگاه" for items user already commented on
  const [commentedProductIds, setCommentedProductIds] = useState(() => new Set());

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

  useEffect(() => {
    if (ordersList?.length > 0 && id) {
      const foundOrder = ordersList.find(o => o.orderId === id);
      setCurrentOrder(foundOrder);
      if (foundOrder) {
        setDelivered(foundOrder.delivered || false);
        setShowAlert(!(foundOrder.delivered || false) && foundOrder.isPaid === 'paid');
      }
    }
  }, [ordersList, id]);

  // Initialize commentedProductIds from order API so "ثبت دیدگاه" is hidden for items already commented
  useEffect(() => {
    const orderPayload = order?.order ?? order?.data?.order ?? order;
    const ids = orderPayload?.commentedProductIds ?? order?.commentedProductIds;
    const next = Array.isArray(ids) ? new Set(ids.map((x) => String(x))) : new Set();
    setCommentedProductIds(next);
  }, [order, id]);

  const handleDeliveryConfirmation = async (val) => {
    await dispatch(updateOrderDelivered({ orderId: id, deliveredStatus: val }));
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ["orderById", id] });
      queryClient.invalidateQueries({ queryKey: ["ordersByUserId"] });
    }
  };

  if (loadingOrdersByUserId || loading) return <Center><Loader /></Center>;

  function DeliveryConfirmationModal({ opened, onClose }) {
    const handleConfirmDelivery = async () => {
      await dispatch(updateOrderDelivered({ orderId: id, deliveredStatus: true }));
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["orderById", id] });
        queryClient.invalidateQueries({ queryKey: ["ordersByUserId"] });
      }
      onClose();
    };
  
    return (
      <Modal opened={opened} onClose={onClose} title="تایید تحویل سفارش">
        <Text size="sm">آیا از تحویل سفارش اطمینان دارید؟</Text>
        <Flex justify="flex-end" gap="xs" wrap="wrap" mt="md">
          <Button onClick={onClose} variant="outline" color="gray" size="sm">
            لغو
          </Button>
          <Button onClick={handleConfirmDelivery} color="green" size="sm">
            تایید
          </Button>
        </Flex>
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
    <Container size="md" px={{ base: 'xs', sm: 'md' }} py="md" style={{ minWidth: 0, overflow: 'hidden' }}>
      <Title order={2} style={{ alignItems: "center", textAlign: "right", wordBreak: 'break-word' }} display="flex">
        <IconArrowRight style={{ marginLeft: "10px", flexShrink: 0 }} /> جزئیات سفارش
      </Title>

      {/* Order Summary Card */}
      <Box p={{ base: 'sm', md: 'md' }} style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }} mt="md">
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 3 }} spacing="sm" verticalSpacing="sm">
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" fw={500} size="sm">شماره سفارش</Text>
            <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all' }}>{formatOrderId(displayOrder.orderId)}</Text>
          </Box>
          {displayOrder.createdAt && (
            <Box style={{ minWidth: 0 }}>
              <Text c="gray" fw={500} size="sm">تاریخ ثبت</Text>
              <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(displayOrder.createdAt)}</Text>
            </Box>
          )}
          {displayOrder.updatedAt && (
            <Box style={{ minWidth: 0 }}>
              <Text c="gray" fw={500} size="sm">آخرین بروزرسانی</Text>
              <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatDate(displayOrder.updatedAt)}</Text>
            </Box>
          )}
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" fw={500} size="sm">نحوه تحویل</Text>
            <Badge variant="outline" size="sm">{getDeliveryMethodText(displayOrder.deliveryType)}</Badge>
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" fw={500} size="sm">روش پرداخت</Text>
            <Badge variant="outline" size="sm">{getPaymentMethodText(displayOrder.paymentMethod)}</Badge>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Status Badges */}
      <Flex wrap="wrap" gap="xs" justify="flex-end" mt="md">
        <Badge
          color={paymentStatus.color}
          variant="light"
          radius="md"
          size="md"
          style={{ textAlign: 'center' }}
        >
          {paymentStatus.text}
        </Badge>
        <Badge
          color={orderStatus.color}
          variant="light"
          radius="md"
          size="md"
        >
          {orderStatus.text}
        </Badge>
      </Flex>
      
      <DeliveryConfirmationModal opened={modalOpened} onClose={() => setModalOpened(false)} />

      {/* Delivery Confirmation Alert */}
      {displayOrder.status !== "delivered" && displayOrder.isPaid === "paid" && (
        <Transition mounted={showAlert} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              <Alert mt="md" title="آیا سفارش به دستتان رسیده است؟">
                <LoadingOverlay visible={loading || loadingOrdersByUserId} zIndex={1000} />
                <Flex wrap="wrap" gap="xs" mt="xs">
                  <Button onClick={() => setModalOpened(true)} size="sm">تایید تحویل</Button>
                </Flex>
              </Alert>
            </div>
          )}
        </Transition>
      )}


      <Divider my={{ base: 'lg', md: 'xl' }} />
      
      {/* Customer Information */}
      <Box style={{ minWidth: 0 }}>
        <Text fw={600} size="sm" c="dimmed" mb="xs">اطلاعات تحویل</Text>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing="sm" verticalSpacing="sm">
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">تحویل گیرنده</Text>
            <Text size="sm" style={{ wordBreak: 'break-word' }}>{displayOrder.customerName || 'نامشخص'}</Text>
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">شماره موبایل</Text>
            <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums', wordBreak: 'break-all' }}>{displayOrder.customerPhone || 'نامشخص'}</Text>
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">ایمیل</Text>
            <Text size="sm" style={{ wordBreak: 'break-all' }}>{displayOrder.customerEmail || 'نامشخص'}</Text>
          </Box>
        </SimpleGrid>
      </Box>
      
      <Divider my={{ base: 'lg', md: 'xl' }} />
      
      {/* Financial Information */}
      <Box style={{ minWidth: 0 }}>
        <Text fw={600} size="sm" c="dimmed" mb="xs">اطلاعات مالی</Text>
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 2, md: 4 }} spacing="sm" verticalSpacing="sm">
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">مبلغ کل</Text>
            <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
              <NumberFormatter value={displayOrder.totalPrice || 0} thousandSeparator /> تومان
            </Text>
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">تخفیف</Text>
            {displayOrder.totalDiscount > 0 ? (
              <Text size="sm" c="red" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                <NumberFormatter value={displayOrder.totalDiscount} thousandSeparator /> تومان
              </Text>
            ) : (
              <Text size="sm" c="dimmed">بدون تخفیف</Text>
            )}
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">مبلغ نهایی</Text>
            <Text size="sm" fw={700} c="green" style={{ fontVariantNumeric: 'tabular-nums' }}>
              <NumberFormatter value={(displayOrder.totalPrice || 0) - (displayOrder.totalDiscount || 0)} thousandSeparator /> تومان
            </Text>
          </Box>
          <Box style={{ minWidth: 0 }}>
            <Text c="gray" size="xs">کد تخفیف</Text>
            <Badge variant="outline" size="sm" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayOrder.discountCodeId ? displayOrder.discountCodeId : "بدون تخفیف"}
            </Badge>
          </Box>
        </SimpleGrid>
      </Box>
      
      <Divider my={{ base: 'lg', md: 'xl' }} />
      <Title order={3} mb="md" style={{ textAlign: 'right', wordBreak: 'break-word' }}>اقلام سفارش</Title>
      
      {/* Order Items */}
      {displayOrder.items && displayOrder.items.length > 0 ? (
        <Stack gap="md">
          {displayOrder.items.map((item, index) => (
            <Card key={index} shadow="sm" p={{ base: 'sm', md: 'md' }} withBorder style={{ overflow: 'hidden', minWidth: 0 }}>
              <Stack gap="md">
                {/* Item Header */}
                <Flex justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                  <Flex wrap="wrap" gap="xs">
                    <Badge color={getPaymentStatusBadge(item.isPaid).color} variant="light" size="sm">
                      {getPaymentStatusBadge(item.isPaid).text}
                    </Badge>
                    <Badge color={getOrderStatusBadge(item.status).color} variant="light" size="sm">
                      {getOrderStatusBadge(item.status).text}
                    </Badge>
                  </Flex>
                  {item.vatRequested && item.vatLink && (item.isPaid === "paid" || item.isPaid === "selfprepaid") && (
                    <Badge
                      component="a"
                      href={item.vatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      p="xs"
                      color="blue"
                      variant="outline"
                      size="sm"
                      style={{ cursor: "pointer", flexShrink: 0 }}
                    >
                      دریافت فاکتور رسمی
                    </Badge>
                  )}
                </Flex>

                {/* Item Financial Details */}
                <SimpleGrid cols={{ base: 2, xs: 2, sm: 3, md: 4 }} spacing="sm" verticalSpacing="xs">
                  <Box style={{ minWidth: 0 }}>
                    <Text c="gray" size="xs">تعداد</Text>
                    <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>{item.quantity || 1}</Text>
                  </Box>
                  <Box style={{ minWidth: 0 }}>
                    <Text c="gray" size="xs">قیمت واحد</Text>
                    <Text size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <NumberFormatter value={item.price || 0} thousandSeparator /> تومان
                    </Text>
                  </Box>
                  {item.discount_price > 0 && (
                    <Box style={{ minWidth: 0 }}>
                      <Text c="gray" size="xs">تخفیف</Text>
                      <Text size="sm" c="red" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <NumberFormatter value={item.discount_price} thousandSeparator /> تومان
                      </Text>
                    </Box>
                  )}
                  <Box style={{ minWidth: 0 }}>
                    <Text c="gray" size="xs">قیمت کل</Text>
                    <Text size="sm" fw={700} c="green" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <NumberFormatter value={item.totalPrice || 0} thousandSeparator /> تومان
                    </Text>
                  </Box>
                  {item.vatRequested && (
                    <Box style={{ minWidth: 0 }}>
                      <Text c="gray" size="xs">قیمت با مالیات</Text>
                      <Text size="sm" fw={500} style={{ fontVariantNumeric: 'tabular-nums' }}>
                        <NumberFormatter value={item.priceWithVat || 0} thousandSeparator /> تومان
                      </Text>
                    </Box>
                  )}
                </SimpleGrid>

                {/* Product IDs */}
                {item.product_id && item.product_id.length > 0 && (
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={500} size="xs" c="dimmed" mb="xs">محصولات</Text>
                    <Flex wrap="wrap" gap="xs">
                      {item.product_id.map((product, idx) => (
                        <Badge key={idx} variant="outline" size="sm" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.id} {product.combinationId && `(${product.combinationId})`}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {/* Payment Method */}
                {item.paymentMethod && (
                  <Box style={{ minWidth: 0 }}>
                    <Text c="gray" size="xs">روش پرداخت</Text>
                    <Badge variant="outline" size="sm" style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.paymentMethod.name} - {getPaymentMethodText(item.paymentMethod.paymentMethod)}
                    </Badge>
                  </Box>
                )}

                {/* Add comment only when order is paid; one per (order, product) – hide once commented */}
                {item.product_id && item.product_id.length > 0 && (displayOrder.isPaid === 'paid' || displayOrder.isPaid === 'selfprepaid') && !commentedProductIds.has(String(item.product_id[0]?.id)) && (
                  <OrderItemComment
                    productId={item.product_id[0]?.id}
                    supplierIdFromOrder={item.supplier_id}
                    orderId={displayOrder.orderId}
                    onCommented={(productId) => {
                      setCommentedProductIds((prev) => new Set(prev).add(String(productId)));
                      queryClient.invalidateQueries({ queryKey: ["orderById", id] });
                    }}
                  />
                )}
              </Stack>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box p={{ base: 'sm', md: 'md' }} style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', minWidth: 0 }}>
          <Text c="dimmed" ta="center" size="sm">
            اطلاعات اقلام سفارش در حال بارگذاری...
          </Text>
          <Text c="dimmed" ta="center" size="xs" mt="xs">
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
          onClick={() => navigate("/payment")}
          size="lg"
        >
          مراجعه به صفحه پرداخت
        </Button>
        </Flex>
      )}
    </Container>
  );
}

export default Account_Order;