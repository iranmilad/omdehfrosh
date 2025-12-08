import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Loader,
  Stack,
  Group,
  Flex,
  Badge,
  Grid,
  Alert,
  Divider,
  Box,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconClock,
  IconPackage,
  IconUser,
  IconCreditCard,
  IconInfoCircle,
  IconArrowRight,
} from "@tabler/icons-react";
import { verifyPayment } from "../../../redux/payment/verifypayment/verifyPaymentActions";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

const PaymentStatusCheck = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  
  // Parse the complete payment data from URL parameters
  const paymentDataString = queryParams.get("paymentData");
  
  let completePaymentData = null;
  try {
    if (paymentDataString) {
      completePaymentData = JSON.parse(paymentDataString);
    }
  } catch (error) {
    console.error("Error parsing payment data:", error);
  }

  // Get order_id from complete payment data body or fallback to URL param
  const order_id = completePaymentData?.body?.order_id || queryParams.get("order_id");

  const { paymentStatus, loading, error } = useSelector((state) => state.verifypayment);

  // Local state for processed order data
  const [orderItems, setOrderItems] = useState([]);
  const [mainOrder, setMainOrder] = useState(null);
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [webhookProcessing, setWebhookProcessing] = useState(false);
  const [webhookError, setWebhookError] = useState(null);
  const [webhookProcessed, setWebhookProcessed] = useState(false);

  // Helper functions - memoized to prevent re-creation
  const getPaymentStatusInfo = useCallback((isPaid) => {
    switch (isPaid) {
      case "paid":
        return { color: "teal", text: "پرداخت شده", icon: IconCheck };
      case "prepaid":
        return { color: "orange", text: "مبلغ اولیه پرداخت شده", icon: IconClock };
      case "selfprepaid":
        return { color: "orange", text: "مبلغ اولیه پرداخت شده - تماس با تامین کننده", icon: IconClock };
      case "unpaid":
        return { color: "red", text: "پرداخت نشده", icon: IconX };
      default:
        return { color: "gray", text: "نامشخص", icon: IconClock };
    }
  }, []);

  const getOrderStatusInfo = useCallback((status) => {
    switch (status) {
      case "waiting":
        return { color: "orange", text: "در انتظار پردازش" };
      case "processing":
        return { color: "blue", text: "در حال پردازش" };
      case "shipped":
        return { color: "cyan", text: "ارسال شده" };
      case "delivered":
        return { color: "teal", text: "تحویل داده شده" };
      case "cancelled":
        return { color: "red", text: "لغو شده" };
      case "basket":
        return { color: "gray", text: "در سبد خرید" };
      case "failed":
        return { color: "red", text: "ناموفق" };
      case "pending":
        return { color: "yellow", text: "در انتظار پرداخت" };
      case "rejected":
        return { color: "red", text: "رد شده" };
      default:
        return { color: "gray", text: status || "نامشخص" };
    }
  }, []);

  // Handle payment webhook when receiving complete payment data from external gateway
  useEffect(() => {
    const handlePaymentWebhook = async () => {
      // Check if we have complete payment data from URL (coming from external gateway)
      if (completePaymentData && order_id && !webhookProcessed && !webhookProcessing) {
        setWebhookProcessing(true);
        
        try {
          const response = await fetch(getApiUrl("/payment/paymentwebhook"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(completePaymentData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
          }

          setWebhookProcessed(true);
          
          // Fetch updated payment status after successful webhook
          if (order_id) {
            dispatch(verifyPayment({ order_id }));
          }

        } catch (error) {
          console.error("Payment webhook error:", error);
          setWebhookError(error.message || "خطا در پردازش پرداخت");
          setWebhookProcessed(true);
        } finally {
          setWebhookProcessing(false);
        }
      }
    };

    handlePaymentWebhook();
  }, [completePaymentData, order_id, dispatch, webhookProcessed, webhookProcessing]);

  // Fetch payment status - only when needed and not processing webhook
  useEffect(() => {
    if (order_id && !completePaymentData && !webhookProcessing) {
      // Only fetch if not coming from external gateway (no paymentData parameter)
      dispatch(verifyPayment({ order_id }));
    }
  }, [dispatch, order_id, completePaymentData, webhookProcessing]);

  // Process payment status data - only when paymentStatus changes
  useEffect(() => {
    if (paymentStatus?.order) {
      setMainOrder({
        id: paymentStatus.order.order_id,
        isPaid: paymentStatus.order.isPaid,
        status: paymentStatus.order.status,
        customer_name: paymentStatus.order.customer_name,
        customer_phone_number: paymentStatus.order.customer_phone_number,
        total_price: paymentStatus.order.totalPriceToPay,
        delivery_type: paymentStatus.order.delivery_type,
        paymentComment: paymentStatus.order.paymentComment
      });

      if (paymentStatus.order.sellers) {
        const items = paymentStatus.order.sellers.map((seller, index) => ({
          id: seller.seller.id || `seller-${index}`,
          isPaid: seller.isPaid,
          status: seller.status || 'waiting',
          supplier_id: seller.seller.label,
          quantity: seller.quantity || 1,
          price: seller.price,
          discount_price: seller.discount_price || 0,
          totalPrice: seller.totalPrice,
          vatRequested: seller.vatRequested,
          paymentMethod: seller.paymentMethod,
          product_id: seller.products || [],
          vatLink: seller.vatLink,
          paymentComment: seller.paymentComment
        }));
        setOrderItems(items);
      }

      if (paymentStatus.relatedOrders && paymentStatus.relatedOrders.length > 0) {
        setRelatedOrders(paymentStatus.relatedOrders);
      }
    }
  }, [paymentStatus]);

  // Navigation functions - memoized to prevent re-creation
  const navigateToRelatedOrder = useCallback((relatedOrderId) => {
    navigate(`/payment-statuscheck?order_id=${relatedOrderId}`);
  }, [navigate]);

  const navigateToPayment = useCallback((supplierId = null, gateway = "online") => {
    let selectedSeller = null;
    let selectedOrderItem = null;
    
    if (supplierId && paymentStatus?.order?.sellers) {
      selectedSeller = paymentStatus.order.sellers.find(
        seller => seller.seller.id === supplierId
      );
      selectedOrderItem = paymentStatus.orderItems?.find(
        orderItem => orderItem.supplier_id === supplierId
      );
    }
    
    const sellerToUse = selectedSeller || paymentStatus?.order?.sellers?.[0];
    const orderItemToUse = selectedOrderItem || paymentStatus?.orderItems?.[0];
    
    if (!sellerToUse || !orderItemToUse) {
      console.error("No seller or order item found");
      return;
    }
    
    navigate("/payment-info", { 
      state: { 
        source: "checkstatus",
        gateway: orderItemToUse.paymentMethod?.paymentMethod || gateway,
        paymentStatus: paymentStatus,
        sellerId: sellerToUse.seller.id,
        sellerData: {
          seller: sellerToUse.seller,
          priceApplyEachSeller: orderItemToUse.totalPrice,
          items: [{
            item: {
              name: `محصول از ${sellerToUse.seller.label}`,
              productId: orderItemToUse.product_id?.map(p => p.id) || [],
              priceWithVat: {
                regularPriceWithVat: orderItemToUse.price,
                discountedPriceWithVat: orderItemToUse.totalPrice
              },
              attributes: []
            },
            quantity: orderItemToUse.quantity
          }],
          vatRequested: orderItemToUse.vatRequested,
          paymentMethod: orderItemToUse.paymentMethod
        },
        orderId: mainOrder?.id || order_id,
        amount: orderItemToUse.totalPrice,
        orderTracking: []
      } 
    });
  }, [navigate, paymentStatus, mainOrder?.id, order_id]);

  // Memoized computed values
  const filteredRelatedOrders = useMemo(() => 
    relatedOrders.filter(order => order.id !== order_id), 
    [relatedOrders, order_id]
  );

  const overallPaymentStatus = useMemo(() => mainOrder?.isPaid || "unpaid", [mainOrder?.isPaid]);
  const overallStatusInfo = useMemo(() => getPaymentStatusInfo(overallPaymentStatus), [getPaymentStatusInfo, overallPaymentStatus]);
  const StatusIcon = overallStatusInfo.icon;

  // Loading state
  if (loading || webhookProcessing) {
    return (
      <Flex justify="center" align="center" h="60vh">
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text size="sm" c="dimmed">
            {webhookProcessing ? "در حال پردازش پرداخت..." : "در حال بارگذاری اطلاعات سفارش..."}
          </Text>
        </Stack>
      </Flex>
    );
  }

  // Error state
  if (error || webhookError) {
    return (
      <Container size="sm" mt="xl">
        <Paper bg="red.0">
          <Stack align="center" gap="lg">
            <IconX size={48} color="var(--mantine-color-red-6)" />
            <Text size="lg" c="red" fw={500} ta="center">
              {webhookError || error}
            </Text>
            <Button 
              variant="light" 
              color="brand"
              onClick={() => navigate("/account/orders")}
            >
              بازگشت به سفارش‌ها
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  // No data state
  if (!paymentStatus?.order) {
    return (
      <Container size="sm" mt="xl">
        <Paper bg="gray.0">
          <Stack align="center" gap="lg">
            <IconClock size={48} color="var(--mantine-color-gray-6)" />
            <Text size="lg" c="gray" fw={500} ta="center">
              اطلاعات سفارش در دسترس نیست
            </Text>
            <Button 
              variant="light" 
              color="brand"
              onClick={() => navigate("/account/orders")}
            >
              بازگشت به سفارش‌ها
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md" mt="xl">
      <Stack gap="lg">
        {/* Success/failure message from external gateway */}
        {completePaymentData && (
          <Alert
            color={completePaymentData.status === 'OK' ? 'teal' : 'red'}
            title={completePaymentData.status === 'OK' ? 'پرداخت موفق' : 'پرداخت ناموفق'}
            icon={completePaymentData.status === 'OK' ? <IconCheck size={20} /> : <IconX size={20} />}
            variant="light"
          >
            <Stack gap="xs">
              <Text size="sm">
                {completePaymentData.status === 'OK' 
                  ? 'پرداخت شما با موفقیت در درگاه خارجی انجام شد و در حال پردازش است.' 
                  : 'پرداخت شما در درگاه خارجی ناموفق بود. می‌توانید دوباره تلاش کنید.'
                }
              </Text>
              {completePaymentData.body?.transaction_id && (
                <Text size="xs" c="dimmed">
                  شماره تراکنش: {completePaymentData.body.transaction_id}
                </Text>
              )}
            </Stack>
          </Alert>
        )}

        {/* Main Order Header */}
        <Paper bg="gray.0">
          <Stack gap="md" align="center">
            <Title order={2} ta="center" size="h3">
              وضعیت سفارش
            </Title>

            <Flex align="center" gap="sm">
              <StatusIcon size={32} color={`var(--mantine-color-${overallStatusInfo.color}-6)`} />
              <Text size="xl" c={overallStatusInfo.color} fw={600}>
                {overallStatusInfo.text}
              </Text>
            </Flex>

            {mainOrder && (
              <Stack gap="xs" w="100%">
                <Flex justify="space-between" align="center">
                  <Text size="lg" c="brand" fw={500}>
                    شماره سفارش: {mainOrder.id}
                  </Text>
                  <div style={{ marginTop: 8 }}>
                    <Badge 
                      color={getOrderStatusInfo(mainOrder.status).color}
                      variant="light"
                      size="lg"
                      w="fit-content"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {getOrderStatusInfo(mainOrder.status).text}
                    </Badge>
                  </div>
                </Flex>

                <Divider my="xs" />

                <Flex justify="space-between">
                  <Text size="sm" c="dimmed">
                    مشتری: {mainOrder.customer_name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    مبلغ کل: {mainOrder.total_price?.toLocaleString()} تومان
                  </Text>
                </Flex>

                <Flex justify="space-between">
                  <Text size="xs" c="dimmed">
                    تلفن: {mainOrder.customer_phone_number}
                  </Text>
                  <Text size="xs" c="dimmed">
                    نوع تحویل: {mainOrder.delivery_type === "store_delivery" ? "تحویل از فروشگاه" : "ارسال پستی"}
                  </Text>
                </Flex>
              </Stack>
            )}

            {/* Payment Comment */}
            {mainOrder?.paymentComment && (
              <Paper w="100%" bg="blue.0" withBorder>
                <Text size="sm" c="blue.8" ta="center">
                  پیام پرداخت: {mainOrder.paymentComment}
                </Text>
              </Paper>
            )}
          </Stack>
        </Paper>

        {/* Order Items */}
        <Stack gap="md">
          <Title order={3} c="dimmed" size="h4">
            آیتم‌های سفارش ({orderItems.length} مورد)
          </Title>

          {orderItems.map((item, index) => {
            const itemStatusInfo = getPaymentStatusInfo(item.isPaid);
            const ItemStatusIcon = itemStatusInfo.icon;
            const orderStatusInfo = getOrderStatusInfo(item.status);

            return (
              <Paper
                key={`${item.id}-${index}`}
                bg={item.isPaid === "paid" ? "teal.0" : item.isPaid === "unpaid" ? "red.0" : "orange.0"}
                withBorder
              >
                <Stack gap="sm">
                  <Flex justify="space-between" align="flex-start">
                    <Group gap="xs">
                      <IconPackage size={20} color="var(--mantine-color-gray-6)" />
                    </Group>
                    <Group gap="xs">
                      <Badge 
                        color={orderStatusInfo.color}
                        variant="light"
                        w="fit-content"
                        style={{ whiteSpace: "nowrap" }}
                      >
                        {orderStatusInfo.text}
                      </Badge>
                      {item.isPaid !== "paid" && (
                        <Button
                          size="xs"
                          color={item.isPaid === "unpaid" ? "brand" : "orange"}
                          onClick={() => navigateToPayment(item.supplier_id, item.paymentMethod?.paymentMethod || "online")}
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {item.isPaid === "unpaid" ? "پرداخت" : "تکمیل پرداخت"}
                        </Button>
                      )}
                    </Group>
                  </Flex>

                  <Flex align="center" gap="xs">
                    <ItemStatusIcon size={20} color={`var(--mantine-color-${itemStatusInfo.color}-6)`} />
                    <Text c={itemStatusInfo.color} fw={500} size="sm">
                      {itemStatusInfo.text}
                    </Text>
                  </Flex>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Group gap="xs">
                          <IconUser size={16} color="var(--mantine-color-gray-6)" />
                          <Text size="xs" c="dimmed">
                            تامین‌کننده: {item.supplier_id}
                          </Text>
                        </Group>
                        <Text size="xs" c="dimmed">
                          تعداد: {item.quantity}
                        </Text>
                        <Text size="xs" c="dimmed">
                          قیمت واحد: {item.price?.toLocaleString()} تومان
                        </Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="xs">
                        <Text size="xs" c="dimmed">
                          تخفیف: {item.discount_price?.toLocaleString()} تومان
                        </Text>
                        <Text size="md" c="brand.8" fw={600}>
                          مبلغ کل: {item.totalPrice?.toLocaleString()} تومان
                        </Text>
                        {item.vatRequested && (
                          <Badge color="teal" variant="light" size="sm" w="fit-content" style={{ whiteSpace: "nowrap" }}>
                            فاکتور درخواست شده
                          </Badge>
                        )}
                      </Stack>
                    </Grid.Col>
                  </Grid>

                  {item.paymentMethod && (
                    <Group gap="xs">
                      <IconCreditCard size={16} color="var(--mantine-color-gray-6)" />
                      <Text size="xs" c="dimmed">
                        روش پرداخت: {item.paymentMethod.name === "melli" ? "بانک ملی" : item.paymentMethod.name}
                      </Text>
                      <Badge variant="outline" size="sm" w="fit-content" style={{ whiteSpace: "nowrap" }}>
                        {item.paymentMethod.paymentMethod === "online" ? "آنلاین" : "نقدی"}
                      </Badge>
                    </Group>
                  )}

                  {item.product_id && item.product_id.length > 0 && (
                    <Paper bg="gray.1" withBorder={false}>
                      <Text size="xs" c="dimmed" mb="xs">محصولات:</Text>
                      <Stack gap={4}>
                        {item.product_id.map((product, prodIndex) => (
                          <Text key={`${product.id}-${prodIndex}`} size="xs" c="dimmed">
                            کد محصول: {product.id}
                          </Text>
                        ))}
                      </Stack>
                    </Paper>
                  )}

                  {item.vatLink && (
                    <Text size="xs" c="brand.6">
                      لینک فاکتور: {item.vatLink}
                    </Text>
                  )}

                  {item.paymentComment && (
                    <Paper bg="blue.0" withBorder={false}>
                      <Text size="xs" c="blue.8">
                        پیام: {item.paymentComment}
                      </Text>
                    </Paper>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>

        {/* Action Buttons */}
        <Paper>
          <Stack gap="md">
            {(overallPaymentStatus === "prepaid" || overallPaymentStatus === "unpaid") && (
              <Button
                fullWidth
                size="lg"
                color={overallPaymentStatus === "unpaid" ? "brand" : "orange"}
                onClick={() => navigateToPayment(null, "online")}
              >
                {overallPaymentStatus === "unpaid" ? "پرداخت" : "تکمیل پرداخت"}
              </Button>
            )}

            {overallPaymentStatus === "paid" && (
              <Text ta="center" c="teal" size="lg" fw={500}>
                پرداخت با موفقیت کامل شد
              </Text>
            )}

            {paymentStatus?.order?.status === "failed" && (
              <Text ta="center" c="red" size="lg" fw={500}>
                پرداخت ناموفق بود. برای تلاش دوباره به بخش سفارش‌ها مراجعه کنید.
              </Text>
            )}

            <Button
              fullWidth
              variant="light"
              color="gray"
              onClick={() => navigate("/account/orders")}
            >
              بازگشت به سفارش‌ها
            </Button>
          </Stack>
        </Paper>

        {/* Related Orders Section */}
        {filteredRelatedOrders.length > 0 && (
          <Paper mt="md">
            <Stack gap="md">
              <Group gap="xs">
                <IconInfoCircle size={20} color="var(--mantine-color-brand-6)" />
                <Title order={4} c="brand" size="h5">
                  سفارش‌های مرتبط ({filteredRelatedOrders.length} مورد)
                </Title>
              </Group>
              
              <Alert color="brand" variant="light">
                <Text size="sm">
                  این سفارش‌های مرتبط نیز برای حساب شما ثبت شده‌اند. برای مشاهده جزئیات هر سفارش روی آن کلیک کنید.
                </Text>
              </Alert>

              <Stack gap="xs">
                {filteredRelatedOrders.map((relatedOrder) => {
                  const relatedStatusInfo = getOrderStatusInfo(relatedOrder.status);
                  const needsPayment = relatedOrder.status === "pending" || relatedOrder.status === "rejected";
                  
                  return (
                    <Paper
                      key={relatedOrder.id}
                      bg={needsPayment ? "yellow.0" : "gray.0"}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigateToRelatedOrder(relatedOrder.id)}
                      withBorder
                    >
                      <Flex justify="space-between" align="center">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Group gap="xs">
                            <Text size="sm" fw={500} c="brand.8">
                              شماره سفارش: {relatedOrder.id}
                            </Text>
                            <Badge 
                              color={relatedStatusInfo.color}
                              variant="light"
                              size="sm"
                              w="fit-content"
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {relatedStatusInfo.text}
                            </Badge>
                          </Group>
                          
                          {needsPayment && (
                            <Text size="xs" c="orange.7" fw={500}>
                              {relatedOrder.status === "pending" ? 
                                "این سفارش نیاز به پرداخت دارد" : 
                                "این سفارش رد شده و نیاز به پرداخت مجدد دارد"
                              }
                            </Text>
                          )}
                        </Stack>

                        <Group gap="xs">
                          {needsPayment && (
                            <Button
                              size="xs"
                              color={relatedOrder.status === "pending" ? "brand" : "orange"}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToRelatedOrder(relatedOrder.id);
                              }}
                            >
                              پرداخت
                            </Button>
                          )}
                          <IconArrowRight size={16} color="var(--mantine-color-gray-6)" />
                        </Group>
                      </Flex>
                    </Paper>
                  );
                })}
              </Stack>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
};

export default PaymentStatusCheck;