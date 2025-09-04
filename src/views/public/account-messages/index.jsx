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
  Overlay,
  Box,
  Loader,
  Badge
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";

import { getUserTickets } from "../../../redux/usermyaccounts/usermyaccounts/getusertickets/getUserTicketsActions";

import { useDispatch, useSelector } from "react-redux";


function Account_Messages() {
  const { primaryColor } = useMantineTheme();
  const [sort, setSort] = useState("all");


  
  const dispatch = useDispatch()

  const { 
    userTickets, 
    loadingUserTickets, 
    errorUserTickets
  } = useSelector((state) => state.userTickets);

  useEffect(() => {
    dispatch(getUserTickets())
  }, [dispatch])

  // Combined loading state
  const isLoadingData = loadingUserTickets;

  return (
    <>
      {/* Unified Loading Overlay */}
      {isLoadingData && (
        <Overlay
          color="#000"
          backgroundOpacity={0.6}
          blur={2}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              minWidth: '220px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Loader size="lg" color="blue" />
            <Text size="md" mt="lg" c="dimmed" weight={500}>
              در حال بارگذاری...
            </Text>
          </Box>
        </Overlay>
      )}

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
            {!isLoadingData && userTickets?.userTickets?.tickets ? 
              userTickets.userTickets.tickets.map((item, index) => (
                <ItemRow key={index} {...item} />
              )) : 
              !isLoadingData && (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                    <Text c="dimmed">پیامی وجود ندارد</Text>
                  </Table.Td>
                </Table.Tr>
              )
            }
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
        <Text size="sm" c="blue" ta="right" component={NavLink} to={`/account/tickets/single/${props.ticketId}`}>
          {props.ticketId}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={2}>{props.ticketTitle}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color="gray" size="sm" component={NavLink} to={`/account/tickets/single/${props.ticketId}`}>
          {props.teamName}
        </Badge>
      </Table.Td>
      <Table.Td>
        {props.ticketStatus === "closed" ? "بسته شده" : "پاسخ داده نشده"}
      </Table.Td>
      <Table.Td>{props.updatedAt}</Table.Td>
      <Table.Td>
        <Button size="xs" component={NavLink} to={`/account/tickets/single/${props.ticketId}`} radius={999}>
          مشاهده
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}

export default Account_Messages;