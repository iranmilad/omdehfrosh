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
import { RiUserLine } from "react-icons/ri";
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
import { ChevronDown, LucideChevronDownCircle, LucideChevronDownSquare } from "lucide-react";
import ImageIcon from "../../resources/defaultImageIcon";



const isValidLogo = (logo) => {
  if (!logo) return false;
  if (Array.isArray(logo) && (logo.length === 0 || logo[0] === "")) return false;
  if (typeof logo === 'string' && logo.trim() === "") return false;
  return true;
};




const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [logoError, setLogoError] = useState(false);

  const isFastOrderPage = location.pathname.includes('/fastorder');
  const isFastEditPage = location.pathname.includes('/fastedit');

  const [showBottomNav, setShowBottomNav] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const [cartData, setCartData] = useState({ cart: [], totalPrice: 0 });
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const { notificationNumber, errorNotificationNumber } = useSelector((state) => state.notificationNumber);
  const { bootstrapData: bootstrap, loadingBootstrap } = useSelector((state) => state.bootstrap);
  const { isVerified, user, loading: authLoading } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const showCategoryMenu = useMediaQuery('(min-width: 600px)');

  const hideMiniCart = useMemo(() => (
    ["/payment-statuscheck", "/payment-method", "/payment-info", "/payment-checkstatus"].includes(location.pathname)
  ), [location.pathname]);
  
  const [opened, { open, close }] = useDisclosure(false);
  const mobileMenuDrawer = useDisclosure(false);
  const mobileSearchDrawer = useDisclosure(false);

  const navigate = useNavigate();

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
      console.error("Cart fetch error:", error);
      setCartData({ cart: [], totalPrice: 0 });
    } finally {
      setIsLoadingCart(false);
    }
  }, [dispatch]);

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
    dispatch(verifyTokenSilent());
  }, [dispatch]);

  useEffect(() => {
    if (user && isVerified) {
      dispatch(getNotificationNumber({ forceRefresh: true }));
    }
  }, [dispatch, user, isVerified]);

  useEffect(() => {
    if (user && isVerified) {
      fetchCartData();
    } else {
      setCartData({ cart: [], totalPrice: 0 });
    }
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
        <div style={{ 
          width: '100%', 
          maxWidth: '100vw', 
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1000
        }}>
          <a 
            className="relative" 
            style={{ 
              zIndex: 1000,
              display: 'block',
              width: '100%'
            }} 
            id="header_banner" 
            href={bootstrap.data.banner.link} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Image src={bootstrap.data.banner.src} w="100%" h={48} />
          </a>
        </div>
      )}
      
      <div 
        className={`${(isFastOrderPage || isFastEditPage) ? '' : 'sticky top-0'} bg-white transition-shadow duration-300 ${isSticky ? 'shadow-md' : 'shadow-sm'}`} 
        style={{ 
          zIndex: 1000,
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden'
        }} 
        id="header"
      >
        <div 
          className="relative gap-x-4 bg-white py-1 sm:py-2" 
          style={{ 
            zIndex: 1000,
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}
        >
          <Container 
            px={{ base: 'xs', sm: 'md' }}
            style={{
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <Flex 
              justify="space-between" 
              align="center" 
              gap={{ base: 4, sm: 8 }}
              style={{
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
            >
              {/* Left Flex: Logo, Search, and Categories */}
              <Flex 
                align="center" 
                gap={{ base: 4, sm: 8 }} 
                style={{ 
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden'
                }}
              >
                {/* Logo - Reduced sizes */}
                  <Box style={{ flexShrink: 0, zIndex: 1000 }} w={{ base: "40px", sm: "80px", md: "120px" }}>
                    <Anchor component={NavLink} to="/">
                      {loadingBootstrap ? (
                        <Skeleton h={{ base: 28, sm: 36, md: 42 }} w="100%" />
                      ) : isValidLogo(bootstrap?.data.logo) && !logoError ? (
                        <Image 
                          src={bootstrap?.data.logo} 
                          h={{ base: "28px", sm: "36px", md: "42px" }} 
                          w="100%" 
                          fit="contain" 
                          alt={bootstrap?.data.siteTitle || "Logo"}
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        <Flex justify="center" align="center" h={{ base: "28px", sm: "36px", md: "42px" }}>
                          <ImageIcon 
                            size={window.innerWidth < 640 ? 28 : window.innerWidth < 768 ? 36 : 42} 
                            color="#6B7280" 
                          />
                        </Flex>
                      )}
                    </Anchor>
                  </Box>

                <Flex>


                {/* Search - More flexible */}
                <Box
                  style={{
                    position: 'relative',
                    flex: 1,
                    minWidth: 0,
                    maxWidth: '100%',
                    marginRight: '20px',
                    cursor: window.innerWidth <= 768 ? 'pointer' : 'default',
                    overflow: 'visible',
                    zIndex: 1000
                  }}
                  onClick={window.innerWidth <= 768 ? mobileSearchDrawer[1].toggle : undefined}
                  tabIndex={-1}
                >
                  <Search onSearchClick={mobileSearchDrawer[1].toggle} />
                </Box>
                </Flex>

                  <Flex>

                {/* Category Menu - Shows at 600px and above */}
                {showCategoryMenu && (
                  <Box style={{ flexShrink: 0 }}>
                    <Menu shadow="md" position="bottom-end" trigger="hover" openDelay={100} closeDelay={200}
                      styles={{ dropdown: { minWidth: 192, padding: "15px", maxHeight: '500px', overflowY: 'auto', zIndex: 1001 } }}
                      >
                      <MenuTarget>
                        <Flex align="center" gap={2} dir="rtl" style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: "13px", color: "#1a1a1a", whiteSpace: 'nowrap' }}>
                            دسته‌بندی‌ها
                          </span>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#4A4A4A">
                            <path d="M7 10l5 5 5-5H7z" />
                          </svg>
                        </Flex>
                      </MenuTarget>
                      <MenuDropdown>
                        <DropDownMenu menuItems={mainMenu} />
                      </MenuDropdown>
                    </Menu>
                  </Box>
                )}
              </Flex>
              </Flex>
              
              {/* Right Flex: Notifications, User Icon, and Basket */}
              <Flex 
                gap={{ base: 6, sm: 8, md: 10 }} 
                align="center" 
                style={{ 
                  flexShrink: 0, 
                  zIndex: 1000,
                  overflow: 'visible'
                }}
              >
                <Box visibleFrom="sm"><Notifications /></Box>
                
                {authLoading ? (
                  <Button h={{ base: 34, sm: 36 }} size="sm" loading>بارگذاری...</Button>
                ) : user && isVerified ? (
                  <Menu shadow="md" position="bottom-end" styles={{ dropdown: { minWidth: 250, padding: "10px", zIndex: 1001 } }}>
                    <MenuTarget>
                      <div className="flex w-[57px] h-[42px] items-center justify-center relative grow" style={{ cursor: 'pointer' }}>
                        <div className="flex flex-col items-center">
                          <div className="flex">
                            <RiUserLine style={{ fontSize: '8px', fontWeight: '700', width: '20px', height: '24px', color: '#6E7172'}} />
                          </div>
                          <p className=" font-uiKit-normal text-uiKit-muted-foreground" style={{ 
                            fontSize: '12px',
                            lineHeight: '',
                            fontWeight: '400',
                            color: '#6E7172',
                            margin: 0
                          }}>
                            پروفایل
                          </p>
                        </div>
                        <div className="flex">
                          <svg style={{ width: '20px', height: '20px', fill: 'var(--color-icon-high-emphasis)' }} viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5H7z"/>
                          </svg>
                        </div>
                      </div>
                    </MenuTarget>
                    <MenuDropdown>
                      <MenuItem leftSection={<Avatar size="sm" />} rightSection={<IconChevronLeft size={18} />} component={NavLink} to="/account">مشاهده پروفایل</MenuItem>
                      <Menu.Divider />
                      <MenuItem rightSection={<IconUserCog size={18} />} component={NavLink} to="/account/edit-account">ویرایش</MenuItem>
                      <MenuItem rightSection={<IconShoppingCart size={18} />} component={NavLink} to="/account/orders">سفارش ها</MenuItem>
                      <MenuItem rightSection={<IconShoppingCart size={18} />} component={NavLink} to="/account/wallet">کیف پول</MenuItem>
                      <MenuItem rightSection={renderNotificationBadge()} component={NavLink} to="/account/notifications">پیام ها</MenuItem>
                      <MenuItem color="red" rightSection={<IconLogout size={18} />} onClick={Logout}>خروج</MenuItem>
                    </MenuDropdown>
                  </Menu>
                ) : (
                  <Button h={{ base: 34, sm: 36 }} px={{ base: 12, sm: 16 }} size="sm" component={NavLink} to="/login">
                    <span style={{ fontSize: '13px' }}>ورود/ثبت‌نام</span>
                  </Button>
                )}
                
                {!hideMiniCart && <Box><MiniCart cartItems={cartItems} /></Box>}
              </Flex>
            </Flex>

          <Drawer
            opened={mobileMenuDrawer[0]}
            size="100%"
            onClose={mobileMenuDrawer[1].close}
            title={
              isValidLogo(bootstrap?.data.logo) && !logoError ? (
                <Image 
                  src={bootstrap?.data.logo} 
                  h="36px" 
                  w="auto" 
                  maw="100px" 
                  fit="contain" 
                  alt={bootstrap?.data.siteTitle}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <ImageIcon size={36} color="#6B7280" />
              )
            }
            styles={{ root: { zIndex: 1001 }, inner: { zIndex: 1001 }, overlay: { zIndex: 1000 } }}
          >
            <MobileMenu toggle={mobileMenuDrawer[1].toggle} menu={mainMenu} />
          </Drawer>
          </Container>
        </div>
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
        transform: `translateY(${showBottomNav ? '0px' : '100px'})`,
        transition: 'transform 0.3s ease-in-out', willChange: 'transform'
      }}>
        <BottomNavigation category={mobileMenuDrawer[1].toggle} basket={open} search={mobileSearchDrawer[1].toggle} user={user} />
      </div>
      
      <MobileSearch 
        opened={mobileSearchDrawer[0]} 
        close={mobileSearchDrawer[1].close} 
        position="bottom"
      />
    </>
  );
};

export default Header;