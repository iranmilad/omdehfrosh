import {
  Title,
  Paper,
  Stack,
  Flex,
  Divider,
  Grid,
  GridCol,
  Button,
  Text,
  Image,
} from "@mantine/core";
import { IconArrowRight, IconCheck } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import { updateFinalReceiptPaymentMethod } from "../../redux/cartfinalreceipt/cartfinalreceiptupdategateway/cartFinalReceiptUpdateGatewayActions";
import { useNavigate } from "react-router";
import { requestFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceiptrequestreceipt/cartFinalReceiptRequestReceiptActions";
import { notifications } from "@mantine/notifications";

const PaymentCalcReceipt = ({ children, prev, gateway }) => {

  const dispatch = useDispatch();
  
  const { orderfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
    (state) => state.cartfinalreceipt
  );

  const navigate = useNavigate();

  // Helper function to get orderId for a specific seller
  const getOrderIdForSeller = (sellerId) => {
    if (!orderfinalreceipt?.orderTracking) return null;
    
    const tracking = orderfinalreceipt.orderTracking.find(
      track => track.supplierId === sellerId
    );
    
    return tracking ? tracking.orderId : null;
  };

  // Modified to accept sellerId for individual seller payment
  const applySettings = async (sellerId = null) => {
    dispatch(updateFinalReceiptPaymentMethod({ paymentMethod: gateway }));
    dispatch(fetchFinalReceipt());

    let selectedSeller = null;
    let sellerOrderTracking = [];
    
    // If sellerId is provided, find the specific seller from orderfinalreceipt
    if (sellerId && orderfinalreceipt?.sellers) {
      selectedSeller = orderfinalreceipt.sellers.find(
        sellerGroup => sellerGroup.seller.id === sellerId
      );

      // Find all orderTracking entries for this specific seller
      if (orderfinalreceipt?.orderTracking) {
        sellerOrderTracking = orderfinalreceipt.orderTracking.filter(
          tracking => tracking.supplierId === sellerId
        );
      }
    }
    
    // Navigate to payment-info with seller data and their specific orderTracking
    navigate("/payment-info", { 
      state: { 
        gateway: gateway, 
        sellerId: sellerId,
        sellerData: selectedSeller, // Pass the entire seller object
        orderTracking: sellerOrderTracking // Pass specific orderTracking for this seller
      } 
    });
  };

  // FIXED: Add order-specific receipt request using orderId
  const applyReceipt = async (sellerId) => {
    const orderId = getOrderIdForSeller(sellerId);
    
    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    const response = await dispatch(requestFinalReceipt({ 
      vatRequested: true, 
      orderId: orderId // Use orderId instead of supplierId
    }));
    
    if (response?.payload?.status === "OK") {
      notifications.show({
        title: "پیام سیستم",
        message: "درخواست فاکتور با موفقیت ثبت شد",
        color: "green",
      });
    } else {
      notifications.show({
        title: "خطا",
        message: "مشکلی در ثبت درخواست فاکتور پیش آمد!",
        color: "red",
      });
    }
    
    dispatch(fetchFinalReceipt());
  }

  // FIXED: Add order-specific receipt removal using orderId
  const removeReceipt = async (sellerId) => {
    const orderId = getOrderIdForSeller(sellerId);
    
    if (!orderId) {
      notifications.show({
        title: "خطا",
        message: "شناسه سفارش یافت نشد!",
        color: "red",
      });
      return;
    }

    const response = await dispatch(requestFinalReceipt({ 
      vatRequested: false, 
      orderId: orderId // Use orderId instead of supplierId
    }));
    
    if (response?.payload?.status === "OK") {
      notifications.show({
        title: "پیام سیستم",
        message: "درخواست حذف فاکتور با موفقیت ثبت شد",
        color: "green",
      });
    } else {
      notifications.show({
        title: "خطا",
        message: "مشکلی در ثبت درخواست حذف فاکتور پیش آمد!",
        color: "red",
      });
    }
    
    dispatch(fetchFinalReceipt());
  }

  // ✅ NEW: Dynamic attribute rendering function
  const renderAttributes = (attributes) => {
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return null;
    }

    // Define attribute name mappings (Persian labels)
    const attributeLabels = {
      'material': 'جنس',
      'جنس': 'جنس',
      'color': 'رنگ', 
      'رنگ': 'رنگ',
      'size': 'سایز',
      'سایز': 'سایز',
      'brand': 'برند',
      'برند': 'برند',
      'weight': 'وزن',
      'وزن': 'وزن',
      'capacity': 'ظرفیت',
      'ظرفیت': 'ظرفیت',
      'model': 'مدل',
      'مدل': 'مدل'
      // Add more mappings as needed
    };

    // Group all attributes from all attribute objects
    const allAttributes = [];
    
    attributes.forEach(attrGroup => {
      // Handle different possible attribute structures
      Object.entries(attrGroup).forEach(([key, value]) => {
        // Skip null, undefined, or empty values
        if (value !== null && value !== undefined && value !== '') {
          // Check if this is a known attribute
          const label = attributeLabels[key] || key; // Use mapping or fallback to key
          
          allAttributes.push({
            key,
            label,
            value,
            isColor: key === 'color' || key === 'رنگ'
          });
        }
      });
    });

    // Remove duplicates based on key
    const uniqueAttributes = allAttributes.filter((attr, index, self) => 
      index === self.findIndex(a => a.key === attr.key)
    );

    if (uniqueAttributes.length === 0) {
      return null;
    }

    return (
      <Text size="xs" c="gray">
        {uniqueAttributes.map((attr, index) => (
          <span key={attr.key}>
            {attr.label}: {attr.isColor ? (
              <span style={{ color: attr.value }}>⬤</span>
            ) : (
              attr.value
            )}
            {index < uniqueAttributes.length - 1 && ' | '}
          </span>
        ))}
      </Text>
    );
  };

  // ✅ NEW: Alternative approach using a more structured method
  const renderAttributesStructured = (item) => {
    const attributes = item.item.attributes;
    
    if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
      return null;
    }

    // Collect all unique attributes
    const attributeMap = new Map();

    attributes.forEach(attrGroup => {
      Object.entries(attrGroup).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          attributeMap.set(key, value);
        }
      });
    });

    if (attributeMap.size === 0) {
      return null;
    }

    const attributeLabels = {
      'material': 'جنس',
      'جنس': 'جنس',
      'color': 'رنگ', 
      'رنگ': 'رنگ',
      'size': 'سایز',
      'سایز': 'سایز'
    };

    return (
      <Text size="xs" c="gray">
        {Array.from(attributeMap.entries()).map(([key, value], index) => {
          const label = attributeLabels[key] || key;
          const isColor = key === 'color' || key === 'رنگ';

          // Handle objects safely
          let displayValue;
          if (typeof value === "object") {
            displayValue = value.name || JSON.stringify(value); 
          } else {
            displayValue = value;
          }

          return (
            <span key={key}>
              {label}: {isColor ? (
                <span style={{ color: displayValue }}>⬤</span>
              ) : (
                displayValue
              )}
              {index < attributeMap.size - 1 && ' | '}
            </span>
          );
        })}
      </Text>
    );
  };
  
  useEffect(() => {
    dispatch(fetchFinalReceipt());
  }, [dispatch]);

  if (errorfinalreceipt) {
    return <Text color="red">{errorfinalreceipt}</Text>;
  }


  return (
    <>
      <Grid mt="md" gutter="lg">
        {orderfinalreceipt?.sellers?.length > 0 ? (
          orderfinalreceipt.sellers.map((sellerGroup) => (
            <GridCol span={12} key={sellerGroup.seller.id}>
              <Paper p="md" shadow="xs" fullWidth>
                {/* Seller Header with Payment Button */}
                <Flex justify="space-between" align="center" mb="md">
                  <div>
                    <Title order={3}>
                      فروشنده: {sellerGroup.seller.label} (ID: {sellerGroup.seller.id})
                    </Title>
                    <Text size="sm" c="gray">
                      مجموع قیمت از این فروشنده: {sellerGroup.priceApplyEachSeller} تومان
                    </Text>

                  </div>
                  
                  {/* Payment Button for this seller */}
                  <Button 
                    onClick={() => applySettings(sellerGroup.seller.id)} 
                    h="40"
                    style={{ minWidth: "80px" }}
                  >
                    {children}
                  </Button>
                </Flex>
                
                <Divider my="sm" />
                <Stack>
                  {sellerGroup.items.map((item, index) => (
                    <Paper p="sm" key={index} fullWidth>
                      <Flex justify="space-between" align="center">
                        <Stack gap="xs">
                          <Text size="sm" fw="600">
                            {item.item.name}
                          </Text>
                          {!item.item.productId?.includes("subscription") && (
                            // ✅ FIXED: Use dynamic attribute rendering
                            renderAttributesStructured(item)
                          )}
                        </Stack>
                      </Flex>
                      <Flex justify="space-between" align="center" mt="xs">
                        <Text size="sm" c="gray">
                          قیمت:
                        </Text>
                        <Text size="sm" fw="bold">
                          {item.item.priceWithVat.discountedPriceWithVat
                            ? `${item.item.priceWithVat.discountedPriceWithVat} تومان`
                            : `${item.item.priceWithVat.regularPriceWithVat} تومان`}
                        </Text>
                      </Flex>
                    </Paper>
                  ))}
                                          
                  <Flex>
                    <GridCol>
                      {sellerGroup.vatRequested ? (
                        <Button
                          onClick={() => removeReceipt(sellerGroup.seller.id)}
                          h={35}
                          w="120px"
                          color="green"
                          leftSection={<IconCheck size={14} />}
                          style={{ fontSize: 10, fontWeight: 700, minWidth: 110 }}
                        >
                         حذف فاکتور 
                        </Button>
                      ) : (
                        <Button
                          onClick={() => applyReceipt(sellerGroup.seller.id)}
                          h={35}
                          w="100px"
                          color="blue"
                          style={{ fontSize: 8, fontWeight: 700, minWidth: 90 }}
                        >
                          درخواست فاکتور 
                        </Button>
                      )}
                    </GridCol>
                  </Flex>
                </Stack>

              </Paper>
            </GridCol>
          ))
        ) : (
          <Text>هیچ آیتمی موجود نیست</Text>
        )}

        {/* ✅ Summary displayed only once */}
        {orderfinalreceipt?.sellers?.length > 0 && (
          <GridCol span={12}>
            <Title fw="600" c="gray.8" mb="sm">
              خلاصه فاکتور
            </Title>
            <Paper py="xl" pos="relative" fullWidth>
              <Stack gap="lg">
                <Flex direction="row" justify="space-between">
                  <Text size="sm" c="gray">
                    مجموع سبد خرید
                  </Text>
                  <Text size="sm" fw="bold">
                    {orderfinalreceipt?.totalPriceApply} تومان
                  </Text>
                </Flex>
                <Flex direction="row" justify="space-between">
                  <Text size="sm" c="gray">
                    مجموع سبد خرید (با اعمال کد تخفیف)
                  </Text>
                  <Text size="sm" fw="bold">
                    {orderfinalreceipt?.totalPriceToPay} تومان
                  </Text>
                </Flex>
              </Stack>
              <Divider my="lg" />
            </Paper>
          </GridCol>
        )}

        {/* Optional: Keep a "Pay All" button if you want to allow full cart payment */}
        {/* {orderfinalreceipt?.sellers?.length > 1 && (
          <GridCol span={12}>
            <Paper p="md" shadow="xs">
              <Flex justify="center">
                <Button 
                  onClick={() => applySettings()} 
                  fullWidth 
                  h="45"
                  variant="outline"
                >
                  پرداخت کل سبد خرید
                </Button>
              </Flex>
            </Paper>
          </GridCol>
        )} */}
      </Grid>
    </>
  );
};

export default PaymentCalcReceipt;