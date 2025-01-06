import {
  Divider,
  Flex,
  Select,
  Title,
  useMantineTheme,
  ScrollArea,
  Table,
  Text,
  Button,
  LoadingOverlay,
  Center,
  Loader,
  Badge
} from "@mantine/core";
import React, { useState } from "react";
import { NavLink } from "react-router";
import { useData } from "../../../Libs/api";

function Account_Messages() {
  const { primaryColor } = useMantineTheme();
  const [sort, setSort] = useState("all");
  const {data,isLoading,isFetching} = useData({url:"/tickets" ,queryKey: ['tickets',sort],params: {sort},queryOptions:{staleTime: 60 * 1000}});
  if(isLoading) return <Center><Loader /></Center>;
  return (
    <>
      <LoadingOverlay visible={isFetching} zIndex={1000} />
      <Flex justify="space-between" align="center" mb="xl">
        <Title>تیکت ها</Title>
        <Button component={NavLink} to="/account/tickets/new">ارسال تیکت جدید</Button>
      </Flex>
      <Flex justify="end">
      <Select
          w={140}
          allowDeselect={false}
          data={[
            { label: "همه", value: "all" },
            { label: "بسته شده", value: "closed" },
            { label: "باز", value: "open" },
          ]}
          value={sort}
          onChange={(val) => setSort(val)}
        />
      </Flex>
      <ScrollArea type="auto" mt="xl">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th miw={100} c={primaryColor}>
                #
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                موضوع
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                بخش
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                وضعیت
              </Table.Th>
              <Table.Th miw={130} c={primaryColor}>
                آخرین به روز رسانی
              </Table.Th>
              <Table.Th c={primaryColor}>عملیات</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!isLoading && data ? data.map((item, index) => (
              <ItemRow key={index} {...item} />
            )) : <Table.Tr><Table.Td>پیامی وجود ندارد</Table.Td></Table.Tr>}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </>
  );
}

function ItemRow(props) {
  return (
    <Table.Tr>
      <Table.Td>
        <Text size="sm" c="blue" ta="right" component={NavLink} to={`/account/tickets/single/${props.id}`}>{props.id}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>{props.title}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="gray" size="sm" component={NavLink} to={`/account/tickets/single/${props.id}`}>
          {props.type}
        </Badge>
      </Table.Td>
      <Table.Td>
        {props.status === "closed" ? "بسته شده" : "پاسخ داده نشده"}
      </Table.Td>
      <Table.Td>{props.update}</Table.Td>
      <Table.Td>
        <Button size="xs" component={NavLink} to={`/account/tickets/single/${props.id}`} radius={999}>مشاهده</Button>
      </Table.Td>
    </Table.Tr>
  );
}

export default Account_Messages;
