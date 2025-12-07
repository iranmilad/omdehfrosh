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
import { useCookies } from "react-cookie";
import { IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router";
import * as yup from 'yup';
import { yupResolver } from 'mantine-form-yup-resolver';
import { useDispatch, useSelector } from "react-redux";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

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

  // Replace useSend with local state
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerData, setRegisterData] = useState(null);
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsData, setSmsData] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyData, setVerifyData] = useState(null);

  const [stateMessage, setStateMessage] = useState("ok");
  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [errs, setErrs] = useState({});
  const [successMessage, setSuccessMessage] = useState({});

 // Custom register function with direct fetch - FIXED VERSION
const registerUser = async (userData) => {
  setRegisterLoading(true);
  setRegisterData(null);
  
  try {
    console.log('Sending registration data:', userData);
    
    const response = await fetch(getApiUrl("/auth/signup"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Get response text first
    const text = await response.text();
    console.log('Response text:', text);

    // Try to parse JSON
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
      console.log('Parsed data:', data);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw text was:', text);
      
      // If we can't parse JSON, it's an error
      const errorData = {
        state: "error",
        message: "خطا در دریافت پاسخ از سرور",
        error: {
          status: response.status,
          message: "Invalid JSON response"
        }
      };
      setRegisterData(errorData);
      return errorData;
    }

    // Check if response is not OK (status 200-299)
    if (!response.ok) {
      console.error('Response not OK:', response.status);
      
      const error = {
        status: response.status,
        message: data?.message || getHttpCodeMessage(response.status),
      };

      const errorData = {
        state: "error",
        message: data?.message || "خطایی در ثبت نام کاربر رخ داده است",
        error,
        errors: data?.errors || {}
      };
      
      setRegisterData(errorData);
      return errorData;
    }

    // Check if backend returned state: "error" even with 2xx status
    if (data?.state === "error") {
      console.error('Backend returned error state:', data);
      
      const errorData = {
        state: "error",
        message: data.message || "خطایی در ثبت نام کاربر رخ داده است",
        error: {
          status: response.status,
          message: data.message
        },
        errors: data?.errors || {}
      };
      
      setRegisterData(errorData);
      return errorData;
    }

    // Success!
    console.log('Registration successful:', data);
    
    // Store token if provided
    if (data.token) {
      localStorage.setItem('user', data.token);
      console.log('Token stored');
    }
    
    const successData = {
      state: "ok",
      message: data.message || "موفقیت در ثبت نام",
      data,
    };
    
    setRegisterData(successData);
    return successData;

  } catch (error) {
    console.error('Registration request failed - caught error:', error);
    
    const errorData = {
      state: "error",
      message: "خطا در برقراری ارتباط با سرور",
      error: {
        message: error.message || "Network error"
      },
    };
    
    setRegisterData(errorData);
    return errorData;
  } finally {
    setRegisterLoading(false);
  }
};

  // Custom SMS sending function with direct fetch
  const sendSMSCode = async (mobile) => {
    setSmsLoading(true);
    setSmsData(null);
    
    try {
      const response = await fetch(getApiUrl("/sms/newsmscode"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error = {
          status: response.status,
          message: data?.message || getHttpCodeMessage(response.status),
        };

        setSmsData({
          state: "error",
          message: "Failed to send SMS",
          error,
        });
        return {
          state: "error",
          message: "Failed to send SMS",
          error,
        };
      }

      const successData = {
        state: "ok",
        message: "SMS sent successfully",
        data,
      };
      
      setSmsData(successData);
      return successData;

    } catch (error) {
      const errorData = {
        state: "error",
        message: "Internal Server Error",
        error: error.message || error,
      };
      
      setSmsData(errorData);
      return errorData;
    } finally {
      setSmsLoading(false);
    }
  };

  // Custom verify function with direct fetch
  const verifyRegisterCode = async (mobile, code) => {
    setVerifyLoading(true);
    setVerifyData(null);
    
    try {
      const token = localStorage.getItem("user");
      
      const response = await fetch(getApiUrl("/sms/verifysms"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mobile, code }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const errorData = {
          state: "error",
          message: "Verification failed",
          error: data?.error || { code: "کد وارد شده اشتباه است" },
        };
        
        setVerifyData(errorData);
        return errorData;
      }

      const successData = {
        state: "ok",
        message: "Verification successful",
        data,
      };
      
      setVerifyData(successData);
      return successData;

    } catch (error) {
      const errorData = {
        state: "error",
        message: "Internal Server Error",
        error: { code: "Internal Server Error" },
      };
      
      setVerifyData(errorData);
      return errorData;
    } finally {
      setVerifyLoading(false);
    }
  };

  useEffect(() => {
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
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
    if (errors?.status) {
      handleKnownErrors(errors.status, setModalOpen, navigate);
    }
  }, [errors]);

  useEffect(() => {
    if (successMessage && successMessage.state === "ok") {
      notifications.show({
        title: successMessage.message,
        color: "green",
        autoClose: true
      });
    }
    if (errs && errs?.state === "error") {
      notifications.show({
        title: errs.message,
        color: "red",
        autoClose: true
      });
    }
  }, [successMessage, errs]);

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

  async function submitForm(value) {
    let data = { ...value };
    data.mobile = value.mobile.replace(/\s+/g, "");
    const mobile = data.mobile;

    try {
      const registerResult = await registerUser(data);
      
      if (!registerResult) {
        console.error('No response data received');
        setStateMessage("error");
        return;
      }

      if (registerResult.state === "error") {
        setStateMessage("error");
        setErrs(registerResult);
        
        if (registerResult.error || registerResult.errors) {
          form.setErrors(registerResult.errors || registerResult.error);
          setErrors(registerResult.error || {});
        }
        return;
      }

      // Registration successful, now send SMS
      setSuccessMessage(registerResult);
      
      const smsResult = await sendSMSCode(mobile);
      
      if (smsResult && smsResult.state === "ok") {
        formCode.setValues({ code: "" });
        formCode.setFieldError("code", "");
        setType("code");
        setErrors({});
      } else if (smsResult && smsResult.error) {
        form.setErrors(smsResult.error);
      }

    } catch (error) {
      console.error('Registration request failed:', error);
      if (error && ![401, 404, 500].includes(error?.status)) {
        setErrors(error);
      }
    }
  }

  async function verifyRegister(value) {
    if (stateMessage === "error") {
      return;
    }

    try {
      const mobile = form.getValues().mobile.replace(/\s+/g, "");
      const result = await verifyRegisterCode(mobile, value.code);
      
      if (!result) {
        console.error('No response data received for verification');
        formCode.setFieldError("code", "خطا در دریافت پاسخ سرور");
        return;
      }

      if (result.state === "error") {
        formCode.setErrors(result.error);
        return;
      }

      // Verification successful
      setType("success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error('Verification request failed:', error);
      formCode.setFieldError("code", error?.message || "خطا در تایید کد");
    }
  }

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
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
                      <TextInput 
                        label="نام"
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
                        loading={registerLoading || smsLoading}
                        disabled={registerLoading || smsLoading}
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
                      loading={verifyLoading}
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