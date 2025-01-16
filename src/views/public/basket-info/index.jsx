import {
  Stepper,
  Grid,
  Title,
  Text,
  Flex,
  Paper,
  Stack,
  Button,
  Divider,
  SimpleGrid,
  TextInput,
  Select,
  Autocomplete,
  GridCol,
  Textarea,
  Checkbox,
  Collapse,
} from "@mantine/core";
import PriceText from "../../../components/priceText";
import { NavLink, useLocation, useNavigate } from "react-router";
import {
  IconArrowRight,
  IconChevronRight,
  IconCircleCheck,
  IconShoppingCart,
  IconUserCheck,
  IconWallet,
} from "@tabler/icons-react";
import { IMaskInput } from "react-imask";
import iranCity from "../../../iran_cities_with_coordinates.json";
import { useForm, yupResolver } from "@mantine/form";
import { useEffect, useRef, useState } from "react";
import { useForceUpdate } from "@mantine/hooks";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateBasketInfo } from "../../../redux/basket-info";
import {toggleLoading} from "../../../redux/global"
import PaymentCalc from "../../../components/payment_calc";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("نام الزامی است"),
  lastName: Yup.string().required("نام خانوادگی الزامی است"),
  phone: Yup.string()
    .matches(/^[0-9]{4} [0-9]{3} [0-9]{4}$/, "فرمت شماره موبایل صحیح نیست")
    .required("شماره موبایل الزامی است"),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد پستی باید 10 رقم باشد")
    .required("کد پستی الزامی است"),
  province: Yup.string().required("استان الزامی است"),
  city: Yup.string().required("شهر الزامی است"),
  address: Yup.string().required("آدرس الزامی است"),
  socialNumber: Yup.string()
  .matches(/^[0-9]{4} [0-9]{3} [0-9]{4}$/, "فرمت شماره موبایل صحیح نیست")
  .required("شماره موبایل الزامی است"),
});

let Provinces = [];
iranCity.map((item) => {
  Provinces.push({ label: item.name, value: item.name });
});

const BasketInfo = () => {
  const formRef = useRef("");
  let [cities, setCities] = useState([]);
  const defaultValues = useSelector((state) => state.basketInfo.values);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      name: "",
      lastName: "",
      postalCode: "",
      province: "",
      city: "",
      phone: "",
      email: "",
      nationalCode: "",
      address: "",
      socialName: "whatsapp",
      socialNumber: ""
    },
    onValuesChange: (values, prevValues) => {
      if (values.province !== prevValues.province) {
        // اگر استان تغییر کرد، مقدار شهر را خالی کن
        form.setFieldValue("city", "");

        if (values.province) {
          const provinceData = iranCity.find(
            (item) => item.name === values.province
          );
          if (provinceData && provinceData.cities) {
            const formattedCities = provinceData.cities.map((item) => ({
              label: item.name,
              value: item.name,
            }));
            setCities(formattedCities);
          } else {
            setCities([]); // اگر استان داده‌ای نداشت، شهرها را خالی کن
          }
        } else {
          setCities([]); // اگر استان خالی شد، شهرها را خالی کن
        }
      }
    },
    validate: yupResolver(validationSchema),
  });

  useEffect(() => {
    form.setValues(defaultValues);
    form.setFieldValue("city", defaultValues.city);
  }, []);

  const handleForm = (values) => {
    form.validate();
    if (form.isValid() !== false) {
      dispatch(toggleLoading());
      setTimeout(() => {
        dispatch(updateBasketInfo({ ...form.getValues() }));
        dispatch(toggleLoading());
      },1000)
    }
  };
  return (
    <>
      <Stepper mb="xl" active={1}>
        <Stepper.Step label="سبد خرید" icon={<IconShoppingCart />} />
        <Stepper.Step label="اطلاعات خریدار" icon={<IconUserCheck />} />
        <Stepper.Step label="انتخاب روش پرداخت" icon={<IconWallet />} />
        <Stepper.Step label="پرداخت نهایی" icon={<IconCircleCheck />} />
      </Stepper>
      <Grid>
        <Grid.Col span={{ lg: 9 }}>
          <Title fw="600" c="gray.8" mb="lg">
            اطلاعات خریدار
          </Title>
          <Paper p="xl">
            <form
              onSubmit={form.onSubmit((values) => handleForm(values))}
              ref={formRef}
            >
              <Grid>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="نام"
                    withAsterisk
                    {...form.getInputProps("name")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="نام خانوادگی"
                    withAsterisk
                    {...form.getInputProps("lastName")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="شماره موبایل"
                    component={IMaskInput}
                    mask="0000 000 0000"
                    type="text"
                    dir="ltr"
                    styles={{ input: { textAlign: "left" } }}
                    withAsterisk
                    inputMode="numeric"
                    {...form.getInputProps("phone")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    type="email"
                    label="آدرس ایمیل"
                    {...form.getInputProps("email")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="کد ملی"
                    component={IMaskInput}
                    type="number"
                    mask="0000000000"
                    dir="ltr"
                    styles={{ input: { textAlign: "left" } }}
                    {...form.getInputProps("nationalCode")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <Select
                    data={[{ label: "ایران", value: "ایران" }]}
                    readOnly
                    value={"ایران"}
                    label="کشور"
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <Select
                    data={Provinces}
                    allowDeselect={false}
                    label="استان"
                    placeholder="لطفا یک استان انتخاب کنید"
                    searchable="true"
                    withAsterisk
                    {...form.getInputProps("province")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <Autocomplete
                    data={cities}
                    label="شهر"
                    placeholder={
                      form.getInputProps("province").value !== ""
                        ? "لطفا یک شهر انتخاب کنید"
                        : "ابتدا استان را انتخاب کنید"
                    }
                    searchable="true"
                    withAsterisk
                    {...form.getInputProps("city")}
                  />
                </GridCol>
                <GridCol span={12}>
                  <Textarea
                    rows={4}
                    label="آدرس"
                    placeholder="آدرس کامل"
                    withAsterisk
                    {...form.getInputProps("address")}
                  />
                </GridCol>
                <GridCol>
                  <TextInput
                    label="کد پستی 10 رقمی"
                    component={IMaskInput}
                    type="number"
                    mask="0000000000"
                    dir="ltr"
                    withAsterisk
                    {...form.getInputProps("postalCode")}
                  />
                </GridCol>
                <GridCol>
                  <Flex align="start" gap="3"><Text size="sm" mb="sm">شماره موبایل شبکه اجتماعی ( جهت هماهنگی )</Text><Text c="red" size="sm">*</Text></Flex>
                  <Flex gap="md">
                    <Select allowDeselect={false} data={[
                      {
                        label: "واتس‌اپ",
                        value: "whatsapp"
                      },
                      {
                        label: "تلگرام",
                        value: "telegram"
                      },
                      {
                        label: "روبیکا",
                        value: "rubika"
                      },
                      {
                        label: "بله",
                        value: "bale"
                      },
                      {
                        label: "ایتا",
                        value: "eita"
                      },
                    ]} {...form.getInputProps('socialName')} />
                    <TextInput w="100%" 
                    placeholder="شماره تلفن"
                    component={IMaskInput}
                    mask="0000 000 0000"
                    type="text"
                    dir="ltr"
                    styles={{ input: { textAlign: "left" } }}
                    withAsterisk
                    inputMode="numeric"
                    {...form.getInputProps('socialNumber')}
                    />
                  </Flex>
                </GridCol>
              </Grid>
              <button type="submit" hidden></button>
            </form>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ lg: 3 }}>
          <PaymentCalc prev={{to:"/basket",component:NavLink}}  submit={{onClick:() => handleForm()}} >ثبت سفارش</PaymentCalc>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default BasketInfo;
