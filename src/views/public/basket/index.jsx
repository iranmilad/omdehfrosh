import { Grid, Title, Paper, GridCol, Flex, Text, Stack, Space, useMantineTheme, Divider, Button, Collapse, Input, Stepper } from "@mantine/core"
import PriceText from "../../../components/priceText";
import { useDisclosure } from "@mantine/hooks";
import Product from "./product";
import { IconCircleCheck, IconShoppingCart, IconUserCheck, IconWallet } from "@tabler/icons-react";
import { NavLink } from "react-router";
import PaymentCalc from "../../../components/payment_calc";

const Basket = (props) => {
  const [opened,{toggle}] = useDisclosure(false);

  const handleCoupon = (value) => {
    // code
  }

  const updateProductCount = (value) => {
    // code
  }

  const removeProduct = (value) => {
    
  }


  return (
    <>
    <Stepper mb="xl" active={0}>
        <Stepper.Step label="سبد خرید" icon={<IconShoppingCart />} />
        <Stepper.Step label="اطلاعات خریدار" icon={<IconUserCheck />} />
        <Stepper.Step label="انتخاب روش پرداخت" icon={<IconWallet />} />
        <Stepper.Step label="پرداخت نهایی" icon={<IconCircleCheck />} />
    </Stepper>
      <Grid>
        <Grid.Col span={{ lg: 9 }}>
          <Title fw="600" c="gray.8" mb="lg">محتویات سبد خرید</Title>
          <Stack>
            <Product />
          </Stack>
        </Grid.Col>
        <GridCol span={{ lg: 3 }}>
        <PaymentCalc
            submit={{ to: "/basket-info", component: NavLink}}
          >
            ادامه
          </PaymentCalc>
        </GridCol>
      </Grid>
    </>
  );
};

export default Basket
