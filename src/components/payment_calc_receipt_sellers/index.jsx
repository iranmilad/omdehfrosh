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
    Badge,
  } from "@mantine/core";
  import { IconArrowRight } from "@tabler/icons-react";
  import { useDispatch, useSelector } from "react-redux";
  import { useEffect } from "react";
  import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
  import { updateFinalReceiptPaymentMethod } from "../../redux/cartfinalreceipt/cartfinalreceiptupdategateway/cartFinalReceiptUpdateGatewayActions";
  import { useNavigate } from "react-router";
import { getOrderByReceiptID } from "../../redux/orders/orders/getorderbyreceiptid/getOrderByReceiptIDActions";
  
  const PaymentCalcReceiptSellers = ({ children, prev, receipt_id }) => {

    const dispatch = useDispatch();

    const { orderByReceiptID, loadingByReceiptID, errorByReceiptID } = useSelector(
      (state) => state.getOrderByReceiptID
    );
    
    useEffect(() => {
      dispatch(getOrderByReceiptID({receipt_id: receipt_id}));
    }, [dispatch]);

    const navigate = useNavigate();
  
    const applySettings = async (receipt_id_seller) => {
      navigate("/fake-gateway", { state: { receiptId: receipt_id, receipt_id_seller: receipt_id_seller } });
    };

    // ✅ NEW: Dynamic attribute rendering function
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
        'مدل': 'مدل',
        'storage': 'حافظه',
        'حافظه': 'حافظه',
        'ram': 'رم',
        'رم': 'رم',
        'processor': 'پردازنده',
        'پردازنده': 'پردازنده'
        // Add more mappings as needed
      };

      return (
        <Text size="xs" c="gray">
          {Array.from(attributeMap.entries()).map(([key, value], index) => {
            const label = attributeLabels[key] || key;
            const isColor = key === 'color' || key === 'رنگ';
            
            return (
              <span key={key}>
                {label}: {isColor ? (
                  <span style={{ color: value }}>⬤</span>
                ) : (
                  value
                )}
                {index < attributeMap.size - 1 && ' | '}
              </span>
            );
          })}
        </Text>
      );
    };

    // ✅ NEW: Alternative simple approach for backward compatibility
    const renderAttributesSimple = (attributes) => {
      if (!attributes || !Array.isArray(attributes) || attributes.length === 0) {
        return (
          <Text size="xs" c="gray">
            ویژگی‌ها: نامشخص
          </Text>
        );
      }

      // Try to find common attributes first
      const firstAttr = attributes[0] || {};
      const material = firstAttr.material || firstAttr.جنس || 'نامشخص';
      const color = firstAttr.color || firstAttr.رنگ;

      // If we have the basic attributes, show them in the old format
      if (material !== 'نامشخص' || color) {
        return (
          <Text size="xs" c="gray">
            جنس: {material}
            {color && (
              <>
                {' | رنگ: '}
                <span style={{ color: color || "black" }}>⬤</span>
              </>
            )}
          </Text>
        );
      }

      // Otherwise, fall back to dynamic rendering
      return renderAttributesStructured({ item: { attributes } });
    };
  
    return (
      <>
        <Grid mt="md" gutter="lg">

          {orderByReceiptID?.sellers?.length > 0 ? (
            orderByReceiptID.sellers.map((sellerGroup) => (
              <GridCol span={12} key={sellerGroup.seller.id}>
                <Paper p="md" shadow="xs" fullWidth>

                  <Title order={3}>
                    فروشنده: {sellerGroup.seller.label} (ID: {sellerGroup.seller.id})
                  </Title>
                  <Text size="sm" c="gray">
                    مجموع قیمت از این فروشنده: {sellerGroup.priceApplyEachSeller} تومان
                  </Text>
                  <Divider my="sm" />
                  <Stack>
                    {sellerGroup.items.map((item, index) => (
                      <Paper p="sm" key={index} fullWidth>
                        <Flex justify="space-between" align="center">
                          <Stack gap="xs">
                            <Text size="sm" fw="600">
                              {item.item.name}
                            </Text>
                            {!String(item.item.productId ?? '').includes("subscription") && (
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
                            {item.item.price.discountedPrice
                              ? `${item.item.price.discountedPrice} تومان`
                              : `${item.item.price.regularPrice} تومان`}
                          </Text>
                          
                        </Flex>

                        {sellerGroup.paymentComment && (
                          <Flex justify="space-between" align="center" mt="xs">
                            <Text color="teal">پیام: {sellerGroup.paymentComment}</Text>
                          </Flex>
                        )}

                      </Paper>
                    ))}
                  </Stack>
                  {
                    orderByReceiptID?.sellers?.length !== 0 && 
                      (sellerGroup.isPaid === "unpaid" || sellerGroup.isPaid === "prepaid") ? (
                        <GridCol span={{ lg: prev ? 6 : 12 }} mt="md">
                          <Flex 
                            justify="flex-end" 
                            w="100%"
                          >
                            <Button 
                              onClick={() => applySettings(sellerGroup.receipt_id_seller)} 
                              fullWidth 
                              h="45"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                whiteSpace: "normal",
                                textAlign: "center",
                                width: "fit-content",
                              }}                            
                              >
                              پرداخت
                            </Button>
                          </Flex>
                        </GridCol>
                      ) : sellerGroup.isPaid === "selfprepaid" ? (
                        <GridCol span={{ lg: prev ? 6 : 12 }} mt="md">
                          <Flex 
                            justify="flex-end" 
                            w="100%"
                          >
                            <Badge
                              fullWidth
                              variant="light"
                              color="orange"
                              size="lg"
                              radius="md"
                              h={45}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                whiteSpace: "normal",
                                textAlign: "center",
                                width: "fit-content",
                              }}                            
                              >
                              مبلغ اولیه پرداخت شده است برای نهایی کردن با تامین کننده در تماس باشید
                            </Badge>
                          </Flex>
                        </GridCol>
                      ) : (
                        <GridCol span={{ lg: prev ? 6 : 12 }} mt="md">
                          <Badge
                            fullWidth
                            variant="light"
                            color="green"
                            size="lg"
                            radius="md"
                            h={45}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "fit-content",
                            }}                          
                            >
                            پرداخت شده
                          </Badge>
                        </GridCol>
                      )
                  }
                </Paper>

              </GridCol>
            ))
          ) : (
            <Text>هیچ آیتمی موجود نیست</Text>
          )}
          {
            orderByReceiptID?.paymentComment &&
            <Flex w="100%" justify="flex-start">
              <Paper
                gutter="lg"
                withBorder
                radius="md"
                p="md"
                mx="sm"
                mt="sm"
                mb="sm"
                bg="gray.1"
                w="100%"
                >
                <Flex align="right" gap="sm"> 

                  <Text color="green">
                   پیام پرداخت:
                  </Text>

                  <Text>
                    {orderByReceiptID?.paymentComment}
                  </Text>

                </Flex>
              </Paper>
            </Flex>
          }
          {/* ✅ Summary displayed only once */}
          {orderByReceiptID?.sellers?.length > 0 && (
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
                      {orderByReceiptID?.totalPriceApply} تومان
                    </Text>
                  </Flex>
                  <Flex direction="row" justify="space-between">
                    <Text size="sm" c="gray">
                      مجموع سبد خرید (با اعمال کد تخفیف)
                    </Text>
                    <Text size="sm" fw="bold">
                      {orderByReceiptID?.totalPriceToPay} تومان
                    </Text>
                  </Flex>
                </Stack>
                <Divider my="lg" />
              </Paper>
            </GridCol>
          )}

          {/* Buttons */}
          {prev && (
            <GridCol span={{ lg: 6 }}>
              <Button
                fullWidth
                h="45"
                variant="light"
                color="gray"
                justify="space-between"
                leftSection={<IconArrowRight size={16} />}
                {...prev}
              >
                قبلی
              </Button>
            </GridCol>
          )}
        </Grid>
      </>
    );
  };
  
  export default PaymentCalcReceiptSellers;