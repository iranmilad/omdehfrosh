import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Center,
  Drawer,
  Flex,
  Image,
  Indicator,
  NumberFormatter,
  ScrollArea,
  Stack,
  Text,
  useMantineTheme,
  Loader,
  Box,
  Input
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUser, IconX, IconCheck, IconMinus, IconPlus } from "@tabler/icons-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { NavLink, useNavigate } from "react-router";
import { setInitial, clearCart } from "../../redux/cart";
import { logout } from "../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../redux/auth/authmaster/authMasterSlice";
import { clearCacheOnLogout } from "../../Libs/reactQuery";
import InfoBox from "../InfoBox";
import { getsubscriptionPlansGet } from "../../redux/usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansActions";
import { DEFAULT_COLOR_MAP } from '../../Libs/attribute_colors/colors';
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import CounterMiniCart from "../counterminicart";
import PriceText from "../priceText";
import { IoCloseSharp } from "react-icons/io5";
import ImageIcon from "../../resources/defaultImageIcon";


// Custom Cart Icon Component
const CartIcon = ({ size = 18, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      transform: "scaleX(1.2)",
      transformOrigin: "center",
    }}
    {...props}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    <line x1="16" y1="10" x2="19" y2="10" />
  </svg>
);

const NewBasketIcon = ({ size = 24, color = "currentColor", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={color}
    width={size}
    height={size}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.543 19.952a1.296 1.296 0 0 1 0 2.589 1.296 1.296 0 0 1 0-2.59m11.28 0c.716 0 1.297.58 1.297 1.294s-.581 1.295-1.296 1.295a1.296 1.296 0 0 1 0-2.59M3.269 3.009l2.08.36c.335.06.59.337.619.677l.235 2.801h.873l.424.001h1.604l.38.001h1.77l.33.001h1.242l.291.001h1.092l.255.001h.952l.222.001h.625l.196.001h.725l.166.001h.612l.14.001h.389l.12.001h.433l.097.001h.267l.08.001h.286l.063.001h.167l.05.001h.17l.035.001h.093l.026.001h.067l.018.001h.046l.012.001h.028l.008.001h.02l.004.001.013.001a2.08 2.08 0 0 1 1.38.82c.335.447.475.998.395 1.55l-.95 6.558a2.56 2.56 0 0 1-2.522 2.19H7.975a2.56 2.56 0 0 1-2.54-2.344L4.52 4.748l-1.507-.26A.75.75 0 0 1 2.4 3.62a.76.76 0 0 1 .867-.61m3.607 5.339h-.547l.603 7.171c.044.552.495.966 1.046.966h10.917c.52 0 .966-.388 1.04-.903l.95-6.559a.59.59 0 0 0-.112-.438.58.58 0 0 0-.388-.23h-.16l-.076.001h-.566l-.149.001h-1.559l-1.52-.001h-1.136l-.297-.001-.91-.001h-.938l-.317-.001-.958-.001h-.96l-.32-.001h-.636l-.315-.001h-.93l-.304-.001-1.176-.001zm10.413 2.196a.75.75 0 0 1 0 1.5h-2.773a.75.75 0 1 1 0-1.5z"
    />
  </svg>
);

const MiniBox = ({ productId, item, name, image, price, count, attributes, seller, combinationsID, max, min, maxOrder, minOrder, stock }) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { primaryColor } = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 401: use global auth flow (same as counter-basket, payment-method)
  const clearAuthAndShowReloginModal = useCallback(() => {
    localStorage.removeItem("user");
    if (queryClient) clearCacheOnLogout(queryClient);
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:401"));
    }
  }, [queryClient, dispatch]);

  const handleTokenExpiration = useCallback((error) => {
    const status401 = error?.status === 401 || error?.response?.status === 401;
    const msg = typeof error?.message === "string" ? error.message : "";
    const isAuthError =
      status401 ||
      /401|unauthorized|توکن نامعتبر|احراز هویت|ورود مجدد|لطفا.*وارد/i.test(msg);
    if (isAuthError) {
      clearAuthAndShowReloginModal();
      return true;
    }
    return false;
  }, [clearAuthAndShowReloginModal]);

  useEffect(() => {
    return () => {
      if (isRemoving) {
        setIsRemoving(false);
      }
    };
  }, [isRemoving]);

  // Reset image error when image changes
  useEffect(() => {
    setImageError(false);
  }, [image]);

  const isImageValid = () => {
    if (!image || 
        image === "" || 
        image === null || 
        image === undefined ||
        (Array.isArray(image) && image.length === 0) ||
        (Array.isArray(image) && image.every(img => !img || img === ""))) {
      return false;
    }
    // If it's an array, check if the first element is valid
    if (Array.isArray(image)) {
      return image[0] && image[0] !== "";
    }
    return true;
  };

  const getValidImageSrc = () => {
    if (!isImageValid()) {
      return null; // Return null to indicate we should use ImageIcon
    }
    // If it's an array, use the first valid image
    if (Array.isArray(image)) {
      return image.find(img => img && img !== "") || null;
    }
    return image;
  };

  const shouldRenderAttributes = (attrs) => {
    if (!attrs) return false;
    if (Array.isArray(attrs)) {
      if (attrs.length === 0) return false;
      return attrs.some(attr => 
        (attr && typeof attr === 'object' && 
         (attr.color || attr.material || attr.warranty)) ||
        (typeof attr === 'string' && attr !== "")
      );
    }
    return attrs !== "";
  };

  const getColorCode = (colorValue) => {
    if (!colorValue || colorValue === "") return null;
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    const lowerColorValue = colorValue.toLowerCase();
    return DEFAULT_COLOR_MAP[lowerColorValue] || DEFAULT_COLOR_MAP[colorValue] || colorValue;
  };

// In MiniBox component, update the discount percentage calculation:
const discountPercentage = useMemo(() => {
  if (price?.regularPrice && price?.discountedPrice && 
      price.regularPrice > price.discountedPrice && 
      price.discountedPrice > 0) {  // Add this condition
    return Math.round(((price.regularPrice - price.discountedPrice) / price.regularPrice) * 100);
  }
  return null;
}, [price]);



  const updateItem = async (newCount) => {
    try {
      const token = localStorage.getItem("user");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestPayload = {
        productId: productId,
        seller: seller,
        count: newCount,
        combinationsID: combinationsID || null,
      };

      const updateResponse = await fetch(getApiUrl("/cart/update"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload),
      });

      if (updateResponse.status === 401) {
        handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        return;
      }

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`HTTP ${updateResponse.status}: ${errorText}`);
      }

      const updateData = await updateResponse.json();

      if (updateData?.message === "error") {
        throw new Error(updateData.error || "Server returned an error");
      }

      // Update Redux with response cart if available
      if (updateData?.cart && Array.isArray(updateData.cart)) {
        dispatch(setInitial([...updateData.cart]));
      }

      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      notifications.show({
        title: 'موفق',
        message: 'تعداد محصول به‌روزرسانی شد',
        color: 'green',
        icon: <IconCheck size={16} />,
        autoClose: 2000,
        position: 'top-right'
      });

    } catch (error) {
      console.error("Update failed:", error);
      // Always show 401 modal for auth errors; never show toast for them
      if (handleTokenExpiration(error)) return;
      notifications.show({
        title: 'خطا',
        message: 'مشکلی در به‌روزرسانی پیش آمد',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 3000,
        position: 'top-right'
      });
    }

    try {
      dispatch(getsubscriptionPlansGet());
    } catch (planError) {
      console.warn("Failed to refresh subscription plans:", planError);
    }
  };

  const removeItem = async () => {
    setIsRemoving(true);

    try {
      const token = localStorage.getItem("user");
      
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestPayload = {
        productId: productId,
        seller: seller,
        combinationsID: combinationsID || null,
      };

      const removeResponse = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload),
      });

      if (removeResponse.status === 401) {
        handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        setIsRemoving(false);
        return;
      }

      if (removeResponse.status === 404) {
        const errorData = await removeResponse.json();
        
        if (errorData.message === "Cart not found") {
          dispatch(setInitial([]));
          notifications.show({
            title: 'اطلاع',
            message: 'سبد خرید خالی است',
            color: 'blue',
            icon: <IconCheck size={16} />,
            autoClose: 3000,
            position: 'top-right'
          });
          setIsRemoving(false);
          return;
        }
        
        throw new Error(`Item not found: ${errorData.message}`);
      }
      
      if (!removeResponse.ok) {
        const errorText = await removeResponse.text();
        throw new Error(`HTTP ${removeResponse.status}: ${errorText}`);
      }

      const removeData = await removeResponse.json();

      if (removeData?.message === "error") {
        throw new Error(removeData.error || "Server returned an error");
      }

      if (removeData?.message === "ok") {
        const newCartItems = removeData.cart || [];
        dispatch(setInitial(newCartItems));
        
        // Invalidate queries to refetch fresh data
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        
        notifications.show({
          title: 'موفق',
          message: newCartItems.length === 0 ? 'سبد خرید خالی شد' : 'محصول از سبد خرید حذف شد',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
          position: 'top-right'
        });
        
        setIsRemoving(false);
        return;
      }

      // Invalidate queries even if message wasn't "ok" to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      setIsRemoving(false);

    } catch (error) {
      console.error("Remove failed:", error);
      // Always show 401 modal for auth errors; never show toast for them
      if (handleTokenExpiration(error)) {
        setIsRemoving(false);
        return;
      }
      const msg = typeof error?.message === 'string' ? error.message : '';
      let errorMessage = 'مشکلی پیش آمده است دوباره تلاش کنید';
      let errorTitle = 'خطا در حذف';
      if (msg.includes('404') || msg.includes('not found')) {
        errorMessage = 'محصول در سبد خرید یافت نشد';
        errorTitle = 'محصول یافت نشد';
      } else if (msg.includes('400')) {
        errorMessage = 'اطلاعات ارسالی نامعتبر است';
        errorTitle = 'خطا در اطلاعات';
      } else if (msg.includes('500')) {
        errorMessage = 'مشکل در سرور، لطفا بعداً تلاش کنید';
        errorTitle = 'خطا در سرور';
      } else if (msg.includes('NetworkError') || msg.includes('fetch')) {
        errorMessage = 'مشکل در اتصال به اینترنت';
        errorTitle = 'خطا در اتصال';
      }
      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 5000,
        position: 'top-right'
      });
      setIsRemoving(false);
    }

    try {
      dispatch(getsubscriptionPlansGet());
    } catch (planError) {
      console.warn("Failed to refresh subscription plans:", planError);
    }
  };

  return (
    <>
      {/* Main container matching the design */}
      <Box
        style={{
          padding: isMobile ? '8px 8px' : '12px 12px',
          borderBottom: '1px solid #e0e0e0',
          borderRadius: 0,
          opacity: isRemoving ? 0.5 : 1,
          transition: 'all 0.3s ease',
          backgroundColor: '#fff'
        }}
      >
        {/* Product row */}
        <Flex gap={isMobile ? 4 : 8} align="flex-start">
          {/* Image */}
          <Anchor component={NavLink} to={`product/${productId}`}>
            {getValidImageSrc() && !imageError ? (
              <Image 
                src={getValidImageSrc()} 
                w={60}
                h={60}
                fit="contain" 
                style={{
                  objectFit: 'contain'
                }}
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <Box
                w={60}
                h={60}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef'
                }}
              >
                <ImageIcon size={32} color="#6B7280" />
              </Box>
            )}
          </Anchor>

          {/* Product details */}
          <Flex direction="column" gap={isMobile ? 8 : 16} style={{ flex: 1 }}>
            <Anchor component={NavLink} to={`product/${productId}`} style={{ textDecoration: 'none' }}>
              <Text size={isMobile ? "xs" : "sm"} fw={400} c="#23254e" style={{ lineHeight: 1.5 }}>
                {name}
              </Text>
            </Anchor>
          </Flex>
        </Flex>

        {/* Divider */}
        <Box style={{ width: '100%', height: '1px', backgroundColor: '#D7DADFFF', margin: '16px 0' }} />

        {/* Attributes row */}
        <Flex align="center" gap="xs" wrap="wrap" mb="xs">
          {shouldRenderAttributes(attributes) && attributes?.map((attr, index) => (
            <Flex key={index} align="center" gap={4}>
              {attr.color && attr.color !== "" && (
                <>
                  <div style={{
                    width: 12,
                    height: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg style={{ width: '12px', height: '12px', fill: 'rgb(255, 255, 255)' }}>
                      <circle cx="6" cy="6" r="6" fill={getColorCode(attr.color)} />
                    </svg>
                  </div>
                </>
              )}
              
              {(attr.material || attr.warranty) && (
                <Box style={{ width: '1px', height: '12px', backgroundColor: '#81858b', marginRight: '8px' }} />
              )}
              
              {attr.material && attr.material !== "" && (
                <Text size="xs" c="#81858b" mr={8}>
                  {attr.material}
                </Text>
              )}
              
              {attr.warranty && attr.warranty !== "" && (
                <>
                  {attr.material && (
                    <Box style={{ width: '1px', height: '12px', backgroundColor: '#81858b', marginRight: '8px' }} />
                  )}
                  <Text size="xs" c="#81858b" mr={8}>
                    {attr.warranty}
                  </Text>
                </>
              )}
            </Flex>
          ))}

          {seller?.label && (
            <>
              {shouldRenderAttributes(attributes) && (
                <Box style={{ width: '1px', height: '12px', backgroundColor: '#81858b', marginRight: '8px' }} />
              )}
              <Text size="xs" c="#81858b">
                {seller.label}
              </Text>
            </>
          )}

          <Box style={{ width: '1px', height: '12px', backgroundColor: '#81858b', marginRight: '8px' }} />
          
        <Flex align="center" gap={4} wrap="nowrap">
          <Text size="xs" c="#81858b" style={{ whiteSpace: 'nowrap' }}>
            هر واحد
          </Text>
          <Text size="xs" c="#81858b" style={{ whiteSpace: 'nowrap' }}>
            <NumberFormatter thousandSeparator value={price?.discountedPrice || price?.regularPrice} />
          </Text>
          <PriceText fontSize="10px">تومان</PriceText>
        </Flex>
        </Flex>

{/* Quantity and Price row */}
<Flex align="center" justify="space-between" mt={8}>
  {/* Quantity selector with CounterMiniCart */}
  <CounterMiniCart
    productId={productId}
    seller={seller}
    combinationsID={combinationsID}
    count={count}
    max={max ?? maxOrder ?? item?.maxOrder ?? item?.max}
    min={min ?? minOrder ?? item?.minOrder ?? item?.min ?? 1}
    stock={stock ?? item?.stock ?? item?.product?.stock}
    onUpdate={updateItem}
    onRemove={removeItem}
    isLoading={isRemoving}
  />

{/* Price section */}
<Flex direction="column" align="flex-end" gap={4}>
  {/* Discounted price or regular price */}
  <Flex align="center" gap={4}>
    <Text size="lg" fw={700} c="#23254e">
      <NumberFormatter 
        thousandSeparator 
        value={
          price?.discountedPrice && 
          price.discountedPrice > 0 && 
          price.discountedPrice < price.regularPrice 
            ? price.discountedPrice 
            : price.regularPrice
        } 
      />
    </Text>
    <PriceText fontSize="10px">تومان</PriceText>
  </Flex>

  {/* Show regular price with strikethrough ONLY if there's a real discount */}
  {discountPercentage && price?.discountedPrice < price?.regularPrice && (
    <Flex align="center" gap={4} style={{ textDecoration: 'line-through', textDecorationColor: 'grey' }}>
      <Badge 
        size="sm" 
        radius="md"
        style={{
          backgroundColor: '#ef4056',
          color: '#fff',
          border: 'none',
          height: '20px',
          padding: '4px 8px',
          fontSize: '10px',
          fontWeight: 600
        }}
      >
        % {discountPercentage}
      </Badge>
      
      <Text size="sm" c="#a1a3a8">
        <NumberFormatter thousandSeparator value={price.regularPrice} />
      </Text>
      <PriceText fontSize="10px">تومان</PriceText>
    </Flex>
  )}
</Flex>
</Flex>


      </Box>
    </>
  );
};

const MiniCart = ({ externalOpened, externalOpen, externalClose, cartItemCount }) => {
  const [internalOpened, internalHandlers] = useDisclosure(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  // Use external state if provided, otherwise use internal state
  const opened = externalOpened !== undefined ? externalOpened : internalOpened;
  const open = externalOpen || internalHandlers.open;
  const close = externalClose || internalHandlers.close;

  const cartState = useSelector((state) => state.cart);
  const items = cartState?.items || [];

  const { user, isVerified } = useSelector((state) => state.auth);

  // When token is expired, clear auth and show 401 modal so MiniCart does not show stale items
  const clearAuthAndShow401Modal = useCallback(() => {
    localStorage.removeItem("user");
    if (queryClient) clearCacheOnLogout(queryClient);
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("auth:401"));
    }
  }, [queryClient, dispatch]);

  const calculatedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemPrice = item.price?.discountedPrice || item.price?.regularPrice || 0;
      return total + (itemPrice * item.count);
    }, 0);
  }, [items]);

  const shouldShowCart = user && isVerified;
  const reduxItemTotal = items.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
  const cartCount = shouldShowCart
    ? (typeof cartItemCount === 'number' ? cartItemCount : reduxItemTotal)
    : 0;

  // When drawer opens with token: validate session (GET /cart). If 401, clear auth and show 401 modal so we don't show stale items.
  useEffect(() => {
    if (!opened) return;

    const token = localStorage.getItem("user");
    if (!token) return;

    let cancelled = false;
    const validateCart = async () => {
      try {
        const res = await fetch(getApiUrl("/cart"), {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (cancelled) return;
        if (res.status === 401) {
          clearAuthAndShow401Modal();
          return;
        }
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        }
      } catch {
        if (cancelled) return;
        // Network error: don't clear auth; keep showing cart from Redux
      }
    };
    validateCart();
    return () => { cancelled = true; };
  }, [opened, queryClient, clearAuthAndShow401Modal]);

  const handleNavigateToBasket = () => {
    close();
    setTimeout(() => {
      navigate("/basket");
    }, 100);
  };

  const handleClose = () => {
    close();
  };

  const drawerSize = isSmallMobile ? '500px' : isMobile ? '500px' : 500;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        minWidth: '50px',
        height: '42px',
        cursor: 'pointer'
      }}
      onClick={open}
    >
<div style={{ position: 'relative', display: 'inline-block' }}>
  <NewBasketIcon size={24} color="#4d5053" />
  {shouldShowCart && cartCount > 0 && (
    <div
      style={{
        position: 'absolute',
        top: '-2px',
        right: '-7px',
        height: '23px',
        width: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ed1944',
        color: '#fff',
        fontSize: '9px',
        fontWeight: 600,
        borderRadius: '4px',
        padding: '2px 4px',
        boxSizing: 'border-box',
        zIndex: 1
      }}
    >
      {cartCount}
    </div>
  )}
</div>
      <Text
        size="12px"
        fw={400}
        c="#6E7172"
        style={{ lineHeight: 1.2, marginTop: '2px' }}
      >
        سبد خرید
      </Text>

      <Drawer.Root
        opened={opened}
        onClose={handleClose}
        position="left"
        size={drawerSize}
        closeOnClickOutside={true}
        closeOnEscape={true}
        lockScroll={false}
        transitionProps={{ transition: 'slide-right', duration: 200 }}
        styles={{
          root: { zIndex: 1005 },
          inner: {
            left: 0,
            right: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            position: 'fixed',
            zIndex: 1005
          },
          overlay: { 
            zIndex: 1004,
            cursor: 'pointer',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          content: {
            left: 0,
            right: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            maxHeight: '100vh',
            minWidth: isMobile ? 'auto' : '500px',
            width: isMobile ? '100%' : '500px',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1006,
            backgroundColor: '#f7f7f7'
          },
          header: {
            flexShrink: 0,
            padding: 0,
            backgroundColor: '#fff',
            borderBottom: '1px solid #e0e0e0',
            height: '56px'
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            backgroundColor: '#f7f7f7'
          }
        }}
      >
        <Drawer.Overlay 
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        />
        <Drawer.Content
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Drawer.Header>
            <Flex justify="space-between" align="center" w="100%" px={isMobile ? 1 : 2} py={isMobile ? 2 : 2.5}>
              <ActionIcon
                size="lg"
                variant="subtle"
                color="black"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClose();
                }}
              >
              <IoCloseSharp size={24} color="var(--mantine-color-gray-7)" />

              </ActionIcon>
              <Text fw={600} size="md" c="#000000FF" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>سبد خرید</Text>
              <div style={{ width: '40px' }}></div>
            </Flex>
          </Drawer.Header>
          <Drawer.Body>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              width: '100%'
            }}>
              {!shouldShowCart ? (
                <Center style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', width: '100%' }}>
                  <InfoBox back={false} shadow="0" style={{ width: '100%', textAlign: 'center' }}>
                    <Stack align="center" gap="md">
                      <NewBasketIcon size={24} color="#4d5053" />
                      <Text size={isMobile ? "sm" : "md"} c="dimmed">لطفا وارد حساب کاربری شوید</Text>
                      <Button 
                        component={NavLink} 
                        to="/login"
                        onClick={() => close()}
                        size="sm"
                        fullWidth={isMobile}
                      >
                        ورود
                      </Button>
                    </Stack>
                  </InfoBox>
                </Center>
              ) : items.length === 0 ? (
                <Center style={{ flex: 1, padding: isMobile ? '1rem' : '2rem', width: '100%' }}>
                  <InfoBox back={false} shadow="0" style={{ width: '100%', textAlign: 'center' }}>
                    <Stack align="center" gap="md">
<NewBasketIcon size={24} color="#4d5053" />
                      <Text size={isMobile ? "sm" : "md"} c="dimmed">سبد خرید خالی است</Text>
                      <Text size="sm" c="dimmed">محصولات مورد نظر خود را اضافه کنید</Text>
                    </Stack>
                  </InfoBox>
                </Center>
              ) : (
                <>
                  {/* Scrollable content */}
                  <div style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
                    <ScrollArea 
                      style={{ height: '100%', width: '100%' }}
                      type="hover"
                      py={0}
                    >
                      <Stack gap={0}>
                        {items.map((item, index) => {
                          const uniqueKey = `${item.productId}-${item.combinationsID || 'no-combo'}-${index}-${items.length}`;
                          return (
                            <MiniBox 
                              key={uniqueKey}
                              {...item} 
                              item={item}
                            />
                          );
                        })}
                      </Stack>
                    </ScrollArea>
                  </div>

                  {/* Fixed footer matching the design */}
                  <Box
                    style={{
                      borderTop: '1px solid #e0e0e0',
                      padding: 0,
                      backgroundColor: '#fff',
                      zIndex: 10,
                      width: '100%'
                    }}
                  >
                    <Flex 
                      justify="space-between" 
                      align="center"
                      gap="md"
                      px={isMobile ? 2 : 3}
                      py={isMobile ? 2 : 3}
                    >
                      {/* Price section */}
                      <Flex direction="column" gap={4}>
                        <Text size="xs" c="#09346D">
                          قابل پرداخت
                        </Text>
                        <Flex align="center" gap={4}>
                          <Text size="md" fw={700} c="#23254e" mr={4}>
                            <NumberFormatter thousandSeparator value={calculatedTotal} />
                          </Text>
                          <PriceText fontSize="8px">تومان</PriceText>
                        </Flex>
                      </Flex>

                      {/* Checkout button */}
                     <Button
                        onClick={handleNavigateToBasket}
                        size="md"
                        px={16}
                        py={12}
                        h={48}
                        radius="md"
                        style={{
                          flex: 1,
                          backgroundColor: '#09346D',
                          color: '#fff',
                          fontWeight: 500,
                          fontSize: '14px',
                          height: '48px',
                        }}
                      >
                        تایید و تکمیل سفارش
                      </Button>

                    </Flex>
                  </Box>
                </>
              )}
            </div>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </div>
  );
};

export default MiniCart;