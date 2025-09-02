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
} from "@mantine/core";
import CartStepper from "../../../components/cartStepper";
import { data, NavLink, useNavigate } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useForm } from "@mantine/form";
import { IconArrowRight, IconBuildingCommunity, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useLayoutEffect, useState } from "react";
import {useSend} from '../../../Libs/api'
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

  console.log(fetchedGateways)


  const [ paymentURL , setPaymentURL ]  = useState("");
  const { mutateAsync } = useSend({url:"https://jsonplaceholder.typicode.com/posts"})
  const [ cookies, setCookie ] = useCookies(["user"]);
  const [ pageActive, setPageActive ] = useState(false);
  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const { orderfinalreceipt } = useSelector((state) => state.cartfinalreceipt); 
  const [ isDiscountApplied, setIsDiscountApplied ] = useState(false);

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
      <CartStepper active={3} />
      <Grid>
        <GridCol>
          <Title fw="600" c="gray.8" mb="sm">
            روش پرداخت
          </Title>
          <Paper>
            <form>
              <Radio.Group
                name="انتخاب درگاه پرداخت"
                value={form.values.gateway.name}
                onChange={(value) => {
                  const selectedGateway = fetchedGateways.find(
                    (gateway) => gateway.info.name === value
                  );
                  form.setValues({ gateway: selectedGateway?.info });
                }}
              >
                <Stack>{cards}</Stack>
              </Radio.Group>
            </form>
          </Paper>
          <SubmitCoupon 
            isDiscountApplied={isDiscountApplied} 
            setIsDiscountApplied={setIsDiscountApplied}
            gateway={form.getValues().gateway} 
            />
        </GridCol>
        
        <GridCol>
        {
          form.getValues().gateway?.name && (
            <PaymentCalcReceipt
              prev={{ to: "/basket-info", component: NavLink }}
              gateway={form.getValues().gateway}
            >
              پرداخت
            </PaymentCalcReceipt>
          )
        }
        </GridCol>

        {/* Buttons */}
        {(
          <GridCol span={{ lg: 6 }}>
            <Button
              fullWidth
              h={45}
              variant="light"
              color="gray"
              justify="space-between"
              leftSection={<IconArrowRight size={16} />}
              component={NavLink}
              to="/basket-info"
            >
              قبلی
            </Button>
          </GridCol>
        )}
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

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errorUpdateDiscount?.message || errorUpdateDiscountDelete?.message}
      />
      <Title fw="600" c="gray.8" mt="xl" mb="sm">
        کد تخفیف
      </Title>
      <Paper>
        <form onSubmit={form.onSubmit((values) => applyDiscount(values))}>
          <Flex align="end" gap="sm" w={{ lg: "50%" }}>
            <TextInput
              w="100%"
              label="وارد کردن کد تخفیف"
              placeholder="اینجا بنویسید"
              {...form.getInputProps("code")}
              disabled={isDiscountApplied}
              error={
                (cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code) || 
                (form.errors.code) || 
                (cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code) ? (
                  <div>
                    {cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code && (
                      <div>{cartfinalreceiptDiscount?.errors?.code}</div>
                    )}
                    {form.errors.code && <div>{form.errors.code}</div>}
                    {cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code && (
                      <div>{cartfinalreceiptDiscountDelete?.errors?.code}</div>
                    )}
                  </div>
                ) : null
              }
            />
            <Button 
              w="70" 
              type="submit" 
              disabled={isDiscountApplied}
              loading={loadingUpdateDiscount}
            >
              ثبت
            </Button>
          </Flex>
        </form>

        {orderfinalreceipt?.cartDiscounts?.discountCode?.code && (
          <>
            <Text mt="sm" c="green">
              کد تخفیف اعمال شده: {orderfinalreceipt.cartDiscounts.discountCode.code}
            </Text>
            <Button 
              mt="sm" 
              color="red" 
              onClick={removeDiscount}
              loading={loadingUpdateDiscountDelete}
            >
              حذف کد
            </Button>
          </>
        )}
      </Paper>
    </>
  );
};

export default PaymentMethod;