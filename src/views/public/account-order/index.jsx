import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Title,
  Alert,
  Group,
  Button,
  Divider,
  Flex,
  Text,
  Badge,
  Stack,
  Center,
  Loader,
  LoadingOverlay,
  Transition,
  useProps,
  Modal,
  Box,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { useData, useSend } from "../../../Libs/api"; // Replace with your actual hook library
import Product from "./Product"; // Import the Product component
import PriceText from "../../../components/priceText"; // Import the PriceText component
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import { getOrderByID } from "../../../redux/orders/orders/getorderbyid/getOrderByIDActions";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import PercentText from "../../../components/priceText";
import { updateOrderDelivered } from "../../../redux/orders/orders/updateorderdelivered/updateOrderDeliveredActions";


function Account_Order() {

  const dispatch = useDispatch();

  const [modalOpened, setModalOpened] = useState(false);

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const { id } = useParams();


  const { data, isLoading } = useData({ url: `/orders/${id}`, method: 'POST', queryKey: ['single-order', id] });
  
  const { order, loading, error } = useSelector((state) => state.orders)

  const { userInfo, errorUserInfo, loadingUserInfo } = useSelector((state) => state.user)
  
  const [sellers, setSellers] = useState([])

  const navigate = useNavigate();

  
  const [delivered, setDelivered] = useState(false);
  
  const [showAlert, setShowAlert] = useState(false);


    useEffect(() => {
      dispatch(verifyToken());
    }, [dispatch]);
  
  
    useEffect(() => {
  
      if (user) {
        dispatch(getUserMyAccount({userId: user.id}));
      }
  
    }, [dispatch]);

    useEffect(() => {

      if (user) {
        dispatch(getOrderByID({orderId: id}))
      }
    }, [dispatch, user])


    useEffect(() => {

      if (user) {
        dispatch(fetchUserInfo())
      }
    }, [dispatch, user])


    useEffect(() => {
      if (order?.sellers?.length > 0) {
        setSellers(order.sellers);
      }
    }, [order]); // Remove 'dispatch' from dependencies
    

    useEffect(() => {
    if (data) {
      setDelivered(data.deliveryConfirmation);
      setShowAlert(!data.deliveryConfirmation); 
    }
  }, [data]);

  const handleDeliveryConfirmation = async (val) => {
    dispatch(updateOrderDelivered(
      { 
        orderId: id, 
        deliveredStatus: val
      }
    ))

    if (user) {
      dispatch(getOrderByID({orderId: id}))
    }

  };




  if (isLoading) return <Center><Loader /></Center>;

  


  function DeliveryConfirmationModal({ opened, onClose }) {
    const dispatch = useDispatch();
    const { id } = useParams();
  
    const handleConfirmDelivery = () => {
      dispatch(updateOrderDelivered({ orderId: id, deliveredStatus: true }));
      dispatch(getOrderByID({orderId: id}))
      onClose();
    };
  
    return (
      
      <Modal opened={opened} onClose={onClose} title="تایید تحویل سفارش">
        <Text>آیا از تحویل سفارش اطمینان دارید؟</Text>
        <Group position="right" mt="md">
          <Button onClick={onClose} variant="outline" color="gray">
            لغو
          </Button>
          <Button onClick={handleConfirmDelivery} color="green">
            تایید
          </Button>
        </Group>
      </Modal>
    );
  }

  const {
    recipient,
    phoneNumber,
    address,
    totalAmount,
    discountAmount,
    discountCode,
    products,
  } = data;

  if (!order) {
    return <Center>
      <Loader />
    </Center>
  }

  return (
    <>
      <Title display="flex" style={{ alignItems: "center" }}>
        <IconArrowRight style={{ marginLeft: "10px" }} /> جزئیات سفارش
      </Title>



      <Group position="right" mt="md">
        <Badge
          color={
            order.isPaid === 'paid'
              ? 'green'
              : order.isPaid === 'prepaid'
              ? 'blue'
              : order.isPaid === 'selfprepaid'
              ? 'orange'
              : 'red'
          }
          variant="light"
          radius="md"
          size="lg"
          px="md"
          py={6}
          style={{ textAlign: 'center', whiteSpace: 'normal' }}
        >
          {
            order.isPaid === 'paid'
              ? 'پرداخت شده'
              : order.isPaid === 'prepaid'
              ? 'پیش‌ پرداخت شده'
              : order.isPaid === 'selfprepaid'
              ? 'مبلغ اولیه پرداخت شده'
              : 'پرداخت نشده'
          }
        </Badge>
      </Group>





      
      <DeliveryConfirmationModal opened={modalOpened} onClose={() => setModalOpened(false)} />

      {/* Conditionally render the Alert only if deliveryConfirmation is false */}
      {!order?.delivered && order.isPaid === "paid" && (
        <Transition mounted={showAlert} transition="fade" duration={400} timingFunction="ease">
          {(styles) => (
            <div style={styles}>
              <Alert mt="md" title="آیا سفارش به دستتان رسیده است؟">
                <LoadingOverlay visible={loading || isLoading} zIndex={1000} />
                <Group>
                  {/* <Button size="xs" h={35} color="red" onClick={() => handleDeliveryConfirmation(false)}>
                    خیر
                  </Button> */}
                  <Button onClick={() => setModalOpened(true)}>تایید تحویل</Button>

                </Group>
              </Alert>
            </div>
          )}
        </Transition>
      )}

      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">تحویل گیرنده : </Text>
          <Text>{order.name}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">شماره موبایل : </Text>
          <Text>{order.mobile}</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">آدرس : </Text>
          <Text>{order.address}</Text>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">مبلغ : </Text>
          <PriceText>{order.totalPriceToPay}</PriceText>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">مقدار تخفیف : </Text>
          {order?.totalPriceApply - order?.totalPriceToPay > 0 ? (
            <PriceText>{order.totalPriceApply - order.totalPriceToPay}</PriceText>
          ) : (
            <Text>بدون تخفیف</Text>
          )}
        </Flex>
        <Flex gap="xs" align="center">
        <Text c="gray">کد تخفیف استفاده شده :</Text>
        <Badge>
          {order.cartDiscounts?.discountCode?.code
            ? order.cartDiscounts.discountCode.code
            : "بدون تخفیف"}
        </Badge>
      </Flex>
      </Flex>
      <Divider my="xl" />
      <Title mb="lg">مرسولات</Title>
      <Stack>
      <Stack>
      {order?.sellers?.length > 0 ? (
        order.sellers.map((seller, index) => (
          <div key={index}>
            <Flex direction={"row"} justify="space-between" align="start">
              <Flex direction={"column"} justify="space-between" align="start">
                <Flex>
                  <Title>{seller?.seller.label}</Title> {/* Seller Name */}
                </Flex>
                <Flex>
                  <Badge
                      mt="md"
                      mb="md"
                      radius="md"
                      size="lg"
                      variant="light"
                      color={
                        seller.isPaid === 'paid'
                          ? 'green'
                          : seller.isPaid === 'prepaid'
                          ? 'blue'
                          : seller.isPaid === 'selfprepaid'
                          ? 'orange'
                          : 'red'
                    }
                    >
                      {
                        seller.isPaid === 'paid'
                          ? 'پرداخت شده'
                          : seller.isPaid === 'prepaid'
                          ? 'پیش‌پرداخت شده'
                          : seller.isPaid === 'selfprepaid'
                          ? 'مبلغ اولیه پرداخت شده'
                          : 'پرداخت نشده'
                      }
                  </Badge>
                </Flex>
              </Flex>
              {
                seller?.vatRequested && seller.vatLink && (seller?.isPaid === "paid" || seller?.isPaid === "selfprepaid" ) && (
                  <Flex align="center" gap="xs">
                    <Badge
                      component="a"
                      href={seller.vatLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      p="sm"
                      color="blue"
                      variant="outline"
                      style={{ cursor: "pointer", transition: "all 0.2s" }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e0f0ff"}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      دریافت فاکتور رسمی
                    </Badge>
                  </Flex>
                )
              }
            </Flex>
            <>
              {
                seller?.items?.map((product, idx ) => {
                  return (
                    <Product 
                      key={idx}
                      id={product.item?.productId}
                      imageUrl={product.item?.image}
                      name={product.item?.name}
                      price={product.item?.price}
                      options={product.item?.attributes}
                      seller={seller?.seller}
                    />
                  );
                }
              
              )

              }


            </>


          </div>
        ))
      ) : (
          <Text>هیچ فروشنده‌ای یافت نشد</Text>
        )}
      </Stack>

      {
        (order.isPaid === "unpaid" || order.isPaid === "prepaid") && (
          <Flex 
            justify={{ base: "center", md: "flex-end" }}
            w="100%"
          >
          <Button
            onClick={() =>
              navigate(`/payment-sellers/${order?.receipt_id || order?.id}`)
            }
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "fit-content",
            }}
          >
            مراجعه به صفحه پرداخت
          </Button>

          </Flex>
        )
      }


        

      </Stack>
          </>
        );
      }

export default Account_Order;