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
  rem,
  Text,
  TextInput,
} from "@mantine/core";
import authBg from "../../../assets/auth.jpg";
import { IMaskInput } from "react-imask";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useCookies } from "react-cookie";
import { IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from "react-router";
import * as yup from 'yup';
import { yupResolver } from 'mantine-form-yup-resolver';
import { useDispatch, useSelector } from "react-redux";
import QueryString from "qs";
import { verifyToken, verifyTokenSilent } from "../../../redux/auth/authusers/auth";
import { clearUserInfo } from "../../../redux/users/userinfo/userInfo";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { handleForbiddenError, handleKnownErrors } from '../../../Libs/errorstatushandle/httpErrorStatus'
import { getUserFavoritesList } from "../../../redux/users/getuserfavouriteslist/listActions";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

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
  const [cookies, setCookie] = useCookies(["user", "userFavorites"]);
  const bootstrap = useSelector((state) => state.global.bootstrap);
  const navigate = useNavigate();
  const redirectURL = QueryString.parse(location.search);
  const dispatch = useDispatch();

  // Replace useSend with local state for both SMS and Login
  const [smsLoading, setSmsLoading] = useState(false);
  const [smsData, setSmsData] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginData, setLoginData] = useState(null);
  
  const { user, isVerified, error, loading } = useSelector((state) => state.auth);
  const [stateMessage, setStateMessage] = useState("ok");
  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const { isVerifiedMaster, loadingMaster, errorMaster, user_master } = useSelector((state) => state.authMaster);
  
  const { getUserFavoritesListData, loadingGetUserFavoritesList, errorGetUserFavoritesList } = useSelector((state) => state.getUserFavoritesList);

  // ✅ NEW: Countdown timer state
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    // Use silent versions to prevent console errors
    dispatch(verifyTokenSilent());
    dispatch(clearUserInfo());
  }, [dispatch]);

  useEffect(() => {
    const isAuthenticated = (user && isVerified) || (user_master && isVerifiedMaster);
    
    if (isAuthenticated && !cookies.userFavorites) {
      // Dispatch action to get user's favorites list
      dispatch(getUserFavoritesList())
        .unwrap()
        .then((favoritesData) => {
          // Cache favorites in cookies for 7 days
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + 7);
          
          setCookie("userFavorites", JSON.stringify(favoritesData), {
            expires: expirationDate,
            path: "/",
            secure: true,
            sameSite: "strict"
          });
        })
        .catch((error) => {
          console.warn('Failed to load favorites:', error);
        });
    }
  }, [user, user_master, isVerified, isVerifiedMaster, dispatch, cookies.userFavorites, setCookie]);

  // Redirect logic
  useEffect(() => {
    // Check if user is authenticated (either regular user or master)
    const isAuthenticated = (user && isVerified) || (user_master && isVerifiedMaster);
    
    if (isAuthenticated) {
      const redirectPath = redirectURL['?redirect'] || "/";
      navigate(redirectPath, { replace: true });
    }
  }, [user, user_master, isVerified, isVerifiedMaster, navigate, redirectURL]);

  // ✅ NEW: Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // ✅ NEW: Format countdown as MM:SS
  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      mobile: "",
    },
    validate: {
      mobile: (value) => {
        const sanitizedValue = value.replace(/\s+/g, ""); 
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
          message: "مشکلی در ارسال پیامک رخ داده است",
          error,
        });
        return {
          state: "error",
          message: "خطایی رخ داده است",
          error,
        };
      }

      const successData = {
        state: "ok",
        message: "پیام با موفقیت ارسال شد",
        data,
      };
      
      setSmsData(successData);
      return successData;

    } catch (error) {
      const errorData = {
        state: "error",
        message: "خطای سرور",
        error: error.message || error,
      };
      
      setSmsData(errorData);
      return errorData;
    } finally {
      setSmsLoading(false);
    }
  };

  // Custom login function with direct fetch
  const loginUser = async (mobile, code) => {
    setLoginLoading(true);
    setLoginData(null);
    
    try {
      const response = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, code }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const error = {
          status: response.status,
          message: data?.message || getHttpCodeMessage(response.status),
          error: data?.error || "کد وارد شده اشتباه است"
        };

        setLoginData({
          state: "error",
          message: "ورود ناموفق",
          error,
        });
        return {
          state: "error",
          message: "ورود ناموفق",
          error,
        };
      }

      // Handle token storage based on API response
      if ("token" in data) {
        if (data.token) {
          localStorage.setItem("user", data.token);
        } else {
          localStorage.removeItem("user");
        }
      }

      if ("token_master" in data) {
        if (data.token_master) {
          localStorage.setItem("user_master", data.token_master);
        } else {
          localStorage.removeItem("user_master");
        }
      }

      const successData = {
        state: "ok",
        message: "ورود موفق",
        data,
      };
      
      setLoginData(successData);
      return successData;

    } catch (error) {
      const errorData = {
        state: "error",
        message: "خطای داخلی سرور",
        error: error.message || error,
      };
      
      setLoginData(errorData);
      return errorData;
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle SMS response notifications
  useEffect(() => {
    if (smsData && smsData?.state === "ok") {
      notifications.show({
        title: smsData.message,
        color: "green",
        autoClose: true
      });
    }
    if (smsData && smsData?.state === "error") {
      notifications.show({
        title: smsData.message,
        color: "red",
        autoClose: true
      });
    }
  }, [smsData]);

  // Handle error notifications (only for non-auth errors)
  useEffect(() => {
    const authErrorStatuses = [400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 422, 429];
    const isEmpty = (obj) => Object.keys(obj).length === 0;
    const hasValidStatus = errors && typeof errors.status !== "undefined" && !isNaN(Number(errors.status));

    if (!isEmpty(errors) && hasValidStatus && !authErrorStatuses.includes(Number(errors.status))) {
      setErrors({});
      notifications.show({
        title: errors.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }
  }, [errors]);

  // Handle specific error modals
  useEffect(() => {
    if (errors?.status && ![401, 404, 500].includes(errors.status)) {
      handleKnownErrors(errors.status, setModalOpen, navigate);
    }
  }, [errors, navigate]);

  async function submitForm(value) {
    const sanitizedValue = value.mobile.replace(/\s+/g, "");

    try {
      const result = await sendSMSCode(sanitizedValue);
      
      if (!result) {
        console.error('No response data received');
        setStateMessage("error");
        return;
      }

      if (result.state === "error") {
        setStateMessage("error");
        if (result.error) {
          form.setErrors(result.error);
          setErrors(result.error);
        }
        return;
      }

      // Success - move to code input and reset state message
      formCode.setValues({ code: "" });
      formCode.setFieldError("code", "");
      setType("code");
      setErrors({});
      setStateMessage("ok"); // Reset state message on success
      
      // ✅ NEW: Start countdown timer
      setCountdown(120); // 2 minutes = 120 seconds
      setCanResend(false);
      
    } catch (error) {
      console.error('SMS request failed:', error);
      // Only set errors for non-auth related errors
      if (error && ![401, 404, 500].includes(error?.status)) {
        setErrors(error);
      }
    }
  }

  // ✅ NEW: Handle resend SMS
  const handleResendSMS = async () => {
    if (!canResend) return;
    
    const sanitizedValue = form.getValues().mobile.replace(/\s+/g, "");
    
    try {
      const result = await sendSMSCode(sanitizedValue);
      
      if (result && result.state === "ok") {
        // Restart countdown timer
        setCountdown(120);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Resend SMS failed:', error);
    }
  };

  async function submitLogin(value) {
    const sanitizedMobile = form.getValues().mobile.replace(/\s+/g, "");
    
    try {
      const result = await loginUser(sanitizedMobile, value.code);
      
      if (!result) {
        console.error('No response data received for login');
        formCode.setFieldError("code", "خطا در دریافت پاسخ سرور");
        return;
      }

      if (result.state === "error") {
        formCode.setFieldError("code", result.error?.error || result.error?.message || "خطا در ورود به سیستم");
        
        // Only set errors for non-auth related errors
        if (result.error && ![401, 404, 500].includes(result.error?.status)) {
          setErrors(result.error);
        }
        return;
      }

      // Success - handle the response
      const data = result.data;
      
      if (data?.user) {
        if (data.user.status === true) {
          setType("success");

          // Load favorites after successful login
          dispatch(getUserFavoritesList())
            .unwrap()
            .then((favoritesData) => {
              // Cache favorites in cookies for 7 days
              const expirationDate = new Date();
              expirationDate.setDate(expirationDate.getDate() + 7);
              
              setCookie("userFavorites", JSON.stringify(favoritesData), {
                expires: expirationDate,
                path: "/",
                secure: true,
                sameSite: "strict"
              });
            })
            .catch((error) => {
              console.warn('Failed to load favorites after login:', error);
            });

          setTimeout(() => {
            const redirectPath = redirectURL['?redirect'] || "/";
            navigate(redirectPath, { replace: true });
          }, 2000);
        } else if (data.user.status === false) {
          setType("unverified");
        } else {
          setType(data.user.status);
        }
      } else {
        console.error('Invalid response structure:', data);
        formCode.setFieldError("code", "ساختار پاسخ سرور نامعتبر است");
      }
      
    } catch (error) {
      console.error('Login request failed:', error);
      // Only set errors for non-auth related errors
      if (error && ![401, 404, 500].includes(error?.status)) {
        setErrors(error);
      }
      
      // Show user-friendly error message
      formCode.setFieldError("code", error?.message || "خطا در ورود به سیستم");
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
        <Center w={{base: "85%",xs:"65%",sm:"50%",md:"40%",lg:"40%",xl:"450px"}} className="flex-col relative z-10">
          <Image
            w={160}
            src={bootstrap?.logo}
          />
          <Paper className="bg-white rounded-2xl shadow-box-sm w-full h-auto py-5 px-4 min-h-max">
            <Flex justify="space-between" align="center">
              <Text c="dark" size="xl" fw="bold">ورود</Text>
            </Flex>
            
            {type === "enter" && (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form onSubmit={form.onSubmit((values) => submitForm(values))}>
                    <TextInput
                      label="لطفا شماره موبایل خود را وارد کنید"
                      type="text"
                      dir="ltr"
                      inputMode="numeric"
                      styles={{ input: { textAlign: "left" } }}
                      key={form.key("mobile")}
                      {...form.getInputProps("mobile")}
                      withAsterisk
                      error={
                        (smsData?.state === "error" && smsData?.errors?.mobile) || form.errors.mobile ? (
                          <div>
                            {smsData?.state === "error" && smsData?.errors?.mobile && (
                              <div>{smsData?.errors?.mobile}</div>
                            )}
                            {form.errors.mobile && <div>{form.errors.mobile}</div>}
                          </div>
                        ) : null
                      }
                    />                      
                    <Button
                      type="submit"
                      mt="md"
                      variant="filled"
                      fullWidth
                      loading={smsLoading}
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
            )}
            
            {type === "code" && (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form onSubmit={formCode.onSubmit((values) => submitLogin(values))}>
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
                    <Flex justify="space-between" align="center" mt="lg">
                      <Button
                        p="0"
                        variant="transparent"
                        onClick={() => setType("enter")}
                      >
                        تغییر شماره موبایل
                      </Button>
                      {/* ✅ NEW: Resend SMS button with countdown */}
                      {canResend ? (
                        <Button
                          p="0"
                          variant="transparent"
                          onClick={handleResendSMS}
                          loading={smsLoading}
                        >
                          درخواست پیامک مجدد
                        </Button>
                      ) : (
                        <Text size="sm" c="dimmed">
                          درخواست مجدد تا {formatCountdown(countdown)}
                        </Text>
                      )}
                    </Flex>
                    <Button
                      type="submit"
                      mt="md"
                      variant="filled"
                      fullWidth
                      loading={loginLoading || loadingGetUserFavoritesList}
                    >
                      ورود
                    </Button>
                  </form>
                </div>
              </>
            )}
            
            {type === "success" && (
              <Alert mt="xl" variant="light" color="teal" title="ورود موفقیت آمیز بود">
                به طور خودکار هدایت میشوید
                {loadingGetUserFavoritesList && (
                  <Text size="xs" mt="xs" c="dimmed">
                    در حال بارگذاری اطلاعات کاربری...
                  </Text>
                )}
              </Alert>
            )}
            
            {type === "unverified" && (
              <Alert mt="xl" variant="light" color="blue" title="در حال تایید حساب کاربری">
                <Text size="sm">حساب کاربری شما تایید نشده است. لطفاً منتظر تایید توسط مدیریت باشید.</Text>
                <Center>
                  <Button size="xs" mt="md" color="blue" component={NavLink} to="/">
                    بازگشت به صفحه اصلی
                  </Button>
                </Center>
              </Alert>
            )}
            
            {type === "pending" && (
              <Alert mt="xl" variant="light" color="cyan" title="پیام سیستم">
                <Text size="sm">این حساب کاربری در انتظار تایید میباشد</Text>
                <Button size="xs" mt="md" color="cyan" component="a" href="tel:01234567890">
                  تلفن پشیبانی 09123456789
                </Button>
              </Alert>
            )}
            
            {type === "deactive" && (
              <Alert mt="xl" variant="light" color="orange" title="حساب کاربری غیر فعال">
                <Text size="sm">این حساب کاربری غیر فعال است. در صورت فعال نشدن با پشتیبانی تماس بگیرید</Text>
                <Button size="xs" mt="md" color="orange" component="a" href="tel:01234567890">
                  تلفن پشیبانی 09123456789
                </Button>
              </Alert>
            )}
          </Paper>
        </Center>
      </Box>
    </>
  );
};

export default Login;