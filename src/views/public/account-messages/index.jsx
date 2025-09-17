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

import { getUserTickets } from "../../../redux/usermyaccounts/usermyaccounts/getusertickets/getUserTicketsActions";
import { verifyToken } from '../../../redux/auth/authusers/auth';
import { getUserMyAccount } from '../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions';

import { useDispatch, useSelector } from "react-redux";

function Account_Messages() {
  const { primaryColor } = useMantineTheme();
  const [sort, setSort] = useState("all");
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);
  const navigate = useNavigate();

  const { isVerified, loading: authLoading, error: authError, user: userVerified } = useSelector((state) => state.auth);
  
  const dispatch = useDispatch();

  const { 
    userTickets, 
    loadingUserTickets, 
    errorUserTickets
  } = useSelector((state) => state.userTickets);

  const { 
    user
  } = useSelector(state => ({
    user: state.auth?.user
  }));

  // Initial auth check - only verify token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(verifyToken()).unwrap();
      } catch (error) {
        console.log('Auth verification failed:', error);
      } finally {
        setAuthCheckComplete(true);
      }
    };

    if (!authCheckComplete) {
      checkAuth();
    }
  }, [dispatch, authCheckComplete]);

  // Handle auth state changes after initial check
  useEffect(() => {
    // Only proceed after auth check is complete
    if (!authCheckComplete) return;

    const isAuthenticated = isVerified && userVerified;

    if (!isAuthenticated) {
      // Clear any existing timer
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }

      // Show modal first
      setLoginModalOpen(true);
      
      // Set up redirect timer
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      setRedirectTimer(timer);
    } else {
      // User is authenticated
      setLoginModalOpen(false);
      
      // Clear redirect timer if it exists
      if (redirectTimer) {
        clearTimeout(redirectTimer);
        setRedirectTimer(null);
      }
      
      // Add 1-2 second delay before dispatching other actions
      const loadDataWithDelay = async () => {
        try {
          // First get user account data
          if (user?.id) {
            await dispatch(getUserMyAccount({userId: user.id}));
          }
          
          // Add 1.5 second delay
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Then get user tickets
          await dispatch(getUserTickets());
          
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      };

      loadDataWithDelay();
    }

    // Cleanup function
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [dispatch, isVerified, userVerified, authCheckComplete, navigate, user?.id]);

  // Handle immediate redirect to login page
  const handleGoToLogin = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    navigate('/login');
  };

  // Handle modal close (if needed)
  const handleModalClose = () => {
    if (redirectTimer) {
      clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setLoginModalOpen(false);
    // Optionally redirect immediately or allow user to stay
    navigate('/login');
  };

  // Combined loading state
  const isLoadingData = loadingUserTickets;

  // Show loading while checking auth
  if (!authCheckComplete || authLoading) {
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
            <Button 
              onClick={handleGoToLogin}
              variant="filled"
            >
              رفتن به صفحه ورود
            </Button>
          </Flex>
        </Modal>
        
        {/* Show a placeholder content while modal is open */}
        <Container size="md" py="xl">
          <Center h={400}>
            <Stack align="center" gap="md">
              <Text size="xl" c="dimmed">در حال بررسی وضعیت ورود...</Text>
              <Loader size="md" />
            </Stack>
          </Center>
        </Container>
      </>
    );
  }

  // Filter tickets based on sort value
  const filteredTickets = userTickets?.userTickets?.tickets?.filter(ticket => {
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
            {!isLoadingData && filteredTickets.length > 0 ? 
              filteredTickets.map((item, index) => (
                <ItemRow key={index} {...item} />
              )) : 
              !isLoadingData && (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
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