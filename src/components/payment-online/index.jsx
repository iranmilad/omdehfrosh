import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import {
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  GridCol,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { getPaymentLink } from "../../redux/payment/getpaymentlink/getPaymentLinkActions";
import { Steps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  WarningOutlined,
  InboxOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Grid as GridAnt } from 'antd';

const { useBreakpoint } = GridAnt;



// Default Product Image SVG Component
const DefaultProductImage = ({ width = 60, height = 60, borderRadius = "4px" }) => (
  <div
    style={{
      width: `${width}px`,
      height: `${height}px`,
      borderRadius,
      backgroundColor: '#f8f9fa',
      border: '2px dashed #dee2e6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#6c757d" strokeWidth="2" fill="none"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="#6c757d"/>
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

// Smart Image Component with fallback
const SmartProductImage = ({ 
  src, 
  alt, 
  width = 60, 
  height = 60, 
  borderRadius = "4px",
  style = {} 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Function to check if image source is valid
  const isValidImageSrc = useCallback((imageSrc) => {
    if (!imageSrc) return false;
    if (typeof imageSrc !== 'string') return false;
    if (imageSrc.trim() === '') return false;
    if (imageSrc === '""' || imageSrc === "''") return false;
    if (Array.isArray(imageSrc) && (imageSrc.length === 0 || imageSrc[0] === "")) return false;
    return true;
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  // Check if we should show default image
  const shouldShowDefault = !isValidImageSrc(src) || imageError;

  if (shouldShowDefault) {
    return <DefaultProductImage width={width} height={height} borderRadius={borderRadius} />;
  }

  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      {imageLoading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius,
            border: '1px solid #dee2e6',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid #dee2e6',
              borderTop: '2px solid #6c757d',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          objectFit: 'cover',
          borderRadius,
          display: imageLoading ? 'none' : 'block',
          ...style,
        }}
      />
    </div>
  );
};

const PaymentInfoOnline = ({ paymentData, gateway, orderTracking, paymentStatus, source }) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const screensAnt = useBreakpoint();

  const { orderfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
    (state) => state.cartfinalreceipt
  );
  const { paymentLink, loading, error } = useSelector((state) => state.getPaymentLink);
  const [countdown, setCountdown] = useState(5);

  // Create stable references using useMemo with proper dependencies
  const locationState = useMemo(() => location.state || {}, [location.state]);
  
  // Create stable string values for comparison
  const sourceKey = source || "";
  const paymentStatusKey = useMemo(() => {
    if (!paymentStatus) return "";
    return JSON.stringify({
      orderId: paymentStatus.order?.order_id,
      totalPrice: paymentStatus.order?.totalPriceToPay,
      sellerId: paymentStatus.order?.sellers?.[0]?.seller?.id,
      itemsCount: paymentStatus.orderItems?.length
    });
  }, [paymentStatus]);
  
  const paymentDataKey = useMemo(() => {
    if (!paymentData) return "";
    return JSON.stringify({
      sellerId: paymentData.seller?.id,
      price: paymentData.priceApplyEachSeller,
      itemsCount: paymentData.items?.length,
      orderIds: paymentData.orderIds,
      orderItemIds: paymentData.orderItemIds
    });
  }, [paymentData]);

  // Helper function to safely extract payment method string
  const getPaymentMethodString = useCallback((paymentMethodData) => {
    if (!paymentMethodData) return "نامشخص";
    
    // If it's already a string, return it
    if (typeof paymentMethodData === 'string') {
      return paymentMethodData === "melli" ? "بانک ملی" : paymentMethodData;
    }
    
    // If it's an object, extract the appropriate string value
    if (typeof paymentMethodData === 'object') {
      // Try different possible properties that might contain the payment method name
      const possibleNames = [
        paymentMethodData.name,
        paymentMethodData.paymentMethod,
        paymentMethodData.method,
        paymentMethodData.type,
        paymentMethodData.gateway
      ];
      
      for (const name of possibleNames) {
        if (typeof name === 'string' && name.length > 0) {
          return name === "melli" ? "بانک ملی" : name;
        }
      }
      
      // If object has nested paymentMethod
      if (paymentMethodData.paymentMethod && typeof paymentMethodData.paymentMethod === 'object') {
        return getPaymentMethodString(paymentMethodData.paymentMethod);
      }
    }
    
    return "نامشخص";
  }, []);

  // Process data only when keys change
  const processedData = useMemo(() => {

    if (sourceKey === "checkstatus" && paymentStatus) {
      const firstSeller = paymentStatus.order?.sellers?.[0] || {};
      const seller = firstSeller.seller || {};
      const priceApplyEachSeller = paymentStatus.order?.totalPriceToPay || 0;
      
      const items = paymentStatus.orderItems?.map(orderItem => ({
        item: orderItem.product_id?.[0]?.productDetails || {},
        quantity: orderItem.quantity || 1,
        orderItemId: orderItem.id,
        orderId: orderItem.order_id
      })) || [];
      
      const vatRequested = paymentStatus.orderItems?.[0]?.vatRequested || false;
      const paymentMethod = paymentStatus.orderItems?.[0]?.paymentMethod || {};
      
      return {
        seller,
        priceApplyEachSeller,
        items,
        vatRequested,
        paymentMethod,
        orderId: paymentStatus.order?.order_id,
        orderItemId: paymentStatus.orderItems?.[0]?.id,
        orderIds: [paymentStatus.order?.order_id].filter(Boolean),
        orderItemIds: paymentStatus.orderItems?.map(item => item.id).filter(Boolean) || [],
        sellerId: seller.id,
        totalAmount: priceApplyEachSeller,
        sellerName: seller.label || "نامشخص"
      };
    } else if (paymentData) {
      // Use paymentData structure
      const seller = paymentData.seller || {};
      const priceApplyEachSeller = paymentData.priceApplyEachSeller || 0;
      const items = paymentData.items || [];
      const vatRequested = paymentData.vatRequested || false;
      const paymentMethod = paymentData.paymentMethod || {};
      
      // Extract orderId and orderItemId from multiple sources with better fallbacks
      const orderIds = paymentData.orderIds || 
                      [locationState.orderId, locationState.order_id].filter(Boolean) ||
                      items.map(item => item.orderId || item.item?.orderId).filter(Boolean) ||
                      [];
      
      const orderItemIds = paymentData.orderItemIds || 
                          [locationState.orderItemId, locationState.order_item_id].filter(Boolean) ||
                          items.map(item => item.orderItemId || item.item?.orderItemId).filter(Boolean) ||
                          [];
      
      // Use first available IDs for backwards compatibility
      const orderId = orderIds[0];
      const orderItemId = orderItemIds[0];
      

      
      return {
        seller,
        priceApplyEachSeller,
        items,
        vatRequested,
        paymentMethod,
        orderId,
        orderItemId,
        orderIds,
        orderItemIds,
        sellerId: locationState.sellerId || seller.id,
        totalAmount: priceApplyEachSeller,
        sellerName: seller.label || "نامشخص"
      };
    }
    
    
    return null;
  }, [sourceKey, paymentStatusKey, paymentDataKey, locationState]);

  // Early return if no data
  if (!processedData) {

    
    return (
      <div style={{ padding: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
        <h3>Loading Payment Information...</h3>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          <p><strong>Source:</strong> {sourceKey || 'undefined'}</p>
          <p><strong>Has PaymentData:</strong> {paymentData ? 'Yes' : 'No'}</p>
          <p><strong>Has PaymentStatus:</strong> {paymentStatus ? 'Yes' : 'No'}</p>
          {process.env.NODE_ENV === 'development' && (
            <>
              <p><strong>PaymentData:</strong> {paymentData ? JSON.stringify(paymentData, null, 2) : 'null'}</p>
              <p><strong>PaymentStatus:</strong> {paymentStatus ? JSON.stringify(paymentStatus, null, 2) : 'null'}</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const {
    seller,
    priceApplyEachSeller,
    items,
    vatRequested,
    paymentMethod,
    orderId,
    orderItemId,
    orderIds,
    orderItemIds,
    sellerId,
    totalAmount,
    sellerName
  } = processedData;


  // Helper function to render product attributes - memoized to prevent recreations
  const renderAttributes = useCallback((attributes) => {
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return null;
    }

    const attributeLabels = {
      material: "جنس",
      جنس: "جنس",
      color: "رنگ",
      رنگ: "رنگ",
      size: "سایز",
      سایز: "سایز",
    };

    const allAttributes = [];
    attributes.forEach((attrGroup) => {
      Object.entries(attrGroup).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          const label = attributeLabels[key] || key;
          allAttributes.push({
            key,
            label,
            value,
            isColor: key === "color" || key === "رنگ",
          });
        }
      });
    });

    return (
      <Text size="xs" c="gray" mt="xs">
        {allAttributes.map((attr, index) => (
          <span key={attr.key}>
            {attr.label}:{" "}
            {attr.isColor ? (
              <span style={{ color: attr.value }}>⬤</span>
            ) : (
              attr.value
            )}
            {index < allAttributes.length - 1 && " | "}
          </span>
        ))}
      </Text>
    );
  }, []);

  useEffect(() => {
    dispatch(fetchFinalReceipt());
  }, [dispatch]);

  // Create stable sellerData object for dispatch
  const sellerDataForDispatch = useMemo(() => ({
    seller,
    priceApplyEachSeller,
    items,
    vatRequested,
    paymentMethod,
    orderId,
    orderItemId,
    orderIds,
    orderItemIds,
    amount: priceApplyEachSeller,
  }), [seller, priceApplyEachSeller, items, vatRequested, paymentMethod, orderId, orderItemId, orderIds, orderItemIds]);

  useEffect(() => {
    // Allow payment link generation if we have at least one order ID
    if (orderfinalreceipt && (orderId || (orderIds && orderIds.length > 0))) {
      const paymentRequestData = {
        paymentData: sellerDataForDispatch,
        orderTracking: orderTracking?.[0] || null,
      };


      dispatch(getPaymentLink({ paymentRequestData }));
    } else {

    }
  }, [orderfinalreceipt, dispatch, sellerDataForDispatch, orderTracking, orderId, orderItemId, orderIds, orderItemIds]);

  // Fixed useEffect to properly handle payment redirect
  useEffect(() => {
    if (paymentLink?.link_url) {
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            
            // Check if it's a fake gateway (for development)
            if (paymentLink.link_url.includes('fake-gateway') || gateway === 'fake') {
              // For fake gateway, use React Router navigation
              const paymentParams = new URLSearchParams();
              
              try {
                // Parse the body data from your API response
                const bodyData = JSON.parse(paymentLink.body || '{}');
                
                // Add the parsed data as URL parameters
                Object.keys(bodyData).forEach(key => {
                  paymentParams.append(key, bodyData[key]);
                });
              } catch (e) {
                paymentParams.append('order_id', orderId || '');
                paymentParams.append('order_item_id', orderItemId || '');
                paymentParams.append('amount_to_pay', totalAmount || 0);
                paymentParams.append('user_id', locationState.user_id || '');
                paymentParams.append('sellerId', sellerId || '');
              }
              
              // Navigate to fake gateway with payment data
              navigate(`/fake-gateway?${paymentParams.toString()}`, {
                state: {
                  // Include both parsed body data and seller data
                  ...(paymentLink.body ? JSON.parse(paymentLink.body) : {}),
                  ...sellerDataForDispatch,
                  order_id: orderId,
                  order_item_id: orderItemId,
                  amount_to_pay: totalAmount,
                  user_id: locationState.user_id,
                  sellerId: sellerId,
                  paymentMethod: getPaymentMethodString(paymentMethod),
                  totalItems: items.length
                }
              });
            } else {
              // For real payment gateways, use form submission
              try {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = paymentLink.link_url;
                form.style.display = 'none';
                form.target = '_self';

                // Parse the body JSON and add as form data
                if (paymentLink.body) {
                  const bodyData = JSON.parse(paymentLink.body);
                  Object.keys(bodyData).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = bodyData[key];
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
                console.error('Error submitting payment form:', e);
                window.location.href = paymentLink.link_url;
              }
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentLink, navigate, sellerDataForDispatch, totalAmount, sellerId, paymentMethod, items.length, gateway, orderId, orderItemId, locationState.user_id, getPaymentMethodString]);

  // Manual redirect for testing - simplified dependencies
  const handleManualRedirect = useCallback(() => {
    if (paymentLink?.link_url) {
      if (paymentLink.link_url.includes('fake-gateway') || gateway === 'fake') {
        navigate('/fake-gateway', {
          state: {
            ...sellerDataForDispatch,
            order_id: orderId,
            order_item_id: orderItemId,
            amount_to_pay: totalAmount,
            user_id: locationState.user_id,
            sellerId: sellerId,
            paymentMethod: getPaymentMethodString(paymentMethod),
            totalItems: items.length
          }
        });
      } else {
        window.location.href = paymentLink.link_url;
      }
    }
  }, [paymentLink?.link_url, gateway, navigate, sellerDataForDispatch, orderId, orderItemId, totalAmount, locationState.user_id, sellerId, paymentMethod, items.length, getPaymentMethodString]);

  return (
    <>
      {/* CSS for spinner animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

        <Steps
          current={3}
          size={screensAnt.md ? 'default' : 'small'}
          style={{ 
            marginBottom: 32,
            background: 'white',
            padding: screensAnt.md ? 24 : 12,
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: screensAnt.md ? '14px' : '12px'
          }}
          items={[
            { title: 'سبد خرید', icon: <ShoppingCartOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'اطلاعات خریدار', icon: <UserOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'انتخاب روش پرداخت', icon: <WalletOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'پرداخت نهایی', icon: <CheckCircleOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
          ]}
        />
      


      <Grid mt="md" gutter="lg">
        <GridCol span={12}>
          <Paper p="md" shadow="xs" fullWidth>
            {/* Header Section */}
            <Stack mb="lg">
              <Title fw="600" c="gray.8" order={2}>
                در حال انتقال به درگاه پرداخت ...
              </Title>
              <Flex align="center" gap="md">
                <Text size="lg" c="blue" fw="500">
                  فروشنده: {sellerName}
                </Text>
                {vatRequested && (
                  <Text
                    size="sm"
                    c="green"
                    bg="green.0"
                    px="sm"
                    py="xs"
                    style={{ borderRadius: "4px", fontSize: "11px" }}
                  >
                    فاکتور درخواست شده
                  </Text>
                )}
              </Flex>

            </Stack>

            <Divider my="md" />

            {/* Items Section */}
            <Stack mb="lg">
              <Title order={4} c="gray.7" mb="md">
                محصولات این فروشنده:
              </Title>
              {items.map((orderItem, index) => {
                const { item } = orderItem;
                return (
                  <Paper key={index} p="sm" bg="gray.0" radius="sm">
                    <Flex gap="md" align="flex-start">
                      {/* Product Image - Updated to use SmartProductImage */}
                      <SmartProductImage
                        src={item.image}
                        alt={item.name || item.title || "محصول"}
                        width={60}
                        height={60}
                        borderRadius="4px"
                      />
                      {/* Product Details */}
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Text size="sm" fw="500" lineClamp={2}>
                          {item.name || item.title || "محصول نامشخص"}
                        </Text>
                        {renderAttributes(item.attributes)}
                        <Flex justify="space-between" align="center">
                          <Text size="xs" c="gray">
                            تعداد: {orderItem.quantity || item.count || 1}
                          </Text>
                          <Text size="sm" fw="600" c="dark">
                            {item.priceWithVat?.discountedPriceWithVat
                              ? `${Number(item.priceWithVat.discountedPriceWithVat).toLocaleString()} تومان`
                              : item.priceWithVat?.regularPriceWithVat
                              ? `${Number(item.priceWithVat.regularPriceWithVat).toLocaleString()} تومان`
                              : "قیمت نامشخص"}
                          </Text>
                        </Flex>
                      </Stack>
                    </Flex>
                  </Paper>
                );
              })}
            </Stack>

            <Divider my="md" />

            {/* Payment Summary */}
            <Paper py="xl" px="md" bg="blue.0" radius="sm" mb="lg">
              <Stack gap="md">
                <Flex direction="row" justify="space-between" align="center">
                  <Text size="lg" c="gray.8" fw="500">
                    مبلغ قابل پرداخت:
                  </Text>
                  <Text size="xl" fw="700" c="blue.8">
                    {Number(totalAmount || 0).toLocaleString()} تومان
                  </Text>
                </Flex>
                <Flex direction="row" justify="space-between" align="center">
                  <Text size="sm" c="gray.6">
                    روش پرداخت:
                  </Text>
                  <Text size="sm" c="gray.8" fw="500">
                    {getPaymentMethodString(paymentMethod)}
                  </Text>
                </Flex>
                <Flex direction="row" justify="space-between" align="center">
                  <Text size="sm" c="gray.6">
                    تعداد محصولات:
                  </Text>
                  <Text size="sm" c="gray.8">
                    {items.length} محصول
                  </Text>
                </Flex>
              </Stack>
            </Paper>

            {/* Countdown Section */}
            {paymentLink?.link_url && (
              <Paper p="lg" bg="orange.0" radius="sm" ta="center" mb="md">
                <Text size="lg" fw="500" c="orange.8" mb="sm">
                  انتقال به درگاه پرداخت در {countdown} ثانیه
                </Text>
                <Text size="sm" c="gray.6">
                  لطفاً صبر کنید تا به درگاه پرداخت منتقل شوید
                </Text>
              </Paper>
            )}

            {/* Manual redirect button for testing */}
            {paymentLink?.link_url && (
              <Center mb="md">
                <Button onClick={handleManualRedirect} variant="outline" size="sm">
                  انتقال فوری به درگاه پرداخت
                </Button>
              </Center>
            )}

            {/* Loading and Error States */}
            {loading && (
              <Center mt="lg">
                <Stack align="center" gap="sm">
                  <Loader size="md" />
                  <Text size="sm" c="gray">
                    در حال آماده‌سازی درگاه پرداخت...
                  </Text>
                </Stack>
              </Center>
            )}

            {error && (
              <Paper p="md" bg="red.0" mt="lg">
                <Text c="red.8" size="sm" ta="center" fw="500">
                  خطا در دریافت لینک پرداخت: {error}
                </Text>
              </Paper>
            )}

            {/* No payment link warning */}
            {!paymentLink?.link_url && !loading && !error && orderfinalreceipt && (
              <Paper p="md" bg="yellow.0" mt="lg">
                <Text c="yellow.8" size="sm" ta="center" fw="500">
                  در حال بررسی اطلاعات پرداخت...
                </Text>
                {/* {process.env.NODE_ENV === 'development' && (
                  <Text size="xs" c="yellow.7" ta="center" mt="xs">
                    Debug: orderId: {orderId}, orderItemId: {orderItemId}, orderfinalreceipt: {!!orderfinalreceipt}
                  </Text>
                )} */}
              </Paper>
            )}

          </Paper>
        </GridCol>
      </Grid>
    </>
  );
};

export default PaymentInfoOnline;