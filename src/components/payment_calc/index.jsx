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
  Box,
} from "@mantine/core";
import { IconArrowRight, IconInfoCircle, IconInfoCircleFilled } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import PriceText from "../priceText";
import { Alert } from "antd";

const PaymentCalc = ({ children, submit, prev, cartItems: cartItemsProp }) => {
  const cartItemsFromRedux = useSelector((state) => state.cart.items || []);
  const items = Array.isArray(cartItemsProp) && cartItemsProp.length > 0
    ? cartItemsProp
    : (Array.isArray(cartItemsFromRedux) ? cartItemsFromRedux : []);

  // Support both normalized (count, price.regularPrice) and raw (quantity, price number) shapes
  const getCount = (item) => Number(item?.count ?? item?.quantity ?? item?.qty ?? 0) || 0;
  const getRegularPrice = (item) => {
    const p = item?.price;
    if (p == null) return 0;
    if (typeof p === "number") return p;
    return Number(p?.regularPrice ?? p?.regular ?? p) || 0;
  };
  const getDiscountedPrice = (item) => {
    const p = item?.price;
    if (p == null) return getRegularPrice(item);
    if (typeof p === "number") return p;
    return Number(p?.discountedPrice ?? p?.discounted ?? p?.regularPrice ?? p) || 0;
  };

  const totalItems = items.reduce((sum, item) => sum + getCount(item), 0);
  const totalCartPrice = items.reduce(
    (sum, item) => sum + getRegularPrice(item) * getCount(item),
    0
  );
  const totalDiscount = items.reduce(
    (sum, item) => {
      const reg = getRegularPrice(item);
      const disc = getDiscountedPrice(item);
      const discount = reg - disc;
      return sum + (discount > 0 ? discount * getCount(item) : 0);
    },
    0
  );

  const finalTotal = totalCartPrice - totalDiscount;

  return (
    <>
      <Paper 
        p="lg" 
        radius="md" 
        mr="0"
        ml="0"
        style={{ 
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          width: "auto"
        }}
      >
        {/* Info Alert */}
        <Flex
          align="flex-start"
          gap={8}
          style={{
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '8px',
            marginBottom: '10px',
            padding: '12px',
            width: '100%',
          }}
        >
          <Box style={{ position: "relative", width: "100%" }}>
            <IconInfoCircleFilled
              size={18}
              color="#2196f3"
              style={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}
            />
            <Stack gap={4} style={{ width: "100%" }}>
              <Text
                size="xs"
                c="#1976d2"
                fw={400}
                style={{ whiteSpace: "nowrap", paddingRight: 22, lineHeight: 1.5 }}
              >
                سفارش شما از چندین فروشنده می باشد ،
              </Text>
              <Text
                size="xs"
                c="#1976d2"
                fw={400}
                style={{ whiteSpace: "nowrap", lineHeight: 1.5 }}
              >
                هر فاکتور جداگانه پرداخت و ارسال می گردد.
              </Text>
            </Stack>
          </Box>
        </Flex>

        <Stack gap="md">
          {/* قیمت کالاها */}
          <Flex justify="space-between" align="center">
            <Text size="sm" c="#676a6f" fw={400}>
              قیمت کالا‌ها ({totalItems} عدد)
            </Text>
            <Flex align="center" gap={4}>
              <Text size="sm" fw={700} c="#374151">
                {totalCartPrice?.toLocaleString()}
              </Text>
                <PriceText fontWeight={400} fontSize="10px">تومان</PriceText>
            </Flex>
          </Flex>

          {/* هزینه ارسال */}
          <Flex 
            justify="space-between" 
            align="center"
            pb="md"
            style={{ borderBottom: '1px solid #e5e7eb' }}
          >
            <Text size="sm" c="#676a6f" fw={400}>
              هزینه ارسال
            </Text>
            <Text size="sm" fw={700} c="#676a6f">
              رایگان
            </Text>
          </Flex>

          {/* سود شما */}
          {totalDiscount > 0 && (
            <Flex justify="space-between" align="center">
              <Text size="sm" c="#4caf50" fw={400}>
                سود شما از این خرید
              </Text>
              <Flex align="center" gap={4}>
                <Text size="md" fw={700} c="#4caf50">
                  {totalDiscount.toLocaleString()}
                </Text>
                <PriceText fontWeight={400} fontSize="10px">تومان</PriceText>
              </Flex>
            </Flex>
          )}

          {/* مبلغ قابل پرداخت */}
          <Flex justify="space-between" align="center">
            <Text size="12px" c="#1f2937" fw={400}>
              مبلغ قابل پرداخت
            </Text>
            <Flex align="center" gap={4}>
              <Text size="sm" fw={700} c="#1f2937">
                {finalTotal?.toLocaleString()}
              </Text>
                <PriceText fontWeight={400} fontSize="10px">تومان</PriceText>
            </Flex>
          </Flex>

          {/* Tax Info */}
          <Flex align="center" gap={6} mt="xs">
            <IconInfoCircle className="infoIcon" color="#676a6f" />
            <Text size="xs" c="#676a6f" fw={400}>
              قیمت‌ها شامل ٪۱۰ مالیات بر ارزش افزوده است.
            </Text>
          </Flex>
        </Stack>


              {/* Buttons */}
      <Grid mt="md" gutter="md">
        {prev && (
          <GridCol span={{ base: 12, lg: 6 }}>
            <Button
              fullWidth
              h="48"
              variant="light"
              color="gray"
              justify="space-between"
              leftSection={<IconArrowRight size={16} />}
              radius="md"
              styles={{
                root: {
                  fontSize: '14px',
                  fontWeight: 700,
                },
              }}
              {...prev}
            >
              قبلی
            </Button>
          </GridCol>
        )}
        {items.length !== 0 && (
          <GridCol span={{ base: 12, lg: prev ? 6 : 12 }}>
            <Button 
              fullWidth 
              h="48" 
              radius="md"
              m="16 0 16 0"
              p="12 16 12 16"
              styles={{
                root: {
                  fontSize: '14px',
                  fontWeight: 700,
                  // backgroundColor: '#1976d2',
                  // '&:hover': {
                  //   backgroundColor: '#1565c0',
                  // },
                },
              }}
              {...submit}
            >
              {children}
            </Button>
          </GridCol>
        )}
      </Grid>
      </Paper>


    </>
  );
};

export default PaymentCalc;