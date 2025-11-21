import {
  ActionIcon,
  Badge,
  Button,
  Container,
  Flex,
  Image,
  Menu,
  MenuDropdown,
  MenuItem,
  MenuTarget,
  Drawer,
  Anchor,
  Box,
  useMantineTheme,
  Avatar,
  ThemeIcon,
  Skeleton
} from "@mantine/core";
import {
  IconChevronLeft,
  IconComet,
  IconLogout,
  IconShoppingCart,
  IconUser,
  IconUserCog,
  IconMenu2
} from "@tabler/icons-react";
import { data, NavLink, useLocation, useNavigate } from "react-router";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Search from "../search";
import { useDispatch, useSelector } from "react-redux";
import DropDownMenu from "../dropdownmenu";
import MobileMenu from "../mobileMenu";
import BottomNavigation from "../bottomNavigation";
import MobileSearch from "../mobileSearch";
import MiniCart from "../miniCart";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { setInitial, clearCart } from "../../redux/cart";
import { logout, verifyTokenSilent } from "../../redux/auth/authusers/auth";
import Notifications from "../notifications";
import { getNotificationNumber } from "../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberActions";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const [cartData, setCartData] = useState({ cart: [], totalPrice: 0 });
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const { notificationNumber, errorNotificationNumber } = useSelector((state) => state.notificationNumber);
  const { bootstrapData: bootstrap, loadingBootstrap } = useSelector((state) => state.bootstrap);
  const { isVerified, user } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  console.log("Headerbootstrap:", bootstrap);

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);

  const hideMiniCart = useMemo(() => (
    ["/payment-statuscheck", "/payment-method", "/payment-info", "/payment-checkstatus"].includes(location.pathname)
  ), [location.pathname]);
  
  const [opened, { open, close }] = useDisclosure(false);
  const mobileMenuDrawer = useDisclosure(false);
  const mobileSearchDrawer = useDisclosure(false);

  const navigate = useNavigate();

  // Memoized menu data to prevent unnecessary re-renders
  const mainMenu = useMemo(() => bootstrap?.data.menu?.main, [bootstrap?.data.menu?.main]);

  const fetchCartData = useCallback(async () => {
    const token = localStorage.getItem("user");
    if (!token) {
      setCartData({ cart: [], totalPrice: 0 });
      return;
    }
    setIsLoadingCart(true);
    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: { 'Authorization': `Bearer ${token}`, "Content-Type": "application/json" },        
      });
      if (!response.ok) {
        localStorage.removeItem("user");
        throw new Error("Failed to fetch cart data");
      }
      const serverData = await response.json();
      const newCartData = { cart: serverData.cart || [], totalPrice: serverData.total || 0 };
      setCartData(newCartData);
      if (newCartData.cart.length > 0) dispatch(setInitial(newCartData.cart));
    } catch (error) {
      setCartData({ cart: [], totalPrice: 0 });
    } finally {
      setIsLoadingCart(false);
    }
  }, [dispatch]);

  // Optimized scroll handler with useCallback
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const newIsSticky = currentScrollY > 0;
        let newShowBottomNav = showBottomNav;
        
        if (currentScrollY < 10) {
          newShowBottomNav = false;
        } else if (currentScrollY > lastScrollY.current + 5) {
          newShowBottomNav = true;
        } else if (currentScrollY < lastScrollY.current - 5) {
          newShowBottomNav = false;
        }
        
        // Only update state if values changed
        setIsSticky(prev => prev !== newIsSticky ? newIsSticky : prev);
        setShowBottomNav(prev => prev !== newShowBottomNav ? newShowBottomNav : prev);
        
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [showBottomNav]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    dispatch(verifyTokenSilent()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (user && isVerified) dispatch(getNotificationNumber({ forceRefresh: true }));
  }, [dispatch, user, isVerified]);

  useEffect(() => {
    if (user && isVerified) fetchCartData();
    else setCartData({ cart: [], totalPrice: 0 });
  }, [user, isVerified, fetchCartData]);

  const Logout = useCallback(async () => {
    localStorage.removeItem("user"); 
    dispatch(logout());
    dispatch(clearCart());
    setCartData({ cart: [], totalPrice: 0 });
    await dispatch(verifyTokenSilent());
    navigate("/");
  }, [dispatch, navigate]);

  const renderNotificationBadge = useCallback(() => {
    if (errorNotificationNumber || !notificationNumber) return null;
    return <Badge variant="light">{notificationNumber.unreadCount || 0}</Badge>;
  }, [errorNotificationNumber, notificationNumber]);

  return (
    <>
      {bootstrap?.data.banner?.src && (
        <a className="relative z-50" id="header_banner" href={bootstrap.data.banner.link} target="_blank" rel="noopener noreferrer">
          <Image src={bootstrap.data.banner.src} w="100%" h={48} />
        </a>
      )}
      
      <div className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${isSticky ? 'shadow-md' : 'shadow-sm'}`} id="header">
        <div className="relative z-30 gap-x-4 bg-white py-2 pb-2">
          <Container>
            <Flex w="100%" justify="space-between" align="center" gap={{ base: 'xs', sm: 'sm', md: 'md' }}>
              <Box style={{ flexShrink: 0 }} w={{ base: "80px", sm: "100px", md: "146px" }}>
                <Anchor component={NavLink} to="/">
                  {loadingBootstrap ? (
                    <Skeleton h={{ base: 36, sm: 42, md: 48 }} w="100%" />
                  ) : (
                    <Image src={bootstrap?.data.logo} h={{ base: "36px", sm: "42px", md: "48px" }} w="100%" fit="contain" alt={bootstrap?.data.siteTitle || "Logo"} />
                  )}
                </Anchor>
              </Box>
              
              {/* <Box style={{ flex: 1, minWidth: 0 }} maw={{ base: "none", md: "500px", lg: "600px" }}>
                <Search />
              </Box> */}

              <Box 
                style={{ flex: 1, minWidth: 0, cursor: 'pointer', border: '1px solid #dee2e6', borderRadius: '9999px', padding: '2px 8px' }}
                onClick={mobileSearchDrawer[1].toggle}
                // visibleFrom="base"
                // hiddenFrom="md"
              >
                <Search />
              </Box>

              <Box style={{ flex: 1 }} />

              <Flex gap={{ base: 'xs', sm: 'sm', md: 'md' }} align="center" style={{ flexShrink: 0 }}>
                <Box visibleFrom="sm">
                  <Menu shadow="md" position="bottom-end" trigger="hover" openDelay={100} closeDelay={200}
                    styles={{ dropdown: { minWidth: 192, padding: "15px", maxHeight: '500px', overflowY: 'auto' } }}
                  >
                    <MenuTarget>
                      <ActionIcon h={{ base: 40, md: 45 }} w={{ base: 40, md: 45 }} variant="light" size="xl">
                        <IconMenu2 size={18} />
                      </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                      {/* Fixed: bootstrap?.menu?.main instead of bootstrap?.data.menu?.main */}
                      <DropDownMenu menuItems={mainMenu} />
                    </MenuDropdown>
                  </Menu>
                </Box>

                <Box visibleFrom="sm"><Notifications /></Box>
                
                {user ? (
                  <Menu shadow="md" position="bottom-end" styles={{ dropdown: { minWidth: 250, padding: "10px" } }}>
                    <MenuTarget>
                      <ActionIcon h={{ base: 40, md: 45 }} w={{ base: 40, md: 45 }} variant="light" size="xl">
                        <IconUser size={18} />
                      </ActionIcon>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem leftSection={<Avatar size="sm" />} rightSection={<IconChevronLeft size={18} />} component={NavLink} to="/account">مشاهده پروفایل</MenuItem>
                      <Menu.Divider />
                      <MenuItem rightSection={<IconUserCog size={18} />} component={NavLink} to="/account/edit-account">ویرایش</MenuItem>
                      <MenuItem rightSection={<IconShoppingCart size={18} />} component={NavLink} to="/account/orders">سفارش ها</MenuItem>
                      <MenuItem rightSection={<IconShoppingCart size={18} />} component={NavLink} to="/account/wallet">کیف پول</MenuItem>
                      <MenuItem rightSection={renderNotificationBadge()} component={NavLink} to="/account/notifications">پیام ها</MenuItem>
                      <MenuItem rightSection={<ThemeIcon size="xs" color="yellow" variant="transparent"><IconComet /></ThemeIcon>} component={NavLink} to="/subscription">تهیه اشتراک</MenuItem>
                      <MenuItem color="red" rightSection={<IconLogout size={18} />} onClick={Logout}>خروج</MenuItem>
                    </MenuDropdown>
                  </Menu>
                ) : (
                  <Button h="39" w="113" component={NavLink} to="/login">ورود/ثبت‌نام</Button>
                )}
                
                {!hideMiniCart && <Box><MiniCart cartItems={cartItems} /></Box>}
              </Flex>
            </Flex>

            <Drawer
              opened={mobileMenuDrawer[0]}
              size="100%"
              onClose={mobileMenuDrawer[1].close}
              title={<Image src={bootstrap?.data.logo} h="40px" w="auto" maw="120px" fit="contain" alt={bootstrap?.data.siteTitle} />}
            >
              {/* Fixed: bootstrap?.menu?.main instead of bootstrap?.data.menu?.main */}
              <MobileMenu toggle={mobileMenuDrawer[1].toggle} menu={mainMenu} />
            </Drawer>
          </Container>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
        transform: `translateY(${showBottomNav ? '0px' : '100px'})`,
        transition: 'transform 0.3s ease-in-out', willChange: 'transform'
      }}>
        <BottomNavigation category={mobileMenuDrawer[1].toggle} basket={open} search={mobileSearchDrawer[1].toggle} user={user} />
      </div>
      
      <MobileSearch opened={mobileSearchDrawer[0]} close={mobileSearchDrawer[1].close} />
    </>
  );
};

export default Header;