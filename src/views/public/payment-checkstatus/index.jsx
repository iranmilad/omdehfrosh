import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import {
  Loader,
  Text,
  Paper,
  Stack,
  Button,
  Grid,
  Flex,
  Container,
  Badge,
  Group,
  Title,
  Alert,
} from "@mantine/core";
import { IconCheck, IconX, IconClock, IconPackage, IconUser, IconCreditCard, IconInfoCircle, IconArrowRight } from "@tabler/icons-react";
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

  console.log('PaymentStatus from Redux:', paymentStatus);

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
        return { color: "green", text: "پرداخت شده", icon: IconCheck };
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
        return { color: "green", text: "تحویل داده شده" };
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
          console.log('Processing payment webhook with complete data:', completePaymentData);

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

  console.log("paymentStatus", paymentStatus);

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
        <Stack align="center" spacing="md">
          <Loader variant="dots" size="lg" />
          <Text size="md" c="gray">
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
        <Paper p="xl" radius="md" shadow="md" withBorder bg="red.0">
          <Stack align="center" spacing="lg">
            <IconX size={48} color="red" />
            <Text size="lg" c="red" fw={500} ta="center">
              {webhookError || error}
            </Text>
            <Button 
              variant="light" 
              color="blue"
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
        <Paper p="xl" radius="md" shadow="md" withBorder bg="gray.0">
          <Stack align="center" spacing="lg">
            <IconClock size={48} color="gray" />
            <Text size="lg" c="gray" fw={500} ta="center">
              اطلاعات سفارش در دسترس نیست
            </Text>
            <Button 
              variant="light" 
              color="blue"
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
      <Stack spacing="xl">
        {/* Success/failure message from external gateway */}
        {completePaymentData && (
          <Alert
            color={completePaymentData.status === 'OK' ? 'green' : 'red'}
            title={completePaymentData.status === 'OK' ? 'پرداخت موفق' : 'پرداخت ناموفق'}
            icon={completePaymentData.status === 'OK' ? <IconCheck /> : <IconX />}
            variant="filled"
          >
            {completePaymentData.status === 'OK' 
              ? 'پرداخت شما با موفقیت در درگاه خارجی انجام شد و در حال پردازش است.' 
              : 'پرداخت شما در درگاه خارجی ناموفق بود. می‌توانید دوباره تلاش کنید.'
            }
            {completePaymentData.body?.transaction_id && (
              <Text size="sm" mt="xs">
                شماره تراکنش: {completePaymentData.body.transaction_id}
              </Text>
            )}
          </Alert>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && completePaymentData && (
          <Paper p="sm" bg="yellow.0" radius="sm">
            <Text size="xs" c="gray.6">Debug - Complete Payment Data:</Text>
            <Text size="xs" c="gray.6" style={{ wordBreak: 'break-all' }}>
              {JSON.stringify(completePaymentData, null, 2)}
            </Text>
          </Paper>
        )}

        {/* Main Order Header */}
        <Paper p="xl" radius="md" shadow="md" withBorder bg="gray.0">
          <Stack spacing="lg" align="center">
            <Title order={2} ta="center">
              وضعیت سفارش
            </Title>

            <Flex align="center" gap="md">
              <StatusIcon size={32} color={overallStatusInfo.color} />
              <Text size="xl" c={overallStatusInfo.color} fw={600}>
                {overallStatusInfo.text}
              </Text>
            </Flex>

            {mainOrder && (
              <Stack spacing="sm" w="100%">
                <Group position="apart">
                  <Text size="lg" c="blue" fw={500}>
                    شماره سفارش: {mainOrder.id}
                  </Text>
                  <Badge 
                    color={getOrderStatusInfo(mainOrder.status).color}
                    variant="light"
                    size="lg"
                  >
                    {getOrderStatusInfo(mainOrder.status).text}
                  </Badge>
                </Group>

                <Group position="apart">
                  <Text size="md" c="gray.7">
                    مشتری: {mainOrder.customer_name}
                  </Text>
                  <Text size="md" c="gray.7">
                    مبلغ کل: {mainOrder.total_price?.toLocaleString()} تومان
                  </Text>
                </Group>

                <Group position="apart">
                  <Text size="sm" c="gray.6">
                    تلفن: {mainOrder.customer_phone_number}
                  </Text>
                  <Text size="sm" c="gray.6">
                    نوع تحویل: {mainOrder.delivery_type === "store_delivery" ? "تحویل از فروشگاه" : "ارسال پستی"}
                  </Text>
                </Group>
              </Stack>
            )}

            {/* Payment Comment */}
            {mainOrder?.paymentComment && (
              <Paper withBorder radius="md" p="md" bg="blue.0" w="100%">
                <Text size="sm" c="blue.8" ta="center">
                  پیام پرداخت: {mainOrder.paymentComment}
                </Text>
              </Paper>
            )}
          </Stack>
        </Paper>

        {/* Order Items */}
        <Stack spacing="md">
          <Title order={3} c="gray.7">
            آیتم‌های سفارش ({orderItems.length} مورد)
          </Title>

          {orderItems.map((item, index) => {
            const itemStatusInfo = getPaymentStatusInfo(item.isPaid);
            const ItemStatusIcon = itemStatusInfo.icon;
            const orderStatusInfo = getOrderStatusInfo(item.status);

            return (
              <Paper
                key={`${item.id}-${index}`}
                p="lg"
                radius="md"
                shadow="sm"
                withBorder
                bg={item.isPaid === "paid" ? "green.0" : item.isPaid === "unpaid" ? "red.0" : "orange.0"}
              >
                <Stack spacing="md">
                  <Flex justify="space-between" align="flex-start">
                    <Group spacing="xs">
                      <IconPackage size={20} color="gray" />
                    </Group>
                    <Group spacing="sm">
                      <Badge 
                        color={orderStatusInfo.color}
                        variant="light"
                      >
                        {orderStatusInfo.text}
                      </Badge>
                      {item.isPaid !== "paid" && (
                        <Button
                          size="xs"
                          color={item.isPaid === "unpaid" ? "blue" : "orange"}
                          onClick={() => navigateToPayment(item.supplier_id, item.paymentMethod?.paymentMethod || "online")}
                        >
                          {item.isPaid === "unpaid" ? "پرداخت" : "تکمیل پرداخت"}
                        </Button>
                      )}
                    </Group>
                  </Flex>

                  <Flex align="center" gap="sm">
                    <ItemStatusIcon size={20} color={itemStatusInfo.color} />
                    <Text c={itemStatusInfo.color} fw={500}>
                      {itemStatusInfo.text}
                    </Text>
                  </Flex>

                  <Grid>
                    <Grid.Col span={6}>
                      <Stack spacing="xs">
                        <Group spacing="xs">
                          <IconUser size={16} color="gray" />
                          <Text size="sm" c="gray.7">
                            تامین‌کننده: {item.supplier_id}
                          </Text>
                        </Group>
                        <Text size="sm" c="gray.7">
                          تعداد: {item.quantity}
                        </Text>
                        <Text size="sm" c="gray.7">
                          قیمت واحد: {item.price?.toLocaleString()} تومان
                        </Text>
                      </Stack>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack spacing="xs">
                        <Text size="sm" c="gray.7">
                          تخفیف: {item.discount_price?.toLocaleString()} تومان
                        </Text>
                        <Text size="lg" c="blue.8" fw={600}>
                          مبلغ کل: {item.totalPrice?.toLocaleString()} تومان
                        </Text>
                        {item.vatRequested && (
                          <Badge color="green" variant="light" size="sm">
                            فاکتور درخواست شده
                          </Badge>
                        )}
                      </Stack>
                    </Grid.Col>
                  </Grid>

                  {item.paymentMethod && (
                    <Group spacing="xs">
                      <IconCreditCard size={16} color="gray" />
                      <Text size="sm" c="gray.7">
                        روش پرداخت: {item.paymentMethod.name === "melli" ? "بانک ملی" : item.paymentMethod.name}
                      </Text>
                      <Badge variant="outline" size="sm">
                        {item.paymentMethod.paymentMethod === "online" ? "آنلاین" : "نقدی"}
                      </Badge>
                    </Group>
                  )}

                  {item.product_id && item.product_id.length > 0 && (
                    <Paper p="sm" bg="gray.1" radius="sm">
                      <Text size="xs" c="gray.6" mb="xs">محصولات:</Text>
                      {item.product_id.map((product, prodIndex) => (
                        <Group key={`${product.id}-${prodIndex}`} spacing="xs">
                          <Text size="xs" c="gray.7">
                            کد محصول: {product.id}
                          </Text>
                        </Group>
                      ))}
                    </Paper>
                  )}

                  {item.vatLink && (
                    <Group spacing="xs">
                      <Text size="xs" c="blue.6">
                        لینک فاکتور: {item.vatLink}
                      </Text>
                    </Group>
                  )}

                  {item.paymentComment && (
                    <Paper p="sm" bg="blue.0" radius="sm">
                      <Text size="sm" c="blue.8">
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
        <Paper p="lg" radius="md" withBorder>
          <Stack spacing="md">
            {(overallPaymentStatus === "prepaid" || overallPaymentStatus === "unpaid") && (
              <Button
                fullWidth
                size="lg"
                color={overallPaymentStatus === "unpaid" ? "blue" : "orange"}
                onClick={() => navigateToPayment(null, "online")}
              >
                {overallPaymentStatus === "unpaid" ? "پرداخت" : "تکمیل پرداخت"}
              </Button>
            )}

            {overallPaymentStatus === "paid" && (
              <Text ta="center" c="green" size="lg" fw={500}>
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
              size="md"
              onClick={() => navigate("/account/orders")}
            >
              بازگشت به سفارش‌ها
            </Button>
          </Stack>
        </Paper>

        {/* Related Orders Section */}
        {filteredRelatedOrders.length > 0 && (
          <Paper p="lg" radius="md" shadow="sm" withBorder mt="xl">
            <Stack spacing="md">
              <Group spacing="xs">
                <IconInfoCircle size={20} color="blue" />
                <Title order={4} c="blue">
                  سفارش‌های مرتبط ({filteredRelatedOrders.length} مورد)
                </Title>
              </Group>
              
              <Alert color="blue" variant="light">
                <Text size="sm">
                  این سفارش‌های مرتبط نیز برای حساب شما ثبت شده‌اند. برای مشاهده جزئیات هر سفارش روی آن کلیک کنید.
                </Text>
              </Alert>

              <Stack spacing="sm">
                {filteredRelatedOrders.map((relatedOrder) => {
                  const relatedStatusInfo = getOrderStatusInfo(relatedOrder.status);
                  const needsPayment = relatedOrder.status === "pending" || relatedOrder.status === "rejected";
                  
                  return (
                    <Paper
                      key={relatedOrder.id}
                      p="md"
                      radius="sm"
                      withBorder
                      bg={needsPayment ? "yellow.0" : "gray.0"}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigateToRelatedOrder(relatedOrder.id)}
                    >
                      <Group position="apart" align="center">
                        <Stack spacing="xs" style={{ flex: 1 }}>
                          <Group spacing="sm">
                            <Text size="sm" fw={500} c="blue.8">
                              شماره سفارش: {relatedOrder.id}
                            </Text>
                            <Badge 
                              color={relatedStatusInfo.color}
                              variant="light"
                              size="sm"
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

                        <Group spacing="sm">
                          {needsPayment && (
                            <Button
                              size="xs"
                              color={relatedOrder.status === "pending" ? "blue" : "orange"}
                              variant="filled"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToRelatedOrder(relatedOrder.id);
                              }}
                            >
                              پرداخت
                            </Button>
                          )}
                          <IconArrowRight size={16} color="gray" />
                        </Group>
                      </Group>
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