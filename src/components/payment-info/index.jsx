import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import { Button, Divider, Flex, Grid, GridCol, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import PaymentInfoOnline from "../payment-online";
import PaymentInfoCod from "../payment-info-cod";
import { useLocation } from "react-router-dom";

const PaymentInfo = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [enrichedSellerData, setEnrichedSellerData] = useState(null);
  const [isProcessingData, setIsProcessingData] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // NEW: Track initialization

  // Extract data from location state
  const { gateway, sellerId, sellerData, orderTracking, paymentStatus, source } = location.state || {};

  // NEW: Create a stable key to prevent unnecessary re-processing
  const dataKey = useMemo(() => {
    if (!gateway || !sellerId) return null;
    return `${gateway}-${sellerId}-${source || 'default'}-${!!sellerData}-${!!paymentStatus}`;
  }, [gateway, sellerId, source, !!sellerData, !!paymentStatus]);

  // FIXED: Only fetch receipt once on mount
  useEffect(() => {
    if (!hasInitialized) {
      dispatch(fetchFinalReceipt());
      setHasInitialized(true);
    }
  }, [dispatch, hasInitialized]);

  // FIXED: Simplified data processing with proper dependency management
  useEffect(() => {
    const processSellerData = async () => {
      // Return early if no valid data key or already processing
      if (!dataKey || isProcessingData) return;

      // If we have sellerData directly, use it immediately
      if (sellerData) {
        setEnrichedSellerData(sellerData);
        return;
      }

      // Only process paymentStatus data if we don't have sellerData
      if (paymentStatus && source === "checkstatus" && !sellerData) {
        setIsProcessingData(true);
        
        try {
          
          // Find the seller data from paymentStatus
          const targetSeller = paymentStatus.order?.sellers?.find(s => s.seller.id === sellerId);
          
          if (!targetSeller) {
            setIsProcessingData(false);
            return;
          }

          // Get enriched orderItems for this seller
          const sellerOrderItems = paymentStatus.orderItems?.filter(
            orderItem => orderItem.supplier_id === sellerId
          ) || [];

          // Transform enriched orderItems to match expected structure
          const transformedItems = sellerOrderItems.flatMap((orderItem) => {
            return orderItem.product_id?.map((productWithDetails) => {
              const productDetails = productWithDetails?.productDetails;
              
              if (productDetails) {
                return {
                  item: {
                    name: productDetails.name || productDetails.title || "محصول نامشخص",
                    title: productDetails.title || productDetails.name || "محصول نامشخص",
                    image: productDetails.image,
                    images: productDetails.images || [],
                    attributes: productDetails.attributes || [],
                    priceWithVat: productDetails.priceWithVat || {
                      regularPriceWithVat: orderItem.price,
                      discountedPriceWithVat: orderItem.discount_price || orderItem.price
                    },
                    price: productDetails.price || {
                      regularPrice: orderItem.price,
                      discountedPrice: orderItem.discount_price || orderItem.price
                    },
                    seller: productDetails.seller || {
                      id: orderItem.supplier_id,
                      label: targetSeller.seller.label
                    },
                    productId: productDetails.productId || productWithDetails.id,
                    combinationsID: productDetails.combinationId || productWithDetails.combinationId,
                    seller_id: productDetails.supplier_id || orderItem.supplier_id,
                    count: productDetails.count || orderItem.quantity,
                    max: productDetails.max || 999999,
                    min: productDetails.min || 1,
                    orderId: productDetails.orderId || orderItem.order_id,
                    sku: productDetails.sku || "",
                    stock: productDetails.stock || 0,
                    rating: productDetails.rating || 0
                  },
                  quantity: orderItem.quantity,
                  itemPriceApply: orderItem.totalPrice,
                  orderId: orderItem.order_id
                };
              } else {
                console.warn('Missing productDetails for product:', productWithDetails);
                return {
                  item: {
                    name: `محصول ${productWithDetails?.id || 'نامشخص'}`,
                    title: `محصول ${productWithDetails?.id || 'نامشخص'}`,
                    image: null,
                    images: [],
                    attributes: [],
                    priceWithVat: {
                      regularPriceWithVat: orderItem.price,
                      discountedPriceWithVat: orderItem.discount_price || orderItem.price
                    },
                    price: {
                      regularPrice: orderItem.price,
                      discountedPrice: orderItem.discount_price || orderItem.price
                    },
                    seller: {
                      id: orderItem.supplier_id,
                      label: targetSeller.seller.label
                    },
                    productId: productWithDetails?.id || 'unknown',
                    combinationsID: productWithDetails?.combinationId || 'unknown',
                    seller_id: orderItem.supplier_id,
                    count: orderItem.quantity,
                    orderId: orderItem.order_id
                  },
                  quantity: orderItem.quantity,
                  itemPriceApply: orderItem.totalPrice,
                  orderId: orderItem.order_id
                };
              }
            }) || [];
          });

          const processedSellerData = {
            seller: targetSeller.seller,
            vatRequested: targetSeller.vatRequested,
            vatLink: targetSeller.vatLink || "",
            isPaid: targetSeller.isPaid,
            paymentComment: targetSeller.paymentComment || "",
            priceApplyEachSeller: targetSeller.totalPrice,
            items: transformedItems,
            paymentMethod: targetSeller.paymentMethod,
            orderIds: sellerOrderItems.map(item => item.order_id),
          };

          setEnrichedSellerData(processedSellerData);
        } catch (error) {
        } finally {
          setIsProcessingData(false);
        }
      }
    };

    processSellerData();
  }, [dataKey, paymentStatus, sellerData, sellerId, source, isProcessingData]); // FIXED: Removed complex dependencies

  // FIXED: Early return conditions with clearer logic
  if (!gateway) {
    return (
      <Grid mt="md" gutter="lg">
        <GridCol span={12}>
          <Paper p="md" shadow="xs" bg="red.0">
            <Text c="red.8" ta="center" fw="500">
              خطا: روش پرداخت مشخص نشده است
            </Text>
          </Paper>
        </GridCol>
      </Grid>
    );
  }

  if (!sellerId) {
    return (
      <Grid mt="md" gutter="lg">
        <GridCol span={12}>
          <Paper p="md" shadow="xs" bg="red.0">
            <Text c="red.8" ta="center" fw="500">
              خطا: شناسه فروشنده مشخص نشده است
            </Text>
          </Paper>
        </GridCol>
      </Grid>
    );
  }

  // Show loading while processing data or when no data is available yet
  if (isProcessingData || (!enrichedSellerData && !sellerData)) {
    return (
      <Grid mt="md" gutter="lg">
        <GridCol span={12}>
          <Paper p="md" shadow="xs">
            <Stack align="center" gap="md">
              <Loader size="md" />
              <Text size="sm" c="gray">
                در حال بارگذاری اطلاعات پرداخت...
              </Text>
              {process.env.NODE_ENV === 'development' && (
                <div>
                  <Text size="xs" c="gray.6">
                    Debug Info:
                  </Text>
                  <Text size="xs" c="gray.6">
                    - Processing: {isProcessingData ? 'Yes' : 'No'}
                  </Text>
                  <Text size="xs" c="gray.6">
                    - EnrichedData: {enrichedSellerData ? 'Yes' : 'No'}
                  </Text>
                  <Text size="xs" c="gray.6">
                    - SellerData: {sellerData ? 'Yes' : 'No'}
                  </Text>
                  <Text size="xs" c="gray.6">
                    - PaymentStatus: {paymentStatus ? 'Yes' : 'No'}
                  </Text>
                  <Text size="xs" c="gray.6">
                    - Source: {source || 'undefined'}
                  </Text>
                  <Text size="xs" c="gray.6">
                    - Data Key: {dataKey || 'null'}
                  </Text>
                </div>
              )}
            </Stack>
          </Paper>
        </GridCol>
      </Grid>
    );
  }

  // Use enriched data or fallback to original sellerData
  const finalSellerData = enrichedSellerData || sellerData;

  if (!finalSellerData) {
    return (
      <Paper p="md" bg="red.0">
        <Text c="red.8" ta="center" fw="500">
          خطا: اطلاعات فروشنده یافت نشد
        </Text>
        {process.env.NODE_ENV === 'development' && (
          <Text size="xs" c="red.6" ta="center" mt="xs">
            Debug: No final seller data available after processing
          </Text>
        )}
      </Paper>
    );
  }

  // FIXED: Simplified gateway routing
  const isOnlinePayment = gateway.paymentMethod === "online" || finalSellerData.paymentMethod?.paymentMethod === "online";
  const isCodPayment = gateway.paymentMethod === "cod" || finalSellerData.paymentMethod?.paymentMethod === "cod";

  if (isOnlinePayment) {
    return (
      <PaymentInfoOnline 
        paymentData={finalSellerData} 
        gateway={gateway} 
        orderTracking={orderTracking} 
        paymentStatus={paymentStatus}
        source={source}
      />
    );
  } else if (isCodPayment) {
    return (
      <PaymentInfoCod 
        paymentData={finalSellerData} 
        gateway={gateway} 
        orderTracking={orderTracking} 
        paymentStatus={paymentStatus}
        source={source}
      />
    );
  }

  // Fallback for unknown payment methods
  return (
    <Grid mt="md" gutter="lg">
      <GridCol span={12}>
        <Paper p="md" shadow="xs" bg="yellow.0">
          <Text c="yellow.8" ta="center" fw="500">
            روش پرداخت نامشخص: {gateway}
          </Text>

        </Paper>
      </GridCol>
    </Grid>
  );
};

export default PaymentInfo;