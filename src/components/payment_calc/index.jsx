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
  Alert,
} from "@mantine/core";
import { IconArrowRight, IconInfoCircle, IconInfoCircleFilled } from "@tabler/icons-react";
import { useSelector } from "react-redux";

const PaymentCalc = ({ children, submit, prev }) => {
  const cartItems = useSelector((state) => state.cart.items || []);

  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }

  // Count total items
  const totalItems = cartItems.reduce((sum, item) => sum + item.count, 0);

  // Calculate total price and discount
  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.price.regularPrice * item.count,
    0
  );

  console.log(cartItems)

const totalDiscount = cartItems.reduce(
  (sum, item) => {
    const discount = item.price.regularPrice - item.price.discountedPrice;
    // Only count positive discounts
    return sum + (discount > 0 ? discount * item.count : 0);
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
        <Alert
          icon={<IconInfoCircleFilled size={18} />}
          color="blue.1"
          styles={{
            root: {
              backgroundColor: '#e3f2fd',
              border: 'none',
              borderRadius: '6px',
              marginBottom: '16px',
            },
            icon: {
              color: '#29b6f6',
            },
            message: {
              color: '#546e7a',
              fontSize: '14px',
            },
          }}
        >
          فاکتور رسمی پس از پرداخت و ثبت سفارش، در صفحه جزئیات سفارش قابل دانلود است.
        </Alert>

        <Stack gap="md">
          {/* قیمت کالاها */}
          <Flex justify="space-between" align="center">
            <Text size="sm" c="#6b7280" fw={400}>
              قیمت کالا‌ها ({totalItems} عدد)
            </Text>
            <Flex align="center" gap={4}>
              <Text size="sm" fw={700} c="#374151">
                {totalCartPrice?.toLocaleString()}
              </Text>
              <Text size="xs" c="#6b7280">تومان</Text>
            </Flex>
          </Flex>

          {/* هزینه ارسال */}
          <Flex 
            justify="space-between" 
            align="center"
            pb="md"
            style={{ borderBottom: '1px solid #e5e7eb' }}
          >
            <Text size="sm" c="#6b7280" fw={400}>
              هزینه ارسال
            </Text>
            <Text size="sm" fw={700} c="#6b7280">
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
                <Text size="xs" c="#4caf50">تومان</Text>
              </Flex>
            </Flex>
          )}

          {/* مبلغ قابل پرداخت */}
          <Flex justify="space-between" align="center">
            <Text size="sm" c="#1f2937" fw={700}>
              مبلغ قابل پرداخت
            </Text>
            <Flex align="center" gap={4}>
              <Text size="sm" fw={700} c="#1f2937">
                {finalTotal?.toLocaleString()}
              </Text>
              <Text size="xs" c="#1f2937">تومان</Text>
            </Flex>
          </Flex>

          {/* Tax Info */}
          <Flex align="center" gap={6} mt="xs">
            <IconInfoCircle size={20} color="#6b7280" />
            <Text size="xs" c="#6b7280" fw={400}>
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
        {cartItems.length !== 0 && (
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