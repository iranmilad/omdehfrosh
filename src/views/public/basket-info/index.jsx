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
  Center,
  Loader,
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
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateBasketInfo } from "../../../redux/basket-info";
import { toggleLoading } from "../../../redux/global";
import PaymentCalc from "../../../components/payment_calc";
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { Steps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  WarningOutlined,
  InboxOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Grid as GridAnt } from 'antd';

const { useBreakpoint } = GridAnt;

const validationSchema = Yup.object().shape({
  name: Yup.string().required("نام الزامی است"),
  family: Yup.string().required("نام خانوادگی الزامی است"),
  mobile: Yup.string()
    .matches(/^(\d{4})\s?(\d{3})\s?(\d{4})$/, "فرمت شماره موبایل صحیح نیست")
    .required("شماره موبایل الزامی است"),
  postalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد پستی باید 10 رقم باشد")
    .required("کد پستی الزامی است"),
  nationalCode: Yup.string()
    .matches(/^[0-9]{10}$/, "کد ملی باید 10 رقم باشد")
    .required("کد ملی الزامی است"),
  province: Yup.string().required("استان الزامی است"),
  city: Yup.string().required("شهر الزامی است"),
  address: Yup.string().required("آدرس الزامی است"),
  socialNumber: Yup.string()
    .matches(/^(\d{4})\s?(\d{3})\s?(\d{4})$/, "فرمت شماره موبایل صحیح نیست")
    .required("شماره موبایل الزامی است"),
});

let Provinces = iranCity.map((item) => ({ label: item.name, value: item.name }));

const BasketInfo = () => {
  const [isEditable, setIsEditable] = useState(false);
  const formRef = useRef("");
  const [cities, setCities] = useState([]);
  const defaultValues = useSelector((state) => state.basketInfo.values);
  const dispatch = useDispatch();
  const [cookies] = useCookies(["user"]);
  const [pageActive, setPageActive] = useState(false);
  const navigate = useNavigate();
  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [stateMessage, setStateMessage] = useState("ok");
  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [errs, setErrs] = useState({});

  const screensAnt = useBreakpoint();

  useEffect(() => {
    const nonNotifyStatuses = [400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 422, 429];

    const isEmpty = (obj) => Object.keys(obj).length === 0;
    const hasValidStatus = errors && typeof errors.status !== "undefined" && !isNaN(Number(errors.status));

    if (!isEmpty(errors) && hasValidStatus && !nonNotifyStatuses.includes(Number(errors.status))) {
      setErrors({});
      notifications.show({
        title: errors.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }
  }, [errors]);

  useEffect(() => {
    if (errs?.state === "ok") {
      notifications.show({
        title: errs.message,
        color: "green",
        autoClose: true,
      });
    }
    if (errs?.state === "error") {
      notifications.show({
        title: errs.message,
        color: "red",
        autoClose: true,
      });
    }
  }, [errs]);

  useEffect(() => {
    if (errors?.status) {
      handleKnownErrors(errors.status, setModalOpen, navigate);
    }
  }, [errors, navigate]);

  const form = useForm({
    initialValues: {
      name: "",
      family: "",
      postalCode: "",
      province: "",
      city: "",
      mobile: "",
      email: "",
      nationalCode: "",
      address: "",
      socialName: "whatsapp",
      socialNumber: "",
    },
    onValuesChange: (values, prevValues) => {
      if (values.province !== prevValues.province) {
        form.setFieldValue("city", "");
        if (values.province) {
          const provinceData = iranCity.find((item) => item.name === values.province);
          if (provinceData && provinceData.cities) {
            const formattedCities = provinceData.cities.map((item) => ({
              label: item.name,
              value: item.name,
            }));
            setCities(formattedCities);
          } else {
            setCities([]);
          }
        } else {
          setCities([]);
        }
      }
    },
    validate: yupResolver(validationSchema),
  });

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    if (authLoading) return;
    if (isVerified === false) {
      navigate("/login", { replace: true });
    } else if (isVerified === true) {
      setPageActive(true);
      dispatch(fetchUserInfo());
    }
  }, [isVerified, authLoading, navigate, dispatch]);

  useEffect(() => {
    if (userInfo?.user) {
      form.setValues({
        name: userInfo.user.name || "",
        family: userInfo.user.family || "",
        mobile: userInfo.user.mobile || "",
        email: userInfo.user.email || "",
        nationalCode: userInfo.user.nationalCode || "",
        postalCode: userInfo.user.postalCode || "",
        province: userInfo.user.province || "",
        city: userInfo.user.city || "",
        address: userInfo.user.address || "",
        socialName: userInfo.user.socialNetworkName || "whatsapp",
        socialNumber: userInfo.user.socialNetworkMobile || "",
      });

      if (userInfo.user.province) {
        const provinceData = iranCity.find((item) => item.name === userInfo.user.province);
        if (provinceData && provinceData.cities) {
          const formattedCities = provinceData.cities.map((item) => ({
            label: item.name,
            value: item.name,
          }));
          setCities(formattedCities);
          const isCityValid = formattedCities.some((city) => city.value === userInfo.user.city);
          form.setFieldValue("city", isCityValid ? userInfo.user.city : "");
        }
      }
    }
  }, [userInfo]);

  useEffect(() => {
    form.setValues(defaultValues);
    form.setFieldValue("city", defaultValues.city);
  }, [defaultValues]);


  const handleForm = async () => {
    form.validate();
    if (!form.isValid()) return;
    const token = localStorage.getItem("user");

    dispatch(toggleLoading(true));
    try {
      const response = await fetch(getApiUrl("/users/update"), {
        method: "POST",
        body: JSON.stringify({
          name: form.values.name,
          family: form.values.family,
          postalCode: form.values.postalCode,
          province: form.values.province,
          city: form.values.city,
          mobile: form.values.mobile,
          email: form.values.email,
          nationalCode: form.values.nationalCode,
          address: form.values.address,
          socialName: form.values.socialName,
          socialNumber: form.values.socialNumber,
          note: form.values.note,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error = {
          status: response.status,
          message: data?.message || "خطایی در ویرایش اطلاعات کاربر رخ داده است",
        };
        setErrors(error);
        setErrs({ state: "error", message: error.message });
        return;
      }

      if (data.state === "error") {
        setStateMessage("error");
        setErrs(data);
        return;
      }

      if (data.error) {
        form.setErrors(data.error);
        setErrors(data.error);
        return;
      }

      if (data.status === "ok") {
        setErrs({ state: "ok", message: "موفقیت در ویرایش اطلاعات کاربر" });
        setErrors({});
        navigate("/payment");
      } else {
        throw new Error("Failed to update user data");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      setErrors({ message: "خطایی در سرور رخ داده است" });
      setErrs({ state: "error", message: "خطایی در سرور رخ داده است" });
    } finally {
      dispatch(toggleLoading(false));
    }
  };

  if (!userInfo || authLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!pageActive) return <></>;

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errors?.message}
      />
        <Steps
          current={1}
          size={screensAnt.md ? 'default' : 'small'}
          style={{ 
            marginBottom: 32,
            background: 'white',
            padding: screensAnt.md ? 24 : 12,
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: screensAnt.md ? '14px' : '12px'
          }}
          items={[
            { title: 'سبد خرید', icon: <ShoppingCartOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'اطلاعات خریدار', icon: <UserOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'انتخاب روش پرداخت', icon: <WalletOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'پرداخت نهایی', icon: <CheckCircleOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
          ]}
        />
      <Grid>
        <Grid.Col span={{ lg: 9 }}>
          <Title fw="600" c="gray.8" mb="lg">
            اطلاعات خریدار
          </Title>
          <Paper p="xl">
            <form onSubmit={form.onSubmit(() => handleForm())}>
              <Grid>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="نام"
                    withAsterisk
                    disabled={!isEditable}
                    {...form.getInputProps("name")}
                    error={
                      (errs?.state === "error" && errs?.errors?.name) ||
                      form.errors.name ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.name && (
                            <div>{errs?.errors?.name}</div>
                          )}
                          {form.errors.name && <div>{form.errors.name}</div>}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="نام خانوادگی"
                    withAsterisk
                    disabled={!isEditable}
                    {...form.getInputProps("family")}
                    error={
                      (errs?.state === "error" && errs?.errors?.family) ||
                      form.errors.family ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.family && (
                            <div>{errs?.errors?.family}</div>
                          )}
                          {form.errors.family && <div>{form.errors.family}</div>}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="شماره موبایل"
                    component={IMaskInput}
                    mask="0000 000 0000"
                    type="text"
                    dir="ltr"
                    disabled={true}
                    styles={{ input: { textAlign: "left" } }}
                    withAsterisk
                    inputMode="numeric"
                    {...form.getInputProps("mobile")}
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    type="email"
                    label="آدرس ایمیل"
                    disabled={!isEditable}
                    {...form.getInputProps("email")}
                    error={
                      (errs?.state === "error" && errs?.errors?.email) ||
                      form.errors.email ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.email && (
                            <div>{errs?.errors?.email}</div>
                          )}
                          {form.errors.email && <div>{form.errors.email}</div>}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="کد ملی"
                    component={IMaskInput}
                    type="number"
                    mask="0000000000"
                    dir="ltr"
                    disabled={!isEditable}
                    styles={{ input: { textAlign: "left" } }}
                    {...form.getInputProps("nationalCode")}
                    error={
                      (errs?.state === "error" && errs?.errors?.nationalCode) ||
                      form.errors.nationalCode ? (
                        <div>
                          {errs?.state === "error" &&
                            errs?.errors?.nationalCode && (
                              <div>{errs?.errors?.nationalCode}</div>
                            )}
                          {form.errors.nationalCode && (
                            <div>{form.errors.nationalCode}</div>
                          )}
                        </div>
                      ) : null
                    }
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
                    disabled={!isEditable}
                    withAsterisk
                    {...form.getInputProps("province")}
                    error={
                      (errs?.state === "error" && errs?.errors?.province) ||
                      form.errors.province ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.province && (
                            <div>{errs?.errors?.province}</div>
                          )}
                          {form.errors.province && (
                            <div>{form.errors.province}</div>
                          )}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <Autocomplete
                    data={cities}
                    label="شهر"
                    disabled={!isEditable}
                    placeholder={
                      form.getInputProps("province").value !== ""
                        ? "لطفا یک شهر انتخاب کنید"
                        : "ابتدا استان را انتخاب کنید"
                    }
                    searchable="true"
                    withAsterisk
                    {...form.getInputProps("city")}
                    error={
                      (errs?.state === "error" && errs?.errors?.city) ||
                      form.errors.city ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.city && (
                            <div>{errs?.errors?.city}</div>
                          )}
                          {form.errors.city && <div>{form.errors.city}</div>}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol span={12}>
                  <Textarea
                    rows={4}
                    label="آدرس"
                    placeholder="آدرس کامل"
                    disabled={!isEditable}
                    withAsterisk
                    {...form.getInputProps("address")}
                    error={
                      (errs?.state === "error" && errs?.errors?.address) ||
                      form.errors.address ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.address && (
                            <div>{errs?.errors?.address}</div>
                          )}
                          {form.errors.address && <div>{form.errors.address}</div>}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol>
                  <TextInput
                    label="کد پستی 10 رقمی"
                    component={IMaskInput}
                    type="number"
                    mask="0000000000"
                    dir="ltr"
                    disabled={!isEditable}
                    withAsterisk
                    {...form.getInputProps("postalCode")}
                    error={
                      (errs?.state === "error" && errs?.errors?.postalCode) ||
                      form.errors.postalCode ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.postalCode && (
                            <div>{errs?.errors?.postalCode}</div>
                          )}
                          {form.errors.postalCode && (
                            <div>{form.errors.postalCode}</div>
                          )}
                        </div>
                      ) : null
                    }
                  />
                </GridCol>
                <GridCol>
                  <Flex align="start" gap="3">
                    <Text size="sm" mb="sm">
                      شماره موبایل شبکه اجتماعی ( جهت هماهنگی )
                    </Text>
                    <Text c="red" size="sm">
                      *
                    </Text>
                  </Flex>
                  <Flex gap="md">
                    <Select
                      allowDeselect={false}
                      disabled={!isEditable}
                      data={[
                        { label: "واتس‌اپ", value: "whatsapp" },
                        { label: "تلگرام", value: "telegram" },
                        { label: "روبیکا", value: "rubika" },
                        { label: "بله", value: "bale" },
                        { label: "ایتا", value: "eita" },
                      ]}
                      {...form.getInputProps("socialName")}
                      error={
                        (errs?.state === "error" && errs?.errors?.socialNetworkName) ||
                        form.errors.socialName ? (
                          <div>
                            {errs?.state === "error" &&
                              errs?.errors?.socialNetworkName && (
                                <div>{errs?.errors?.socialNetworkName}</div>
                              )}
                            {form.errors.socialName && (
                              <div>{form.errors.socialName}</div>
                            )}
                          </div>
                        ) : null
                      }
                    />
                    <TextInput
                      w="100%"
                      disabled={!isEditable}
                      placeholder="شماره تلفن"
                      component={IMaskInput}
                      mask="0000 000 0000"
                      type="text"
                      dir="ltr"
                      styles={{ input: { textAlign: "left" } }}
                      withAsterisk
                      inputMode="numeric"
                      {...form.getInputProps("socialNumber")}
                      error={
                        (errs?.state === "error" && errs?.errors?.socialNetworkMobile) ||
                        form.errors.socialNumber ? (
                          <div>
                            {errs?.state === "error" &&
                              errs?.errors?.socialNetworkMobile && (
                                <div>{errs?.errors?.socialNetworkMobile}</div>
                              )}
                            {form.errors.socialNumber && (
                              <div>{form.errors.socialNumber}</div>
                            )}
                          </div>
                        ) : null
                      }
                    />
                  </Flex>
                </GridCol>
              </Grid>
              <button type="submit" hidden></button>
            </form>
          </Paper>
          <Button
            onClick={() => setIsEditable(!isEditable)}
            variant="outline"
            mb="md"
            mt="md"
          >
            {isEditable ? "قفل اطلاعات" : "ویرایش همه"}
          </Button>
        </Grid.Col>
        <Grid.Col span={{ lg: 3 }}>
          <PaymentCalc
            prev={{ to: "/basket", component: NavLink }}
            submit={{ onClick: () => handleForm() }}
          >
            ثبت سفارش
          </PaymentCalc>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default BasketInfo;