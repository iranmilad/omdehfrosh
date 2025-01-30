import React, { useState } from 'react'
import { Table,Title,ScrollArea,Button, useMantineTheme, Center, Loader, LoadingOverlay, Pagination} from '@mantine/core'
import { NavLink } from 'react-router';
import {useData} from "../../../Libs/api"
import InfoBox from "../../../components/InfoBox"

function Account_Orders() {
    const {primaryColor} = useMantineTheme();
    const [activePage,setActivePage] = useState(1);
    const {data,isLoading,isFetching} = useData(
      {url: "/orders",
        queryKey:['orders',activePage],
        method:"POST",
        bodyData:{
          page:activePage
        }
      }
    );
  if(isLoading) return <Center><Loader /></Center>
  return (
    <>
    {isFetching && <LoadingOverlay visible={isFetching} zIndex={9999} />}
      <Title my="lg">آخرین سفارشات</Title>
      {data && data?.items?.length > 0 ? (
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
              {data?.items.map((item, index) => (
                <ItemRow key={index} {...item} />
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
        <Center mt="xl"><Pagination total={data.totalPage} value={activePage} onChange={setActivePage} /></Center>
      </>
      ) : <InfoBox shadow='0'>سفارشی یافت نشد</InfoBox>}
    </>
  )
}

function ItemRow(props) {
    return (
      <Table.Tr>
        <Table.Td>{props.id}</Table.Td>
        <Table.Td>{props.date}</Table.Td>
        <Table.Td>{props.status}</Table.Td>
        <Table.Td>{props.total}</Table.Td>
        <Table.Td ta="end">
          <Button
            radius="9999"
            component={NavLink}
            to={`/account/orders/${props.id}`}
            size="sm"
          >
            مشاهده
          </Button>
        </Table.Td>
      </Table.Tr>
    );
  }

export default Account_Orders