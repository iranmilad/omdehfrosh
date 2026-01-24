import Product from "./product";
import {
  IconCircleCheck,
  IconShoppingCart,
  IconUserCheck,
  IconWallet,
  IconAlertCircle,
  IconShoppingCartOff,
  IconSparkles,
  IconMapPin,
  IconArrowRight,
} from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setInitial } from "../../../redux/cart";
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { Steps } from "antd";
import { Grid as GridAnt } from 'antd';
import {
  ShoppingCartOutlined,
  UserOutlined,
  WalletOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import AddressManagement from "../basket-info/AddressManagement";
import ProductWithFallback, { EmptyCartComponent } from "./ProductWithFallback";
import { fetchUserInfo } from "../../../redux/users/userinfo/userInfo";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import { updateBasketOrdersAddress, updateOrderAddress } from "../../../redux/orders/updateOrderAddress/updateOrderAddressActions";
import { notifications } from "@mantine/notifications";


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

/* ---------------------- Spinner Component ---------------------- */
const Spinner = ({ size = "xl", color = "white" }) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };
  
  const colorClasses = {
    white: "border-white",
    blue: "border-blue-600"
  };

  return (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
};

/* ---------------------- Loading Component ---------------------- */
const LoadingComponent = () => (
  <div className="container mx-auto max-w-6xl py-12 px-4">
    <div 
      className="p-12 rounded-3xl shadow-sm"
      style={{
        background: 'linear-gradient(135deg, var(--mantine-color-brand-5) 0%, var(--mantine-color-brand-8) 100%)',
      }}
    >
      <div className="flex items-center justify-center" style={{ height: '40vh' }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <Spinner size="xl" color="white" />
            <IconSparkles 
              size={16} 
              color="white"
              className="absolute -top-2 -right-2 animate-pulse"
            />
          </div>
          <p 
            className="text-lg text-white font-medium text-center"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            در حال بارگذاری سبد خرید شما...
          </p>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------- Error Components ---------------------- */
const AuthErrorComponent = () => (
  <div className="container mx-auto max-w-xl py-12 px-4">
    <div className="p-12 rounded-3xl shadow-md border border-red-200">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
            }}
          >
            <IconAlertCircle size={40} color="white" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-red-700">خطا در احراز هویت</h3>
            <p className="text-gray-500 text-sm">برای ادامه لطفا مجدداً وارد شوید</p>
          </div>
          <NavLink 
            to="/login"
            className="px-6 py-3 text-lg rounded-3xl text-white border-none"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            ورود مجدد
          </NavLink>
        </div>
      </div>
    </div>
  </div>
);

const CartErrorComponent = ({ onRetry }) => (
  <div className="container mx-auto max-w-xl py-12 px-4">
    <div className="p-12 rounded-3xl shadow-md border border-orange-200">
      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-6">
          <div 
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
            }}
          >
            <IconAlertCircle size={40} color="white" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-orange-700">خطا در بارگذاری سبد خرید</h3>
            <p className="text-gray-500 text-sm">لطفا مجدداً تلاش کنید</p>
          </div>
          <button 
            onClick={onRetry}
            className="px-6 py-3 text-lg rounded-3xl text-white border-none"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            }}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    </div>
  </div>
);

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
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Get Redux cart items (real-time updates)
  const reduxItems = useSelector((state) => state.cart.items || []);
  const authState = useSelector((state) => state.auth);
  const { isVerified, loading: authLoading, error: authError, user } = authState;
  const userInfo = useSelector((state) => state.user.userInfo);


  useEffect(() => {
    if (user) {
      dispatch(fetchUserInfo());
      dispatch(getUserMyAccount());
    }
  }, [dispatch, user]);


  const shouldFetchCart = user && isVerified;

  // Filter out invalid or empty items from the cart
  const getValidCartItems = (items) => {
    if (!Array.isArray(items)) return [];
    
    return items.filter(item => {
      if (!item) return false;
      if (!item.productId) return false;
      if (!item.count || item.count <= 0) return false;
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
      
      const validCartItems = getValidCartItems(data.cart);
      
      setCartData({
        ...data,
        cart: validCartItems
      });
      
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

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      notifications.show({
        title: "خطا",
        message: "لطفا یک آدرس برای تحویل انتخاب کنید",
        color: "red",
      });
      return;
    }

    try {
      // Show loading notification
      const loadingNotification = notifications.show({
        title: "در حال ثبت آدرس...",
        message: "لطفا منتظر بمانید",
        loading: true,
        autoClose: false,
      });

      

      // Update address for ALL basket orders
      const result = await dispatch(updateBasketOrdersAddress({
        address: selectedAddress
      })).unwrap();

      // Hide loading notification
      notifications.hide(loadingNotification);

      if (result.success) {
        notifications.show({
          title: "موفق",
          message: "آدرس با موفقیت ثبت شد",
          color: "green",
          autoClose: 2000,
        });
        
        // Navigate to payment page
        setTimeout(() => {
          navigate("/payment");
        }, 500);
      }
    } catch (error) {
      notifications.show({
        title: "خطا",
        message: error?.message || "خطا در ثبت آدرس",
        color: "red",
        autoClose: 4000,
      });
      console.error("Error updating address:", error);
    }
  };
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

  // Force refetch when component mounts
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

  const validReduxItems = getValidCartItems(reduxItems);
  const validCartDataItems = getValidCartItems(cartData?.cart || []);
  const displayItems = validReduxItems.length > 0 ? validReduxItems : validCartDataItems;
  const hasItems = displayItems && displayItems.length > 0;

  if (isOverallLoading) {
    return <LoadingComponent />;
  }

  if (authError) {
    return <AuthErrorComponent />;
  }

  if (cartError && !cartLoading) {
    return <CartErrorComponent onRetry={handleRetry} />;
  }

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

      <div 
        className="relative min-h-screen pb-6 bg-[#f7f7f8]"
        style={{
          
        }}
      >
        {/* Header with back button */}
        <div className="mb-6 md:px-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <NavLink
                to="/"
                className="w-10 h-10 rounded-3xl flex items-center justify-center text-gray-600 hover:bg-gray-100"
                aria-label="بازگشت به صفحه اصلی"
              >
                <IconArrowRight size={24} />
              </NavLink>
              <h2 className="text-xl font-bold m-0">
                اطلاعات ارسال
              </h2>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isPageLoading && (
          <div 
            className="fixed top-0 left-0 right-0 w-full h-full z-[1000] flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xl" color="blue" />
              <p className="text-sm text-gray-500">در حال بروزرسانی سبد خرید...</p>
            </div>
          </div>
        )}
        
        {hasItems && (
          <div className="grid grid-cols-12 gap-4 m-0">
            {/* Main content area */}
            <div className="col-span-12 lg:col-span-9 p-0">
              <div className=" p-0">
                {userInfo && (
                  <AddressManagement 
                    onAddressSelect={setSelectedAddress}
                    userInfo={userInfo}
                  />
                )}
              </div>
              <div className="p-0">
                {displayItems.map((item, index) => (
                  <ProductWithFallback
                    key={index}
                    {...item}
                    onRemoveStart={handleRemoveStart}
                  />
                ))}
              </div>
            </div>
            
            {/* Sidebar - Payment Section */}
            <div className="col-span-12 lg:col-span-3 p-0 m-0">
              <div className=" p-0">
                <PaymentCalc
                  cartItems={displayItems}
                  submit={{ 
                    onClick: handleProceedToPayment,
                    disabled: !selectedAddress
                  }}
                >
                  نهایی کردن خرید
                </PaymentCalc>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Basket;