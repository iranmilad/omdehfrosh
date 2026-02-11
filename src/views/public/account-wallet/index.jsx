// H:\projects\React\j2b.market\src\views\public\account-wallet\index.jsx
import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Loader,
  Modal,
  Radio,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { useForm, yupResolver } from '@mantine/form';
import { useMediaQuery } from '@mantine/hooks';
import React, { useEffect, useState, useCallback } from 'react';
import * as yup from 'yup';
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';

import { updateUserInfo } from '../../../redux/users/updateuserinfo/updateUserInforActions';
import { clearUserInfo } from '../../../redux/users/updateuserinfo/updateUserInfoSlice';
import { useSessionQuery, useQueryClient } from '../../../Libs/reactQuery';

import ErrorMessageModal from '../../../components/errormessagemodal';
import { withdrawFromWallet } from '../../../redux/payment/wallet/walletwithdrawal/walletWithDrawalActions';
import { transferFromWallet } from '../../../redux/payment/wallet/wallettransfer/walletTransferActions';
import { handleKnownErrors } from '../../../Libs/errorstatushandle/httpErrorStatus';
import { clearWithdrawState } from '../../../redux/payment/wallet/walletwithdrawal/walletWithDrawalSlice';
import { clearTransferState } from '../../../redux/payment/wallet/wallettransfer/walletTransferSlice';
import { processPayment } from '../../../utils/paymentHelper';


const depositValidationSchema = yup.object().shape({
  name: yup
    .string()
    .matches(/^[\u0600-\u06FF\s]{3,}$/, "نام باید حداقل ۳ حرف و فقط شامل حروف فارسی باشد")
    .required("نام الزامی است"),
  family: yup
    .string()
    .matches(/^[\u0600-\u06FF\s]{3,}$/, "نام خانوادگی باید حداقل ۳ حرف و فقط شامل حروف فارسی باشد")
    .required("نام خانوادگی الزامی است"),
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .positive("مبلغ باید بیشتر از صفر باشد")
    .required("مبلغ الزامی است"),
});

const withdrawValidationSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .positive("مبلغ باید بیشتر از صفر باشد")
    .required("مبلغ الزامی است"),
});



const validationSchema = yup.object().shape({
  name: yup.string().required("نام الزامی است"),
  family: yup.string().required("نام خانوادگی الزامی است"),
  mobile: yup
    .string()
    .matches(/^09[0-9]{9}$/, "فرمت شماره موبایل صحیح نیست")
    .required("شماره موبایل الزامی است"),
  email: yup
    .string()
    .email("فرمت ایمیل صحیح نیست")
    .required("ایمیل الزامی است"),
  nationalCode: yup
    .string()
    .matches(/^[0-9]{10}$/, "کد ملی باید 10 رقم باشد")
    .required("کد ملی الزامی است"),
  birthday: yup
    .string()
    .matches(/^\d{4}\/\d{1,2}\/\d{1,2}$/, "فرمت تاریخ تولد صحیح نیست")
    .required("تاریخ تولد الزامی است"),
});

const transferValidationSchema = yup.object().shape({
  receiverPhone: yup
    .string()
    .matches(/^09\d{9}$/, "شماره موبایل گیرنده باید ۱۱ رقم و با ۰۹ شروع شود")
    .required("شماره موبایل گیرنده الزامی است"),
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .positive("مبلغ باید بیشتر از صفر باشد")
    .required("مبلغ الزامی است"),
  note: yup.string().required("توضیحات الزامی است"),
});


function Account_Wallet() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;

  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletModalType, setWalletModalType] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenDetail, setModalOpenDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [errMessage, setErrMessage] = useState();
  const [errMessageTransfer, setErrMessageTransfer] = useState();
  const [selectedGatewayId, setSelectedGatewayId] = useState(null);
  const [confirmTransferModal, setConfirmTransferModal] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [modalOpenWithdrawError, setModalOpenWithdrawError] = useState(false);
  const [modalOpenTransferError, setModalOpenTransferError] = useState(false);
  const [confirmWithdrawModal, setConfirmWithdrawModal] = useState(false);

  const { data: userInfoData, isLoading: loadingUserInfo } = useSessionQuery({
    endpoint: "/users/getuserinfo",
    queryKey: ["userInfo"],
    enabled: !!token,
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });
  const userInfo = userInfoData?.data ?? userInfoData;

  const { data: userAccountData } = useSessionQuery({
    endpoint: "/user-myaccounts",
    queryKey: ["userMyAccount"],
    enabled: !!token,
    queryOptions: { refetchOnMount: true },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });
  const userAccount = userAccountData?.data ?? userAccountData;

  // Gateways data (POST) - cached with React Query; shared with payment-method for "online" state
  const {
    data: gatewaysData,
    isLoading: gatewaysLoading,
  } = useSessionQuery({
    endpoint: "/gatewaysdata",
    queryKey: ["gatewaysdata", "online"],
    method: "post",
    body: { state: "online" },
    enabled: true,
    queryOptions: { refetchOnMount: false },
  });
  const fetchedGateways = Array.isArray(gatewaysData) ? gatewaysData : (gatewaysData?.gateways ?? []);
  const loading = gatewaysLoading;

  const { updateuser, errorUpdateUser } = useSelector((state) => state.updateUserInfo);
  const { withdrawResult, loadingWithdraw, errorWithdraw } = useSelector((state) => state.walletWithDrawal);
  const { transferResult, loadingTransfer, errorTransfer } = useSelector((state) => state.walletTransfer);
  const { isVerified, loading: authLoading, user } = useSelector((state) => state.auth);

  const isShortViewport = useMediaQuery('(max-height: 500px)');
  const isNarrowViewport = useMediaQuery('(max-width: 576px)');
  const detailsModalSmall = isShortViewport || isNarrowViewport;

  const [depositData, setDepositData] = useState({ name: '', family: '', amount: '' });
  const [withdrawData, setWithdrawData] = useState({ amount: '' });
  const [transferData, setTransferData] = useState({ receiverPhone: '', amount: '', note: '' });


// Fix the navigate call in handleSubmitModal function
const handleSubmitModal = (e) => {
  e.preventDefault();

  if (walletModalType === "deposit") {
    const isValid = depositForm.validate();

    if (!isValid.hasErrors) {
      setWalletModalOpen(false);

      const info = fetchedGateways.find(
        (gateway) => gateway._id === selectedGatewayId
      );

      // Invalidate wallet/account cache so when user returns from payment we refetch
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      }

      // Use new universal payment flow for wallet recharge
      // Send amount, gateway - backend will get wallet_id from user token
      console.log("[PAYMENT][WALLET] واریز به کیف پول (deposit)", {
        amount: depositForm.values.amount,
        gateway: info?.info?.name || "fake",
      });
      processPayment({
        amount: depositForm.values.amount,
        gateway: info?.info?.name || "fake",
      });
    }
    return;
  }

  if (walletModalType === "withdraw") {
    const isValid = withdrawForm.validate();

    if (!isValid.hasErrors) {
      setWalletModalOpen(false);
      setConfirmWithdrawModal(true);
    }

    return;
  }

  if (walletModalType === "transfer") {
    const isValid = transferForm.validate();

    if (!isValid.hasErrors) {
      setWalletModalOpen(false);
      setConfirmTransferModal(true);
    }

    return;
  }
};

// Add this function at the top of your component (after imports, before the main function)
const GatewayIcon = ({ src, alt, width = 20 }) => {
  const [hasError, setHasError] = useState(false);

  // Check if src is invalid
  const isInvalid =
    !src ||
    src === "" ||
    src === null ||
    src === undefined ||
    (Array.isArray(src) && (src.length === 0 || src[0] === ""));

  // Default SVG icon
  const DefaultIcon = () => (
    <svg width={width} height={width} viewBox="0 0 24 24" fill="none">
      <rect
        x="2"
        y="4"
        width="20"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
      <rect x="2" y="8" width="20" height="2" fill="currentColor" />
      <circle cx="6" cy="14" r="1" fill="currentColor" />
      <circle cx="10" cy="14" r="1" fill="currentColor" />
    </svg>
  );

  if (isInvalid || hasError) {
    return <DefaultIcon />;
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      onError={() => setHasError(true)}
      style={{ objectFit: "contain" }}
    />
  );
};

// Then replace this line:
// leftSection={<img src={gateway.icon} alt={gateway.label} width={20} />}

// With this line:
// leftSection={<GatewayIcon src={gateway.icon} alt={gateway.label} width={20} />}

useEffect(() => {
  if (
    withdrawResult &&
    withdrawResult.state === "error" &&
    withdrawResult.errors
  ) {
    withdrawResult.errors.forEach((err) => {
      withdrawForm.setFieldError(err.name, err.message);
    });
  }
}, [withdrawResult]);

useEffect(() => {
  if (
    transferResult &&
    transferResult.state === "error" &&
    transferResult.errors
  ) {
    transferResult.errors.forEach((err) => {
      transferForm.setFieldError(err.name, err.message);
    });
  }
}, [transferResult]);

const depositForm = useForm({
  initialValues: {
    name: "",
    family: "",
    amount: "",
  },
  validate: yupResolver(depositValidationSchema),
});

const withdrawForm = useForm({
  initialValues: {
    amount: "",
  },
  validate: yupResolver(withdrawValidationSchema),
});

const transferForm = useForm({
  initialValues: {
    receiverPhone: "",
    amount: "",
    note: "",
  },
  validate: yupResolver(transferValidationSchema),
});

const form = useForm({
  initialValues: {
    name: "",
    family: "",
    mobile: "",
    email: "",
    nationalCode: "",
    birthday: "",
  },
  validate: yupResolver(validationSchema),
});

useEffect(() => {
  if (userInfo?.user) {
    const { name, family, mobile, email, nationalCode, birthday } =
      userInfo.user;
    form.setValues({ name, family, mobile, email, nationalCode, birthday });
  }
}, [userInfo]);

useEffect(() => {
  if (!selectedGatewayId && fetchedGateways.length > 0) {
    setSelectedGatewayId(fetchedGateways[0]._id); // Select the first gateway by default
  }
}, [fetchedGateways, selectedGatewayId]);

useEffect(() => {
  if (updateuser?.state === "ok") {
    notifications.show({
      title: updateuser.message,
      color: "green",
      autoClose: true,
    });
  } else if (updateuser?.state === "error") {
    notifications.show({
      title: updateuser.message,
      color: "red",
      autoClose: true,
    });
  }
}, [updateuser]);

useEffect(() => {
  const criticalErrors = [
    400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416,
    417, 422, 429,
  ];
  if (
    errorUpdateUser &&
    !criticalErrors.includes(Number(errorUpdateUser.status))
  ) {
    notifications.show({
      title: errorUpdateUser.message,
      color: "red",
      autoClose: true,
    });
  }

  if (errorUpdateUser?.status === 401 || errorUpdateUser?.status === 403) {
    setModalOpen(true);
    setTimeout(() => {
      setModalOpen(false);
      dispatch(clearUserInfo());
      if (errorUpdateUser?.status === 401) navigate("/");
    }, 4000);
  }
}, [errorUpdateUser, dispatch, navigate]);

const submitForm = useCallback(
  async (values) => {
    const updatedValues = { ...values, phone: values.mobile };
    await dispatch(updateUserInfo(updatedValues));
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ["userInfo"] });
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
    }
  },
  [dispatch, queryClient]
);

const handleDeposit = () => {
  setWalletModalType("deposit");

  setWalletModalOpen(true);
};

const handleWithdraw = () => {
  setWalletModalType("withdraw");
  setWalletModalOpen(true);
};

const handleTransfer = () => {
  setWalletModalType("transfer");
  setWalletModalOpen(true);
};

useEffect(() => {
  if (withdrawResult && withdrawResult?.state === "ok") {
    setWalletModalOpen(false);
    notifications.show({
      title: withdrawResult.message,
      color: "green",
      autoClose: true,
    });
  }

  if (withdrawResult && withdrawResult?.state === "error") {
    notifications.show({
      title: withdrawResult.message,
      color: "red",
      autoClose: true,
    });
  }
}, [errorWithdraw, withdrawResult]);

useEffect(() => {
  if (
    errorWithdraw &&
    Number(errorWithdraw.status) !== 400 &&
    Number(errorWithdraw.status) !== 401 &&
    Number(errorWithdraw.status) !== 403 &&
    Number(errorWithdraw.status) !== 404 &&
    Number(errorWithdraw.status) !== 405 &&
    Number(errorWithdraw.status) !== 406 &&
    Number(errorWithdraw.status) !== 408 &&
    Number(errorWithdraw.status) !== 409 &&
    Number(errorWithdraw.status) !== 410 &&
    Number(errorWithdraw.status) !== 411 &&
    Number(errorWithdraw.status) !== 412 &&
    Number(errorWithdraw.status) !== 413 &&
    Number(errorWithdraw.status) !== 414 &&
    Number(errorWithdraw.status) !== 415 &&
    Number(errorWithdraw.status) !== 416 &&
    Number(errorWithdraw.status) !== 417 &&
    Number(errorWithdraw.status) !== 422 &&
    Number(errorWithdraw.status) !== 429
  ) {
    setWalletModalOpen(false);

    notifications.show({
      title: errorWithdraw.message,
      color: "red",
      autoClose: true,
    });

    dispatch(clearWithdrawState());
  }
}, [errorWithdraw]);

useEffect(() => {
  if (errorWithdraw?.status) {
    handleKnownErrors(
      errorWithdraw?.status,
      setModalOpenWithdrawError,
      navigate
    );
    setErrMessage(errorWithdraw?.message);
  }

  dispatch(clearWithdrawState());
}, [errorWithdraw]);

useEffect(() => {
  if (transferResult && transferResult?.state === "ok") {
    setWalletModalOpen(false);
    notifications.show({
      title: transferResult.message,
      color: "green",
      autoClose: true,
    });
  }

  if (transferResult && transferResult?.state === "error") {
    notifications.show({
      title: transferResult.message,
      color: "red",
      autoClose: true,
    });
  }
}, [errorTransfer, transferResult]);

useEffect(() => {
  if (withdrawResult?.state === "ok" && queryClient) {
    queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
  }
}, [withdrawResult?.state, queryClient]);

useEffect(() => {
  if (transferResult?.state === "ok" && queryClient) {
    queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
  }
}, [transferResult?.state, queryClient]);
useEffect(() => {
  if (
    errorTransfer &&
    Number(errorTransfer.status) !== 400 &&
    Number(errorTransfer.status) !== 401 &&
    Number(errorTransfer.status) !== 403 &&
    Number(errorTransfer.status) !== 404 &&
    Number(errorTransfer.status) !== 405 &&
    Number(errorTransfer.status) !== 406 &&
    Number(errorTransfer.status) !== 408 &&
    Number(errorTransfer.status) !== 409 &&
    Number(errorTransfer.status) !== 410 &&
    Number(errorTransfer.status) !== 411 &&
    Number(errorTransfer.status) !== 412 &&
    Number(errorTransfer.status) !== 413 &&
    Number(errorTransfer.status) !== 414 &&
    Number(errorTransfer.status) !== 415 &&
    Number(errorTransfer.status) !== 416 &&
    Number(errorTransfer.status) !== 417 &&
    Number(errorTransfer.status) !== 422 &&
    Number(errorTransfer.status) !== 429
  ) {
    setWalletModalOpen(false);

    notifications.show({
      title: errorTransfer.message,
      color: "red",
      autoClose: true,
    });

    dispatch(clearTransferState());
  }
}, [errorTransfer]);

useEffect(() => {
  if (errorTransfer?.status) {
    handleKnownErrors(
      errorTransfer?.status,
      setModalOpenTransferError,
      navigate
    );
    setErrMessageTransfer(errorTransfer?.message);
  }

  dispatch(clearTransferState());
}, [errorTransfer]);

useEffect(() => {
  // Only check after auth loading is complete
  if (!authLoading) {
    if (!isVerified || !user) {
      setLoginModalOpen(true);
      // Auto redirect to login after 3 seconds
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);

      // Cleanup timer if component unmounts
      return () => clearTimeout(timer);
    } else {
      setLoginModalOpen(false);
      // User is authenticated - data already fetched by other useEffects
    }
  }
}, [dispatch, isVerified, user, authLoading, navigate]);

// Handle immediate redirect to login page
const handleGoToLogin = () => {
  navigate("/login");
};

if (!isVerified || !user) {
  return (
    <>
      <Modal
        removeScrollProps={{ removeScrollBar: false }}
        opened={loginModalOpen}
        onClose={() => {}} // Prevent closing by clicking outside
        closeOnClickOutside={false}
        closeOnEscape={false}
        withCloseButton={false}
        title="ورود به حساب کاربری"
        centered
        overlayProps={{
          backgroundOpacity: 0,
          blur: 0,
        }}
      >
        <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
        <Text size="sm" c="dimmed" mb="md">
          در حال انتقال به صفحه ورود...
        </Text>
        <Flex gap="sm" justify="flex-end">
          <Button onClick={handleGoToLogin}>رفتن به صفحه ورود</Button>
        </Flex>
      </Modal>

      {/* Show a placeholder content while modal is open */}
      <Center h={400}>
        <Stack align="center" gap="md">
          <Text size="xl" c="dimmed">
            در حال بررسی وضعیت ورود...
          </Text>
        </Stack>
      </Center>
    </>
  );
}
          

  if (loadingUserInfo) return <Center><Loader /></Center>;
  if (!userInfo?.user) return <Center>خطایی رخ داده است. لطفاً دوباره تلاش کنید.</Center>;

  return (
    <>

    


      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errorUpdateUser?.message}
      />

      {modalOpenWithdrawError && (
        <ErrorMessageModal
          opened={modalOpenWithdrawError}
          onClose={() => setModalOpenWithdrawError(false)}
          message={errMessage}
        />
      )}

      {modalOpenTransferError && (
        <ErrorMessageModal
          opened={modalOpenTransferError}
          onClose={() => setModalOpenTransferError(false)}
          message={errMessageTransfer}
        />
      )}

      
      <Modal
        opened={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        removeScrollProps={{ removeScrollBar: false }}

        title={
          walletModalType === "deposit"
            ? "واریز به کیف پول"
            : walletModalType === "withdraw"
            ? "برداشت از کیف پول"
            : "انتقال به حساب دیگر"
        }
        size={detailsModalSmall ? 'sm' : 'md'}
        zIndex={1100}
        lockScroll={false}
        removeScrollBar={false}
        styles={{
          content: { maxHeight: '90dvh', display: 'flex', flexDirection: 'column' },
          body: { overflowY: 'auto', flex: '1 1 auto', minHeight: 0 },
        }}
      >
        <form onSubmit={handleSubmitModal}>
          <Stack gap="sm">

          {walletModalType === "deposit" && (
            <>
              <TextInput
                label="نام"
                required
                {...depositForm.getInputProps('name')}
              />
              <TextInput
                label="نام خانوادگی"
                required
                {...depositForm.getInputProps('family')}
              />
              <TextInput
                label="مبلغ واریز"
                required
                {...depositForm.getInputProps('amount')}
              />

              <Divider my="sm" label="درگاه پرداخت را انتخاب کنید" />

    {loading ? (
      <Center><Loader size="sm" /></Center>
    ) : (
      <Radio.Group
        value={selectedGatewayId}
        onChange={setSelectedGatewayId}
        name="paymentGateway"
        label="انتخاب درگاه پرداخت"
        withAsterisk
      >
        <Stack gap="sm" mt="sm">
          {fetchedGateways.map(gateway => (
            <div
              key={gateway._id}
              style={{
                border: `2px solid ${selectedGatewayId === gateway._id ? '#fa5252' : '#e9ecef'}`,
                borderRadius: '8px',
                padding: '12px',
                backgroundColor: selectedGatewayId === gateway._id ? '#fff5f5' : 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedGatewayId(gateway._id)}
            >
              <Radio
                value={gateway._id}
                label={
                  <Group gap="sm" align="center">
                    <GatewayIcon 
                      src={gateway.icon} 
                      alt={gateway.label} 
                      width={24} 
                    />
                    <Text 
                      fw={selectedGatewayId === gateway._id ? 600 : 400}
                      c={selectedGatewayId === gateway._id ? 'red.7' : 'dark.7'}
                    >
                      {gateway.label}
                    </Text>
                  </Group>
                }
                styles={{
                  radio: {
                    cursor: 'pointer'
                  },
                  label: {
                    cursor: 'pointer',
                    paddingLeft: '8px'
                  }
                }}
              />
            </div>
          ))}
        </Stack>
      </Radio.Group>
    )}

            </>
          )}



            {walletModalType === "withdraw" && (
              <>
                <TextInput
                  label="میزان مبلغ برداشت"
                  required
                  {...withdrawForm.getInputProps('amount')}
                />
                {/* Phone number removed - backend will get it from token */}
              </>
            )}

            {walletModalType === "transfer" && (
              <>
                <TextInput
                  label="شماره تلفن گیرنده"
                  required
                  {...transferForm.getInputProps('receiverPhone')}
                />
                <TextInput
                  label="مبلغ واریز"
                  required
                  {...transferForm.getInputProps('amount')}
                />
                <Textarea
                  label="توضیحات"
                  required
                  {...transferForm.getInputProps('note')}
                />

              </>
            )}

            <Button type="submit" fullWidth>
              تایید
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={confirmWithdrawModal}
        onClose={() => setConfirmWithdrawModal(false)}
        title="تأیید برداشت"
        size={detailsModalSmall ? 'sm' : 'md'}
                removeScrollProps={{ removeScrollBar: false }}

        zIndex={1100}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Text>آیا از برداشت مبلغ مطمئن هستید؟</Text>
        <Group mt="md" position="right">
          <Button onClick={() => setConfirmWithdrawModal(false)} variant="default">
            انصراف
          </Button>
            <Button
              color="red"
              onClick={() => {
                setConfirmWithdrawModal(false);
                dispatch(withdrawFromWallet({ withdrawData: { amount: withdrawForm.values.amount } })).then((action) => {
                  if (action?.type?.endsWith?.("fulfilled") && queryClient) {
                    queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
                    queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
                  }
                });
              }}
            >
              بله، برداشت کن
            </Button>

        </Group>
      </Modal>

      <Modal
        opened={confirmTransferModal}
        onClose={() => setConfirmTransferModal(false)}
        title="تأیید انتقال"
                removeScrollProps={{ removeScrollBar: false }}

        size={detailsModalSmall ? 'sm' : 'md'}
        zIndex={1100}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Text>آیا از انتقال مبلغ مطمئن هستید؟</Text>
        <Group mt="md" justify="flex-end">
          <Button variant="default" onClick={() => setConfirmTransferModal(false)}>
            انصراف
          </Button>
          <Button
            color="blue"
            onClick={() => {
              dispatch(transferFromWallet({
                transferData: {
                  receiverPhone: transferForm.values.receiverPhone,
                  amount: transferForm.values.amount,
                  note: transferForm.values.note
                }
              })).then((action) => {
                if (action?.type?.endsWith?.("fulfilled") && queryClient) {
                  queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
                  queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
                }
              });
              setConfirmTransferModal(false);
            }}
          >
            بله، منتقل کن
          </Button>
        </Group>
      </Modal>


      <Modal
        opened={modalOpenDetail}
        onClose={() => setModalOpenDetail(false)}
        title="جزئیات کامل"
                removeScrollProps={{ removeScrollBar: false }}

        size={detailsModalSmall ? 'sm' : 'lg'}
        zIndex={1100}
        lockScroll={false}
        removeScrollBar={false}
        styles={{
          content: {
            maxHeight: '85dvh',
            display: 'flex',
            flexDirection: 'column',
          },
          body: {
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
          },
        }}
      >
        {selectedItem && (
          <Stack gap="md">
            {/* Transaction Details */}
            {selectedItem.transactionId && (
              <>
                <Title order={5}>تراکنش</Title>
                <Divider />
                <Group><Text fw={500}>کد:</Text><Text>{selectedItem.transactionId}</Text></Group>
                <Group><Text fw={500}>مبلغ:</Text><Text color={selectedItem.amount > 0 ? 'green' : 'red'}>{selectedItem.amount.toLocaleString()} تومان</Text></Group>
                <Group><Text fw={500}>تاریخ:</Text><Text>{selectedItem.date}</Text></Group>
                <Group><Text fw={500}>نوع:</Text><Badge color="blue">{selectedItem.typeDescriptionFa}</Badge></Group>
                <Group><Text fw={500}>روش:</Text><Text>{selectedItem.methodDescriptionFa}</Text></Group>
                <Group><Text fw={500}>توضیحات:</Text><Text>{selectedItem.description}</Text></Group>
              </>
            )}

            {/* Transfer Details */}
            {selectedItem.transferId && (
              <>
                <Title order={5}>انتقال</Title>
                <Divider />
                <Group><Text fw={500}>کد انتقال:</Text><Text>{selectedItem.transferId}</Text></Group>
                <Group><Text fw={500}>فرستنده:</Text><Text>{selectedItem.senderId}</Text></Group>
                <Group><Text fw={500}>گیرنده:</Text><Text>{selectedItem.receiverId}</Text></Group>
                <Group><Text fw={500}>مبلغ:</Text><Text color="teal">{selectedItem.amount.toLocaleString()} تومان</Text></Group>
                <Group><Text fw={500}>تاریخ:</Text><Text>{selectedItem.date}</Text></Group>
                <Group><Text fw={500}>وضعیت:</Text><Badge color={selectedItem.status === 'completed' ? 'green' : 'yellow'}>{selectedItem.statusDescriptionFa}</Badge></Group>
                <Group><Text fw={500}>توضیحات:</Text><Text>{selectedItem.note}</Text></Group>
              </>
            )}

            {/* Withdrawal Request */}
            {selectedItem.requestId && (
              <>
                <Title order={5}>درخواست برداشت</Title>
                <Divider />
                <Group><Text fw={500}>کد درخواست:</Text><Text>{selectedItem.requestId}</Text></Group>
                <Group><Text fw={500}>مبلغ:</Text><Text>{selectedItem.amount.toLocaleString()} تومان</Text></Group>
                <Group><Text fw={500}>تاریخ:</Text><Text>{selectedItem.date}</Text></Group>
                <Group><Text fw={500}>وضعیت:</Text><Badge color={selectedItem.status === 'pending' ? 'orange' : 'green'}>{selectedItem.statusDescriptionFa}</Badge></Group>
              </>
            )}
          </Stack>
        )}
      </Modal>

      <Title mb="lg">کیف پول</Title>

      <Flex direction={{ base: 'column', sm: 'row' }} gap="sm" justify="flex-end" mb="md">
        <Button color="green" fullWidth onClick={handleDeposit}>واریز به کیف پول</Button>
        <Button color="orange" fullWidth onClick={handleWithdraw}>برداشت از کیف پول</Button>
        <Button color="blue" fullWidth onClick={handleTransfer}>انتقال به حساب دیگر</Button>
      </Flex>

      {userAccount?.wallet && (
        <Flex direction="column" gap="md">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Alert title="موجودی" color="green" radius="md" variant="light">
                {userAccount.wallet.balance.toLocaleString()} تومان
              </Alert>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Alert title="مبلغ مسدود شده" color="orange" radius="md" variant="light">
                {userAccount.wallet.blockedAmount.toLocaleString()} تومان
              </Alert>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Alert title="آخرین تراکنش" color="blue" radius="md" variant="light">
                {userAccount.wallet.lastTransaction?.typeDescriptionFa ?? "—"}، مبلغ: {userAccount.wallet.lastTransaction?.amount?.toLocaleString()} تومان
              </Alert>
            </Grid.Col>
          </Grid>

          {/* Transactions */}
          <Title order={4} mt="lg" style={{ textAlign: 'right' }}>تراکنش‌ها</Title>
          <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -var(--mantine-spacing-md)' }}>
            <Table striped highlightOnHover withBorder style={{ tableLayout: 'auto', width: '100%', minWidth: 520, direction: 'rtl' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>کد تراکنش</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>توضیح</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>مبلغ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>تاریخ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {userAccount.wallet.paymentHistory?.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{tx.transactionId}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>{tx.description}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', direction: 'rtl' }}>{tx.amount.toLocaleString()} تومان</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{tx.date}</td>
                    <td style={{ textAlign: 'center', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}><Button size="xs" variant="light" onClick={() => { setSelectedItem(tx); setModalOpenDetail(true); }}>نمایش</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* Transfers */}
          <Title order={4} mt="lg" style={{ textAlign: 'right' }}>انتقال‌ها</Title>
          <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -var(--mantine-spacing-md)' }}>
            <Table striped highlightOnHover withBorder style={{ tableLayout: 'auto', width: '100%', minWidth: 560, direction: 'rtl' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>کد انتقال</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>یادداشت</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>مبلغ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>وضعیت</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>تاریخ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {userAccount.wallet.transfers?.map(tr => (
                  <tr key={tr._id}>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{tr.transferId}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>{tr.note}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', direction: 'rtl' }}>{tr.amount.toLocaleString()} تومان</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>{tr.statusDescriptionFa}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{tr.date}</td>
                    <td style={{ textAlign: 'center', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}><Button size="xs" variant="light" onClick={() => { setSelectedItem(tr); setModalOpenDetail(true); }}>نمایش</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>

          {/* Withdrawals */}
          <Title order={4} mt="lg" style={{ textAlign: 'right' }}>درخواست‌های برداشت</Title>
          <Box style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -var(--mantine-spacing-md)' }}>
            <Table striped highlightOnHover withBorder style={{ tableLayout: 'auto', width: '100%', minWidth: 560, direction: 'rtl' }}>
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>کد درخواست</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>مبلغ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>یادداشت</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>وضعیت</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>تاریخ</th>
                  <th style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {userAccount.wallet.pendingWithdrawals?.map(wd => (
                  <tr key={wd._id}>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{wd.requestId}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', direction: 'rtl' }}>{wd.amount.toLocaleString()} تومان</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>{wd.note}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', direction: 'rtl' }}>{wd.statusDescriptionFa}</td>
                    <td style={{ textAlign: 'right', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}>{wd.date}</td>
                    <td style={{ textAlign: 'center', padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-sm)', whiteSpace: 'nowrap', direction: 'rtl' }}><Button size="xs" variant="light" onClick={() => { setSelectedItem(wd); setModalOpenDetail(true); }}>نمایش</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Box>
        </Flex>
      )}
    </>
  );
}

export default Account_Wallet;
