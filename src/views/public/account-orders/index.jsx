import React from 'react'
import { Table,Title,ScrollArea,Button, useMantineTheme} from '@mantine/core'
import { NavLink } from 'react-router';

function Account_Orders() {
    const {primaryColor} = useMantineTheme();
    const rows = [
        {
          id: "1234",
          date: "1403/12/12",
          status: "درحال بررسی",
          total: "12,000,000",
        },
        {
          id: "1234",
          date: "1403/12/12",
          status: "درحال بررسی",
          total: "12,000,000",
        },
      ];
  return (
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
                    {rows.map((item, index) => (
                      <ItemRow key={index} {...item} />
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
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