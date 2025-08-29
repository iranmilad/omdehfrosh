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
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import PriceText from "../priceText";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useData } from "../../Libs/api";

const PaymentCalc = ({ children, submit, prev }) => {

  const cartItems = useSelector((state) => state.cart.items || []); // ✅ Fetch cart from Redux


  if (!Array.isArray(cartItems)) {
    cartItems = [];
  }


  // Calculate total price and discount
  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.price.regularPrice * item.count,
    0
  );

  
  // const { data, isLoading } = useData({ url: "/cart", queryKey: [''] });
  const dispatch = useDispatch();


  const totalDiscount = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.price.regularPrice - item.price.discountedPrice) * item.count,
    0
  );

  const finalTotal = totalCartPrice - totalDiscount;

  


  
  return (
    <>
      <Title fw="600" c="gray.8" mb="sm">
        خلاصه فاکتور
      </Title>
      <Paper py="xl" pos="relative">
        <Stack gap="lg">
          <Flex justify="space-between">
            <Text size="sm" c="gray">
              مجموع سبد خرید
            </Text>
            <Text fw="500">{totalCartPrice?.toLocaleString()}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text size="sm" c="gray">
              تخفیف ها
            </Text>
            <Text fw="500">{totalDiscount?.toLocaleString()}</Text>
          </Flex>
        </Stack>
        <Divider my="lg" />
        <Flex justify="space-between">
          <Text size="sm" c="gray">
            مجموع
          </Text>
          <Text fw="500">{finalTotal?.toLocaleString()}</Text>
        </Flex>
      </Paper>
      <Grid mt="md">
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
        {
          cartItems.length !== 0 ?
          <GridCol span={{ lg: prev ? 6 : 12 }}>
          <Button fullWidth h="45" {...submit}>
            {children}
          </Button>
        </GridCol>
        :
        null
        }
      </Grid>
    </>
  );
};

export default PaymentCalc;
