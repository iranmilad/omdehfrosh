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
  Loader
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconShoppingCart, IconTrash, IconUser, IconX, IconCheck } from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router";
import { useSend } from "../../Libs/api";
import { setInitial } from "../../redux/cart";
import InfoBox from "../InfoBox";
import { getsubscriptionPlansGet } from "../../redux/usermyaccounts/usermyaccounts/getsubscriptionplans/getSubscriptionPlansActions";
import { DEFAULT_COLOR_MAP } from '../../Libs/attribute_colors/colors'

const MiniBox = ({ productId, item, name, image, price, count, attributes, seller, combinationsID }) => {
  const dispatch = useDispatch();
  const [isRemoving, setIsRemoving] = useState(false);

  const removeQuery = useSend({ url: "/cart/remove" });
  const { primaryColor } = useMantineTheme();

  // Default image fallback logic
  const defaultImage = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f8f9fa" stroke="#e9ecef" stroke-width="2"/>
      <rect x="50" y="70" width="100" height="80" fill="#dee2e6" stroke="#adb5bd" stroke-width="2" rx="4"/>
      <path d="M50 70 L75 50 L125 50 L150 70 Z" fill="#ced4da" stroke="#adb5bd" stroke-width="2"/>
      <path d="M150 70 L150 150 L175 130 L175 50 L150 70 Z" fill="#c6c8ca" stroke="#adb5bd" stroke-width="2"/>
      <rect x="40" y="105" width="120" height="8" fill="#6c757d" opacity="0.7"/>
      <rect x="95" y="60" width="8" height="90" fill="#6c757d" opacity="0.7"/>
      <circle cx="100" cy="110" r="15" fill="#fff" stroke="#6c757d" stroke-width="2"/>
      <rect x="92" y="102" width="16" height="16" fill="none" stroke="#6c757d" stroke-width="2" rx="2"/>
      <circle cx="100" cy="110" r="3" fill="#6c757d"/>
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

  // Helper function to check if attributes should be rendered
  const shouldRenderAttributes = (attrs) => {
    if (!attrs) return false;
    if (Array.isArray(attrs)) {
      if (attrs.length === 0) return false;
      // Check if all elements are empty strings
      return attrs.some(attr => attr && attr !== "");
    }
    return attrs !== "";
  };

  // Helper function to get color code from color name or value
  const getColorCode = (colorValue) => {
    if (!colorValue || colorValue === "") return null;
    
    // If it's already a hex color code, return as is
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    
    // Check if it's a CSS color name or matches our default mapping
    const lowerColorValue = colorValue.toLowerCase();
    return DEFAULT_COLOR_MAP[lowerColorValue] || DEFAULT_COLOR_MAP[colorValue] || colorValue;
  };

  const removeItem = async () => {
    // Set loading state for this specific item
    setIsRemoving(true);

    try {
      const response = await removeQuery.mutateAsync({
        productId,
        seller: seller,
        combinationsID,
      });

      if (response?.message === "error" || !response?.cart ) {
        notifications.show({
          title: 'خطا',
          message: 'مشکلی پیش آمده است دوباره تلاش کنید',
          color: 'red',
          icon: <IconX size={16} />,
          autoClose: 4000,
          position: 'top-right'
        });
        setIsRemoving(false);
        return;
      }

      if (response?.cart) {
        dispatch(setInitial([...response.cart]));
        notifications.show({
          title: 'موفق',
          message: 'محصول از سبد خرید حذف شد',
          color: 'green',
          icon: <IconCheck size={16} />,
          autoClose: 3000,
          position: 'top-right'
        });
      }
    } catch (error) {
      console.error("Remove failed:", error);
      notifications.show({
        title: 'خطا در اتصال',
        message: 'مشکلی پیش آمده است دوباره تلاش کنید',
        color: 'red',
        icon: <IconX size={16} />,
        autoClose: 4000,
        position: 'top-right'
      });
      setIsRemoving(false);
    }

    dispatch(getsubscriptionPlansGet());
    // Note: Don't set setIsRemoving(false) here because the component will unmount when item is removed
  };

  return (
    <Flex 
      gap="md" 
      pt="sm" 
      w="100%" 
      style={{ 
        opacity: isRemoving ? 0.5 : 1,
        transition: 'opacity 0.2s ease'
      }}
    >
      <Anchor component={NavLink} to={`product/${productId}`} style={{ flexShrink: 0 }}>
        <Image 
          src={getValidImageSrc()} 
          w={70} 
          h={70} 
          fit="contain" 
          radius="sm"
          fallbackSrc={defaultImage}
        />
      </Anchor>
      <Flex gap="6" direction="column" flex="1" style={{ minWidth: 0 }}>
        <Flex align="flex-start" justify="space-between" gap="sm">
          <Text 
            component={NavLink} 
            to={`product/${productId}`} 
            className="line-clamp-2"
            size="sm"
            style={{ flex: 1, minWidth: 0 }}
          >
            {name}
          </Text>
          <ActionIcon 
            color="red" 
            variant="light" 
            onClick={removeItem}
            style={{ flexShrink: 0 }}
            size="sm"
            loading={isRemoving}
            disabled={isRemoving}
          >
            {isRemoving ? <Loader size={12} /> : <IconTrash size={12} />}
          </ActionIcon>
        </Flex>
        
        {shouldRenderAttributes(attributes) && (
          <Flex gap="xs" wrap="wrap">
            {attributes?.map((item, index) => (
              <Flex key={index} gap="xs">
                {/* Color attribute */}
                {item.color && item.color !== "" && (
                  <Badge variant="light" color="dark" size="xs">
                    <span style={{ color: getColorCode(item.color) }}>⬤</span>
                  </Badge>
                )}
                {/* Material attribute */}
                {item.material && item.material !== "" && (
                  <Badge variant="light" color="dark" size="xs">
                    <Text size="xs">{item.material}</Text>
                  </Badge>
                )}
                {/* Warranty attribute */}
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
          <Text size="xs" component="span">{seller?.label}</Text>
        </Flex>
        
        <Flex dir="ltr" gap="sm" align="center" justify="space-between" w="100%">
          <Text fw={500} size="sm">
            <NumberFormatter 
              thousandSeparator 
              value={price?.discountedPrice ? price.discountedPrice : price.regularPrice} 
            />
          </Text>
          <Text c="var(--mantine-primary-color-filled)" size="xs">
            x {count}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

const MiniCart = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const navigate = useNavigate();

  // Get cart data from Redux store only
  const cartState = useSelector((state) => state.cart);
  const items = cartState?.items || [];
  
  // Authentication state
  const { user, isVerified } = useSelector((state) => state.auth);

  // Calculate total from Redux items (avoid extra API calls)
  const calculatedTotal = useMemo(() => {
    return items.reduce((total, item) => {
      const itemPrice = item.price?.discountedPrice || item.price?.regularPrice || 0;
      return total + (itemPrice * item.count);
    }, 0);
  }, [items]);

  // Only show cart badge and content when user is authenticated
  const shouldShowCart = user && isVerified;
  const cartCount = shouldShowCart ? items.length : 0;

  // Handle navigation to basket
  const handleNavigateToBasket = () => {
    close(); // Close drawer first
    setTimeout(() => {
      navigate("/basket");
    }, 100); // Small delay to ensure drawer closes smoothly
  };
  
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
        <ActionIcon h={45} color="red" variant="light" size="xl" onClick={open}>
          <IconShoppingCart />
        </ActionIcon>
      </Indicator>
      
      <Drawer.Root
        opened={opened}
        onClose={close}
        position="right"
        size={450}
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
            minWidth: '450px',
            width: '450px',
            position: 'fixed',
            display: 'flex',
            flexDirection: 'column'
          },
          header: {
            flexShrink: 0,
            padding: '1rem'
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
            <Drawer.Title fw={600} size="md">سبد خرید</Drawer.Title>
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
                <Center style={{ flex: 1, padding: '2rem', width: '100%' }}>
                  <InfoBox back={false} shadow="0" style={{ width: '100%', textAlign: 'center' }}>
                    <Stack align="center" gap="md">
                      <IconShoppingCart size={40} color="gray" />
                      <Text size="md" c="dimmed">لطفا وارد حساب کاربری شوید</Text>
                      <Button 
                        component={NavLink} 
                        to="/login"
                        onClick={() => close()}
                        size="sm"
                      >
                        ورود
                      </Button>
                    </Stack>
                  </InfoBox>
                </Center>
              ) : items.length === 0 ? (
                <Center style={{ flex: 1, padding: '2rem', width: '100%' }}>
                  <InfoBox back={false} shadow="0" style={{ width: '100%', textAlign: 'center' }}>
                    <Stack align="center" gap="md">
                      <IconShoppingCart size={40} color="gray" />
                      <Text size="md" c="dimmed">سبد خرید خالی است</Text>
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
                      px="lg"
                      py="md"
                    >
                      <Stack className="divide-y" gap="sm">
                        {items.map((item, index) => (
                          <MiniBox 
                            key={`${item.productId}-${item.combinationsID}-${index}`} 
                            {...item} 
                            item={item}
                          />
                        ))}
                      </Stack>
                    </ScrollArea>
                  </div>

                  {/* Fixed footer */}
                  <div
                    style={{
                      borderTop: '1px solid var(--mantine-color-gray-3)',
                      padding: '1.25rem',
                      backgroundColor: 'var(--mantine-color-body)',
                      zIndex: 10,
                      width: '100%'
                    }}
                  >
                    <Flex justify="space-between" align="center" gap="md">
                      <Flex direction="column" align="start">
                        <Text size="xs" c="gray" component="span">
                          جمع کل
                        </Text>
                        <Text component="span" fw={600} size="md">
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
                        size="sm"
                        style={{ minWidth: '100px' }}
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