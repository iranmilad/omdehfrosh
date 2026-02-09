import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Group,
  Image,
  Paper,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowRight,
  IconSparkles,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import { setInitial, clearCart } from "../../../redux/cart";
import { logout } from "../../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../../redux/auth/authmaster/authMasterSlice";
import { useSessionQuery, useQueryClient, clearCacheOnLogout } from "../../../Libs/reactQuery";
import { useQueryClient as useQueryClientRQ } from "@tanstack/react-query";
import AddressManagement from "../basket-info/AddressManagement";
import { updateBasketOrdersAddress } from "../../../redux/orders/updateOrderAddress/updateOrderAddressActions";
import { notifications } from "@mantine/notifications";
import CounterBasket from "../../../components/counter-basket";
import { DEFAULT_COLOR_MAP } from "../../../Libs/attribute_colors/colors";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import ImageIcon from "../../../resources/defaultImageIcon";
import ReloginRequiredModal from "../../../components/ReloginRequiredModal";

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
    img.onload = () => { if (!cancelled) setSafe(raw); };
    img.onerror = () => { if (!cancelled) setSafe(PLACEHOLDER_DATA_URI); };
    img.src = raw;
    return () => { cancelled = true; };
  }, [raw]);
  return safe;
};

const isValidImageSource = (src) => {
  if (!src) return false;
  if (typeof src !== "string") return false;
  if (src.trim() === "") return false;
  return true;
};

const useSafeProductImageSrc = (src) => {
  const [safeSrc, setSafeSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setSafeSrc(src);
    setHasError(false);
  }, [src]);
  return { safeSrc, hasError, setHasError };
};

/* ---------------------- Spinner Component ---------------------- */
const Spinner = ({ size = "xl", color = "white" }) => {
  const sizeClasses = { sm: "w-6 h-6", md: "w-8 h-8", lg: "w-10 h-10", xl: "w-12 h-12" };
  const colorClasses = { white: "border-white", blue: "border-blue-600" };
  return (
    <div className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}></div>
  );
};

/* ---------------------- Loading Component ---------------------- */
const LoadingComponent = () => (
  <div className="container mx-auto max-w-6xl py-12 px-4">
    <div className="p-12 rounded-3xl shadow-sm" style={{ background: "linear-gradient(135deg, var(--mantine-color-brand-5) 0%, var(--mantine-color-brand-8) 100%)" }}>
      <div className="flex items-center justify-center" style={{ height: "40vh" }}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <Spinner size="xl" color="white" />
            <IconSparkles size={16} color="white" className="absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-lg text-white font-medium text-center" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
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
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)", boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)" }}>
            <IconAlertCircle size={40} color="white" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-red-700">خطا در احراز هویت</h3>
            <p className="text-gray-500 text-sm">برای ادامه لطفا مجدداً وارد شوید</p>
          </div>
          <NavLink to="/login" className="px-6 py-3 text-lg rounded-3xl text-white border-none" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
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
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", boxShadow: "0 8px 32px rgba(245, 158, 11, 0.3)" }}>
            <IconAlertCircle size={40} color="white" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2 text-orange-700">خطا در بارگذاری سبد خرید</h3>
            <p className="text-gray-500 text-sm">لطفا مجدداً تلاش کنید</p>
          </div>
          <button onClick={onRetry} className="px-6 py-3 text-lg rounded-3xl text-white border-none" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
            تلاش مجدد
          </button>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------- Basket Product (inline from product.jsx) ---------------------- */
const BasketProduct = (props) => {
  const cartItems = useSelector((state) => state.cart.items || []);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const queryClient = useQueryClientRQ();
  const productIdStr = String(props.productId);
  const isInCart = cartItems.some(
    (item) =>
      String(item.productId) === String(props.productId) &&
      parseInt(item.combinationsID) === parseInt(props.combinationsID) &&
      (item.seller?.id || item.seller_id) === (props.seller?.id || props.seller_id)
  );
  useEffect(() => { setIsVisible(isInCart); }, [isInCart]);
  const { primaryColor } = useMantineTheme();
  const dispatch = useDispatch();

  const shouldRenderAttributes = (attrs) => {
    if (!attrs) return false;
    if (Array.isArray(attrs)) return attrs.length > 0 && attrs.some((attr) => attr && attr !== "");
    return attrs !== "";
  };

  const getColorCode = (colorValue) => {
    if (!colorValue || colorValue === "") return null;
    if (colorValue.startsWith("#")) return colorValue;
    const lowerColorValue = colorValue.toLowerCase();
    return DEFAULT_COLOR_MAP[lowerColorValue] || DEFAULT_COLOR_MAP[colorValue] || colorValue;
  };

  const handleCartRemovalComplete = () => { if (props.onRemoveStart) props.onRemoveStart(); };

  const removeFromCartAPI = async (productId, seller, combinationsID) => {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/cart/remove"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ productId, seller, combinationsID }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to remove item from cart");
    }
    return response.json();
  };

  const removeItem = async () => {
    if (isRemoving || !isInCart) return;
    setIsRemoving(true);
    if (props.onRemoveStart) props.onRemoveStart();
    try {
      const removeResponse = await removeFromCartAPI(props.productId, props.seller, props.combinationsID);
      if (removeResponse?.message === "ok") {
        if (Array.isArray(removeResponse.cart)) dispatch(setInitial(removeResponse.cart));
        else queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        setIsVisible(false);
      } else throw new Error("Remove operation failed");
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    } finally {
      setIsRemoving(false);
    }
  };

  const removeItemUIOnly = () => setIsVisible(false);

  if (!isVisible || !isInCart) return null;

  return (
    <Paper
      p=""
      style={{
        opacity: isRemoving ? 0.5 : 1,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        transform: isRemoving ? "scale(0.95)" : "scale(1)",
      }}
    >
      <Flex justify="space-between" gap="xl">
        <Box w="120" h="120" pos="relative">
          <Image w="100" h="120" fit="contain" src={props.image} />
        </Box>
        <div className="flex-1">
          <Flex justify="space-between" gap="md" direction="column">
            <Flex direction="column" gap="md">
              <Title size="md">{props.name}</Title>
              {shouldRenderAttributes(props.attributes) && (
                <Flex gap="xs" wrap="wrap">
                  {props.attributes?.map((item, index) => (
                    <Flex key={index} gap="xs">
                      {item.color && item.color !== "" && (
                        <Badge variant="light" color="dark" size="xs">
                          <span style={{ color: getColorCode(item.color) }}>⬤</span>
                        </Badge>
                      )}
                      {item.material && item.material !== "" && (
                        <Badge variant="light" color="dark" size="xs">
                          <Text size="xs">{item.material}</Text>
                        </Badge>
                      )}
                      {item.warranty && item.warranty !== "" && (
                        <Badge variant="light" color="blue" size="xs">
                          <Text size="xs">{item.warranty}</Text>
                        </Badge>
                      )}
                    </Flex>
                  ))}
                </Flex>
              )}
              <Flex c={primaryColor} align="center" gap="xs">
                <IconUser size={12} />
                <Text size="xs" component="span">{props.seller?.label || props.seller?.name}</Text>
              </Flex>
            </Flex>
            <Flex gap="5">
              <ActionIcon color="red" variant="light" size="lg" onClick={removeItem} loading={isRemoving} disabled={isRemoving}>
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Flex>
          <Flex justify="space-between" mt="lg">
            <CounterBasket
              fullWidth
              withButton
              productId={productIdStr}
              seller={props.seller}
              stock={props.stock}
              combinationsID={props.combinationsID}
              removeFun={removeItemUIOnly}
              onRemoveComplete={handleCartRemovalComplete}
              count={props.count}
              productImage={props.image}
              attributes={props.attributes}
              poductName={props.name}
              price={props.price}
              max={props.max}
              min={props.min}
            />
          </Flex>
        </div>
      </Flex>
    </Paper>
  );
};

/* ---------------------- Basket Product With Fallback (inline from ProductWithFallback.jsx) ---------------------- */
const BasketProductWithFallback = ({ onRemoveStart, onUnauthorized, forceShowInBasket = false, ...props }) => {
  const cartItems = useSelector((state) => state.cart.items || []);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const dispatch = useDispatch();
  const queryClient = useQueryClientRQ();

  const getImageSource = (item) => {
    let potentialSrc = null;
    // Check nested items first
    if (item.items && Array.isArray(item.items) && item.items.length > 0 && item.items[0]?.image) potentialSrc = item.items[0].image;
    // Check images array (API returns 'images' not 'image')
    if (!potentialSrc && Array.isArray(item.images) && item.images.length > 0) potentialSrc = item.images[0];
    // Check singular image field
    if (!potentialSrc && item.image) potentialSrc = item.image;
    if (!potentialSrc && item.product?.image) potentialSrc = item.product.image;
    if (!potentialSrc && item.img) potentialSrc = item.img;
    // Check product images array
    if (!potentialSrc && Array.isArray(item.product?.images) && item.product.images.length > 0) potentialSrc = item.product.images[0];
    // Handle if potentialSrc is still an array
    if (Array.isArray(potentialSrc)) potentialSrc = potentialSrc.length === 0 ? null : potentialSrc[0];
    return isValidImageSource(potentialSrc) ? potentialSrc : null;
  };

  const getProductName = (item) => {
    if (item.items && Array.isArray(item.items) && item.items.length > 0) return item.items[0].name || item.items[0].title || "محصول";
    if (item.name) return item.name;
    if (item.title) return item.title;
    if (item.product?.name) return item.product.name;
    return "محصول";
  };

  const getProductId = (item) => item.productId ?? item.product_id ?? item.product?.id ?? item.id ?? null;
  const getCombinationsID = (item) => item.combinationsID ?? item.combinations_id ?? item.combination_id ?? null;
  const getSeller = (item) => (item.seller ? item.seller : item.seller_id != null ? { id: item.seller_id } : null);
  const getAttributes = (item) => item.attributes ?? item.attrs ?? [];
  const getPrice = (item) => {
    const p = item?.price ?? item?.product?.price;
    if (p == null) return 0;
    if (typeof p === "number") return p;
    return Number(p?.regularPrice ?? p?.discountedPrice ?? p?.regular ?? p?.discounted ?? 0) || 0;
  };
  const getCount = (item) => item.count ?? item.quantity ?? item.qty ?? 1;
  const getStock = (item) => item.stock ?? item.product?.stock ?? 0;
  const getDeliveryInfo = (item) => item.delivery ?? item.deliveryInfo ?? item.delivery_info ?? null;
  const getShippingType = (item) => {
    const d = getDeliveryInfo(item);
    return d?.type ?? item.shippingType ?? item.shipping_type ?? "ارسال رایگان";
  };
  const getDeliveryTime = (item) => {
    const d = getDeliveryInfo(item);
    return d?.time ?? item.deliveryTime ?? item.delivery_time ?? "شنبه ۱۵ آذر - ۱۰ تا ۱۲";
  };

  const rawSrc = getImageSource(props);
  const { safeSrc, hasError, setHasError } = useSafeProductImageSrc(rawSrc);
  const productName = getProductName(props);
  const productId = getProductId(props);
  const productIdStr = String(productId);
  const combinationsID = getCombinationsID(props);
  const seller = getSeller(props);
  const attributes = getAttributes(props);
  const price = getPrice(props);
  const count = getCount(props);
  const stock = getStock(props);
  const shippingType = getShippingType(props);
  const deliveryTime = getDeliveryTime(props);
  const shouldShowFallback = !rawSrc || hasError;

  const isInCart = cartItems.some(
    (item) =>
      String(item.productId) === String(productId) &&
      parseInt(item.combinationsID) === parseInt(combinationsID) &&
      (item.seller?.id || item.seller_id) === (seller?.id ?? props.seller_id)
  );
  useEffect(() => { if (!forceShowInBasket) setIsVisible(isInCart); }, [isInCart, forceShowInBasket]);
  const showRow = forceShowInBasket || (isVisible && isInCart);

  const handleCartRemovalComplete = () => { if (onRemoveStart) onRemoveStart(); };

  const removeFromCartAPI = async (productId, seller, combinationsID) => {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/cart/remove"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ productId, seller, combinationsID }),
    });
    if (response.status === 401) {
      if (typeof onUnauthorized === "function") onUnauthorized();
      return null;
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || "Failed to remove item from cart");
    }
    return response.json();
  };

  const removeItem = async () => {
    if (isRemoving || (!isInCart && !forceShowInBasket)) return;
    setIsRemoving(true);
    if (onRemoveStart) onRemoveStart();
    try {
      const removeResponse = await removeFromCartAPI(productId, seller, combinationsID);
      if (removeResponse === null) return;
      if (removeResponse?.message === "ok") {
        if (Array.isArray(removeResponse.cart)) dispatch(setInitial(removeResponse.cart));
        else queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        setIsVisible(false);
      } else throw new Error("Remove operation failed");
    } catch (err) {
      console.error("Failed to remove item from cart:", err);
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    } finally {
      setIsRemoving(false);
    }
  };

  const removeItemUIOnly = () => setIsVisible(false);

  if (!showRow) return null;

  return (
    <div
      id="jet-items1"
      className="flex flex-col gap-6 py-5 px-5 rounded md:px-5 bg-white"
      style={{
        opacity: isRemoving ? 0.5 : 1,
        transition: "opacity 0.3s ease, transform 0.3s ease",
        transform: isRemoving ? "scale(0.95)" : "scale(1)",
      }}
    >
      <div className="flex gap-2 items-center text-gray-700 text-xs md:text-sm">
        <p className="text-gray-700 text-xs md:text-sm font-bold">{shippingType}</p>
        <p className="md:inline-block mr-auto text-gray-700 text-xs md:text-sm font-bold">{count} کالا</p>
      </div>
      <div className="flex justify-between gap-2">
        <div className="flex overflow-hidden gap-1 md:gap-2" style={{ flexBasis: "80%" }}>
          <div className="relative">
            <div
              style={{
                width: "62px",
                height: "62px",
                lineHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: shouldShowFallback ? "#f3f4f6" : "transparent",
                borderRadius: "8px",
              }}
            >
              {shouldShowFallback ? (
                <ImageIcon size={32} color="#9ca3af" />
              ) : (
                <picture>
                  <img
                    className="w-full inline-block"
                    src={safeSrc}
                    width="62"
                    height="62"
                    alt={productName}
                    title={productName}
                    style={{ objectFit: "contain" }}
                    onError={() => setHasError(true)}
                  />
                </picture>
              )}
            </div>
          </div>
        </div>
        <div
          className="flex items-center justify-center border-white border-2 border-solid rounded-lg bg-gray-600 text-xs text-white absolute right-2 top-14"
          style={{ minWidth: "20px", height: "18px" }}
        >
          {count}
        </div>
        <div className="flex-1">
          <CounterBasket
            fullWidth
            withButton
            productId={productIdStr}
            seller={seller}
            stock={stock}
            combinationsID={combinationsID}
            removeFun={removeItemUIOnly}
            onRemoveComplete={handleCartRemovalComplete}
            count={count}
            productImage={safeSrc}
            attributes={attributes}
            poductName={productName}
            price={price}
            max={props.max}
            min={props.min}
          />
        </div>
      </div>
    </div>
  );
};

/* ---------------------- Empty Cart Component ---------------------- */
const EmptyCartComponent = () => (
  <div className="container mx-auto py-6 px-4">
    <div className="flex flex-col gap-6 py-8 md:py-12 border border-gray-200 rounded bg-white px-5">
      <div className="flex flex-col items-center justify-center py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="relative flex items-center justify-center">
            <div className="flex items-center justify-center rounded-full bg-gray-100" style={{ width: "120px", height: "120px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)" }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 2L7.17 4H4C2.9 4 2 4.9 2 6V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V6C22 4.9 21.1 4 20 4H16.83L15 2H9ZM9 5H15L16.83 7H20V19H4V7H7.17L9 5Z" fill="#9ca3af" />
                <line x1="4" y1="4" x2="20" y2="20" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">سبد خرید شما خالی است!</h2>
            <p className="text-sm md:text-base text-gray-600">می‌توانید برای مشاهده محصولات بیشتر به صفحات زیر بروید</p>
          </div>
          <a
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 text-sm md:text-base font-bold text-white rounded transition-colors duration-200"
            style={{ textDecoration: "none", backgroundColor: "#5e87c8" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3f6db3")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5e87c8")}
          >
            مشاهده محصولات
          </a>
        </div>
      </div>
    </div>
  </div>
);

/* ---------------------- ENHANCED Basket Component ---------------------- */
const Basket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const {
    data: userInitialData,
    error: userInitialError,
    isLoading: isLoadingUserData,
    isFetching: isFetchingUserData,
  } = useSessionQuery({
    endpoint: "/auth/user-initial-data",
    queryKey: ["userInitialData"],
    enabled: !!token,
    queryOptions: { refetchOnMount: "always" }, // refetch when landing on basket so corrupt token gets 401 and modal shows
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  // Fetch cart data from /cart endpoint which returns proper prices (using React Query)
  const {
    data: directCartData,
    isLoading: directCartLoading,
  } = useSessionQuery({
    endpoint: "/cart",
    queryKey: ["cart"],
    enabled: !!token,
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  // Fetch user addresses (using React Query)
  const {
    data: addressesData,
    isLoading: addressesLoading,
  } = useSessionQuery({
    endpoint: "/users/addresses",
    queryKey: ["userAddresses"],
    enabled: !!token,
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  // Extract addresses from the response
  const userAddresses = addressesData?.addresses ?? addressesData?.data?.addresses ?? [];

  // Log cart data for debugging
  useEffect(() => {
    if (directCartData) {
      console.log("[Basket] Direct cart (React Query) result:", {
        hasCart: !!directCartData.cart,
        cartLength: directCartData.cart?.length,
        total: directCartData.total,
        firstItem: directCartData.cart?.[0] ? {
          productId: directCartData.cart[0].productId,
          name: directCartData.cart[0].name,
          price: directCartData.cart[0].price,
          image: directCartData.cart[0].image,
        } : null,
      });
    }
  }, [directCartData]);

  const [initialCartLoaded, setInitialCartLoaded] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showReloginModal, setShowReloginModal] = useState(false);

  const clearAuthAndShowReloginModal = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("user_master");
    if (queryClient) clearCacheOnLogout(queryClient);
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    setShowReloginModal(true);
  }, [queryClient, dispatch]);

  const reduxItems = useSelector((state) => state.cart.items || []);
  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  const normalizeCartItem = (item, index) => {
    if (!item || typeof item !== "object") return null;
    const id =
      item.productId ??
      item.product_id ??
      item.id ??
      item.product?.id ??
      (typeof index === "number" ? `cart-${index}` : undefined);
    if (id === undefined || id === null) return null;
    const count = Number(item.count ?? item.quantity ?? item.qty ?? 1) || 1;
    const rawPrice =
      item.price ??
      item.unit_price ??
      item.product?.price ??
      item.product?.regularPrice ??
      item.product?.final_price ??
      0;
    const priceObj =
      rawPrice != null && typeof rawPrice === "object"
        ? {
            regularPrice: Number(rawPrice.regularPrice ?? rawPrice.regular ?? rawPrice.final_price ?? rawPrice) || 0,
            discountedPrice: Number(rawPrice.discountedPrice ?? rawPrice.discounted ?? rawPrice.regularPrice ?? rawPrice.regular ?? rawPrice) || 0,
          }
        : { regularPrice: Number(rawPrice) || 0, discountedPrice: Number(rawPrice) || 0 };
    // Normalize image - ensure 'image' field exists from 'images' array if needed
    const normalizedImage = item.image ?? (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null);
    
    return {
      ...item,
      productId: id,
      count,
      price: priceObj,
      combinationsID: item.combinationsID ?? item.combinations_id ?? item.combination_id ?? null,
      seller: item.seller ?? (item.seller_id != null ? { id: item.seller_id } : null),
      // Ensure image field is set for components that expect singular 'image'
      image: normalizedImage,
      // Preserve name from title if name doesn't exist
      name: item.name ?? item.title ?? item.product?.name ?? "محصول",
    };
  };

  const getValidCartItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item, index) => normalizeCartItem(item, index))
      .filter(Boolean)
      .filter((item) => item.count > 0);
  };

  const getCartFromUserInitialData = (data) => {
    if (!data) return [];
    const raw = data.cart ?? data.data?.cart ?? data.items ?? [];
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && Array.isArray(raw.items)) return raw.items;
    if (raw && typeof raw === "object" && Array.isArray(raw.data)) return raw.data;
    return [];
  };

  useEffect(() => {
    if (!userInitialData) {
      console.log("[Basket] sync effect: userInitialData is null/undefined, skipping");
      return;
    }
    const rawCart = getCartFromUserInitialData(userInitialData);
    const normalizedCart = getValidCartItems(rawCart);
    const total = userInitialData.total ?? userInitialData.data?.total ?? 0;
    if (process.env.NODE_ENV === "development" && rawCart.length > 0 && normalizedCart.length === 0) {
      console.log("[Basket] sync effect: raw cart item shape (first)", {
        firstRawItemKeys: Object.keys(rawCart[0]),
        firstRawItem: rawCart[0],
      });
    }
    console.log("[Basket] sync effect ran", {
      userInitialDataKeys: Object.keys(userInitialData),
      hasData: !!userInitialData.data,
      rawCartLength: rawCart.length,
      normalizedCartLength: normalizedCart.length,
      total,
      // Debug: show first raw item to see price/image structure
      firstRawItem: rawCart[0] ? {
        id: rawCart[0].id,
        productId: rawCart[0].productId,
        title: rawCart[0].title,
        name: rawCart[0].name,
        count: rawCart[0].count,
        price: rawCart[0].price,
        unit_price: rawCart[0].unit_price,
        image: rawCart[0].image,
        images: rawCart[0].images,
      } : null,
      // Debug: show first normalized item
      firstNormalizedItem: normalizedCart[0] ? {
        productId: normalizedCart[0].productId,
        count: normalizedCart[0].count,
        price: normalizedCart[0].price,
      } : null,
    });
    setCartData({ cart: normalizedCart, total });
    dispatch(setInitial([...normalizedCart]));
    setInitialCartLoaded(true);
    setCartError(null);
  }, [userInitialData, dispatch]);

  // When directCartData (from /cart endpoint) is available, use it to update Redux
  // This has proper prices unlike userInitialData.cart
  useEffect(() => {
    if (!directCartData?.cart || directCartData.cart.length === 0) return;
    
    const normalizedDirectCart = getValidCartItems(directCartData.cart);
    if (normalizedDirectCart.length > 0) {
      console.log("[Basket] Syncing directCartData to Redux:", {
        itemCount: normalizedDirectCart.length,
        total: directCartData.total,
        firstItem: normalizedDirectCart[0] ? {
          productId: normalizedDirectCart[0].productId,
          name: normalizedDirectCart[0].name,
          price: normalizedDirectCart[0].price,
        } : null,
      });
      dispatch(setInitial([...normalizedDirectCart]));
      setCartData({ cart: normalizedDirectCart, total: directCartData.total });
    }
  }, [directCartData, dispatch]);

  const handleRemoveStart = useCallback(() => {
    setIsRemoving(true);
    // Invalidate both queries to refetch fresh data
    queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    setTimeout(() => setIsRemoving(false), 500);
  }, [queryClient]);

  const handleRetry = useCallback(() => {
    setCartError(null);
    setInitialCartLoaded(false);
    // Invalidate both queries to refetch
    queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    queryClient.invalidateQueries({ queryKey: ["cart"] });
    queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
  }, [queryClient]);

  const handleProceedToPayment = async () => {
    if (!selectedAddress) {
      notifications.show({ title: "خطا", message: "لطفا یک آدرس برای تحویل انتخاب کنید", color: "red" });
      return;
    }
    let loadingNotification = null;
    try {
      loadingNotification = notifications.show({
        title: "در حال ثبت آدرس...",
        message: "لطفا منتظر بمانید",
        loading: true,
        autoClose: false,
      });
      const result = await dispatch(updateBasketOrdersAddress({ address: selectedAddress })).unwrap();
      if (result.success) {
        notifications.show({ title: "موفق", message: "آدرس با موفقیت ثبت شد", color: "green", autoClose: 2000 });
        setTimeout(() => navigate("/payment"), 500);
      }
    } catch (error) {
      if (error?.status === 401 || error?.response?.status === 401) {
        clearAuthAndShowReloginModal();
        return;
      }
      notifications.show({ title: "خطا", message: error?.message || "خطا در ثبت آدرس", color: "red", autoClose: 4000 });
      console.error("Error updating address:", error);
    } finally {
      if (loadingNotification != null) {
        notifications.hide(loadingNotification);
      }
    }
  };

  useEffect(() => {
    if (!token) { setShowReloginModal(true); return; }
    const errMsg = userInitialError?.message ?? (typeof userInitialError === "string" ? userInitialError : "");
    if (userInitialError && errMsg.includes("401")) {
      clearAuthAndShowReloginModal();
    }
  }, [token, userInitialError, clearAuthAndShowReloginModal]);

  const isAuthLoading = !!token && isLoadingUserData && !userInitialData;
  const isCartLoading = !!token && !!userInitialData && !initialCartLoaded;
  const isOverallLoading = isAuthLoading || isCartLoading;
  const isPageLoading = isOverallLoading || isRemoving || isFetchingUserData;

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[Basket] loading state", {
      token: !!token,
      isLoadingUserData,
      userInitialDataDefined: userInitialData != null,
      directCartLoading,
      directCartDataDefined: directCartData != null,
      directCartLength: directCartData?.cart?.length,
      directCartTotal: directCartData?.total,
      addressesLoading,
      addressesCount: userAddresses.length,
      initialCartLoaded,
      isAuthLoading,
      isCartLoading,
      isOverallLoading,
      showingLoadingComponent: isOverallLoading,
    });
  }

  // Derive display items - prefer directCartData (from /cart endpoint) which has proper prices
  // Fallback to userInitialData.cart, then cartData state, then Redux
  const directCartItems = getValidCartItems(directCartData?.cart || []);
  const rawCartFromApi = getCartFromUserInitialData(userInitialData);
  const normalizedFromApi = getValidCartItems(rawCartFromApi);
  const fromCartData = Array.isArray(cartData?.cart) ? cartData.cart : [];
  const validReduxItems = getValidCartItems(reduxItems);
  const displayItems =
    directCartItems.length > 0
      ? directCartItems  // Prefer /cart endpoint data (has proper prices)
      : normalizedFromApi.length > 0
      ? normalizedFromApi
      : fromCartData.length > 0
        ? fromCartData
        : validReduxItems;
  const hasItems = displayItems.length > 0;

  // ---- Basket page debug: find why items/calc empty after refresh ----
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("[Basket] render debug", {
      userInitialDataDefined: userInitialData != null,
      userInitialDataType: userInitialData == null ? "null" : typeof userInitialData,
      userInitialDataKeys: userInitialData ? Object.keys(userInitialData) : [],
      userInitialDataCart: userInitialData?.cart,
      userInitialDataDataCart: userInitialData?.data?.cart,
      rawCartFromApiLength: rawCartFromApi.length,
      rawCartFromApiFirstItemKeys: rawCartFromApi[0] ? Object.keys(rawCartFromApi[0]) : [],
      normalizedFromApiLength: normalizedFromApi.length,
      cartDataState: cartData,
      fromCartDataLength: fromCartData.length,
      reduxItemsLength: reduxItems.length,
      reduxItemsFirstItemKeys: reduxItems[0] ? Object.keys(reduxItems[0]) : [],
      validReduxItemsLength: validReduxItems.length,
      displayItemsLength: displayItems.length,
      hasItems,
      source: directCartItems.length > 0 ? "directCart (/cart endpoint)" 
        : normalizedFromApi.length > 0 ? "normalizedFromApi (userInitialData)" 
        : fromCartData.length > 0 ? "fromCartData (state)" 
        : "validReduxItems",
      // Debug: first displayItem to verify price/image normalization
      firstDisplayItem: displayItems[0] ? {
        productId: displayItems[0].productId,
        name: displayItems[0].name,
        count: displayItems[0].count,
        price: displayItems[0].price,
        image: displayItems[0].image,
        images: displayItems[0].images,
      } : null,
    });
  }

  if (!token) {
    return (
      <>
        <ReloginRequiredModal opened={true} onClose={() => navigate("/login", { replace: true })} />
      </>
    );
  }
  // Show relogin modal as soon as we get 401 (e.g. corrupt token), before loading check
  const errMsg = userInitialError?.message ?? (typeof userInitialError === "string" ? userInitialError : "");
  if (userInitialError && String(errMsg).includes("401")) {
    return (
      <>
        <ReloginRequiredModal opened={true} onClose={() => navigate("/login", { replace: true })} />
      </>
    );
  }
  if (isOverallLoading) return <LoadingComponent />;
  if (cartError && !isLoadingUserData) return <CartErrorComponent onRetry={handleRetry} />;

  return (
    <>
      <ReloginRequiredModal opened={showReloginModal} onClose={() => setShowReloginModal(false)} />
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes sparkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="relative min-h-screen pb-6 bg-[#f7f7f8]" style={{}}>
        <div className="mb-6 md:px-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <NavLink to="/" className="w-10 h-10 rounded-3xl flex items-center justify-center text-gray-600 hover:bg-gray-100" aria-label="بازگشت به صفحه اصلی">
                <IconArrowRight size={24} />
              </NavLink>
              <h2 className="text-xl font-bold m-0">اطلاعات ارسال</h2>
            </div>
          </div>
        </div>

        {isPageLoading && (
          <div className="fixed top-0 left-0 right-0 w-full h-full z-[1000] flex items-center justify-center" style={{ background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(8px)" }}>
            <div className="flex flex-col items-center gap-4">
              <Spinner size="xl" color="blue" />
              <p className="text-sm text-gray-500">در حال بروزرسانی سبد خرید...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4 m-0">
          <div className="col-span-12 lg:col-span-9 p-0">
            <div className="p-0">
              {(userInitialData?.user || user) && (
                <AddressManagement
                  onAddressSelect={setSelectedAddress}
                  userInfo={userInitialData?.user ? { user: userInitialData.user } : user ? { user } : null}
                  initialAddresses={userAddresses.length > 0 ? userAddresses : (userInitialData?.addresses ?? userInitialData?.data?.addresses)}
                />
              )}
            </div>
            <div className="p-0">
              {hasItems
                ? displayItems.map((item, index) => (
                    <BasketProductWithFallback
                      key={
                        typeof item.productId === "object" || typeof item.product_id === "object"
                          ? `basket-${index}`
                          : String(item.productId ?? item.product_id ?? index)
                      }
                      {...item}
                      onRemoveStart={handleRemoveStart}
                      onUnauthorized={clearAuthAndShowReloginModal}
                      forceShowInBasket
                    />
                  ))
                : <EmptyCartComponent />}
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3 p-0 m-0">
            <div className="p-0">
              <PaymentCalc
                cartItems={displayItems}
                submit={{ onClick: handleProceedToPayment, disabled: !selectedAddress || !hasItems }}
              >
                نهایی کردن خرید
              </PaymentCalc>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Basket;
