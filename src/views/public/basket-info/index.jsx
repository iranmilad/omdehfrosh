import {
  Grid,
  Title,
  Text,
  Paper,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import PriceText from "../../../components/priceText";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import PaymentCalc from "../../../components/payment_calc";
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { Steps } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { Grid as GridAnt } from 'antd';
import AddressManagement from "./AddressManagement"; // Adjust path as needed

const { useBreakpoint } = GridAnt;

const BasketInfo = () => {
  const [cookies] = useCookies(["user"]);
  const [pageActive, setPageActive] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);
  const userInfo = useSelector((state) => state.user.userInfo);
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);

  const screensAnt = useBreakpoint();

  useEffect(() => {
    const nonNotifyStatuses = [400, 401, 403, 404, 405, 406, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 422, 429];

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
  }, [errors, navigate]);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    if (authLoading) return;
    if (isVerified === false) {
      navigate("/login", { replace: true });
    } else if (isVerified === true) {
      setPageActive(true);
      dispatch(fetchUserInfo());
    }
  }, [isVerified, authLoading, navigate, dispatch]);

  const handleForm = async () => {
    if (!selectedAddress) {
      notifications.show({
        title: "لطفا یک آدرس انتخاب کنید",
        color: "red",
        autoClose: true,
      });
      return;
    }

    dispatch(toggleLoading(true));
    try {
      const token = localStorage.getItem("user");
      
      // You can send the selected address to the backend if needed
      // Or just proceed to payment since address is already saved
      
      navigate("/payment");
      
    } catch (error) {
      console.error("Error processing request:", error);
      setErrors({ message: "خطایی در سرور رخ داده است" });
      notifications.show({
        title: "خطایی در سرور رخ داده است",
        color: "red",
        autoClose: true,
      });
    } finally {
      dispatch(toggleLoading(false));
    }
  };

  if (!userInfo || authLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (!pageActive) return <></>;

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errors?.message}
      />
      
      <Steps
        current={0}
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
      />

      <Grid>
        <Grid.Col span={{ lg: 9 }}>
          <Title fw="600" c="gray.8" mb="lg">
            اطلاعات خریدار و آدرس تحویل
          </Title>
          
          <AddressManagement 
            onAddressSelect={setSelectedAddress}
            userInfo={userInfo}
            onSubmit={handleForm}
          />
        </Grid.Col>

        <Grid.Col span={{ lg: 3 }}>
          <PaymentCalc
            prev={{ to: "/basket", component: NavLink }}
            submit={{ onClick: () => handleForm() }}
          >
            ثبت سفارش
          </PaymentCalc>
        </Grid.Col>
      </Grid>
    </>
  );
};

export default BasketInfo;