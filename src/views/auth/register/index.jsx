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
  Paper,
  PinInput,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import authBg from "../../../assets/auth.jpg";
import { IMaskInput } from "react-imask";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useSend } from "../../../Libs/api";
import { useCookies } from "react-cookie";
import { IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import * as yup from 'yup';
import { yupResolver } from 'mantine-form-yup-resolver';
import { useDispatch, useSelector } from "react-redux";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";


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

  const bootstrap = useSelector((state) => state.global.bootstrap);

  const dispatch = useDispatch();

  const navigate = useNavigate();


  const [stateMessage, setStateMessage] = useState("ok")
  
  const [showAlert, setShowAlert] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  
  const [errors, setErrors] = useState({})

  const [errs, setErrs] = useState({})

  const [successMessage, setSuccessMessage] = useState({})


  const { mutateAsync, isPending } = useSend({ url: "auth/register/" });

  const sendCode = useSend({ url: "auth/sms" });

  const { data } = useSend({ url: "auth/sms" });

  const verify = useSend({url: "auth/verifyregister"});



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
    if (errors?.status) {
      handleKnownErrors(errors.status, setModalOpen, navigate);
    }
  }, [errors, data]);


        useEffect(() => {
          if (successMessage && successMessage.state === "ok" ) {
            notifications.show({
              title: successMessage.message,
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
  
        }, [ successMessage, data, errs]);
  




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

    
    let data = value;
    data.mobile = value.mobile.replace(/\s+/g, "");
    const mobile = data.mobile;


    mutateAsync(
      { ...data },
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



          } else {
            setSuccessMessage(data)
            sendCode.mutateAsync({mobile}, {


              onSuccess: (data2) => {

                if(data2.error) {
                  form.setErrors(data.error);
                }

                formCode.setValues({ code: "" });
                formCode.setFieldError("code", "");
                setType("code");
                setErrors({});

              }
            })

          }
        },
      }
    );
  }


  function verifyRegister(value) {

    if (stateMessage !== "error") {
      verify.mutateAsync(
        { mobile: form.getValues().mobile.replace(/\s+/g, ""), code: value.code },
        {
          onSuccess: (data) => {
            if (data.error) {
              formCode.setErrors(data.error);
            } else {
              setType("success");
              setTimeout(() => {
                navigate("/login");
              }, 2000);
            }
          },
        }
      );
    }


  }
  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        // status={errors?.status}
        message={errors?.message}
      />
      <Box bg="gray.1" h="100vh" w="100%" className="flex items-center justify-center">
        <Center w={{base: "85%",xs:"65%",sm:"50%",md:"40%",lg:"40%",xl:"25%"}} className="flex-col relative z-10">
          <Image
            w={160}
            src={bootstrap?.logo}
          />
          <Paper className="bg-white rounded-2xl shadow-box-sm w-full h-auto py-5 px-4 min-h-max">
          <Flex justify="space-between" align="center">
              <Text c="dark" size="xl" fw="bold">ثبت</Text>
              <Image src={""} />
            </Flex>
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
                      <TextInput 
                      label="نام خانوادگی"
                      {...form.getInputProps("family")}
                      withAsterisk
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
                      <TextInput
                        label="کد ملی"
                        component={IMaskInput}
                        dir="ltr"
                        styles={{ input: { textAlign: "left" } }}
                        {...form.getInputProps("nationalCode")}
                        withAsterisk
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
                      <TextInput
                        label="شماره موبایل"
                        type="text"
                        dir="ltr"
                        styles={{ input: { textAlign: "left" } }}
                        {...form.getInputProps("mobile")}
                        withAsterisk
                        error={
                          (errs?.state === "error" && errs?.errors?.mobile) || form.errors.mobile ? (
                            <div>
                              {errs?.state === "error" && errs?.errors?.mobile && (
                                <div>{errs?.errors?.mobile}</div>
                              )}
                              {form.errors.mobile && <div>{form.errors.mobile}</div>}
                            </div>
                          ) : null
                        }
                      />
                      <Button
                        type="submit"
                        variant="filled"
                        fullWidth
                        loading={isPending}
                        disabled={isPending || sendCode.isPending}  // Disable button to prevent multiple submissions

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
                  ثبت نام شما به معنای پذیرش{" "}
                  <Anchor size="xs">
                  قوانین و مقررات
                  </Anchor> {' '}
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
                      verifyRegister(values)
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
              </Alert>
            )}
          </Paper>
        </Center>
      </Box>
    </>
  );
};

export default Register;
