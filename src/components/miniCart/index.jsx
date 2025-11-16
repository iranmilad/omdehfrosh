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
  Modal
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconUser, IconX, IconCheck } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { setInitial } from "../../redux/cart";
import InfoBox from "../InfoBox";
import { getsubscriptionPlansGet } from "../../redux/usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansActions";
import { DEFAULT_COLOR_MAP } from '../../Libs/attribute_colors/colors';
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

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

      <Flex 
        gap={isMobile ? "xs" : "md"}
        pt="sm" 
        w="100%" 
        style={{ 
          opacity: isRemoving ? 0.5 : 1,
          transition: 'all 0.3s ease',
          transform: isRemoving ? 'scale(0.95)' : 'scale(1)',
          borderRadius: '8px',
          padding: isMobile ? '6px' : '8px',
          backgroundColor: 'var(--mantine-color-gray-0)',
          border: '1px solid var(--mantine-color-gray-2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Product Image */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Anchor component={NavLink} to={`product/${productId}`}>
            <Image 
              src={getValidImageSrc()} 
              w={isMobile ? 60 : 80}
              h={isMobile ? 60 : 80}
              fit="contain" 
              radius="md"
              fallbackSrc={defaultImage}
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                backgroundColor: '#fff'
              }}
            />
          </Anchor>
          
          <Badge
            size="xs"
            variant="filled"
            color="blue"
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: '20px',
              height: '20px',
              padding: '0 6px',
              fontSize: '10px',
              fontWeight: 600
            }}
          >
            {count}
          </Badge>
        </div>

        {/* Product Details */}
        <Flex gap="xs" direction="column" flex="1" style={{ minWidth: 0 }}>
          {/* Product Name and Remove Button */}
          <Flex align="flex-start" justify="space-between" gap="xs">
            <Text 
              component={NavLink} 
              to={`product/${productId}`} 
              className="line-clamp-2"
              size={isMobile ? "xs" : "sm"}
              fw={500}
              style={{ 
                flex: 1, 
                minWidth: 0,
                color: 'var(--mantine-color-dark-7)',
                textDecoration: 'none',
                lineHeight: 1.4
              }}
              onMouseEnter={(e) => {
                e.target.style.color = 'var(--mantine-primary-color-filled)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--mantine-color-dark-7)';
              }}
            >
              {name}
            </Text>
            <ActionIcon 
              color="red" 
              variant="light" 
              onClick={removeItem}
              style={{ 
                flexShrink: 0,
                transition: 'all 0.2s ease',
                height: 35, width: 45
              }}
              loading={isRemoving}
              disabled={isRemoving}
              radius="md"
            >
              {isRemoving ? <Loader size={10} /> : <IconTrash size={isMobile ? 10 : 12} />}
            </ActionIcon>
          </Flex>
          
          {/* Product Attributes */}
          {shouldRenderAttributes(attributes) && (
            <Flex gap="xs" wrap="wrap" style={{ margin: '4px 0' }}>
              {attributes?.map((attr, index) => (
                <Flex key={index} gap="xs" wrap="wrap">
                  {attr.color && attr.color !== "" && (
                    <div
                      style={{
                        width: isMobile ? '14px' : '16px',
                        height: isMobile ? '14px' : '16px',
                        borderRadius: '50%',
                        backgroundColor: getColorCode(attr.color),
                        border: '2px solid var(--mantine-color-gray-4)',
                        display: 'inline-block',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  )}
                  
                  {attr.material && attr.material !== "" && (
                    <Badge variant="light" color="gray" size="xs" radius="sm">
                      <Text size="xs">{attr.material}</Text>
                    </Badge>
                  )}
                  
                  {attr.warranty && attr.warranty !== "" && (
                    <Badge variant="light" color="blue" size="xs" radius="sm">
                      <Text size="xs">{attr.warranty}</Text>
                    </Badge>
                  )}
                </Flex>
              ))}
            </Flex>
          )}
          
          {/* Seller Information */}
          <Flex align="center" gap="xs" style={{ margin: '2px 0' }}>
            <IconUser size={isMobile ? 10 : 12} color="var(--mantine-color-gray-6)" />
            <Text size="xs" c="gray.6">{seller?.label}</Text>
          </Flex>

          {/* Price Section */}
          <Flex 
            dir="ltr" 
            gap={isMobile ? "xs" : "sm"}
            align="center" 
            justify="space-between" 
            w="100%"
            style={{ marginTop: 'auto', padding: isMobile ? '4px 0' : '8px 0' }}
          >
            <Flex direction="column" align="start" gap="2px">
              <Flex align="center" gap="xs">
                <Text fw={600} size={isMobile ? "xs" : "sm"} c="dark">
                  <NumberFormatter 
                    thousandSeparator 
                    value={price?.discountedPrice || price?.regularPrice} 
                  />
                  <Text component="span" size="xs" c="dimmed" mr="4px">
                    تومان
                  </Text>
                </Text>
                
                {discountPercentage && (
                  <Badge color="red" size="xs" variant="filled" radius="sm">
                    {discountPercentage}%
                  </Badge>
                )}
              </Flex>
              
              {price?.discountedPrice && price?.regularPrice > price?.discountedPrice && (
                <Text 
                  size="xs" 
                  c="gray.5" 
                  style={{ textDecoration: 'line-through' }}
                >
                  <NumberFormatter 
                    thousandSeparator 
                    value={price.regularPrice} 
                  />
                </Text>
              )}
            </Flex>
            
            <Flex 
              align="center" 
              gap="xs"
              style={{
                backgroundColor: 'var(--mantine-primary-color-light)',
                padding: isMobile ? '3px 6px' : '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--mantine-primary-color-outline)'
              }}
            >
              <Text c="var(--mantine-primary-color-filled)" size="xs" fw={500}>
                × {count}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
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

  // Determine drawer size based on screen size
  const drawerSize = isSmallMobile ? '100%' : isMobile ? '85%' : 450;

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
          indicator: { paddingTop: "1px", fontSize: "10px" },
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
          inner: {
            right: 0,
            left: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            position: 'fixed'
          },
          content: {
            right: 0,
            left: 'auto',
            top: 0,
            bottom: 0,
            height: '100vh',
            maxHeight: '100vh',
            minWidth: isMobile ? 'auto' : '450px',
            width: isMobile ? '100%' : '450px',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column'
          },
          header: {
            flexShrink: 0,
            padding: isMobile ? '0.75rem' : '1rem'
          },
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0
          }
        }}
      >
        <Drawer.Overlay />
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title fw={600} size={isMobile ? "sm" : "md"}>سبد خرید</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>

          <Drawer.Body
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              width: '100%'
            }}
          >
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
                      px={isMobile ? "sm" : "lg"}
                      py={isMobile ? "xs" : "md"}
                    >
                      <Stack className="divide-y" gap="sm">
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

                  {/* Fixed footer - RESPONSIVE */}
                  <div
                    style={{
                      borderTop: '1px solid var(--mantine-color-gray-3)',
                      padding: isMobile ? '0.75rem 1rem' : '1.25rem',
                      backgroundColor: 'var(--mantine-color-body)',
                      zIndex: 10,
                      width: '100%',
                      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <Flex 
                      justify="space-between" 
                      align="center" 
                      gap={isMobile ? "xs" : "md"}
                      direction={isSmallMobile ? "column" : "row"}
                    >
                      <Flex 
                        direction="column" 
                        align={isSmallMobile ? "center" : "start"}
                        style={{ width: isSmallMobile ? '100%' : 'auto' }}
                      >
                        <Text size="xs" c="gray" component="span">
                          جمع کل
                        </Text>
                        <Text component="span" fw={600} size={isMobile ? "sm" : "md"}>
                          <NumberFormatter
                            thousandSeparator
                            value={calculatedTotal}
                          />
                          <Text component="span" size="xs" c="dimmed" mr="xs">
                            تومان
                          </Text>
                        </Text>
                      </Flex>
                      <Button
                        onClick={handleNavigateToBasket}
                        size={isMobile ? "sm" : "md"}
                        fullWidth={isSmallMobile}
                        style={{ 
                          minWidth: isSmallMobile ? '100%' : isMobile ? '80px' : '100px',
                          marginTop: isSmallMobile ? '0.5rem' : 0
                        }}
                      >
                        ادامه
                      </Button>
                    </Flex>
                  </div>
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