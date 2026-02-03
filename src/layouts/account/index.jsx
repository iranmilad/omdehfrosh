import {
  Anchor,
  Avatar,
  Badge,
  Center,
  Flex,
  Grid,
  GridCol,
  Paper,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconBasket,
  IconBell,
  IconHeart,
  IconInfoCircle,
  IconLayout,
  IconLogout,
  IconMessage2,
  IconPencil,
  IconSwitch3,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, Outlet, NavLink, useNavigate } from "react-router";
import NavItem from "./navitem";
import { useSelector } from "react-redux";
import { useSessionQuery } from "../../Libs/reactQuery";
import { CiWallet } from "react-icons/ci";


const navigations = [
  {
    label: "پیشخوان",
    url: "/account",
    icon: <IconLayout size={16} />,
    links: "/",
  },
  {
    label: "سفارش ها",
    url: "/account/orders",
    icon: <IconBasket size={16} />,
    links: "orders",
  },
  {
    label: "کیف پول",
    url: "/account/wallet",
    icon: <CiWallet size={16} />,
    links: "wallet",
  },
  {
    label: "جزئیات حساب",
    url: "/account/edit-account",
    icon: <IconUser size={16} />,
    links: "edit-account",
  },
  {
    label: "پیام ها",
    url: "/account/notifications",
    icon: <IconBell size={16} />,
    links: "notifications",
  },
  {
    label: "تیکت ها",
    url: "/account/tickets",
    icon: <IconMessage2 size={16} />,
    links: "tickets",
  },
  {
    label: "علاقه‌مندی ها",
    url: "/account/favorites",
    icon: <IconHeart size={16} />,
    links: "favorites",
  },
  // {
  //   label: "مقایسه ها",
  //   url: "/compare",
  //   icon: <IconSwitch3 size={16} />,
  //   links: "compares",
  // },
  {
    label: "خروج",
    url: "/logout",
    icon: <IconLogout size={16} />,
    links: "logout",
  },
];

const Account = () => {
  const [route, setRoute] = useState("/");
  const location = useLocation();
  const navigate = useNavigate();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  // Use React Query cache for user-myaccounts (shared with account-index, wallet, etc.)
  // Invalidated when account is edited or wallet changes
  const { data: userAccountData } = useSessionQuery({
    endpoint: "/user-myaccounts",
    queryKey: ["userMyAccount"],
    enabled: !!token && !!user,
    queryOptions: { refetchOnMount: false },
    retry: (failureCount, err) => {
      const msg = typeof err === "string" ? err : err?.message || String(err);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const userAccount = userAccountData?.data ?? userAccountData;

  useEffect(() => {
    // حذف /account از مسیر
    let currentRoute =
      location.pathname.replace("/account", "").split("/")[1] || "/";
    setRoute(currentRoute);
  }, [location.pathname]);  


 

  useEffect(() => {
    if (!user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]); // Depend on user and authLoading
  



  return (
    <Grid>
      <GridCol span={{ lg: 3 }}>
        <Stack>
          <Paper>
            <Center>
              <Avatar size="lg" />
            </Center>
            {userAccount ? (
              <Flex justify="space-between" align="center" mt="xl" mb="sm">
                <Anchor
                  size="sm"
                  display="flex"
                  style={{ alignItems: "center" }}
                  underline="never"
                  component={NavLink}
                  to="/account/edit-account"
                >
                  <IconPencil style={{ marginLeft: 10 }} size={14} />{" "}
                  {userAccount.name} {userAccount.family}
                </Anchor>
                <Badge>{userAccount.userType}</Badge>
              </Flex>
            ) : (
              <Flex align="center" justify="space-between" mt="xl" mb="sm">
                <Skeleton h={25} w={170} />
                <Skeleton h={25} w={100} />
              </Flex>
            )}
          </Paper>
          <Paper>
            <Stack gap="xs">
              {navigations.map((item, index) => {
                // بررسی اینکه آیا مسیر فعلی در آرایه links وجود دارد
                const isActive = item.links === route;
                return <NavItem key={index} activeItem={isActive} {...item} />;
              })}
            </Stack>
          </Paper>
        </Stack>
      </GridCol>
      <GridCol span={{ lg: 9 }}>
        <Paper pos="relative" p="25">
          <Outlet />
        </Paper>
      </GridCol>
    </Grid>
  );
};

export default Account;
