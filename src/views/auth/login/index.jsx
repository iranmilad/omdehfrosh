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
import { useSend } from "../../../Libs/api";
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

  const { mutateAsync, isPending, data } = useSend({ url: "auth/sms" });
  const { user, isVerified, error, loading } = useSelector((state) => state.auth);
  const [stateMessage, setStateMessage] = useState("ok");
  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const { isVerifiedMaster, loadingMaster, errorMaster, user_master } = useSelector((state) => state.authMaster);
  
  const { getUserFavoritesListData, loadingGetUserFavoritesList, errorGetUserFavoritesList } = useSelector((state) => state.getUserFavoritesList);

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

  const sendCode = useSend({ url: "auth/login" });
  
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

  // Handle SMS response notifications
  useEffect(() => {
    if (data && data?.state === "ok") {
      notifications.show({
        title: data.message,
        color: "green",
        autoClose: true
      });
    }
    if (data && data?.state === "error") {
      notifications.show({
        title: data.message,
        color: "red",
        autoClose: true
      });
    }
  }, [data]);

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

  function submitForm(value) {
    const sanitizedValue = value.mobile.replace(/\s+/g, "");

    mutateAsync(
      { mobile: sanitizedValue },
      {
        onSuccess: (data) => {
          // Add null check for data
          if (!data) {
            console.error('No response data received');
            setStateMessage("error");
            return;
          }

          if (data.state === "error") {
            setStateMessage("error");
            return;
          }

          if (data.error) {
            form.setErrors(data.error);
            setErrors(data.error);
          } else {
            formCode.setValues({ code: "" });
            formCode.setFieldError("code", "");
            setType("code");
            setErrors({});
          }
        },
        onError: (error) => {
          console.error('SMS request failed:', error);
          // Only set errors for non-auth related errors
          if (error && ![401, 404, 500].includes(error?.status)) {
            setErrors(error);
          }
        }
      }
    );
  }

  function submitLogin(value) {
    if (stateMessage !== "error") {
      sendCode.mutateAsync(
        { mobile: form.getValues().mobile.replace(/\s+/g, ""), code: value.code },
        {
          onSuccess: (data) => {
            // Add comprehensive null checks
            if (!data) {
              console.error('No response data received for login');
              formCode.setFieldError("code", "خطا در دریافت پاسخ سرور");
              return;
            }

            if (data.error) {
              formCode.setFieldError("code", data.error);
            } else if (data.user) {
              // Check if user object exists before accessing its properties
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
          },
          onError: (error) => {
            console.error('Login request failed:', error);
            // Only set errors for non-auth related errors
            if (error && ![401, 404, 500].includes(error?.status)) {
              setErrors(error);
            }
            
            // Show user-friendly error message
            formCode.setFieldError("code", error?.message || "خطا در ورود به سیستم");
          }
        }
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
                        (data?.state === "error" && data?.errors?.mobile) || form.errors.mobile ? (
                          <div>
                            {data?.state === "error" && data?.errors?.mobile && (
                              <div>{data?.errors?.mobile}</div>
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
                      loading={sendCode.isPending || loadingGetUserFavoritesList}
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