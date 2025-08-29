import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridCol,
  Image,
  Loader,
  NumberFormatter,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconBasket, IconCreditCard, IconMessage2 } from "@tabler/icons-react";
import React, { useEffect } from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";
import { useData } from "../../../Libs/api";
import ProductBox from "../../../components/productBox";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import MyAccountProductBox from "../../../components/myaccountproductbox";
import { clearTicketCreationState } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketSlice";

function Account_Index() {
  const dispatch = useDispatch();

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const { userAccount, loading, error } = useSelector((state) => state.userMyAccounts);

  const { primaryColor } = useMantineTheme();

  const { isLoading, data } = useData({
    url: "/myaccount",
    queryKey: ["myaccount", true],
  });

  useEffect(() => {
    dispatch(verifyToken());
    dispatch(clearTicketCreationState())
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(getUserMyAccount());
    }
  }, [dispatch]);

  // Only show loading if data is being fetched
  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      {/* Only show stats grid if userAccount exists */}
      {userAccount && (
        <Grid grow>
          {/* Only show wallet balance if wallet data exists */}
          {userAccount.wallet && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-red-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-red-600 rounded-xl p-2">
                  <IconCreditCard className="text-zinc-100" />
                </div>
                <div className="text-zinc-50 space-y-1">
                  <div>موجودی حساب</div>
                  <div>
                    <NumberFormatter
                      value={userAccount.wallet.balance || 0}
                      thousandSeparator
                    />{" "}
                    تومان
                  </div>
                </div>
              </div>
            </GridCol>
          )}
          
          {/* Only show total orders if data exists */}
          {typeof userAccount.all_orders !== 'undefined' && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-green-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-green-600 rounded-xl p-2">
                  <IconBasket className="text-zinc-100" />
                </div>
                <div className="text-zinc-100 space-y-1">
                  <div>سفارشات کل</div>
                  <div>{userAccount.all_orders}</div>
                </div>
              </div>
            </GridCol>
          )}
          
          {/* Only show tickets if data exists */}
          {typeof userAccount.tickets !== 'undefined' && (
            <GridCol span={{ lg: 4 }}>
              <div className="flex gap-x-2 items-center bg-blue-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
                <div className=" bg-blue-600 rounded-xl p-2">
                  <IconMessage2 className="text-zinc-100" />
                </div>
                <div className="text-zinc-100 space-y-1">
                  <div>پیام ها</div>
                  <div>{userAccount.tickets}</div>
                </div>
              </div>
            </GridCol>
          )}
        </Grid>
      )}
      
      {/* Only show orders section if userAccount exists */}
      {userAccount && (
        <>
          <Title my="lg">آخرین سفارشات</Title>
          <ScrollArea type="auto">
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th miw={100} c={primaryColor}>
                    سفارش#
                  </Table.Th>
                  <Table.Th miw={100} c={primaryColor}>
                    تاریخ
                  </Table.Th>
                  <Table.Th miw={100} c={primaryColor}>
                    وضعیت
                  </Table.Th>
                  <Table.Th miw={130} c={primaryColor}>
                    مجموع سفارش
                  </Table.Th>
                  <Table.Th miw={100} c={primaryColor} ta="end">
                    عملیات
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
              {userAccount?.orders?.length > 0 ? (
                userAccount.orders.map((item, index) => <ItemRow key={index} {...item} />)
              ) : (
              <Table.Tr>
                <Table.Td colSpan={5} ta="center">
                  هیچ سفارشی یافت نشد
                </Table.Td>
              </Table.Tr>
            )}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </>
      )}
      
      {/* Only show favorites section if userAccount exists */}
      {userAccount && (
        <>
          <Title my="lg">محصولات علاقه مندی شما</Title>
          <Swiper
            spaceBetween={10}
            navigation={false}
            slidesPerView={"auto"}
            style={{ paddingBottom: "40px", paddingInlineStart: "10px" }}
          >
            {userAccount?.favorites?.length > 0 ? (
              userAccount.favorites.map((item, index) => (
                <SwiperSlide key={index} style={{ width: "280px" }}>
                  <MyAccountProductBox {...item} />
                </SwiperSlide>
              ))
            ) : (
              <Text ta="center">هیچ محصولی در لیست علاقه‌مندی شما نیست</Text>
            )}
          </Swiper>
        </>
      )}
    </>
  );
}

function ItemRow(props) {
  return (
    <Table.Tr>
      <Table.Td>{props.orderId}</Table.Td>
      <Table.Td>{props.date}</Table.Td>
      <Table.Td>{props.status ? "پرداخت شده" : "انتظار برای پرداخت"}</Table.Td>
      <Table.Td>{props.totalPrice}</Table.Td>
      <Table.Td ta="end">
        <Button
          radius="9999"
          component={NavLink}
          to={`/account/orders/${props.orderId}`}
          size="sm"
        >
          مشاهده
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}

export default Account_Index;