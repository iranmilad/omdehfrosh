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
  Badge,
  Modal,
  Container,
  Center,
  Stack
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import { useDispatch, useSelector } from "react-redux";
import { useSessionQuery } from "../../../Libs/reactQuery";

function Account_Messages() {
  const { primaryColor } = useMantineTheme();
  const [sort, setSort] = useState("all");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const { isVerified, loading: authLoading, user: userVerified } = useSelector((state) => state.auth);

  const { data: ticketsData, isLoading: loadingUserTickets } = useSessionQuery({
    endpoint: "/user-myaccounts/user-tickets",
    queryKey: ["userTickets"],
    enabled: !!token,
    queryOptions: { refetchOnMount: true },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const userTickets = ticketsData?.data ?? ticketsData ?? {};

  useEffect(() => {
    if (!authLoading && (!isVerified || !userVerified)) {
      setLoginModalOpen(true);
      const timer = setTimeout(() => navigate("/login"), 3000);
      setRedirectTimer(timer);
      return () => clearTimeout(timer);
    }
    setLoginModalOpen(false);
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
  }, [isVerified, userVerified?.id, authLoading, navigate]);

  const handleGoToLogin = () => {
    if (redirectTimer) clearTimeout(redirectTimer);
    navigate("/login");
  };

  const handleModalClose = () => {
    if (redirectTimer) clearTimeout(redirectTimer);
    setLoginModalOpen(false);
    navigate("/login");
  };

  const isLoadingData = loadingUserTickets;

  if (authLoading) {
    return (
      <Container size="md" py="xl">
        <Center>
          <Stack align="center" spacing="md">
            <Loader size="lg" />
            <Title order={3}>در حال بررسی وضعیت ورود...</Title>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Show modal and placeholder if not authenticated
  if (!isVerified || !userVerified) {
    return (
      <>
        <Modal
          opened={loginModalOpen}
          onClose={handleModalClose}
          closeOnClickOutside={false}
          closeOnEscape={false}
          removeScrollProps={{ removeScrollBar: false }}
          withCloseButton={true}
          title="ورود به حساب کاربری"
          centered
          overlayProps={{
            backgroundOpacity: 0.6,
            blur: 3,
          }}
        >
          <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
          <Text size="sm" c="dimmed" mb="md">
            در حال انتقال به صفحه ورود در 3 ثانیه...
          </Text>
          <Flex gap="sm" justify="flex-end">
            <Button onClick={handleGoToLogin} variant="filled">
              رفتن به صفحه ورود
            </Button>
          </Flex>
        </Modal>

        {/* Show a placeholder content while modal is open */}
        <Container size="md" py="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">
                در حال بررسی وضعیت ورود...
              </Text>
              <Loader size="md" />
            </Stack>
          </Center>
        </Container>
      </>
    );
  }

  const ticketsList = userTickets?.userTickets?.tickets ?? userTickets?.tickets ?? [];
  const filteredTickets = ticketsList.filter(ticket => {
    if (sort === "all") return true;
    if (sort === "closed") return ticket.ticketStatus === "closed";
    if (sort === "open") return ticket.ticketStatus !== "closed";
    return true;
  }) || [];

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
              در حال بارگذاری تیکت‌ها...
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
        <Table highlightOnHover style={{ direction: 'rtl' }}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th miw={100} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl', whiteSpace: 'nowrap' }}>
                کد تیکت
              </Table.Th>
              <Table.Th miw={100} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl' }}>
                موضوع
              </Table.Th>
              <Table.Th miw={100} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl', whiteSpace: 'nowrap' }}>
                بخش
              </Table.Th>
              <Table.Th miw={100} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl', whiteSpace: 'nowrap' }}>
                وضعیت
              </Table.Th>
              <Table.Th miw={130} c={primaryColor} style={{ textAlign: 'right', direction: 'rtl', whiteSpace: 'nowrap' }}>
                آخرین به روز رسانی
              </Table.Th>
              <Table.Th c={primaryColor} style={{ textAlign: 'right', direction: 'rtl', whiteSpace: 'nowrap' }}>عملیات</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {!isLoadingData && filteredTickets.length > 0 ? 
              filteredTickets.map((item, index) => (
                <ItemRow key={index} {...item} />
              )) : 
              !isLoadingData && (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center', direction: 'rtl' }}>
                    <Text c="dimmed">
                      {sort === "all" ? "تیکتی وجود ندارد" : 
                       sort === "closed" ? "تیکت بسته شده‌ای وجود ندارد" :
                       "تیکت باز شده‌ای وجود ندارد"}
                    </Text>
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
      <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
        <Text size="sm" c="blue" component={NavLink} to={`/account/tickets/single/${props.ticketId}`}>
          {props.ticketId}
        </Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
        <Text size="sm" lineClamp={2}>{props.ticketTitle}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
        <Badge color="gray" size="sm" component={NavLink} to={`/account/tickets/single/${props.ticketId}`}>
          {props.teamName}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>
        {props.ticketStatus === "closed" ? "بسته شده" : "پاسخ داده نشده"}
      </Table.Td>
      <Table.Td style={{ textAlign: 'right', direction: 'rtl' }}>{props.updatedAt}</Table.Td>
      <Table.Td style={{ textAlign: 'center', direction: 'rtl' }}>
        <Button size="xs" component={NavLink} to={`/account/tickets/single/${props.ticketId}`} radius={999}>
          مشاهده
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}

export default Account_Messages;