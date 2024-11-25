import {
  Alert,
  Box,
  Button,
  Center,
  Image,
  Input,
  PinInput,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import authBg from "../../../assets/auth.jpg";
import { IMaskInput } from "react-imask";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { NavLink } from "react-router";
import { useSend } from "../../../Libs/api";
import { useCookies } from "react-cookie";
import { IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import * as yup from 'yup';
import { yupResolver } from 'mantine-form-yup-resolver';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required('نام الزامی است')
    .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'),
  family: yup
    .string()
    .required('نام خانوادگی الزامی است')
    .min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد')
    .max(50, 'نام خانوادگی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد'),
  nationalCode: yup
    .string()
    .required('کد ملی الزامی است')
    .matches(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'),
    mobile: yup
    .string()
    .transform((value) => value.replace(/\s+/g, '')) // حذف فاصله‌ها
    .required('شماره موبایل الزامی است')
    .matches(/^09\d{9}$/, 'شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد'),
  
});

const Register = () => {
  const [type, setType] = useState("enter");
  const [cookies, setCookie] = useCookies(["user"]);
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useSend({ url: "auth/sms/" });
  const sendCode = useSend({ url: "auth/login/" });
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      name: "",
      family: "",
      nationalCode: "",
      mobile: ""
    },

    validate: yupResolver(validationSchema)
  });
  const formCode = useForm({
    mode: "uncontrolled",
    initialValues: {
      code: "",
    },

    validate: {
      code: (value) => {
        return /^\d{4}$/.test(value) ? null : "کد باید دقیقاً شامل ۴ رقم باشد";
      },
    },
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
          } else {
            setType("success");
            setCookie("user", data.token, {
              path: "/",
              maxAge: data.maxAge,
            });
            setTimeout(() => {
              navigate("/");
            }, 2000);
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
            <Image
              className="w-48 mx-auto"
              src="./assets/image/logo.png"
              alt=""
            />
            <Text c="dark" size="xl" fw="bold" ta="center">
              ثبت نام
            </Text>
            {type === "enter" ? (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form
                    onSubmit={form.onSubmit((values) => submitForm(values))}
                  >
                    <Stack>
                      <TextInput label="نام"
                        {...form.getInputProps("name")}
                        withAsterisk
                      />
                      <TextInput 
                      label="نام خانوادگی"
                      {...form.getInputProps("family")}
                      withAsterisk
                      />
                      <TextInput
                        label="کد ملی"
                        component={IMaskInput}
                        type="number"
                        mask="0000000000"
                        dir="ltr"
                        styles={{ input: { textAlign: "left" } }}
                        {...form.getInputProps("nationalCode")}
                        withAsterisk
                      />
                      <TextInput
                        label="شماره موبایل"
                        component={IMaskInput}
                        mask="0000 000 0000"
                        type="text"
                        dir="ltr"
                        styles={{ input: { textAlign: "left" } }}
                        {...form.getInputProps("mobile")}
                        withAsterisk
                      />
                      <Button
                        type="submit"
                        variant="filled"
                        fullWidth
                        loading={isPending}
                      >
                        ثبت نام
                      </Button>
                      <Button
                        variant="white"
                        fullWidth
                        component={NavLink}
                        to="/login"
                      >
                        ورود
                      </Button>
                    </Stack>
                  </form>
                </div>
                <div className="mt-8 mb-4 text-xs text-zinc-500">
                  ورود شما به معنای پذیرش{" "}
                  <a
                    className="text-red-400 hover:text-red-500 transition"
                    href=""
                  >
                    {" "}
                    قوانین و مقررات
                  </a>{" "}
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
                      ثبت نام
                    </Button>
                  </form>
                </div>
              </>
            )}
            {type === "success" && (
              <Alert
                mt="xl"
                variant="light"
                color="teal"
                title="ثبت نام موفقیت آمیز بود"
              >
                به طور خودکار هدایت میشوید
              </Alert>
            )}
          </div>
        </Center>
      </Box>
    </>
  );
};

export default Register;
