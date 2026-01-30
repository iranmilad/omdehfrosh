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
import { logout, setAuthFromUserInitialData } from "../../redux/auth/authusers/auth";
import Notifications from "../notifications";
import { getNotificationNumber } from "../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberActions";
import { updateNotificationCount } from "../../redux/usermyaccounts/usermyaccounts/notifications/getnotificationnumber/getNotificationNumberSlice";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import { ChevronDown, ChevronLeft, LucideChevronDownCircle, LucideChevronDownSquare, MessageCircle } from "lucide-react";
import ImageIcon from "../../resources/defaultImageIcon";
import { useStaticQuery, useSessionQuery, useQueryClient } from "../../Libs/reactQuery";



const isValidLogo = (logo) => {
  if (!logo) return false;
  if (Array.isArray(logo) && (logo.length === 0 || logo[0] === "")) return false;
  if (typeof logo === 'string' && logo.trim() === "") return false;
  return true;
};

const ChevronDownIcon = ({ size = 14, color = '#4D5053' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6 9l6 6 6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


const ProfileIcon = ({ style, size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 24"
    width={size}
    height={size}
    fill="currentColor"     // ← REQUIRED
    style={style}           // ← REQUIRED
  >
    <path d="M18.417 19.731c0-.859-.338-1.83-1.184-2.591-.844-.761-2.262-1.374-4.524-1.374s-3.68.616-4.524 1.381C7.338 17.914 7 18.891 7 19.75a.75.75 0 0 1-1.5 0c0-1.25.494-2.64 1.678-3.714 1.186-1.075 2.997-1.77 5.531-1.77 2.532 0 4.342.69 5.528 1.76 1.185 1.068 1.68 2.455 1.68 3.705a.75.75 0 0 1-1.5 0M16.084 7.876a3.375 3.375 0 1 0-6.75-.001 3.375 3.375 0 0 0 6.75.001m1.5 0a4.875 4.875 0 1 1-9.75 0 4.875 4.875 0 0 1 9.75 0" />
  </svg>
);



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
  
  // Initialize scroll position on mount
  useEffect(() => {
    const initialScrollY = window.scrollY;
    lastScrollY.current = initialScrollY;
    // Show bottom nav if already scrolled down on page load
    if (initialScrollY > 5) {
      setShowBottomNav(true);
    }
  }, []);

  const [cartData, setCartData] = useState({ cart: [], totalPrice: 0 });
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const { notificationNumber, errorNotificationNumber } = useSelector((state) => state.notificationNumber);
  const { isVerified, user, loading: authLoading } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);

  // Bootstrap data via React Query (static strategy with persistence)
  // Keep same shape as old Redux: { message, data: {...} }
  const { data: bootstrap, loading: loadingBootstrap } = useStaticQuery({
    endpoint: '/bootstrap',
    queryKey: ['bootstrap'],
    transformer: (response) => response?.data ?? null,
  });

  const theme = useMantineTheme();
  const isSmallScreen = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const showCategoryMenu = useMediaQuery('(min-width: 600px)');
  const queryClient = useQueryClient();

  // User initial data (user + cart + notifications) with session-level caching + persistence
  const token = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const {
    data: userInitialData,
    error: userInitialError,
    refetch: refetchUserInitialData,
    isLoading: isLoadingUserData,
    isFetching: isFetchingUserData,
  } = useSessionQuery({
    endpoint: '/auth/user-initial-data',
    queryKey: ['userInitialData'],
    enabled: !!token, // Only fetch if token exists
    // Don't retry on 401 errors (token invalid/expired)
    retry: (failureCount, error) => {
      const errorMessage = typeof error === 'string' ? error : error?.message || String(error);
      if (errorMessage.includes('401')) {
        return false; // Don't retry on 401
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });

  const hideMiniCart = useMemo(() => (
    ["/payment-statuscheck", "/payment-method", "/payment-info", "/payment-checkstatus"].includes(location.pathname)
  ), [location.pathname]);
  
  const [opened, { open, close }] = useDisclosure(false);
  const mobileMenuDrawer = useDisclosure(false);
  const mobileSearchDrawer = useDisclosure(false);

  const navigate = useNavigate();

  const mainMenu = useMemo(
    () => bootstrap?.data?.menu?.main ?? [],
    [bootstrap?.data?.menu?.main]
  );

  // Sync cached user initial data into Redux cart + notifications when it changes
  useEffect(() => {
    if (!userInitialData) {
      // If no data and no token, clear everything
      if (!token) {
        setCartData({ cart: [], totalPrice: 0 });
        dispatch(setInitial([]));
        dispatch(updateNotificationCount(0));
        // Also clear user from Redux if it's still there
        if (user) {
          dispatch(logout());
        }
      }
      return;
    }

    // Also sync auth state (so Header shows profile after login)
    if (userInitialData.user) {
      dispatch(setAuthFromUserInitialData(userInitialData));
    }

    const newCartData = {
      cart: userInitialData.cart || [],
      totalPrice: userInitialData.total || 0,
    };

    setCartData(newCartData);
    dispatch(setInitial(newCartData.cart));
    dispatch(updateNotificationCount(userInitialData.notificationsCount || 0));
  }, [userInitialData, token, dispatch, user]);

  // Handle 401 / unauthorized: clear token, redux state, and remove cached query
  useEffect(() => {
    if (!userInitialError) return;

    const errorMessage =
      typeof userInitialError === 'string'
        ? userInitialError
        : userInitialError?.message || String(userInitialError);

    if (!errorMessage.includes('401')) return;

    // Clear token first to disable the query
    localStorage.removeItem("user");
    
    // Clear Redux state
    dispatch(logout());
    dispatch(clearCart());
    dispatch(setInitial([]));
    dispatch(updateNotificationCount(0));
    
    // Remove query from cache (don't invalidate - that would trigger refetch)
    queryClient.removeQueries({ queryKey: ['userInitialData'] });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Header] 🔒 401 detected - cleared token and userInitialData cache');
    }
  }, [userInitialError, dispatch, queryClient]);

  const handleScroll = useCallback(() => {
    // Get scroll position from window or document
    const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (!ticking.current) {
      requestAnimationFrame(() => {
        const newIsSticky = currentScrollY > 0;
        let newShowBottomNav = showBottomNav; // Keep current state by default
        
        // Hide nav only when at the very top
        if (currentScrollY < 5) {
          newShowBottomNav = false;
        } else if (currentScrollY > lastScrollY.current + 5) {
          // Scrolling down - show bottom nav, hide header
          newShowBottomNav = true;
        } else if (currentScrollY < lastScrollY.current - 5) {
          // Scrolling up - hide bottom nav, show header
          newShowBottomNav = false;
        }
        
        setIsSticky(prev => prev !== newIsSticky ? newIsSticky : prev);
        setShowBottomNav(newShowBottomNav);
        
        lastScrollY.current = currentScrollY;
        ticking.current = false;
      });
      ticking.current = true;
    }
  }, [showBottomNav]);

  useEffect(() => {
    // Listen to scroll on window (primary)
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    // Also listen on document for better compatibility
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    // Listen on document.body as well
    document.body.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    // Also check scroll position periodically to catch any missed events
    const intervalId = setInterval(() => {
      const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (Math.abs(currentScrollY - lastScrollY.current) > 2) {
        handleScroll();
      }
    }, 150);
    
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
      document.body.removeEventListener('scroll', handleScroll, { capture: true });
      clearInterval(intervalId);
    };
  }, [handleScroll]);

  // Refetch user initial data when navigating to /cart routes or returning from payment
  const prevLocationRef = useRef(location.pathname);
  useEffect(() => {
    const prevPath = prevLocationRef.current;
    const currentPath = location.pathname;

    // Refetch if navigating to /cart routes
    const isCartRoute = currentPath.startsWith('/cart') || currentPath.startsWith('/basket');
    const wasCartRoute = prevPath.startsWith('/cart') || prevPath.startsWith('/basket');

    // Refetch if we just left the payment-listener page
    const leftPaymentListener = prevPath === '/payment-listener' && currentPath !== '/payment-listener';

    if ((isCartRoute && !wasCartRoute) || leftPaymentListener) {
      if (token) {
        refetchUserInitialData();
      }
    }

    prevLocationRef.current = currentPath;
  }, [location.pathname, token, refetchUserInitialData]);

  const Logout = useCallback(async () => {
    // Clear token first
    localStorage.removeItem("user");
    
    // Clear Redux state
    dispatch(logout());
    dispatch(clearCart());
    setCartData({ cart: [], totalPrice: 0 });
    dispatch(updateNotificationCount(0));
    
    // Remove the userInitialData query from cache to force immediate UI update
    queryClient.removeQueries({ queryKey: ['userInitialData'] });
    
    // Navigate to home
    navigate("/");
  }, [dispatch, navigate, queryClient]);

  // Determine if we should show loading state
  // Only show loading if:
  // 1. We have a token (user should be logged in)
  // 2. We're actually fetching data (isLoadingUserData or isFetchingUserData)
  // 3. We don't have user data yet
  const shouldShowLoading = !!token && (isLoadingUserData || isFetchingUserData) && !user;

  console.log("Header render:", { 
    isVerified, 
    user, 
    cartData, 
    token: !!token,
    isLoadingUserData,
    isFetchingUserData,
    shouldShowLoading,
    authLoading 
  });

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
        className={`${(isFastOrderPage || isFastEditPage) ? '' : 'fixed top-0 left-0 right-0'} bg-white transition-shadow duration-300 ${isSticky ? 'shadow-md' : 'shadow-sm'}`} 
        style={{ 
          zIndex: 1000,
          width: '100%',
          maxWidth: '100vw',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          transform: isSmallScreen && showBottomNav ? 'translateY(-100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out'
        }} 
        id="header"
      >
        <Box
          px={{ base: 'xs', sm: 'md' }}
          style={{
            width: '100%',
            maxWidth: '1336px',
            margin: '0 auto'
          }}
        >
            <Flex 
              justify="space-between" 
              align="center" 
              gap={{ base: 4, sm: 8 }}
              style={{
                width: '100%',
                maxWidth: '100%'
              }}
            >
              {/* Left Flex: Logo, Search, and Categories */}
              <Flex 
                align="center" 
                gap={{ base: 4, sm: 8 }} 
                style={{ 
                  minWidth: 0,
                  flex: 1
                }}
              >
                {/* Logo - Reduced sizes */}
                  <Box visibleFrom="md" style={{ flexShrink: 0, zIndex: 1000 }} w={{ base: "40px", sm: "80px", md: "120px" }}>
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
                    marginRight: '8px',
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
                  <Box style={{ flexShrink: 0, pointerEvents: (isSmallScreen && showBottomNav) ? 'none' : 'auto' }}>
                    <Menu 
                      shadow="md" 
                      position="bottom-start" 
                      trigger={isSmallScreen ? "click" : "hover"}
                      openDelay={100} 
                      closeDelay={200}
                      offset={38}
                      withinPortal={true}
                      disabled={isSmallScreen && showBottomNav}
                      closeOnClickOutside={true}
                      styles={{ 
                        dropdown: { 
                          minWidth: 192, 
                          padding: "8px", 
                          maxHeight: '500px', 
                          overflowY: 'auto', 
                          zIndex: 1002
                        } 
                      }}
                      >
                      <MenuTarget>
                        <Flex align="center" gap={2} dir="rtl" style={{ cursor: 'pointer' }}>
                          <span style={{ fontSize: "14px", color: "#1a1b1c", whiteSpace: 'nowrap', marginRight: '8px' }}>
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
                gap={{ base: 4, sm: 24, md: 24 }}
                align="flex-end"
                style={{
                  flexShrink: 0,
                  zIndex: 1000,
                  overflow: 'visible'
                }}
              >
                <Box visibleFrom="sm"><Notifications /></Box>

                {/* Fixed loading state logic */}
                {shouldShowLoading ? (
                  <Button h={{ base: 34, sm: 36 }} size="sm" loading>بارگذاری...</Button>
                ) : user && isVerified ? (
                    <Menu
                      shadow="sm"
                      position="bottom-end"
                      styles={{
                        dropdown: {
                          minWidth: 200,
                          padding: 0,
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          zIndex: 1001
                        },
                        item: {
                          padding: '12px 16px',
                          fontSize: '14px',
                          fontWeight: 400,
                          borderBottom: '1px solid #f3f4f6',
                          '&:last-child': {
                            borderBottom: 'none'
                          },
                          '&:hover': {
                            backgroundColor: '#f9fafb'
                          }
                        },
                        itemSection: {
                          marginLeft: 0,
                          marginRight: 0
                        }
                      }}
                    >
                      <MenuTarget>
                        <div style={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          minWidth: '50px',
                          height: '42px',
                          gap: '4px'
                        }}>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '42px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px' }}>
                              <ProfileIcon style={{ width: 24, height: 24, color: '#4D5053' }} />
                              
                            </div>
                            <p style={{
                              fontSize: '12px',
                              fontWeight: '400',
                              color: '#6E7172',
                              margin: 0,
                              lineHeight: 1.2,
                              marginTop: '2px',
                              textAlign: 'center',
                              width: '100%'
                            }}>
                              پروفایل
                            </p>
                          </div>
                          <svg style={{ 
                            width: '14px', 
                            height: '14px',
                            fill: '#4d5053'
                          }} viewBox="0 0 24 24">
                            <path d="M6.5 9.5l5.5 5.5 5.5-5.5" fill="#4d5053" stroke="#4D5053" strokeWidth="2"/>
                          </svg>
                        </div>
                      </MenuTarget>
                      <MenuDropdown>
                        {/* Header with name and view profile link */}
                        <Box px={16} py={12} w={242} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                            {user?.full_name || user?.name || 'کاربر'}
                          </div>
                          <Anchor 
                            component={NavLink} 
                            to="/account"
                            style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                          >
                            مشاهده حساب کاربری 
                          
<ChevronLeft size={14} style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle', color: '#4D5053' }} />

                          </Anchor>
                        </Box>

                        {/* Menu Items */}
                        <MenuItem 
                          component={NavLink} 
                          to="/account/orders"
                            leftSection={
                              <Box ml={6}>
                                <IconShoppingCart size={18} color="#6b7280" />
                              </Box>
                            }
                        >
                          سفارش‌های من
                        </MenuItem>

                         <MenuItem 
                          component={NavLink} 
                          to="/account/notifications"
                          leftSection={
                          <Box ml={6}>
                            <MessageCircle size={18} color="#6b7280" />
                              </Box>
                          }
                        >
                          پیام‌ها
                        </MenuItem>

                        <MenuItem 
                          component={NavLink} 
                          to="/account/favorites"
                          leftSection={
                              <Box ml={6}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                            </svg>
                              </Box>
                            }
                        >
                           علاقه مندی‌ها
                        </MenuItem> 

                        <MenuItem 
                          component={NavLink} 
                          to="/account/edit-account"
                          leftSection={
                              <Box ml={6}>
                                <IconUserCog size={18} style={{ color: '#6b7280' }} />
                              </Box>
                          }
                        >
                          اطلاعات کاربر
                        </MenuItem>

                        <MenuItem 
                          onClick={Logout}
                          style={{ color: '#ef4444' }}
                          leftSection={
                              <Box ml={6}>
                                <IconLogout size={18} style={{ color: '#ef4444' }} />
                              </Box>
                          }
                        >
                          خروج از حساب کاربری
                        </MenuItem>
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
        </Box>
      </div>

      <Box
        hiddenFrom="md"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          transform: `translateY(${showBottomNav ? '0px' : '100px'})`,
          transition: 'transform 0.3s ease-in-out', willChange: 'transform',
          pointerEvents: showBottomNav ? 'auto' : 'none'
        }}
      >
        <BottomNavigation category={mobileMenuDrawer[1].toggle} basket={open} search={mobileSearchDrawer[1].toggle} user={user} />
      </Box>
      
      <MobileSearch 
        opened={mobileSearchDrawer[0]} 
        close={mobileSearchDrawer[1].close} 
        position="bottom"
      />
    </>
  );
};

export default Header;