import {
  Grid,
  GridCol,
  Paper,
  Radio,
  Title,
  Group,
  Stack,
  Text,
  Image,
  TextInput,
  Flex,
  Button,
} from "@mantine/core";
import CartStepper from "../../../components/cartStepper";
import { data, NavLink } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useForm } from "@mantine/form";
import { IconBuildingCommunity, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {useSend} from '../../../Libs/api'
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { notifications } from '@mantine/notifications';

const gateways = [
  {
    name: "online",
    label: "پرداخت اینترنتی",
    description: "پرداخت آنلاین با تمامی کارت‌های بانکی",
    icon: <IconCreditCard size={30}  />,
  },
  {
    name: "cod" /* cash on delivery*/,
    label: "پرداخت در محل ( با کارت بانکی )",
    description: "هنگام تحویل از طریق کارت‌های بانکی",
    icon: <IconBuildingCommunity size={30}  />
  },
];

const PaymentMethod = () => {
    const dispatch = useDispatch();
  const [paymentURL,setPaymentURL]  = useState("");
  const [buttonLink , setButtonLink] = useState({onClick : () => SubmitCart()});
  const {mutateAsync} = useSend({url:"https://jsonplaceholder.typicode.com/posts"})
  const form = useForm({
    initialValues: {
      gateway: "online",
    },
  });


  const cards = gateways.map((item) => (
    <Radio.Card p="lg" radius="md" value={item.name} key={item.name} styles={{card:{borderColor: form.getValues().gateway === item.name ? "var(--mantine-primary-color-5)" : "transparent"}}}>
      <Group wrap="nowrap" align="center">
        <Radio.Indicator />
        <div style={{color: form.getValues().gateway === item.name ? "var(--mantine-primary-color-5)" : "var(--mantine-color-gray-6)"}}>
            {item.icon}
        </div>
        <div>
          <Text>{item.label}</Text>
          <Text size="13px" c="gray.6">{item.description}</Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  function SubmitCart () {
    dispatch(toggleLoading())
    mutateAsync({},{
        onSuccess: () => {
            dispatch(toggleLoading());
            setButtonLink({component:"a",href:"https://google.com"})
        },
        onError: () => {
            console.log('error')
        },
        onSettled: (err) => {
            console.log('error')
        }
    })
  }

  return (
    <>
      <CartStepper active={2} />
      <Grid>
        <Grid.Col span={{ lg: 9 }}>
          <Title fw="600" c="gray.8" mb="sm">
            روش پرداخت
          </Title>
          <Paper>
            <form>
              <Radio.Group
                name="انتخاب درگاه پرداخت"
                {...form.getInputProps("gateway")}
              >
                <Stack>{cards}</Stack>
              </Radio.Group>
            </form>
          </Paper>
          <SubmitCoupon />
        </Grid.Col>
        <GridCol span={{ lg: 3 }}>
          <PaymentCalc
            prev={{ to: "/basket-info", component: NavLink }}
            submit={buttonLink}
          >
            پرداخت
          </PaymentCalc>
        </GridCol>
      </Grid>
    </>
  );
};

const SubmitCoupon = () => {
  const form = useForm({
    initialValues: {
      code: ""
    },
    validate: {
      code: (value) => (value.length < 2 ? 'کد تخفیف را وارد کنید' : null),
    }
  })
  const {mutateAsync,isPending} = useSend({url: '/submitcoupon'})
  const sendRequest = (values) => {
    const code = values.code
    mutateAsync({code},{
      onSuccess:(data) => {
        if(data.error){
          notifications.show({
            title: "پیام سیستم",
            message: data.error,
            color:"red"
          })
        }
        else{
          notifications.show({
            title: "پیام سیستم",
            message: data.message,
            color:"green"
          })
        }
    }})
  }
  return (
    <>
        <Title fw="600" c="gray.8" mt="xl" mb="sm">
          کد تخفیف
        </Title>
        <Paper>
          <form onSubmit={form.onSubmit((values) => sendRequest(values))}>
            <Flex align="end" gap="sm" w={{lg: "50%"}}>
                <TextInput w="100%" label="وارد کردن کد تخفیف" placeholder="اینجا بنویسید" {...form.getInputProps('code')} error={""}/>
                <Button w="70" loading={isPending} type="submit">ثبت</Button>
            </Flex>
            <Flex align="end" w={{lg: "50%"}}>
              <Text c="red" size="13px">{form.getInputProps('code').error}</Text>
            </Flex>
          </form>
        </Paper>
    </>
  )
}

export default PaymentMethod;
