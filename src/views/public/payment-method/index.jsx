// H:\projects\React\j2b.market\src\views\public\payment-method\index.jsx

import {
  Grid,
  GridCol,
  Paper,
  Radio,
  Title,
  Group,
  Stack,
  Text,
  Image,
  TextInput,
  Flex,
  Button,
  Center,
  Loader,
  Box,
} from "@mantine/core";
import CartStepper from "../../../components/cartStepper";
import { data, NavLink, useNavigate } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useForm } from "@mantine/form";
import { IconArrowRight, IconBuildingCommunity, IconCreditCard, IconChevronLeft } from "@tabler/icons-react";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient, useSessionQuery, useStaticQuery, clearCacheOnLogout } from "../../../Libs/reactQuery";
import { toggleLoading } from "../../../redux/global";
import { notifications } from '@mantine/notifications';
import { useCookies } from "react-cookie";
import PaymentCalcReceipt from "../../../components/payment_calc_receipt";
import { updateFinalReceiptWithDiscount } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountActions";
import { getAllGateWaysData } from "../../../redux/gatewaysdata/gatewaysdata/gateWaysDataActions";
import { clearCartFinalReceiptUpdate } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountSlice";
import ErrorMessageModal from '../../../components/errormessagemodal';
import { logout } from "../../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../../redux/auth/authmaster/authMasterSlice";
import { clearCart } from "../../../redux/cart";
import { handleForbiddenError, handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { updateFinalReceiptDeleteDiscountCode } from "../../../redux/cartfinalreceipt/cartfinalreceiptdeletediscount/cartFinalReceiptDeleteDiscountActions";
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
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import PaymentSummary from '../../../components/payment_calc_receipt/PaymentSummary';
import ReloginRequiredModal from '../../../components/ReloginRequiredModal';


const { useBreakpoint } = GridAnt;

// Default SVG icon component
const DefaultPaymentIcon = ({ size = 30, color = "var(--mantine-color-gray-6)" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <line
      x1="2"
      y1="10"
      x2="22"
      y2="10"
      stroke={color}
      strokeWidth="2"
    />
    <circle
      cx="7"
      cy="15"
      r="1"
      fill={color}
    />
    <circle
      cx="11"
      cy="15"
      r="1"
      fill={color}
    />
  </svg>
);

// Utility function to validate icon paths
const isValidIconPath = (icon) => {
  if (!icon) return false;
  if (typeof icon !== 'string') return false;
  if (icon.trim() === '') return false;
  if (icon === 'null' || icon === 'undefined') return false;
  if (Array.isArray(icon)) {
    if (icon.length === 0) return false;
    if (icon.length === 1 && (icon[0] === '' || !icon[0])) return false;
  }
  return true;
};

// Safe Icon component with error handling
const SafeIcon = ({ src, alt, size = 30, style = {}, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = (e) => {
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  if (!isValidIconPath(src) || hasError) {
    return <DefaultPaymentIcon size={size} />;
  }

  return (
    <>
      <img
        src={src}
        alt={alt || 'Payment method'}
        style={{ 
          width: size, 
          height: size, 
          display: isLoading || hasError ? 'none' : 'block',
          ...style 
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      {isLoading && !hasError && (
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ fontSize: '10px', color: '#999' }}>...</div>
        </div>
      )}
    </>
  );
};

const PaymentMethod = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  // React Query cache (same pattern as basket): prefer query data, Redux as fallback
  const {
    data: userInitialData,
    isLoading: userInitialLoading,
    isFetching: userInitialFetching,
  } = useSessionQuery({
    endpoint: "/auth/user-initial-data",
    queryKey: ["userInitialData"],
    enabled: !!token,
    meta: { showErrorNotification: false },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg?.includes?.("401")) return false;
      return failureCount < 2;
    },
  });

  const {
    data: cartData,
    isFetching: cartFetching,
  } = useSessionQuery({
    endpoint: "/cart",
    queryKey: ["cart"],
    enabled: !!token,
    meta: { showErrorNotification: false },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg?.includes?.("401")) return false;
      return failureCount < 2;
    },
  });

  // Gateways data (POST) - cached with React Query
  const {
    data: gatewaysData,
    isLoading: gatewaysLoading,
    isFetching: gatewaysFetching,
    error: gatewaysError,
  } = useStaticQuery({
    endpoint: "/gatewaysdata",
    queryKey: ["gatewaysdata", "all"],
    method: "post",
    body: { state: "all" },
    enabled: true,
    meta: { showErrorNotification: false },
  });

  // Final receipt (GET) - cached with React Query; display prefers cache, Redux fallback
  const {
    data: finalReceiptData,
    isLoading: finalReceiptLoading,
    isFetching: finalReceiptFetching,
  } = useSessionQuery({
    endpoint: "/cart/getfinalreceipt",
    queryKey: ["finalReceipt"],
    enabled: !!token,
    meta: { showErrorNotification: false },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg?.includes?.("401")) return false;
      return failureCount < 2;
    },
  });

  // Verify user (GET) - cached with React Query
  const {
    data: verifyUserData,
    isLoading: authLoading,
    error: authError,
  } = useSessionQuery({
    endpoint: "/auth/verify-user",
    queryKey: ["verifyUser"],
    enabled: !!token,
    meta: { showErrorNotification: false },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg?.includes?.("401")) return false;
      return failureCount < 2;
    },
  });

  // Wallet balance (GET) - cached with React Query
  const {
    data: walletData,
    isLoading: loadingWallet,
  } = useSessionQuery({
    endpoint: "/payment/wallet/balance",
    queryKey: ["walletBalance"],
    enabled: !!token,
    meta: { showErrorNotification: false },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg?.includes?.("401")) return false;
      return failureCount < 2;
    },
  });

  const walletBalance = walletData?.balance != null ? walletData.balance : 0;

  const [showReloginModal, setShowReloginModal] = useState(false);
  const clearAuthAndShowReloginModal = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_master");
    if (queryClient) clearCacheOnLogout(queryClient);
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    setShowReloginModal(true);
  }, [queryClient, dispatch]);

  // Display: prefer React Query cache, fallback to Redux (same as basket)
  const gatewaysFromRedux = useSelector((state) => state.gateWaysData.gateways);
  const fetchedGateways = (gatewaysData != null
    ? (Array.isArray(gatewaysData) ? gatewaysData : (gatewaysData?.gateways ?? []))
    : null) ?? gatewaysFromRedux ?? [];
  const loading = gatewaysLoading;

  const [cookies, setCookie] = useCookies(["user"]);
  const [pageActive, setPageActive] = useState(false);
  const { isVerified: isVerifiedRedux } = useSelector((state) => state.auth);
  const { orderfinalreceipt: orderfinalreceiptRedux } = useSelector((state) => state.cartfinalreceipt);
  // Display: prefer React Query cache (finalReceiptData), fallback to Redux (same as basket)
  const orderfinalreceipt = finalReceiptData ?? orderfinalreceiptRedux;
  const isVerified = !authError && (verifyUserData != null ? !!verifyUserData?.user : isVerifiedRedux);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  const screensAnt = useBreakpoint();

  useEffect(() => {
    if (orderfinalreceipt?.cartDiscounts?.discountCode?.code) {
      setIsDiscountApplied(true);
    } else {
      setIsDiscountApplied(false);
    }
  }, [orderfinalreceipt]);

  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      gateway: {},
    },
  });

  // Sync gateways from React Query to Redux (slice expects gateways array)
  useEffect(() => {
    if (gatewaysData == null) return;
    const payload = Array.isArray(gatewaysData) ? gatewaysData : (gatewaysData?.gateways ?? []);
    dispatch({ type: "gateWaysData/getAll/fulfilled", payload });
  }, [gatewaysData, dispatch]);

  // Sync final receipt from React Query to Redux
  useEffect(() => {
    if (finalReceiptData == null) return;
    dispatch({ type: "order/fetchFinalReceipt/fulfilled", payload: finalReceiptData });
  }, [finalReceiptData, dispatch]);

  // Sync verify user from React Query to Redux
  useEffect(() => {
    if (verifyUserData == null) return;
    dispatch({ type: "auth/verifyToken/fulfilled", payload: verifyUserData });
  }, [verifyUserData, dispatch]);

  useEffect(() => {
    if (authError) {
      dispatch({ type: "auth/verifyToken/rejected", payload: authError });
      const msg = authError?.message ?? (typeof authError === "string" ? authError : "");
      if (String(msg).includes("401")) clearAuthAndShowReloginModal();
    }
  }, [authError, dispatch, clearAuthAndShowReloginModal]);

  // Updated cards mapping with improved icon handling
  const cards = fetchedGateways?.map((item) => (
    <Radio.Card
      p="lg"
      radius="md"
      value={item?.info.name} 
      key={item?.info.name}
      defaultChecked
      styles={{
        card: {
          borderColor:
            form.getValues().gateway.name === item?.info.name
              ? "var(--mantine-primary-color-5)"
              : "transparent",
        },
      }}
    >
      <Group wrap="nowrap" align="center">
        <Radio.Indicator />
        <div
          style={{
            color:
              form.getValues().gateway.name === item.info.name
                ? "var(--mantine-primary-color-5)"
                : "var(--mantine-color-gray-6)",
          }}
        >
          <SafeIcon 
            src={item.icon} 
            alt={item.label}
            size={30}
            onError={(e) => {
              console.warn(`Failed to load icon for ${item.label}: ${item.icon}`);
            }}
          />
        </div>
        <div>
          <Text>{item.label}</Text>
          <Text size="13px" c="gray.6">
            {item.description}
          </Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (isVerified === false) {
      setShowReloginModal(true);
    } else if (isVerified === true) {
      setPageActive(true);
    }
  }, [isVerified, authLoading]);

  useEffect(() => {
    if (fetchedGateways?.[0]?.info) {
      form.setValues({ gateway: fetchedGateways[0].info });
    }
  }, [fetchedGateways]);

  if (!pageActive) {
    if (isVerified === false && !authLoading) {
      return (
        <>
          <ReloginRequiredModal opened={true} onClose={() => navigate("/login", { replace: true })} />
        </>
      );
    }
    return <></>;
  }

  if (!fetchedGateways || loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  // Format balance with Persian digits
  const formatBalance = (balance) => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const formatted = balance.toString().replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
    return formatted;
  };

  return (
    <>
        {/* Header with back button */}
        <div className="mb-6 md:px-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <NavLink
                to="/basket"
                className="w-10 h-10 rounded-3xl flex items-center justify-center text-gray-600 hover:bg-gray-100"
                aria-label="بازگشت به صفحه اصلی"
              >
                <IconArrowRight size={24} />
              </NavLink>
              <h2 className="text-xl font-bold m-0">
                 روش پرداخت
              </h2>
            </div>
          </div>
        </div>

        <Grid gutter="xl">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {/* روش پرداخت Section */}
          <div className="w-full lg:rounded-medium bg-white border p-4 mb-4">
            <div className="text-[16px] md:text-[20px] font-bold mb-1 text-gray-700">
              انتخاب روش پرداخت
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {fetchedGateways.map((gateway) => {
                const isSelected = form.values.gateway?.name === gateway.info.name;
                const isWallet = gateway.info.name === 'wallet';

                return (
                  <label
                    key={gateway.info.name}
                    className={`rounded-lg px-3 py-2 border-2 border-solid cursor-pointer ${isSelected ? 'border-[#29b6f6]' : 'border-gray-200'
                      }`}
                  >
                    <div className="flex items-center rounded-sm">
                      <input
                        id={gateway.info.name}
                        className="hidden"
                        type="radio"
                        value={gateway.info.name}
                        checked={isSelected}
                        onChange={() => form.setValues({ gateway: gateway.info })}
                        name="payment-gateway"
                      />

                      <span className="w-6 h-6 shrink-0">
                        {isSelected ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2Z" fill="#29b6f6"></path>
                            <path d="M12 7C9.2 7 7 9.2 7 12C7 14.8 9.2 17 12 17C14.8 17 17 14.8 17 12C17 9.2 14.8 7 12 7Z" fill="white"></path>
                          </svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 6.5 6.5 2 12 2C17.5 2 22 6.5 22 12C22 17.5 17.5 22 12 22C6.5 22 2 17.5 2 12ZM4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12C20 7.6 16.4 4 12 4C7.6 4 4 7.6 4 12Z" fill="#4D5053" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        )}
                      </span>

                      <div className="flex mr-2.5 gap-2 items-center">
                        <p className="text-xs md:text-sm font-bold">
                          {gateway.label || gateway.info.name}
                        </p>
                      </div>
                    </div>

                    {gateway.description && (
                      <div>
                        <p className="text-[11px] md:text-xs font-normal text-gray-500 mt-1">
                          {gateway.description}
                        </p>
                      </div>
                    )}

                    {/* Wallet balance and recharge link */}
                    {isWallet && (
                      <div className="mt-2">
                        <span className="flex items-center gap-1 text-[11px] md:text-xs font-normal text-gray-500">
                          موجودی: {loadingWallet ? '...' : formatBalance(walletBalance)}
                          <div className="flex">
                            <svg style={{ width: '16px', height: '16px', fill: 'rgb(129, 133, 139)' }}>
                              <text x="2" y="13" fontSize="12" fill="rgb(129, 133, 139)">تومان</text>
                            </svg>
                          </div>
                          <NavLink
                            to="/account/wallet"
                            className="inline-flex items-center cursor-pointer text-sm font-bold text-[#29b6f6] hover:text-blue-700 mr-auto no-underline"
                          >
                            <span>افزایش موجودی</span>
                            <div className="flex">
                              <IconChevronLeft size={18} style={{ fill: '' }} />
                            </div>
                          </NavLink>
                        </span>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Coupon Section */}
          <div className="w-full mb-4">
            <SubmitCoupon
              isDiscountApplied={isDiscountApplied}
              setIsDiscountApplied={setIsDiscountApplied}
              gateway={form.getValues().gateway}
              queryClient={queryClient}
              clearAuthAndShowReloginModal={clearAuthAndShowReloginModal}
            />
          </div>

          {/* PaymentCalcReceipt */}
          {form.getValues().gateway?.name && (
            <div className="w-full">
              <PaymentCalcReceipt
                prev={{ to: "/basket-info", component: NavLink }}
                gateway={form.getValues().gateway}
                queryClient={queryClient}
              >
                پرداخت
              </PaymentCalcReceipt>
            </div>
          )}
        </Grid.Col>
            
        <Grid.Col span={{ base: 12, lg: 4 }} px={0}>
          <PaymentSummary orderfinalreceipt={orderfinalreceipt} />
        </Grid.Col>
        </Grid>
    </>
  );
};

const SubmitCoupon = ({ isDiscountApplied, setIsDiscountApplied, gateway, queryClient, clearAuthAndShowReloginModal }) => {
  const dispatch = useDispatch();
  const { orderfinalreceipt } = useSelector((state) => state.cartfinalreceipt);
  const navigate = useNavigate();

  const {
    cartfinalreceiptDiscount=[], 
    totalfinalreceiptDiscount, 
    loadingUpdateDiscount, 
    errorUpdateDiscount
  } = useSelector((state) => state.cartFinalReceiptUpdateDiscount);

  const {
    cartfinalreceiptDiscountDelete=[], 
    totalfinalreceiptDiscountDelete, 
    loadingUpdateDiscountDelete, 
    errorUpdateDiscountDelete
  } = useSelector((state) => state.cartFinalReceiptUpdateDiscountDelete);

  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const form = useForm({
    initialValues: {
      code: "",
    },
    validate: {
      code: (value) => (value.length < 2 ? "کد تخفیف را وارد کنید" : null),
    },
  });

  useEffect(() => {
    if (cartfinalreceiptDiscount && cartfinalreceiptDiscount.state) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cartfinalreceiptDiscount]);

  useEffect(() => {
    // No error notifications on this page (401/500 etc) – only relogin modal for 401
  }, [cartfinalreceiptDiscount, errorUpdateDiscount]);

  useEffect(() => {
    if (errorUpdateDiscount?.status) {
      if (errorUpdateDiscount.status === 401) clearAuthAndShowReloginModal();
      else handleKnownErrors(errorUpdateDiscount.status, setModalOpen, navigate);
    }
  }, [errorUpdateDiscount, clearAuthAndShowReloginModal]);

  useEffect(() => {
    if (errorUpdateDiscountDelete?.status) {
      if (errorUpdateDiscountDelete.status === 401) clearAuthAndShowReloginModal();
      else handleKnownErrors(errorUpdateDiscountDelete.status, setModalOpen, navigate);
    }
  }, [errorUpdateDiscountDelete, clearAuthAndShowReloginModal]);

  useEffect(() => {
    if (cartfinalreceiptDiscountDelete && cartfinalreceiptDiscountDelete.state) {
      setShowAlert(true);
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cartfinalreceiptDiscountDelete]);

  useEffect(() => {
    // No error notifications on this page (401/500 etc) – only relogin modal for 401
  }, [cartfinalreceiptDiscountDelete, errorUpdateDiscountDelete]);

  const applyDiscount = async (values) => {
    try {
      const response = await dispatch(updateFinalReceiptWithDiscount({ 
        discountCode: values.code, 
        paymentMethod: gateway 
      }));

      if (response?.payload?.status === "OK") {
        setIsDiscountApplied(true);
        notifications.show({
          title: "پیام سیستم",
          message: "کد تخفیف و روش پرداخت اعمال شد!",
          color: "green",
        });
        // Single refetch instead of invalidate to avoid repeated API request loop
        if (queryClient) {
          queryClient.refetchQueries({ queryKey: ["finalReceipt"] });
        }
      }
      // No error toast on this page for apply discount (401 → relogin modal only)
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        clearAuthAndShowReloginModal();
      }
      // No error toast on this page
    }
  };

  const removeDiscount = async () => {
    try {
      const response = await dispatch(updateFinalReceiptDeleteDiscountCode({ 
        discountCode: orderfinalreceipt.cartDiscounts.discountCode.code, 
      }));

      if (response?.payload?.status === "OK") {
        notifications.show({
          title: "پیام سیستم",
          message: "کد تخفیف حذف شد!",
          color: "green",
        });
        // Single refetch instead of invalidate to avoid repeated API request loop
        if (queryClient) {
          queryClient.refetchQueries({ queryKey: ["finalReceipt"] });
        }
      }
      // No error toast on this page for remove discount (401 → relogin modal only)
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        clearAuthAndShowReloginModal();
      }
      // No error toast on this page
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = form.validate();
    if (!validation.hasErrors) {
      applyDiscount(form.values);
    }
  };

  const DiscountIcon = ({ size = 18, color = "#000" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Ticket shape */}
    <path
      d="M3 6.5C3 5.12 4.12 4 5.5 4H18.5C19.88 4 21 5.12 21 6.5V9
         C19.9 9 19 9.9 19 11C19 12.1 19.9 13 21 13V15.5
         C21 16.88 19.88 18 18.5 18H5.5C4.12 18 3 16.88 3 15.5V13
         C4.1 13 5 12.1 5 11C5 9.9 4.1 9 3 9V6.5Z"
      fill={color}
    />

    {/* Percent slash */}
    <line
      x1="9"
      y1="14.5"
      x2="15"
      y2="8.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />

    {/* Percent dots */}
    <circle cx="9" cy="8.5" r="1.2" fill="white" />
    <circle cx="15" cy="14.5" r="1.2" fill="white" />
  </svg>
);


  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errorUpdateDiscount?.message || errorUpdateDiscountDelete?.message}
      />
      
      <div className="lg:rounded-medium bg-white">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <DiscountIcon />
            <p className="text-xs md:text-sm font-bold text-gray-900">کد تخفیف</p>
          </div>

          {orderfinalreceipt?.cartDiscounts?.discountCode?.code ? (
            <div className="sm:my-2">
              <div className="text-xs md:text-sm text-green-600 font-medium mb-2">
                کد تخفیف اعمال شده: {orderfinalreceipt.cartDiscounts.discountCode.code}
              </div>
              <Button 
                color="red" 
                size="xs"
                onClick={removeDiscount}
                loading={loadingUpdateDiscountDelete}
              >
                حذف کد تخفیف
              </Button>
            </div>
          ) : (
            <div className="sm:my-2">
              <label className="w-full sm:w-auto sm:min-w-[40%]">
                  <div
                    className="
                  h-[48px]
                    px-2 flex w-[329px] items-center relative text-gray-800
                    rounded-lg transition-colors

                    /* mobile */
                    border-[0.66667px] border-gray-300
                    focus-within:border-b-2 focus-within:border-b-[#29b6f6]

                    /* lg */
                    lg:bg-white
                    lg:border-[0.83333px]
                    lg:border-gray-300
                    lg:border-b
                    lg:focus-within:border-[#19bfd3]
                    lg:focus-within:border-b
                  "
                  >

                  <div className="grow w-[329px] flex flex-row items-center px-[8px] py-[0px]">
                    <input 
                      className="px-2 w-[329px] py-3 lg:py-2 bg-transparent outline-none text-sm"
                      placeholder="افزودن کد تخفیف" 
                      autoComplete="off" 
                      type="text" 
                      value={form.values.code}
                      onChange={(e) => form.setFieldValue('code', e.target.value)}
                      disabled={isDiscountApplied || loadingUpdateDiscount}
                    />
                  <div 
                    className="flex cursor-pointer p-1"
                    onClick={handleSubmit}
                  >
                    {loadingUpdateDiscount ? (
                      <svg 
                        className="animate-spin"
                        style={{ width: '24px', height: '24px', fill: '#1f2937' }} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8Z"/>
                      </svg>
                    ) : (
                      <svg style={{ width: '24px', height: '24px', fill: '#1f2937' }} viewBox="0 0 24 24">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                      </svg>
                    )}
                  </div>
                  </div>

                </div>
                {((cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code) || 
                  (form.errors.code) || 
                  (cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code)) && (
                  <div className="text-xs text-red-600 mt-1 px-2">
                    {cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code && (
                      <div>{cartfinalreceiptDiscount?.errors?.code}</div>
                    )}
                    {form.errors.code && <div>{form.errors.code}</div>}
                    {cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code && (
                      <div>{cartfinalreceiptDiscountDelete?.errors?.code}</div>
                    )}
                  </div>
                )}
              </label>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentMethod;