import React, { useEffect, useState } from 'react'
import { Table,Title,ScrollArea,Button, useMantineTheme, Center, Loader, LoadingOverlay, Pagination} from '@mantine/core'
import { NavLink } from 'react-router';
import {useData} from "../../../Libs/api"
import InfoBox from "../../../components/InfoBox"
import { verifyToken } from '../../../redux/auth/authusers/auth';
import { getUserMyAccount } from '../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrdersByUserId } from '../../../redux/orders/orders/getallordersbyuserid/getAllOrdersByUserIdActions';

function Account_Orders() {
    const {primaryColor} = useMantineTheme();
    const [activePage,setActivePage] = useState(1);

    const dispatch = useDispatch();

    const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
    const { order, loading, error } = useSelector((state) => state.orders)
    const { ordersByUserId, loadingOrdersByUserId, errerrorOrdersByUserIdor } = useSelector((state) => state.getAllOrdersByUserId)

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
        dispatch(getAllOrdersByUserId())
      }
    }, [dispatch, user])

    const {data,isLoading,isFetching} = useData(
      {url: "/orders",
        queryKey:['orders',activePage],
        method:"POST",
        bodyData:{
          page:activePage
        }
      }
    );

    // Ensure ordersByUserId is always an array
    const ordersArray = Array.isArray(ordersByUserId) ? ordersByUserId : [];

    if(isLoading) return <Center><Loader /></Center>

    return (
      <>
      {isFetching && <LoadingOverlay visible={isFetching} zIndex={9999} />}
        <Title my="lg">آخرین سفارشات</Title>
        {/* Always show table structure if data exists */}
        {data ? (
        <>
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
                {ordersArray.length > 0 ? (
                  ordersArray.map((item, index) => (
                    <ItemRow key={index} {...item} />
                  ))
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
          {/* Only show pagination if there are orders and multiple pages */}
          {ordersArray.length > 0 && data.totalPage > 1 && (
            <Center mt="xl">
              <Pagination 
                total={data.totalPage} 
                value={activePage} 
                onChange={setActivePage} 
              />
            </Center>
          )}
        </>
        ) : <InfoBox shadow='0'>سفارشی یافت نشد</InfoBox>}
      </>
    )
}

function ItemRow(props) {
    return (
      <Table.Tr>
        <Table.Td>{props.order_id}</Table.Td>
        <Table.Td>{props.date}</Table.Td>
        <Table.Td>
          {props.isPaid === "paid"
            ? "پرداخت شده"
            : props.isPaid === "prepaid"
            ? "پیش‌ پرداخت شده"
            : props.isPaid === "selfprepaid"
            ? "مبلغ اولیه پرداخت شده"
            : "پرداخت نشده"}
        </Table.Td>
        <Table.Td>{props.totalPriceToPay}</Table.Td>
        <Table.Td ta="end">
          <Button
            radius="9999"
            component={NavLink}
            to={`/account/orders/${props.order_id}`}
            size="sm"
          >
            مشاهده
          </Button>
        </Table.Td>
      </Table.Tr>
    );
}

export default Account_Orders