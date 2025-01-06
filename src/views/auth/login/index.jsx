import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Center,
  Flex,
  Image,
  Input,
  PinInput,
  Text,
  TextInput,
} from "@mantine/core";
import authBg from "../../../assets/auth.jpg";
import { IMaskInput } from "react-imask";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { NavLink } from "react-router";
import { useSend } from "../../../Libs/api";
import {useCookies}  from "react-cookie";
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from "react-router";
import * as yup from 'yup';
import { yupResolver } from 'mantine-form-yup-resolver';
import Logo from "../../../assets/logo.png"

const validationSchema = yup.object().shape({
  mobile: yup
    .string()
    .required('شماره موبایل الزامی است')
    .matches(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
});

const codeValidationSchema = yup.object().shape({
  code: yup
    .string()
    .required('کد الزامی است')
    .matches(/^\d{4}$/, 'کد باید دقیقاً شامل ۴ رقم باشد'),
});

const Login = () => {
  const [type, setType] = useState("enter");
  const [cookies, setCookie] = useCookies(["user"]);
  const navigate = useNavigate();
  const { mutateAsync, isPending,data } = useSend({ url: "auth/sms/" });
  const sendCode = useSend({ url: "auth/login/" });
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mobile: "",
    },

    validate: {
      mobile: (value) => {
        const sanitizedValue = value.replace(/\s+/g, ""); // حذف تمام فاصله‌ها
        return /^09[0-9]{9}$/.test(sanitizedValue)
          ? null
          : "شماره موبایل نامعتبر است";
      },
    },
  });
  const formCode = useForm({
    mode: "uncontrolled",
    initialValues: {
      code: "",
    },

    validate: yupResolver(codeValidationSchema)
  });
  function submitForm(value) {
    const sanitizedValue = value.mobile.replace(/\s+/g, "");
    mutateAsync(
      { mobile: sanitizedValue },
      {
        onSuccess: (data) => {
          if (data.error) {
            form.setFieldError("mobile", data.error);
          } else {
            formCode.setValues({ code: "" });
            formCode.setFieldError("code", "");
            setType("code");
          }
        },
      }
    );
  }
  function submitLogin(value) {
    sendCode.mutateAsync(
      { mobile: form.getValues().mobile.replace(/\s+/g, ""), code: value.code },
      {
        onSuccess: (data) => {
          if (data.error) {
            formCode.setFieldError("code", data.error);
          }
          else{
            if(data.user.status === 'active'){
              setType("success")
              setCookie("user",data.token,{
                path:"/",
                maxAge: data.maxAge
              });
              setTimeout(() => {
                navigate("/")
              },2000)
            }
            else{
              setType(data.user.status)
            }
          }
        },
      }
    );
  }
  return (
    <>
      <Box h="100vh" w="100%" className="flex items-center justify-center">
        <Image
          pos="absolute"
          style={{ zIndex: 2 }}
          w="100%"
          h="100%"
          fit="cover"
          src={authBg}
        />
        <Center className="relative z-10 lg:w-1/4">
          <div className="bg-white rounded-2xl shadow-box-sm w-full h-auto py-5 px-4 min-h-max">
            <Flex justify="space-between" align="center">
              <Text c="dark" size="xl" fw="bold">ورود</Text>
            </Flex>
            {type === "enter" ? (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form
                    onSubmit={form.onSubmit((values) => submitForm(values))}
                  >
                    <TextInput
                      label="لطفا شماره موبایل خود را وارد کنید"
                      component={IMaskInput}
                      mask="0000 000 0000"
                      type="text"
                      dir="ltr"
                      inputMode="numeric"
                      styles={{ input: { textAlign: "left" } }}
                      key={form.key("mobile")}
                      {...form.getInputProps("mobile")}
                      withAsterisk
                    />
                    <Button
                      type="submit"
                      mt="md"
                      variant="filled"
                      fullWidth
                      loading={isPending}
                    >
                      ادامه
                    </Button>
                    <Button
                      mt="md"
                      variant="white"
                      fullWidth
                      component={NavLink}
                      to="/register"
                    >
                      ثبت نام
                    </Button>          
                  </form>
                </div>
                <div className="mt-8 mb-4 text-xs text-zinc-500">
                  ورود شما به معنای پذیرش{" "}
                  <Text
                    component={NavLink}
                    c="var(--mantine-color-anchor)"
                    size="xs"
                  >
                    {" "}
                    قوانین و مقررات
                  </Text>{" "}
                  مدکالا میباشد.
                </div>
              </>
            ) : (
              <></>
            )}
            {type === "code" && (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form
                    onSubmit={formCode.onSubmit((values) =>
                      submitLogin(values)
                    )}
                  >
                    <Text mb="sm" size="sm">
                      کد تایید پیامک شده را وارد کنید
                    </Text>
                    <Center>
                      <PinInput
                        type="number"
                        key={formCode.key("code")}
                        {...formCode.getInputProps("code")}
                      />
                    </Center>
                    <Text c="red" size="xs">
                      {formCode.errors.code}
                    </Text>
                    <Button
                      p="0"
                      variant="transparent"
                      mt="lg"
                      onClick={() => setType("enter")}
                    >
                      تغییر شماره موبایل
                    </Button>
                    <Button
                      type="submit"
                      mt="md"
                      variant="filled"
                      fullWidth
                      loading={sendCode.isPending}
                    >
                      ورود
                    </Button>
                  </form>
                </div>
              </>
            )}
            {type === "success" && <Alert mt="xl"  variant="light" color="teal" title="ورود موفقیت آمیز بود" >به طور خودکار هدایت  میشوید</Alert> }
            {type === "pending" && (
              <Alert mt="xl" variant="light" color="cyan" title="پیام سیستم">
                <Text size="sm">این حساب کاربری در انتظار تایید میباشد</Text>
                <Button size="xs" mt="md" color="cyan" component="a" href="tel:01234567890">تلفن پشیبانی 09123456789</Button>
              </Alert>
            )}
            {type === "deactive" && (
              <Alert mt="xl" variant="light" color="orange" title="حساب کاربری غیر فعال">
                <Text size="sm">این حساب کاربری غیر فعال است. در صورت فعال نشدن با پشتیبانی تماس بگیرید</Text>
                <Button size="xs" mt="md" color="orange" component="a" href="tel:01234567890">تلفن پشیبانی 09123456789</Button>
              </Alert>
            )}
          </div>
        </Center>
      </Box>
    </>
  );
};

export default Login;
