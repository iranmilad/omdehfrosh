import {
  Grid,
  Title,
  GridCol,
  Text,
  Stack,
  Button,
  Stepper,
  Center,
  Loader,
  Alert,
  LoadingOverlay,
  Group,
  ThemeIcon,
  Container,
  Paper,
  Box,
  Divider,
  Badge,
} from "@mantine/core";
import Product from "./product";
import {
  IconCircleCheck,
  IconShoppingCart,
  IconUserCheck,
  IconWallet,
  IconAlertCircle,
  IconShoppingCartOff,
  IconSparkles,
} from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setInitial } from "../../../redux/cart";
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import CartStepper from "../../../components/cartStepper";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { Steps } from "antd";
import { Grid as GridAnt } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  WarningOutlined,
  InboxOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';
/* ---------------------- API Configuration ---------------------- */
// You'll need to replace this with your actual API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const { useBreakpoint } = GridAnt;


/* ---------------------- Pretty SVG placeholder as DATA URI ---------------------- */
const buildPlaceholderDataUri = (label = "تصویر در دسترس نیست") => {
  const svg = `
  <svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
    <defs>
      <radialGradient id="rad" cx="30%" cy="20%" r="90%">
        <stop offset="0%" stop-color="#eef2ff"/>
        <stop offset="60%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#ffffff"/>
      </radialGradient>
      <linearGradient id="lin" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c7d2fe"/>
        <stop offset="100%" stop-color="#94a3b8"/>
      </linearGradient>
      <pattern id="pat" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M0 24 L24 0" stroke="#eef2ff" stroke-width="1"/>
      </pattern>
    </defs>
    <rect x="0" y="0" width="400" height="260" fill="url(#rad)"/>
    <rect x="0" y="0" width="400" height="260" fill="url(#pat)" opacity="0.35"/>
    <g transform="translate(200 120)">
      <rect x="-72" y="-56" width="144" height="112" rx="16" fill="#ffffff" stroke="rgba(0,0,0,0.06)"/>
      <rect x="-64" y="-48" width="128" height="96" rx="12" fill="url(#lin)" opacity="0.15"/>
      <path d="M-52 28 L-16 -8 L8 10 L28 -10 L52 28 Z" fill="url(#lin)" opacity="0.55"/>
      <circle cx="-30" cy="-18" r="10" fill="url(#lin)" opacity="0.75"/>
    </g>
    <g opacity="0.35" fill="url(#lin)">
      <circle cx="340" cy="44" r="3"/>
      <circle cx="360" cy="62" r="2"/>
      <circle cx="44" cy="180" r="3"/>
      <circle cx="70" cy="200" r="2"/>
    </g>
    <text x="200" y="224" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,Roboto" font-size="16" fill="#64748b">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const PLACEHOLDER_DATA_URI = buildPlaceholderDataUri();

/* ---------------------- Image utils ---------------------- */
const isInvalidSrc = (src) => {
  if (!src) return true;
  if (typeof src !== "string") return true;
  const s = src.trim();
  if (!s) return true;
  if (s === '[""]' || s === "[]") return true;
  const lower = s.toLowerCase();
  if (lower === "null" || lower === "undefined") return true;
  return false;
};

const useSafeImageSrc = (raw) => {
  const [safe, setSafe] = useState(PLACEHOLDER_DATA_URI);

  useEffect(() => {
    if (isInvalidSrc(raw)) {
      setSafe(PLACEHOLDER_DATA_URI);
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setSafe(raw);
    };
    img.onerror = () => {
      if (!cancelled) setSafe(PLACEHOLDER_DATA_URI);
    };
    img.src = raw;

    return () => {
      cancelled = true;
    };
  }, [raw]);

  return safe;
};

/* ---------------------- Product wrapper ---------------------- */
const ProductWithFallback = ({ onRemoveStart, ...props }) => {
  
  const getImageSource = (item) => {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      if (item.items[0]?.image) return item.items[0].image;
    }
    if (item.image) return item.image;
    if (item.product?.image) return item.product.image;
    if (item.img) return item.img;
    return null;
  };

  const getProductName = (item) => {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) {
      return item.items[0].name || item.items[0].title || "محصول";
    }
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.product?.name) return item.product.name;
    return "محصول";
  };

  const rawSrc = getImageSource(props);
  const safeSrc = useSafeImageSrc(rawSrc);
  const productName = getProductName(props);

  return (
    <Product
      {...props}
      name={productName}
      image={safeSrc}
      onRemoveStart={onRemoveStart}
      ImageComponent={() => (
        <img
          src={safeSrc}
          alt={productName}
          style={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            borderRadius: 12,
            display: "block",
          }}
          loading="lazy"
        />
      )}
    />
  );
};

/* ---------------------- Loading Component ---------------------- */
const LoadingComponent = () => (
  <Container size="lg" py="xl">
    <Paper 
      p="xl" 
      radius="xl" 
      shadow="sm"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none'
      }}
    >
      <Center h="40vh">
        <Stack align="center" gap="xl">
          <Box
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Loader 
              size="xl" 
              color="white"
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}
            />
            <IconSparkles 
              size={16} 
              color="white"
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                animation: 'sparkle 1.5s ease-in-out infinite'
              }}
            />
          </Box>
          <Text 
            size="lg" 
            c="white" 
            fw={500}
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              textAlign: 'center'
            }}
          >
            در حال بارگذاری سبد خرید شما...
          </Text>
        </Stack>
      </Center>
    </Paper>
  </Container>
);

/* ---------------------- Error Components ---------------------- */
const AuthErrorComponent = () => (
  <Container size="sm" py="xl">
    <Paper p="xl" radius="xl" shadow="md" style={{ border: '1px solid #fecaca' }}>
      <Center>
        <Stack align="center" gap="xl">
          <ThemeIcon 
            size={80} 
            radius="xl" 
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
            }}
          >
            <IconAlertCircle size={40} />
          </ThemeIcon>
          <Box ta="center">
            <Title order={3} mb="sm" c="red.7">خطا در احراز هویت</Title>
            <Text c="dimmed" size="sm">برای ادامه لطفا مجدداً وارد شوید</Text>
          </Box>
          <Button 
            component={NavLink} 
            to="/login" 
            size="lg"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            ورود مجدد
          </Button>
        </Stack>
      </Center>
    </Paper>
  </Container>
);

const CartErrorComponent = ({ onRetry }) => (
  <Container size="sm" py="xl">
    <Paper p="xl" radius="xl" shadow="md" style={{ border: '1px solid #fed7aa' }}>
      <Center>
        <Stack align="center" gap="xl">
          <ThemeIcon 
            size={80} 
            radius="xl" 
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
            }}
          >
            <IconAlertCircle size={40} />
          </ThemeIcon>
          <Box ta="center">
            <Title order={3} mb="sm" c="orange.7">خطا در بارگذاری سبد خرید</Title>
            <Text c="dimmed" size="sm">لطفا مجدداً تلاش کنید</Text>
          </Box>
          <Button 
            onClick={onRetry} 
            size="lg"
            radius="xl"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none'
            }}
          >
            تلاش مجدد
          </Button>
        </Stack>
      </Center>
    </Paper>
  </Container>
);

/* ---------------------- Empty Cart Component ---------------------- */
const EmptyCartComponent = () => (
  <Container size="lg" py="xl">
    <Paper 
      p="xl" 
      radius="xl" 
      shadow="sm"
      style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '1px solid #e2e8f0'
      }}
    >
      <Center py="xl">
        <Stack align="center" gap="xl">
          <Box
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ThemeIcon 
              size={120} 
              radius="xl" 
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                boxShadow: '0 12px 48px rgba(148, 163, 184, 0.2)',
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <IconShoppingCartOff size={60} color="#64748b" />
            </ThemeIcon>
            <IconSparkles 
              size={20} 
              color="#94a3b8"
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                animation: 'sparkle 2s ease-in-out infinite'
              }}
            />
          </Box>
          
          <Box ta="center" maw={400}>
            <Title 
              order={2} 
              mb="sm"
              style={{
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              سبد خرید خالی است
            </Title>
            <Text c="dimmed" mb="xl">
              هنوز هیچ محصولی به سبد خرید اضافه نکرده‌اید
            </Text>
            <Button 
              component={NavLink} 
              to="/products" 
              size="lg"
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              مشاهده محصولات
            </Button>
          </Box>
        </Stack>
      </Center>
    </Paper>
  </Container>
);

/* ---------------------- Enhanced Stepper Component ---------------------- */
const EnhancedStepper = ({ active = 0 }) => {

    const screensAnt = useBreakpoint();

  return (
        <Steps
          current={0}
          size={screensAnt.md ? 'default' : 'small'}
          style={{ 
            marginBottom: 32,
            background: 'white',
            padding: screensAnt.md ? 24 : 12,
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontSize: screensAnt.md ? '14px' : '12px'
          }}
          items={[
            { title: 'سبد خرید', icon: <ShoppingCartOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'اطلاعات خریدار', icon: <UserOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'انتخاب روش پرداخت', icon: <WalletOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
            { title: 'پرداخت نهایی', icon: <CheckCircleOutlined style={{ fontSize: screensAnt.md ? 20 : 16 }} /> },
          ]}
        />
  )
}

/* ---------------------- ENHANCED Basket Component ---------------------- */
const Basket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [cookies] = useCookies(["user"]);

  const screensAnt = useBreakpoint();

  // State management
  const [authInitialized, setAuthInitialized] = useState(false);
  const [initialCartLoaded, setInitialCartLoaded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  // Get Redux cart items (real-time updates)
  const reduxItems = useSelector((state) => state.cart.items || []);
  const authState = useSelector((state) => state.auth);
  const { isVerified, loading: authLoading, error: authError, user } = authState;

  const shouldFetchCart = user && isVerified;

  // Filter out invalid or empty items from the cart
  const getValidCartItems = (items) => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      // Check if item exists and has required properties
      if (!item) return false;
      
      // Check if item has a valid product ID
      if (!item.productId) return false;
      
      // Check if item has a valid count > 0
      if (!item.count || item.count <= 0) return false;
      
      // Check if item has price information
      if (!item.price) return false;
      
      return true;
    });
  };

  // Fetch cart data function
  const fetchCartData = useCallback(async (showLoader = true) => {
    if (!shouldFetchCart) return;

    try {
      if (showLoader) {
        setCartLoading(true);
      } else {
        setIsFetching(true);
      }
      setCartError(null);

      const token = localStorage.getItem("user");
      
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
        throw new Error("Failed to fetch cart data");
      }

      const data = await response.json();
      
      // Filter valid items before setting state
      const validCartItems = getValidCartItems(data.cart);
      
      setCartData({
        ...data,
        cart: validCartItems
      });
      
      // Update Redux store with valid items only
      dispatch(setInitial([...validCartItems]));
      
      setInitialCartLoaded(true);
      
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCartError(error.message || "خطا در بارگذاری سبد خرید");
      setInitialCartLoaded(true);
    } finally {
      setCartLoading(false);
      setIsFetching(false);
    }
  }, [shouldFetchCart, dispatch, navigate]);

  // Handle remove action from Product components
  const handleRemoveStart = useCallback(async () => {
    setIsRemoving(true);
    
    // Wait a bit then force refetch to ensure we catch any updates
    setTimeout(async () => {
      await fetchCartData(false);
      setIsRemoving(false);
    }, 1000);
  }, [fetchCartData]);

  // Retry function for error component
  const handleRetry = useCallback(() => {
    setCartError(null);
    setInitialCartLoaded(false);
    fetchCartData(true);
  }, [fetchCartData]);

  // Initialize authentication check
  useEffect(() => {
    const initAuth = async () => {
      try {
        await dispatch(verifyToken());
      } catch (error) {
        console.error("Auth verification error:", error);
      } finally {
        setAuthInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Handle authentication state changes
  useEffect(() => {
    if (!authInitialized) return;

    if (authError || isVerified === false) {
      navigate("/login", { replace: true });
      return;
    }
  }, [authInitialized, isVerified, authError, user, navigate]);

  // Fetch cart data when authenticated
  useEffect(() => {
    if (shouldFetchCart && !initialCartLoaded) {
      fetchCartData(true);
    }
  }, [shouldFetchCart, initialCartLoaded, fetchCartData]);

  // Force refetch when component mounts (coming from other pages)
  useEffect(() => {
    if (shouldFetchCart && initialCartLoaded) {
      fetchCartData(false);
    }
  }, []);

  // Calculate loading states
  const isAuthLoading = !authInitialized || authLoading;
  const isCartLoading = (user && isVerified) && (cartLoading || !initialCartLoaded);
  const isOverallLoading = isAuthLoading || isCartLoading;
  const isPageLoading = isOverallLoading || isRemoving || isFetching;

  // Use Redux items as primary source, but ensure they're valid
  const validReduxItems = getValidCartItems(reduxItems);
  const validCartDataItems = getValidCartItems(cartData?.cart || []);
  const displayItems = validReduxItems.length > 0 ? validReduxItems : validCartDataItems;
  const hasItems = displayItems && displayItems.length > 0;

  if (isOverallLoading) {
    return <LoadingComponent />;
  }

  // Show auth error
  if (authError) {
    return <AuthErrorComponent />;
  }

  // Show cart error
  if (cartError && !cartLoading) {
    return <CartErrorComponent onRetry={handleRetry} />;
  }

  // Show empty cart - removed the undefined shouldForceEmpty variable
  if (!hasItems && !cartLoading) {
    return (
      <>
        <Container size="lg" py="md">
          <EnhancedStepper active={0} />
        </Container>
        <EmptyCartComponent />
      </>
    );
  }

  // Show cart with items (using real-time Redux data)
  return (
    <>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
      `}</style>

      <Box style={{ position: 'relative', minHeight: '100vh' }}>
        <LoadingOverlay 
          pos="fixed" 
          visible={isPageLoading}
          zIndex={1000} 
          h="100%" 
          w="100%"
          top={0}
          left={0}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)'
          }}
          loader={
            <Stack align="center" gap="md">
              <Loader size="xl" color="blue" />
              <Text size="sm" c="dimmed">در حال بروزرسانی سبد خرید...</Text>
            </Stack>
          }
        />
        
        <Container size="xl" py="md">
          <EnhancedStepper active={0} />

          {hasItems && (
            <Grid gutter="xl">
              <Grid.Col span={{ lg: 8 }}>
                <Paper 
                  p="xl" 
                  radius="xl" 
                  shadow="sm"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e2e8f0',
                    animation: 'slideUp 0.6s ease-out'
                  }}
                >
                  <Group justify="space-between" align="center" mb="xl">
                    <Group align="center" gap="md">
                      <ThemeIcon 
                        size="lg" 
                        radius="xl"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          animation: 'pulse 2s infinite'
                        }}
                      >
                        <IconShoppingCart size={20} />
                      </ThemeIcon>
                      <Box>
                        <Title order={2} fw={600} c="gray.8">
                          محتویات سبد خرید
                        </Title>
                        <Text size="sm" c="dimmed">
                          محصولات انتخابی شما
                        </Text>
                      </Box>
                    </Group>
                    {/* <Badge 
                      size="lg" 
                      radius="xl" 
                      variant="light"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      {displayItems.length} محصول
                    </Badge> */}
                  </Group>
                  
                  <Divider mb="xl" />
                  
                  <Stack gap="lg">
                    {displayItems.map((item, index) => (
                      <Box
                        key={`${item.productId}-${item.combinationsID || index}`}
                        style={{
                          animation: `slideUp 0.6s ease-out ${index * 0.1}s both`
                        }}
                      >
                        <ProductWithFallback
                          {...item}
                          onRemoveStart={handleRemoveStart}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid.Col>
              
              <GridCol span={{ lg: 4 }}>
                <Box
                  style={{
                    position: 'sticky',
                    top: '2rem',
                    animation: 'slideUp 0.6s ease-out 0.3s both'
                  }}
                >
                  <Paper 
                    p="xl" 
                    radius="xl" 
                    shadow="sm"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <PaymentCalc
                      cartItems={displayItems}
                      submit={{ to: "/basket-info", component: NavLink }}
                    >
                      ادامه فرآیند خرید
                    </PaymentCalc>
                  </Paper>
                </Box>
              </GridCol>
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
};

export default Basket;