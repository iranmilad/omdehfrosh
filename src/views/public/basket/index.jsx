import { Grid, Title, Paper, GridCol, Flex, Text, Stack, Space, useMantineTheme, Divider, Button, Collapse, Input, Stepper, Center, Loader } from "@mantine/core"
import PriceText from "../../../components/priceText";
import { useDisclosure } from "@mantine/hooks";
import Product from "./product";
import { IconCircleCheck, IconShoppingCart, IconUserCheck, IconWallet } from "@tabler/icons-react";
import { NavLink } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useData } from "../../../Libs/api";
import { setInitial } from "../../../redux/cart";

const Basket = (props) => {
  const { data, isLoading } = useData({ url: "/cart" ,queryKey:['']});
  const dispatch = useDispatch();

  useEffect(() => {
    if (data?.total) {
      dispatch(setInitial(data.cart));
    } else {
      dispatch(setInitial([]));
    }
  }, [isLoading]);

  if(isLoading) return <Center><Loader /></Center>


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
            {data?.cart.map((item,index) => <Product key={index} {...item} />)}
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
