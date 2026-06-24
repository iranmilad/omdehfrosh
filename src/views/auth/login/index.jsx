import {
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
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
import { useMediaQuery } from '@mantine/hooks';

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

const AUTH_LOGIN_FORM_COOKIE = "authLoginForm";
const AUTH_LOGIN_FORM_MAX_AGE_DAYS = 30;

function getAuthFieldErrorMessage(error, fallback = "خطا در ورود به سیستم") {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const nested = error.error ?? error.errors ?? error.code;

    if (typeof nested === "string" && nested.trim()) return nested;

    if (nested && typeof nested === "object") {
      const nestedMessage = getAuthFieldErrorMessage(nested, "");
      if (nestedMessage) return nestedMessage;
    }

    if (typeof error.message === "string" && error.message.trim()) return error.message;
    if (typeof error.code === "string" && error.code.trim()) return error.code;
  }

  return fallback;
}

function isUserNotFoundResponse(data) {
  return data?.state === "user_not_found" || data?.exists === false;
}

function getSavedMobileFromCookie() {
  try {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(new RegExp("(?:^|;\\s*)" + AUTH_LOGIN_FORM_COOKIE + "=([^;]*)"));
    if (!match) return "";
    const decoded = decodeURIComponent(match[1].trim());
    const parsed = JSON.parse(decoded);
    return parsed?.mobile && String(parsed.mobile).trim() ? String(parsed.mobile).trim() : "";
  } catch {
    return "";
  }
}

const Login = () => {
  const [type, setType] = useState("enter");
  const [cookies, setCookie] = useCookies(["user", "userFavorites", AUTH_LOGIN_FORM_COOKIE]);
  const [savedMobileOption] = useState(getSavedMobileFromCookie);
  const bootstrap = useSelector((state) => state.global.bootstrap);
  const navigate = useNavigate();
  const redirectURL = QueryString.parse(location.search);
  const dispatch = useDispatch();

  // Responsive size hooks
  const isMobile = useMediaQuery('(max-width: 768px)');
  const buttonSize = isMobile ? 'sm' : 'md';
  const textSize = isMobile ? 'xs' : 'sm';
  const headingSize = isMobile ? 'lg' : 'xl';

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

  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    dispatch(verifyTokenSilent());
    dispatch(clearUserInfo());
  }, [dispatch]);

  useEffect(() => {
    const isAuthenticated = (user && isVerified) || (user_master && isVerifiedMaster);
    
    if (isAuthenticated && !cookies.userFavorites) {
      dispatch(getUserFavoritesList())
        .unwrap()
        .then((favoritesData) => {
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

  useEffect(() => {
    const isAuthenticated = (user && isVerified) || (user_master && isVerifiedMaster);
    
    if (isAuthenticated) {
      const redirectPath = redirectURL['?redirect'] || "/";
      navigate(redirectPath, { replace: true });
    }
  }, [user, user_master, isVerified, isVerifiedMaster, navigate, redirectURL]);

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

  const formatCountdown = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const form = useForm({
    mode: "uncontrolled",
    initialValues: { mobile: "" },
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

  const redirectToRegister = (mobile) => {
    const searchParams = new URLSearchParams({ mobile });
    const redirect = redirectURL["?redirect"];
    if (redirect) {
      searchParams.set("redirect", redirect);
    }
    navigate(`/register?${searchParams.toString()}`);
  };

  const callLoginApi = async (mobile, code) => {
    try {
      const body = { mobile };
      if (code) {
        body.code = code;
      }

      const response = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (isUserNotFoundResponse(data)) {
        return {
          state: "user_not_found",
          message: data?.message || "User not found",
          data,
        };
      }

      if (!response.ok) {
        const errorMessage = getAuthFieldErrorMessage(
          data?.error ?? data?.message,
          data?.message || getHttpCodeMessage(response.status)
        );

        return {
          state: "error",
          message: data?.message || errorMessage,
          error: {
            status: response.status,
            message: data?.message || errorMessage,
            error: errorMessage,
          },
        };
      }

      if (code && "token" in data) {
        if (data.token) {
          localStorage.setItem("user", data.token);
        } else {
          localStorage.removeItem("user");
        }
      }

      if (code && "token_master" in data) {
        if (data.token_master) {
          localStorage.setItem("user_master", data.token_master);
        } else {
          localStorage.removeItem("user_master");
        }
      }

      return {
        state: "ok",
        message: data?.message || (code ? "ورود موفق" : "User found"),
        data,
      };
    } catch (error) {
      return {
        state: "error",
        message: "خطای داخلی سرور",
        error: {
          message: error.message || error,
        },
      };
    }
  };

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

  const loginUser = async (mobile, code) => {
    setLoginLoading(true);
    setLoginData(null);

    try {
      const result = await callLoginApi(mobile, code);

      if (result.state === "user_not_found") {
        setLoginData({
          state: "user_not_found",
          message: result.message,
          data: result.data,
        });
        return result;
      }

      if (result.state === "error") {
        setLoginData({
          state: "error",
          message: result.message || "ورود ناموفق",
          error: result.error,
        });
        return result;
      }

      setLoginData({
        state: "ok",
        message: result.message,
        data: result.data,
      });
      return result;
    } finally {
      setLoginLoading(false);
    }
  };

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

  useEffect(() => {
    if (errors?.status && ![401, 404, 500].includes(errors.status)) {
      handleKnownErrors(errors.status, setModalOpen, navigate);
    }
  }, [errors, navigate]);

  async function submitForm(value) {
    const sanitizedValue = value.mobile.replace(/\s+/g, "");

    try {
      const userCheck = await callLoginApi(sanitizedValue);

      if (userCheck.state === "user_not_found") {
        redirectToRegister(sanitizedValue);
        return;
      }

      if (userCheck.state === "error") {
        setStateMessage("error");
        if (userCheck.error) {
          form.setFieldError(
            "mobile",
            getAuthFieldErrorMessage(userCheck.error, "خطا در بررسی شماره موبایل")
          );
          setErrors(userCheck.error);
        }
        return;
      }

      const result = await sendSMSCode(sanitizedValue);
      
      if (!result) {
        console.error('No response data received');
        setStateMessage("error");
        return;
      }

      if (result.state === "error") {
        setStateMessage("error");
        if (result.error) {
          form.setFieldError(
            "mobile",
            getAuthFieldErrorMessage(result.error, "مشکلی در ارسال پیامک رخ داده است")
          );
          setErrors(result.error);
        }
        return;
      }

      formCode.setValues({ code: "" });
      formCode.setFieldError("code", "");
      setType("code");
      setErrors({});
      setStateMessage("ok");
      setCookie(AUTH_LOGIN_FORM_COOKIE, JSON.stringify({ mobile: sanitizedValue }), {
        maxAge: AUTH_LOGIN_FORM_MAX_AGE_DAYS * 24 * 60 * 60,
        path: "/",
      });
      setCountdown(120);
      setCanResend(false);
      
    } catch (error) {
      console.error('SMS request failed:', error);
      if (error && ![401, 404, 500].includes(error?.status)) {
        setErrors(error);
      }
    }
  }

  const handleResendSMS = async () => {
    if (!canResend) return;
    
    const sanitizedValue = form.getValues().mobile.replace(/\s+/g, "");
    
    try {
      const result = await sendSMSCode(sanitizedValue);
      
      if (result && result.state === "ok") {
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

      if (result.state === "user_not_found") {
        redirectToRegister(sanitizedMobile);
        return;
      }

      if (result.state === "error") {
        const codeErrorMessage = getAuthFieldErrorMessage(
          result.error,
          "کد وارد شده اشتباه است"
        );

        formCode.setFieldError("code", codeErrorMessage);
        notifications.show({
          title: codeErrorMessage,
          color: "red",
          autoClose: true,
        });

        if (result.error && ![401, 404, 500].includes(result.error?.status)) {
          setErrors(result.error);
        }
        return;
      }

      const data = result.data;
      
      if (data?.user) {
        if (data.user.status === true) {
          setType("success");

          dispatch(getUserFavoritesList())
            .unwrap()
            .then((favoritesData) => {
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
      if (error && ![401, 404, 500].includes(error?.status)) {
        setErrors(error);
      }
      
      formCode.setFieldError(
        "code",
        getAuthFieldErrorMessage(error, "خطا در ورود به سیستم")
      );
    }
  }

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errors?.message}
      />
      <Box 
        bg="white" 
        style={{
          minHeight: '100vh',
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto'
        }}
      >
        <Center 
          w={{
            base: "100%",
            xs: "90%",
            sm: "80%",
            md: "70%",
            lg: "500px",
            xl: "500px"
          }}
          maw={500}
          style={{
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10,
            width: '100%'
          }}
        >
          <Image
            w={{ base: 120, xs: 140, sm: 160 }}
            mb={{ base: 'md', sm: 'lg' }}
            src={bootstrap?.logo}
          />
          <Paper 
            className="bg-white rounded-2xl shadow-box-sm w-full h-auto min-h-max"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <Flex justify="space-between" align="center">
              <Text c="dark" size={headingSize} fw="bold">ورود/ثبت نام</Text>
            </Flex>
            
            {type === "enter" && (
              <>
                <div className="flex flex-col gap-y-1 pt-5">
                  <form onSubmit={form.onSubmit((values) => submitForm(values))}>
                    <Autocomplete
                      label="لطفا شماره موبایل خود را وارد کنید"
                      type="text"
                      dir="ltr"
                      inputMode="numeric"
                      styles={{ input: { textAlign: "left" } }}
                      key={form.key("mobile")}
                      {...form.getInputProps("mobile")}
                      data={savedMobileOption ? [savedMobileOption] : []}
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
                      size={buttonSize}
                    >
                      ادامه
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
                    <Text mb="sm" size={textSize}>
                      کد تایید پیامک شده را وارد کنید
                    </Text>
                    <Center>
                      <PinInput
                        type="number"
                        key={formCode.key("code")}
                        {...formCode.getInputProps("code")}
                        error={
                          formCode.errors.code
                            ? getAuthFieldErrorMessage(formCode.errors.code, "")
                            : undefined
                        }
                        size={buttonSize}
                      />
                    </Center>
                    <Text c="red" size="xs" mt="xs">
                      {formCode.errors.code
                        ? getAuthFieldErrorMessage(formCode.errors.code, "")
                        : null}
                    </Text>
                    <Flex 
                      justify="space-between" 
                      align="center" 
                      mt="lg"
                      direction={{ base: 'column', xs: 'row' }}
                      gap={{ base: 'xs', xs: 0 }}
                    >
                      <Button
                        p="0"
                        variant="transparent"
                        onClick={() => setType("enter")}
                        size={buttonSize}
                      >
                        تغییر شماره موبایل
                      </Button>
                      {canResend ? (
                        <Button
                          p="0"
                          variant="transparent"
                          onClick={handleResendSMS}
                          loading={smsLoading}
                          size={buttonSize}
                        >
                          درخواست پیامک مجدد
                        </Button>
                      ) : (
                        <Text size={textSize} c="dimmed">
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
                      size={buttonSize}
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
                <Text size={textSize}>حساب کاربری شما تایید نشده است. لطفاً منتظر تایید توسط مدیریت باشید.</Text>
                <Center>
                  <Button size="xs" mt="md" color="blue" component={NavLink} to="/">
                    بازگشت به صفحه اصلی
                  </Button>
                </Center>
              </Alert>
            )}
            
            {type === "pending" && (
              <Alert mt="xl" variant="light" color="cyan" title="پیام سیستم">
                <Text size={textSize}>این حساب کاربری در انتظار تایید میباشد</Text>
                <Button size="xs" mt="md" color="cyan" component="a" href="tel:01234567890">
                  تلفن پشیبانی 09123456789
                </Button>
              </Alert>
            )}
            
            {type === "deactive" && (
              <Alert mt="xl" variant="light" color="orange" title="حساب کاربری غیر فعال">
                <Text size={textSize}>این حساب کاربری غیر فعال است. در صورت فعال نشدن با پشتیبانی تماس بگیرید</Text>
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