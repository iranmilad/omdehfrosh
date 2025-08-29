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
import { useEffect, useRef, useState,useLayoutEffect } from "react";
import { useForceUpdate } from "@mantine/hooks";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { updateBasketInfo } from "../../../redux/basket-info";
import {toggleLoading} from "../../../redux/global"
import PaymentCalc from "../../../components/payment_calc";
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { useSend } from "../../../Libs/api";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";

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

let Provinces = [];
iranCity.map((item) => {
  Provinces.push({ label: item.name, value: item.name });
});

const BasketInfo = () => {

  // const [isNameEditable, setIsNameEditable] = useState(false);
  // const [isLastNameEditable, setIsLastNameEditable] = useState(false);
  // const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  // const [isEmailEditable, setIsEmailEditable] = useState(false);
  // const [isNationalCodeEditable, setIsNationalCodeEditable] = useState(false);
  // const [isProvinceEditable, setIsProvinceEditable] = useState(false);
  // const [isCityEditable, setIsCityEditable] = useState(false);
  // const [isAddressEditable, setIsAddressEditable] = useState(false);
  // const [isSocialNumberEditable, setIsSocialNumberEditable] = useState(false);
  // const [isSocialMediaEditable, setIsSocialMediaEditable] = useState(false);

  const [isEditable, setIsEditable] = useState(false); // Single state for all fields



  const formRef = useRef("");

  let [cities, setCities] = useState([]);

  const defaultValues = useSelector((state) => state.basketInfo.values);

  const dispatch = useDispatch();

  const [cookies, setCookie] = useCookies(["user"]);

  const [pageActive,setPageActive] = useState(false);

  const navigate = useNavigate();


  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  
  const updateQuery = useSend({ url: "/users/update" });

  const {data} = useSend({ url: "/users/update" });

  const userInfo = useSelector((state) => state.user.userInfo);




  const [stateMessage, setStateMessage] = useState("ok")
  
  const [showAlert, setShowAlert] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  
  const [errors, setErrors] = useState({})

  const [errs, setErrs] = useState({})




    useEffect(() => {
      const nonNotifyStatuses = [
        400, 401, 403, 404, 405, 406, 408, 409,
        410, 411, 412, 413, 414, 415, 416, 417,
        422, 429
      ];
    
      const isEmpty = (obj) => Object.keys(obj).length === 0;
    
      const hasValidStatus = errors && typeof errors.status !== "undefined" && !isNaN(Number(errors.status));
    
      if (!isEmpty(errors) && hasValidStatus && !nonNotifyStatuses.includes(Number(errors.status))) {
        // Clear errors first
        setErrors({});
    
        // Then show notification
        notifications.show({
          title: errors.message || "خطایی رخ داده است",
          color: "red",
          autoClose: true,
        });
      }
    }, [errors, data]);




          useEffect(() => {
            if (errs && errs?.state === "ok" ) {
              notifications.show({
                title: errs.message,
                color: "green",
                autoClose: true
              });
            }
            if (errs && errs?.state === "error" ) {
                notifications.show({
                  title: errs.message,
                  color: "red",
                  autoClose: true
                });
              }
    
          }, [errs]);
  

useEffect(() => {
  if (errors?.status) {
    handleKnownErrors(errors.status, setModalOpen, navigate);
  }
}, [errors, data]);



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

    // Dispatch the verifyToken action on component mount
    useEffect(() => {
      dispatch(verifyToken());
    }, [dispatch]);
  
    // Check the verification state and decide what to render
    
    useEffect(() => {
      if (authLoading) {
        return;
      }
    
      if (isVerified === false) {
        navigate("/login", { replace: true });
      } else if (isVerified === true) {
        setPageActive(true);
        dispatch(fetchUserInfo()); // Fetch user info after verification
      }
    }, [isVerified, authLoading, navigate, dispatch]);
    

    useEffect(() => {
      if (userInfo?.user) {  // Ensure user data exists before setting values
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

    // Set city options if province exists
    if (userInfo.user.province) {
      const provinceData = iranCity.find((item) => item.name === userInfo.user.province);
      if (provinceData && provinceData.cities) {
        setCities(
          provinceData.cities.map((item) => ({
            label: item.name,
            value: item.name,
          }))
        );
      }
    }

    if (userInfo.user.province) {
      const provinceData = iranCity.find((item) => item.name === userInfo.user.province);
      if (provinceData && provinceData.cities) {
        const formattedCities = provinceData.cities.map((item) => ({
          label: item.name,
          value: item.name,
        }));
    
        setCities(formattedCities);
    
        // Auto-select city if it exists in the province's cities list
        const isCityValid = formattedCities.some((city) => city.value === userInfo.user.city);
        form.setFieldValue("city", isCityValid ? userInfo.user.city : "");
      }
    }
    
  }
}, [userInfo]);



  useEffect(() => {
    form.setValues(defaultValues);
    form.setFieldValue("city", defaultValues.city);
  }, []);









  const handleForm = (values) => {

    form.validate();

    if (form.isValid() == true) {

    updateQuery.mutateAsync(
      {
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
          note: form.values.note
      },
      {
        onSuccess: (data) => {


          if(data.state === "error") {
            setStateMessage("error")
            setErrs(data)
            return
          }

          if (data.error) {

            form.setErrors(data.error);
            setErrors(data.error);

          }

          if (data.status === "ok" && form.isValid() !== false) {

            setErrs(data)


              setErrors({});

              if (errs && errs?.state === "ok" ) {
                notifications.show({
                  title: errs.message,
                  color: "green",
                  autoClose: true
                });
              }
              navigate('/payment')


          } else {


            throw new Error("Failed to fetch cart data");        
            
            
          }
        }
      }
    );
  }


    
  };

  // useLayoutEffect(() => {
  //   if (!cookies.user && cookies?.user !== "") {
  //     navigate("/login",{replace:true});
  //   }
  //   else{
  //       setPageActive(true);
  //   }
  // }, []);

    if (!userInfo || authLoading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }

  if(!pageActive) return <></>;

  
  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        // status={errors?.status}
        message={errors?.message}
      />
      <Stepper mb="xl" active={2}>
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
                    disabled={!isEditable}
                    {...form.getInputProps("name")}
                    error={
                      (errs?.state === "error" && errs?.errors?.name) || form.errors.name ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.name && (
                            <div>{errs?.errors?.name}</div>
                          )}
                          {form.errors.name && <div>{form.errors.name}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsNameEditable(true)}
                  >
                    ویرایش
                  </Button> */}
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    label="نام خانوادگی"
                    withAsterisk
                    disabled={!isEditable}
                    {...form.getInputProps("family")}
                    error={
                      (errs?.state === "error" && errs?.errors?.family) || form.errors.family ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.family && (
                            <div>{errs?.errors?.family}</div>
                          )}
                          {form.errors.family && <div>{form.errors.family}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsLastNameEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                    // error={
                    //   (errs?.state === "error" && errs?.errors?.mobile) || form.errors.mobile ? (
                    //     <div>
                    //       {errs?.state === "error" && errs?.errors?.mobile && (
                    //         <div>{errs?.errors?.mobile}</div>
                    //       )}
                    //       {form.errors.mobile && <div>{form.errors.mobile}</div>}
                    //     </div>
                    //   ) : null
                    // }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsPhoneEditable(true)}
                  >
                    ویرایش
                  </Button> */}
                </GridCol>
                <GridCol span={{ md: 6 }}>
                  <TextInput
                    type="email"
                    label="آدرس ایمیل"
                    disabled={!isEditable}
                    {...form.getInputProps("email")}
                    error={
                      (errs?.state === "error" && errs?.errors?.email) || form.errors.email ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.email && (
                            <div>{errs?.errors?.email}</div>
                          )}
                          {form.errors.email && <div>{form.errors.email}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsEmailEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                      (errs?.state === "error" && errs?.errors?.nationalCode) || form.errors.nationalCode ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.nationalCode && (
                            <div>{errs?.errors?.nationalCode}</div>
                          )}
                          {form.errors.nationalCode && <div>{form.errors.nationalCode}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsNationalCodeEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                      (errs?.state === "error" && errs?.errors?.province) || form.errors.province ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.province && (
                            <div>{errs?.errors?.province}</div>
                          )}
                          {form.errors.province && <div>{form.errors.province}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsProvinceEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                      (errs?.state === "error" && errs?.errors?.city) || form.errors.city ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.city && (
                            <div>{errs?.errors?.city}</div>
                          )}
                          {form.errors.city && <div>{form.errors.city}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsCityEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                      (errs?.state === "error" && errs?.errors?.address) || form.errors.address ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.address && (
                            <div>{errs?.errors?.address}</div>
                          )}
                          {form.errors.address && <div>{form.errors.address}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsAddressEditable(true)}
                  >
                    ویرایش
                  </Button> */}
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
                      (errs?.state === "error" && errs?.errors?.postalCode) || form.errors.postalCode ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.postalCode && (
                            <div>{errs?.errors?.postalCode}</div>
                          )}
                          {form.errors.postalCode && <div>{form.errors.postalCode}</div>}
                        </div>
                      ) : null
                    }
                  />
                  {/* <Button
                    mt="xs"
                    size="xs"
                    variant="outline"
                    onClick={() => setIsSocialNumberEditable(true)}
                  >
                    ویرایش
                  </Button> */}
                </GridCol>
                <GridCol>
                  <Flex align="start" gap="3"><Text size="sm" mb="sm">شماره موبایل شبکه اجتماعی ( جهت هماهنگی )</Text><Text c="red" size="sm">*</Text></Flex>
                  <Flex 
                    gap="md"
                  >
                    <Select 
                      allowDeselect={false} 
                      disabled={!isEditable}
                      data={[
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
                    ]} 
                    {...form.getInputProps('socialName')} 
                    error={
                      (errs?.state === "error" && errs?.errors?.socialNetworkName) || form.errors.socialName ? (
                        <div>
                          {errs?.state === "error" && errs?.errors?.socialNetworkName && (
                            <div>{errs?.errors?.socialNetworkName}</div>
                          )}
                          {form.errors.socialName && <div>{form.errors.socialName}</div>}
                        </div>
                      ) : null
                    }
                    />
                    <TextInput w="100%" 
                      disabled={!isEditable}
                      placeholder="شماره تلفن"
                      component={IMaskInput}
                      mask="0000 000 0000"
                      type="text"
                      dir="ltr"
                      styles={{ input: { textAlign: "left" } }}
                      withAsterisk
                      inputMode="numeric"
                      {...form.getInputProps('socialNumber')}
                      error={
                        (errs?.state === "error" && errs?.errors?.socialNetworkMobile) || form.errors.socialNumber ? (
                          <div>
                            {errs?.state === "error" && errs?.errors?.socialNetworkMobile && (
                              <div>{errs?.errors?.socialNetworkMobile}</div>
                            )}
                            {form.errors.socialNumber && <div>{form.errors.socialNumber}</div>}
                          </div>
                        ) : null
                      }
                    />
                  </Flex>
                  {/* <Button
                      mt="xs"
                      size="xs"
                      variant="outline"
                      onClick={() => setIsSocialMediaEditable(true)}
                    >
                      ویرایش
                    </Button> */}
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
          <PaymentCalc prev={{to:"/basket", component:NavLink}}  submit={{onClick:() => handleForm()}} >ثبت سفارش</PaymentCalc>
        </Grid.Col>
      </Grid>

    </>
  );
};

export default BasketInfo;