import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Image,
  Indicator,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Drawer,
  Stack,
  ScrollArea,
  Text,
  NumberInput,
  NumberFormatter,
  Anchor,
  Box,
  Burger,
  useMantineTheme,
  Avatar,
  ThemeIcon
} from "@mantine/core";
import Logo from "../../assets/logo.png";
import {
  IconArrowLeft,
  IconBasketHeart,
  IconChevronLeft,
  IconComet,
  IconLayoutSidebarLeftCollapse,
  IconLogout,
  IconMenu2,
  IconMenuDeep,
  IconShoppingCart,
  IconTrash,
  IconUser,
  IconUserCog,
  IconX,
} from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Search from "../search";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import MegaMenu from "../megaMenu";
import MobileMenu from "../mobileMenu";
import BottomNavigation from "../bottomNavigation";
import MobileSearch from "../mobileSearch";
import MiniCart from "../miniCart";
import { useEffect, useState, useRef } from "react";
import { useData } from "../../Libs/api";
import { setInitial, clearCart } from "../../redux/cart";
import { logout, verifyToken, verifyTokenSilent } from "../../redux/auth/authusers/auth";
import Notifications from "../notifications";
import { getNotificationNumber } from "../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberActions";

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Scroll animation states
  const [showBottomNav, setShowBottomNav] = useState(false); // Start hidden
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const {
    notificationNumber,
    loadingNotificationNumber,
    errorNotificationNumber
  } = useSelector((state) => state.notificationNumber);

  const bootstrap = useSelector((state) => state.global.bootstrap);

  const hideMiniCart = location.pathname === "/payment-statuscheck" || 
                      location.pathname === "/payment-method" || 
                      location.pathname === "/payment-info" || 
                      location.pathname === "/payment-checkstatus";
  
  const [opened, { open, close }] = useDisclosure(false);
  const mobileMenuDrawer = useDisclosure(false);
  const mobileSearchDrawer = useDisclosure(false);

  const navigate = useNavigate();

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  
  const cartItems = useSelector((state) => [...state.cart.items]); 
  
  const { data, isLoading } = useData({ url: "/cart", queryKey: [''] });

  // Scroll handler
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (!ticking.current) {
      requestAnimationFrame(() => {
        if (currentScrollY < 10) {
          // Hide at top
          setShowBottomNav(false);
        } else if (currentScrollY > lastScrollY.current + 5) {
          // Scrolling down - show bottom nav
          setShowBottomNav(true);
        } else if (currentScrollY < lastScrollY.current - 5) {
          // Scrolling up - hide bottom nav
          setShowBottomNav(false);
        }
        
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Silent token verification on component mount
  useEffect(() => {
    const verifyUserAuth = async () => {
      try {
        // Use silent version to prevent console errors
        await dispatch(verifyTokenSilent());
      } catch (error) {
        // Silently handle verification errors
        // console.debug('Silent auth verification completed');
      }
    };

    verifyUserAuth();
  }, [dispatch]);

  // Get notification number only if user is authenticated
  useEffect(() => {
    if (user && isVerified) {
      const fetchNotifications = async () => {
        try {
          await dispatch(getNotificationNumber());
        } catch (error) {
          // Silently handle notification fetch errors
          // console.debug('Notification fetch completed');
        }
      };

      fetchNotifications();
    }
  }, [dispatch, user, isVerified]);

  // Update cart when data changes
  useEffect(() => {
    if (data?.cart?.length) {
      dispatch(setInitial(data.cart));
    }
  }, [data?.cart, dispatch]); 

  const Logout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("user"); 
      
      // Clear Redux states
      dispatch(logout());
      dispatch(clearCart());
      
      // Silent re-verification to update auth state
      await dispatch(verifyTokenSilent());
      
      // Navigate to home
      navigate("/");
    } catch (error) {
      // Even if there's an error, ensure user is logged out
      // console.debug('Logout process completed');
      navigate("/");
    }
  };

  // Safe render for notification badge
  const renderNotificationBadge = () => {
    if (errorNotificationNumber || !notificationNumber) {
      return null; // Don't show badge if there's an error or no data
    }
    return (
      <Badge variant="light">
        {notificationNumber.unreadCount || 0}
      </Badge>
    );
  };

  return (
    <>
      {bootstrap?.banner && bootstrap.banner.src !== "" ? (
        <a
          className="relative z-50"
          id="header_banner"
          href={bootstrap.banner.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={bootstrap.banner.src} w="100%" h={48}/>
        </a>
      ) : null}
      
      <div className=" z-50 bg-white relative" id="header">
        <div>
          <div className="relative z-30 gap-x-4 bg-white py-4 pb-3 shadow-sm">
            <Container>
              <Flex w="100%" justify="space-between" align="center">
                <Flex align="center" gap={60}>
                  <Flex align="center" gap="sm">
                    <Anchor component={NavLink} to="/">
                      <Image
                        src={bootstrap?.logo}
                        h="auto"
                        w={{ base: "146" }}
                        fit="contain"
                      />
                    </Anchor>
                  </Flex>
                  <Box visibleFrom="md">
                    <Search />
                  </Box>
                </Flex>
                <Flex align="center" gap="md">
                  <Notifications />
                  {!hideMiniCart && <MiniCart cartItems={cartItems} />}
                  {user ? (
                    <Menu shadow="md" position="bottom-end" styles={{dropdown:{minWidth: 250,padding:"10px"}}}>
                      <MenuTarget>
                        <ActionIcon h={45} variant="light" size="xl">
                          <IconUser />
                        </ActionIcon>
                      </MenuTarget>
                      <MenuDropdown>
                        <MenuItem
                          leftSection={<Avatar size="sm" />}
                          rightSection={<IconChevronLeft size={18} />}
                          component={NavLink}
                          to="/account"
                        >
                          مشاهده پروفایل
                        </MenuItem>
                        <Menu.Divider />
                        <MenuItem
                          rightSection={<IconUserCog size={18} />}
                          component={NavLink}
                          to="/account/edit-account"
                        >
                          ویرایش
                        </MenuItem>
                        <MenuItem
                          rightSection={<IconShoppingCart size={18} />}
                          component={NavLink}
                          to="/account/orders"
                        >
                          سفارش ها
                        </MenuItem>
                        <MenuItem
                          rightSection={<IconShoppingCart size={18} />}
                          component={NavLink}
                          to="/account/wallet"
                        >
                          کیف پول 
                        </MenuItem>
                        <MenuItem
                          rightSection={renderNotificationBadge()}
                          component={NavLink}
                          to="/account/notifications"
                        >
                          پیام ها
                        </MenuItem>
                        <MenuItem
                          rightSection={<ThemeIcon size="xs" color="yellow" variant="transparent"><IconComet /></ThemeIcon>}
                          component={NavLink}
                          to="/subscription"
                        >
                          تهیه اشتراک
                        </MenuItem>
                        <MenuItem
                          color="red"
                          rightSection={<IconLogout size={18} />}
                          onClick={Logout}
                        >
                          خروج
                        </MenuItem>
                      </MenuDropdown>
                    </Menu>
                  ) : (
                    <Button h="45" variant="light" component={NavLink} to="/login">
                      ورود/ثبت‌ نام
                    </Button>
                  )}
                </Flex>
              </Flex>
              <Box visibleFrom="md">
                <MegaMenu menuItems={bootstrap?.menu?.main} />
              </Box>
              <Drawer
                opened={mobileMenuDrawer[0]}
                size="100%"
                onClose={mobileMenuDrawer[1].close}
                title={
                  <Image
                    src={bootstrap?.logo}
                    h="auto"
                    w={{ base: "146" }}
                    fit="contain"
                  />
                }
              >
                <MobileMenu toggle={mobileMenuDrawer[1].toggle} menu={bootstrap?.menu?.main} />
              </Drawer>
            </Container>
          </div>
        </div>
      </div>

      {/* Animated Bottom Navigation Wrapper */}
      <div 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          transform: `translateY(${showBottomNav ? '0px' : '100px'})`,
          transition: 'transform 0.3s ease-in-out',
          willChange: 'transform'
        }}
      >
        <BottomNavigation 
          category={mobileMenuDrawer[1].toggle} 
          basket={open} 
          search={mobileSearchDrawer[1].toggle} 
        />
      </div>
      
      <MobileSearch opened={mobileSearchDrawer[0]} close={mobileSearchDrawer[1].close} />

    </>
  );
};

export default Header;