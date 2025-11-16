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
  ThemeIcon
} from "@mantine/core";
import {
  IconChevronLeft,
  IconComet,
  IconLogout,
  IconShoppingCart,
  IconUser,
  IconUserCog,
} from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import Search from "../search";
import { useDispatch, useSelector } from "react-redux";
import MegaMenu from "../megaMenu";
import MobileMenu from "../mobileMenu";
import BottomNavigation from "../bottomNavigation";
import MobileSearch from "../mobileSearch";
import MiniCart from "../miniCart";
import { useEffect, useState, useRef } from "react";
import { setInitial, clearCart } from "../../redux/cart";
import { logout, verifyTokenSilent } from "../../redux/auth/authusers/auth";
import Notifications from "../notifications";
import { getNotificationNumber } from "../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberActions";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Scroll animation states
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Cart data state
  const [cartData, setCartData] = useState({ cart: [], totalPrice: 0 });
  const [isLoadingCart, setIsLoadingCart] = useState(false);

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

  // Cart API function
  const fetchCartData = async () => {
    const token = localStorage.getItem("user");
    
    if (!token) {
      setCartData({ cart: [], totalPrice: 0 });
      return;
    }

    setIsLoadingCart(true);
    
    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: new Headers({
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        }),        
      });

      if (!response.ok) {
        localStorage.removeItem("user");
        throw new Error("Failed to fetch cart data");
      }

      const serverData = await response.json();
      
      const newCartData = {
        cart: serverData.cart || [],
        totalPrice: serverData.total || 0
      };
      
      setCartData(newCartData);
      
      if (newCartData.cart.length > 0) {
        dispatch(setInitial(newCartData.cart));
      }
      
    } catch (error) {
      console.warn('Failed to fetch cart data:', error.message);
      setCartData({ cart: [], totalPrice: 0 });
    } finally {
      setIsLoadingCart(false);
    }
  };

  // Scroll handler
  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    if (!ticking.current) {
      requestAnimationFrame(() => {
        // Update sticky shadow state
        setIsSticky(currentScrollY > 0);
        
        if (currentScrollY < 10) {
          setShowBottomNav(false);
        } else if (currentScrollY > lastScrollY.current + 5) {
          setShowBottomNav(true);
        } else if (currentScrollY < lastScrollY.current - 5) {
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
        await dispatch(verifyTokenSilent());
      } catch (error) {
        // Silently handle verification errors
      }
    };

    verifyUserAuth();
  }, [dispatch]);

  // Get notification number - force refresh every time
  useEffect(() => {
    if (user && isVerified) {
      console.log('Fetching notifications with force refresh');
      dispatch(getNotificationNumber({ forceRefresh: true }));
    }
  }, [dispatch, user, isVerified]);

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (user && isVerified) {
      fetchCartData();
    } else {
      setCartData({ cart: [], totalPrice: 0 });
    }
  }, [user, isVerified, dispatch]);

  const Logout = async () => {
    try {
      localStorage.removeItem("user"); 
      dispatch(logout());
      dispatch(clearCart());
      setCartData({ cart: [], totalPrice: 0 });
      await dispatch(verifyTokenSilent());
      navigate("/");
    } catch (error) {
      navigate("/");
    }
  };

  // Safe render for notification badge
  const renderNotificationBadge = () => {
    if (errorNotificationNumber || !notificationNumber) {
      return null;
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
      
      <div 
        className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
          isSticky ? 'shadow-md' : 'shadow-sm'
        }`} 
        id="header"
      >
        <div>
          <div className="relative z-30 gap-x-4 bg-white py-4 pb-2">
            <Container>
              <Flex w="100%" justify="space-between" align="center" gap={{ base: 'xs', sm: 'sm', md: 'md' }}>
                {/* Logo Section - Fixed width */}
                <Box
                  style={{ flexShrink: 0 }}
                  w={{ base: "80px", sm: "100px", md: "146px" }}
                >
                  <Anchor component={NavLink} to="/">
                    <Image
                      src={bootstrap?.logo}
                      h={{ base: "36px", sm: "42px", md: "48px" }}
                      w="100%"
                      fit="contain"
                    />
                  </Anchor>
                </Box>
                
                {/* Search Section - Flexible width */}
                <Box 
                  style={{ 
                    flex: 1,
                    minWidth: 0,
                  }}
                  maw={{ base: "none", md: "500px", lg: "600px" }}
                >
                  <Search />
                </Box>

                {/* Actions Section - Fixed width */}
                <Flex 
                  gap={{ base: 'xs', sm: 'sm', md: 'md' }}
                  align="center"
                  style={{ flexShrink: 0 }}
                  w={{ base: "auto", md: "auto" }}
                >
                  <Box hiddenFrom="sm">
                    <Notifications compact />
                  </Box>
                  
                  <Box visibleFrom="sm">
                    <Notifications />
                  </Box>
                  
                  {user ? (
                    <Menu shadow="md" position="bottom-end" styles={{dropdown:{minWidth: 250,padding:"10px"}}}>
                      <MenuTarget>
                        <ActionIcon 
                          h={{ base: 40, md: 45 }} 
                          w={{ base: 40, md: 45 }}
                          variant="light" 
                          size="xl"
                        >
                          <IconUser size={18} />
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
                    <Button h="39" w="113" component={NavLink} to="/login" visibleFrom="sm">
                      ورود/ثبت‌نام
                    </Button>
                  )}
                  {!hideMiniCart && <MiniCart cartItems={cartItems} />}
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
                    h="40px"
                    w="auto"
                    maw="120px"
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