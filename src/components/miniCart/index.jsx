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
  Modal,
  Box,
  Input
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUser, IconX, IconCheck, IconMinus, IconPlus } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { setInitial } from "../../redux/cart";
import InfoBox from "../InfoBox";
import { getsubscriptionPlansGet } from "../../redux/usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansActions";
import { DEFAULT_COLOR_MAP } from '../../Libs/attribute_colors/colors';
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import CounterMiniCart from "../counterminicart";
import PriceText from "../priceText";
import { IoCloseSharp } from "react-icons/io5";


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


const MiniBox = ({ productId, item, name, image, price, count, attributes, seller, combinationsID, max, min }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { primaryColor } = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Helper function to handle token expiration
  const handleTokenExpiration = (error) => {
    if (error.message.includes('توکن نامعتبر است') || 
        error.message.includes('Unauthorized') || 
        error.status === 401) {
      localStorage.removeItem("user");
      dispatch(setInitial([]));
      setShowAuthModal(true);
      return true;
    }
    return false;
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  useEffect(() => {
    return () => {
      if (isRemoving) {
        setIsRemoving(false);
      }
    };
  }, [isRemoving]);

  const defaultImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f8f9fa;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9ecef;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad1)" stroke="#dee2e6" stroke-width="1"/>
      <rect x="40" y="60" width="120" height="80" fill="#ffffff" stroke="#ced4da" stroke-width="1" rx="8"/>
      <circle cx="100" cy="100" r="25" fill="#f8f9fa" stroke="#adb5bd" stroke-width="2"/>
      <path d="M85 95 L95 105 L115 85" stroke="#6c757d" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="100" y="165" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">تصویر محصول</text>
    </svg>
  `)}`;
  
  const getValidImageSrc = () => {
    if (!image || 
        image === "" || 
        image === null || 
        image === undefined ||
        (Array.isArray(image) && image.length === 0) ||
        (Array.isArray(image) && image[0] === "")) {
      return defaultImage;
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

  const discountPercentage = useMemo(() => {
    if (price?.regularPrice && price?.discountedPrice && price.regularPrice > price.discountedPrice) {
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

      // Fetch updated cart
      const cartResponse = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (cartResponse.status === 401) {
        handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        return;
      }

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData?.message === "ok" && cartData?.cart) {
          dispatch(setInitial([...cartData.cart]));
          notifications.show({
            title: 'موفق',
            message: 'تعداد محصول به‌روزرسانی شد',
            color: 'green',
            icon: <IconCheck size={16} />,
            autoClose: 2000,
            position: 'top-right'
          });
        }
      }

    } catch (error) {
      console.error("Update failed:", error);
      
      if (handleTokenExpiration(error)) {
        return;
      }
      
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

      const cartResponse = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (cartResponse.status === 401) {
        handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        setIsRemoving(false);
        return;
      }

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData?.message === "ok" && cartData?.cart) {
          dispatch(setInitial([...cartData.cart]));
          notifications.show({
            title: 'موفق',
            message: 'محصول از سبد خرید حذف شد',
            color: 'green',
            icon: <IconCheck size={16} />,
            autoClose: 3000,
            position: 'top-right'
          });
        }
      }

      setIsRemoving(false);

    } catch (error) {
      console.error("Remove failed:", error);
      
      if (handleTokenExpiration(error)) {
        setIsRemoving(false);
        return;
      }
      
      let errorMessage = 'مشکلی پیش آمده است دوباره تلاش کنید';
      let errorTitle = 'خطا در حذف';
      
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'محصول در سبد خرید یافت نشد';
        errorTitle = 'محصول یافت نشد';
      } else if (error.message.includes('400')) {
        errorMessage = 'اطلاعات ارسالی نامعتبر است';
        errorTitle = 'خطا در اطلاعات';
      } else if (error.message.includes('401') || error.message.includes('authentication')) {
        errorMessage = 'لطفا دوباره وارد شوید';
        errorTitle = 'خطا در احراز هویت';
      } else if (error.message.includes('500')) {
        errorMessage = 'مشکل در سرور، لطفا بعداً تلاش کنید';
        errorTitle = 'خطا در سرور';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
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
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Text mb="md">لطفا وارد حساب کاربری شوید</Text>
        <Flex gap="sm" justify="flex-end">
          <Button 
            variant="outline" 
            onClick={() => setShowAuthModal(false)}
          >
            انصراف
          </Button>
          <Button 
            onClick={handleLoginRedirect}
          >
            ورود به حساب کاربری
          </Button>
        </Flex>
      </Modal>

      {/* Main container matching the design */}
      <Box
        style={{
          padding: isMobile ? '8px' : '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          opacity: isRemoving ? 0.5 : 1,
          transition: 'all 0.3s ease',
          backgroundColor: '#fff'
        }}
      >
        {/* Product row */}
        <Flex gap={isMobile ? 4 : 8} align="flex-start">
          {/* Image */}
          <Anchor component={NavLink} to={`product/${productId}`}>
            <Image 
              src={getValidImageSrc()} 
              w={60}
              h={60}
              fit="contain" 
              style={{
                objectFit: 'contain'
              }}
            />
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
                  {/* <Text size="xs" c="#81858b" mr={8}>
                    {attr.color}
                  </Text> */}
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
    max={max}
    min={min}
    onUpdate={updateItem}
    onRemove={removeItem}
    isLoading={isRemoving}
  />

  {/* Price section */}
  <Flex direction="column" align="flex-end" gap={4}>
    {/* Discounted price or regular price */}
    <Flex align="center" gap={4}>
      <Text size="lg" fw={700} c="#23254e">
        <NumberFormatter thousandSeparator value={price?.discountedPrice || price?.regularPrice} />
      </Text>
      <PriceText fontSize="10px">تومان</PriceText>
      
      {/* Discount badge next to price */}

    </Flex>

    {/* Show regular price if there's a discount */}
    {(
      <Flex align="center" gap={4} style={{ textDecoration: 'line-through', textDecorationColor: 'grey', }}>
      {discountPercentage && (
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
      )}
      
        <Text size="sm" c="#a1a3a8">
          <NumberFormatter thousandSeparator value={price.regularPrice} />
        </Text>
        <PriceText fontSize="10px">تومان</PriceText>

        
          {/* <Flex
            align="center"
            justify="center"
            w={32}
            h={20}
            style={{
              borderRadius: '45%',
              backgroundColor: 'red',
              padding: '4px 8px',
            }}
          >
          <Text c="white" size="xs" fw={700}>
            {price.regularPrice > 0
              ? (
                  ((price.regularPrice - price.discountedPrice) /
                    price.regularPrice) *
                  100
                ).toFixed(1)
              : '0.0'}
            %
          </Text>

          </Flex> */}

      </Flex>
    )}
  </Flex>
</Flex>


      </Box>
    </>
  );
};

const MiniCart = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallMobile = useMediaQuery('(max-width: 480px)');

  const cartState = useSelector((state) => state.cart);
  const items = cartState?.items || [];

  const { user, isVerified } = useSelector((state) => state.auth);

  const calculatedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemPrice = item.price?.discountedPrice || item.price?.regularPrice || 0;
      return total + (itemPrice * item.count);
    }, 0);
  }, [items]);

  const shouldShowCart = user && isVerified;
  const cartCount = shouldShowCart ? items.length : 0;

  const handleNavigateToBasket = () => {
    close();
    setTimeout(() => {
      navigate("/basket");
    }, 100);
  };

  const drawerSize = isSmallMobile ? '500px' : isMobile ? '500px' : 500;

  return (
    <>
      <Indicator
        offset={2}
        withBorder
        size={18}
        label={cartCount > 0 ? cartCount : ""}
        disabled={!shouldShowCart || cartCount === 0}
        color="red"
        inline
        styles={{
          indicator: { paddingTop: "1px", fontSize: "10px", borderRadius: "5px",     
          width: "22px",             
          height: "24px",  
          marginTop:'10px',
          marginRight: '5px'
        },

        }}
      >
        <Button
          variant="subtle"
          color="gray"
          onClick={open}
          styles={{
            root: {
              height: '42px',
              width: '47px',
              minWidth: '45px',
              padding: '2px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1px',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: 'transparent'
              }
            },
            label: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1px'
            }
          }}
        >
          <CartIcon size={35} color="var(--mantine-color-gray-7)" />
          <Text size="12px" fw={400} c="gray.7" style={{ lineHeight: 1, paddingTop: '2px' }}>
            سبد خرید
          </Text>
        </Button>
      </Indicator>

      <Drawer.Root
        opened={opened}
        onClose={close}
        position="right"
        size={drawerSize}
        styles={{
          root: { zIndex: 1005 },
          inner: {
            right: 0,
            left: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            position: 'fixed',
            zIndex: 1005
          },
          overlay: { zIndex: 1005 },
          content: {
            right: 0,
            left: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            maxHeight: '100vh',
            minWidth: isMobile ? 'auto' : '500px',
            width: isMobile ? '100%' : '500px',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1005,
            backgroundColor: '#f7f7f7'
          },
          header: {
            flexShrink: 0,
            padding: isMobile ? '12px 16px' : '14px 20px',
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
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Flex justify="space-between" align="center" w="100%">
              <ActionIcon
                size="lg"
                variant="subtle"
                color="black"
                onClick={close}
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
                      <CartIcon size={35} color="gray" />
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
                      <CartIcon size={35} color="gray" />
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
                      px={isMobile ? "sm" : "md"}
                      py={isMobile ? "xs" : "md"}
                    >
                      <Stack gap={isMobile ? "sm" : "md"}>
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
                      padding: isMobile ? '12px 16px' : '16px',
                      backgroundColor: '#fff',
                      zIndex: 10,
                      width: '100%'
                    }}
                  >
                    <Flex 
                      justify="space-between" 
                      align="center"
                      gap="md"
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
    </>
  );
};

export default MiniCart;