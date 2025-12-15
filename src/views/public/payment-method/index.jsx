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
import { IconArrowRight, IconBuildingCommunity, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { notifications } from '@mantine/notifications';
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import PaymentCalcReceipt from "../../../components/payment_calc_receipt";
import { updateFinalReceiptWithDiscount } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountActions";
import { fetchFinalReceipt } from "../../../redux/cartfinalreceipt/cartfinalreceipt";
import { getAllGateWaysData } from "../../../redux/gatewaysdata/gatewaysdata/gateWaysDataActions";
import { clearCartFinalReceiptUpdate } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountSlice";
import ErrorMessageModal from '../../../components/errormessagemodal';
import { handleForbiddenError, handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { updateFinalReceiptDeleteDiscountCode } from "../../../redux/cartfinalreceipt/cartfinalreceiptdeletediscount/cartfinalreceiptdeletediscountActions";
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

  const { gateways: fetchedGateways, loading, error } = useSelector((state) => state.gateWaysData);


  // console.log("", fetchedGateways)


  const [ paymentURL , setPaymentURL ]  = useState("");


  const [ cookies, setCookie ] = useCookies(["user"]);
  const [ pageActive, setPageActive ] = useState(false);
  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { orderfinalreceipt } = useSelector((state) => state.cartfinalreceipt); 
  const [ isDiscountApplied, setIsDiscountApplied ] = useState(false);

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

  useEffect(() => {
    dispatch(getAllGateWaysData({ state: "all" }));
    dispatch(fetchFinalReceipt());
  }, [dispatch]);

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
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    if (authLoading) {
      return;
    }
  
    if (isVerified === false) {
      navigate("/login", { replace: true });
    } else if (isVerified === true) {
      setPageActive(true);
    }
  }, [isVerified, authLoading, navigate]);

  useEffect(() => {
    if (fetchedGateways?.[0]?.info) {
      form.setValues({ gateway: fetchedGateways[0].info });
    }
  }, [fetchedGateways]);

  if(!pageActive) return <></>;

  if (!fetchedGateways || loading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
        {/* <Steps
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
            // { title: 'اطلاعات خریدار', icon: <UserOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'انتخاب روش پرداخت', icon: <WalletOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'پرداخت نهایی', icon: <CheckCircleOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
          ]}
        /> */}
        <Grid gutter="xl">

          <Grid.Col span={{ base: 12, lg: 7 }}>
            {/* روش پرداخت Section */}
            <div className="lg:rounded-medium bg-white border p-4 mb-4">
              <div className="text-base md:text-lg font-bold mb-1 text-gray-700">
                انتخاب روش پرداخت
              </div>
              
              <div className="mt-3 flex flex-col gap-2">
                {fetchedGateways.map((gateway) => {
                  const isSelected = form.values.gateway?.name === gateway.info.name;
                  
                  return (
                    <label 
                      key={gateway.info.name}
                      className={`rounded px-3 py-4 border-[2px] border-solid cursor-pointer ${
                        isSelected 
                          ? 'border-blue-400' 
                          : 'border-gray-200'
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
                      
                      {gateway.info.description && (
                        <div>
                          <p className="text-[11px] md:text-xs font-normal text-gray-500 mt-1">
                            {gateway.info.description}
                          </p>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Coupon Section */}
            <SubmitCoupon 
              isDiscountApplied={isDiscountApplied} 
              setIsDiscountApplied={setIsDiscountApplied}
              gateway={form.getValues().gateway} 
            />
          </Grid.Col>
            
          <Grid.Col span={{ base: 12, lg: 5 }}>
            <Box
              style={{
                position: 'sticky',
                top: '2rem',
              }}
            >
              {form.getValues().gateway?.name && (
                <Paper 
                  p="xl" 
                  radius={0}
                  shadow="sm"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  }}
                >
                  <PaymentCalcReceipt
                    prev={{ to: "/basket-info", component: NavLink }}
                    gateway={form.getValues().gateway}
                  >
                    پرداخت
                  </PaymentCalcReceipt>
                </Paper>
              )}
            </Box>
          </Grid.Col>
        </Grid>
    </>
  );
};

const SubmitCoupon = ({ isDiscountApplied, setIsDiscountApplied, gateway }) => {
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
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
    const isEmpty = (obj) => obj && Object.keys(obj).length === 0;
    const hasValidStatus = errorUpdateDiscount && typeof errorUpdateDiscount.status !== "undefined" && !isNaN(Number(errorUpdateDiscount.status));
  
    if (!isEmpty(errorUpdateDiscount) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorUpdateDiscount.status))) {
      setErrors({});
      form.setErrors({});
      notifications.show({
        title: errorUpdateDiscount?.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }
  }, [cartfinalreceiptDiscount, errorUpdateDiscount]);

  useEffect(() => {
    if (errorUpdateDiscount?.status) {
      handleKnownErrors(errorUpdateDiscount.status, setModalOpen, navigate);
    }
  }, [errorUpdateDiscount]);

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
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
    const isEmpty = (obj) => obj && Object.keys(obj).length === 0;
    const hasValidStatus = errorUpdateDiscountDelete && typeof errorUpdateDiscountDelete.status !== "undefined" && !isNaN(Number(errorUpdateDiscountDelete.status));
  
    if (!isEmpty(errorUpdateDiscountDelete) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorUpdateDiscountDelete.status))) {
      form.setErrors({});
      notifications.show({
        title: errorUpdateDiscountDelete?.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }
  }, [cartfinalreceiptDiscountDelete, errorUpdateDiscountDelete]);

  useEffect(() => {
    if (errorUpdateDiscountDelete?.status) {
      handleKnownErrors(errorUpdateDiscountDelete.status, setModalOpen, navigate);
    }
  }, [errorUpdateDiscountDelete]);

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
      } else {
        notifications.show({
          title: "خطا",
          message: "مشکلی در اعمال کد تخفیف پیش آمد!",
          color: "red",
        });
      }

      dispatch(fetchFinalReceipt());
    } catch (error) {
      notifications.show({
        title: "خطا",
        message: "مشکلی در اتصال به سرور پیش آمد!",
        color: "red",
      });
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
      } else {
        notifications.show({
          title: "خطا",
          message: "مشکلی در حذف کد تخفیف پیش آمد!",
          color: "red",
        });
      }

      dispatch(fetchFinalReceipt());
    } catch (error) {
      notifications.show({
        title: "خطا",
        message: "مشکلی در اتصال به سرور پیش آمد!",
        color: "red",
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validation = form.validate();
    if (!validation.hasErrors) {
      applyDiscount(form.values);
    }
  };

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
            {/* <div className="flex sm:block hidden">
              <svg style={{ width: '20px', height: '20px', fill: '#1f2937' }} viewBox="0 0 24 24">
                <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
              </svg>
            </div> */}
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
                <div className="px-2 flex items-center relative text-gray-800 bg-gray-100 lg:bg-white rounded-lg border border-gray-200 focus-within:border-b-2 focus-within:border-b-blue-500 transition-all">
                  <div className="grow">
                    <input 
                      className="px-2 w-full py-3 lg:py-2 bg-transparent outline-none text-sm"
                      placeholder="افزودن کد تخفیف" 
                      autoComplete="off" 
                      type="text" 
                      value={form.values.code}
                      onChange={(e) => form.setFieldValue('code', e.target.value)}
                      disabled={isDiscountApplied || loadingUpdateDiscount}
                    />
                  </div>
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