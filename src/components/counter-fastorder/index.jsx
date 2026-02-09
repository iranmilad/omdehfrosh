// src\components\counter-fastorder\index.jsx
import { ActionIcon, Button, Flex, LoadingOverlay, Modal, Text, Box } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { setInitial, clearCart } from "../../redux/cart";
import { logout } from "../../redux/auth/authusers/auth";
import { useEffect, useLayoutEffect, useState } from "react";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import { useNavigate } from "react-router-dom";

const CounterFastOrder = (props) => {
  const {
    productId = 125,
    seller = 3,
    onChange,
    options = { t: "" },
    productName = "",
    productImages = "",
    item,
    priceFormat
  } = props;

  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const [matchingCombination, setMatchingCombination] = useState(undefined);
  const [count, setCount] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Use Redux items as the single source of truth
  const items = useSelector((state) => state.cart?.items || []);

  // Enhanced helper function to handle token expiration and update global auth state
  const handleTokenExpiration = async (error) => {
    if (error.message.includes('توکن نامعتبر است') ||
        error.message.includes('Unauthorized') ||
        error.status === 401) {

      try {
        localStorage.removeItem("user");
        dispatch(logout());
        dispatch(clearCart());
        setShowAuthModal(true);
        return true;
      } catch (authError) {
        console.error("Error during token expiration handling:", authError);
        setShowAuthModal(true);
        return true;
      }
    }
    return false;
  };

  // Fetch cart data
  const fetchCartData = async () => {
    const token = localStorage.getItem("user");
    
    try {
      setIsLoading(true);
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleTokenExpiration({ status: 401, message: 'Unauthorized' });
          return [];
        }
        throw new Error("Failed to fetch cart data");
      }
      
      const serverData = await response.json();
      const cartItems = serverData.cart || [];
      
      dispatch(setInitial(cartItems));
      return cartItems;
    } catch (error) {
      console.error("Error fetching cart:", error);
      const tokenExpired = await handleTokenExpiration(error);
      if (!tokenExpired) {
        dispatch(setInitial([]));
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (updateData) => {
    const token = localStorage.getItem("user");
    
    try {
      const response = await fetch(getApiUrl("/cart/update"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await handleTokenExpiration({ status: 401, message: 'Unauthorized' });
          return null;
        }
        
        const errorData = await response.json();
        const error = new Error(errorData.message || "Failed to update cart");
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      await fetchCartData();
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      return data;
    } catch (error) {
      console.error("Error updating cart:", error);
      const tokenExpired = await handleTokenExpiration(error);
      if (tokenExpired) {
        return null;
      }
      throw error;
    }
  };

  // Remove cart item
  const removeCartItem = async (removeData) => {
    const token = localStorage.getItem("user");
    
    try {
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(removeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || "Failed to remove item");
        error.status = response.status;
        
        if (response.status === 401) {
          await handleTokenExpiration(error);
          return null;
        }
        
        throw error;
      }

      const data = await response.json();
      await fetchCartData();
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      return data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      const tokenExpired = await handleTokenExpiration(error);
      if (tokenExpired) {
        return null;
      }
      throw error;
    }
  };

  // Get item count from Redux items (normalized IDs so add/update reflects in UI)
  const getItemCount = (cartItems, currentItem) => {
    if (!Array.isArray(cartItems) || !currentItem) {
      return 0;
    }
    const norm = (v) => (v == null ? '' : String(v).trim());
    const normCombo = (v) => (v == null || v === '' ? null : Number(v));
    const matchedItem = cartItems.find((cartItem) => {
      const productMatch = norm(cartItem.productId) === norm(currentItem.productId);
      const sellerMatch = norm(cartItem.seller?.id ?? cartItem.seller) === norm(currentItem.seller?.id ?? currentItem.seller);
      const a = normCombo(cartItem.combinationsID);
      const b = normCombo(currentItem.combinationsID);
      const comboMatch = a === b || (a == null && b == null);
      return productMatch && sellerMatch && comboMatch;
    });
    return matchedItem ? matchedItem.count : 0;
  };

  // Calculate current item count using Redux items
  const itemCount = getItemCount(items, item);

  // Update local count when itemCount changes
  useEffect(() => {
    setCount(itemCount);
  }, [itemCount]);

  const handleChange = async (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    const newCount = Math.max(1, parseInt(value, 10));

    try {
      const result = await updateCartItem({
        "productId": item?.productId,
        "seller": item?.seller,
        "count": newCount,
        "combinationsID": item?.combinationsID,
      });
      
      if (result === null) {
        return;
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    try {
      const result = await removeCartItem({
        productId: item?.productId,
        seller: item?.seller,
        combinationsID: item?.combinationsID,
      });
      
      if (result === null) {
        return;
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsPending(false);
    }
  };
  
  const increment = () => {
    if (!item?.stock || count < item.stock) {
      handleChange(Math.min(count + 1, item.stock));
    }
  };
  
  const decrement = () => {
    const minOrder = Number(item?.minOrder) || 1;
    
    if (count > minOrder) {
      handleChange(count - 1);
    } else {
      handleRemove();
    }
  };

  const handleAddToCart = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }
    
    handleChange(Number(item?.minOrder) || 1);
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  // Prevent body shift when auth modal is open
  useLayoutEffect(() => {
    if (!showAuthModal) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const prevPaddingLeft = body.style.paddingLeft;
    body.style.overflow = '';
    body.style.paddingRight = '';
    body.style.paddingLeft = '';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      body.style.paddingLeft = prevPaddingLeft;
    };
  }, [showAuthModal]);

  // Check if component is still loading essential data
  const isComponentLoading = !item;

  // Calculate dynamic width based on number of digits
  const getTextWidth = (number) => {
    const digits = String(number).length;
    // Minimum width of 20px, add 8px per digit
    return Math.max(20, digits * 8);
  };

  return (
    <>
      {/* ورود به حساب کاربری / زمان حضور شما منقضی شده است – high z-index, no scroll lock to prevent shift */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
        zIndex={2147483647}
        transitionProps={{ duration: 0 }}
        removeScrollProps={{ removeScrollBar: false }}
        portalProps={typeof document !== 'undefined' && document.getElementById('auth-modal-portal') ? { target: document.getElementById('auth-modal-portal') } : {}}
        styles={{
          root: { zIndex: 2147483647, position: 'fixed', inset: 0 },
          inner: { zIndex: 2147483647, padding: 0 },
          content: { zIndex: 2147483647 },
        }}
        overlayProps={{ style: { zIndex: 2147483647 }, backgroundOpacity: 0, blur: 0 }}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Text mb="md">
          زمان حضور شما منقضی شده است
          <br />
          لطفا وارد حساب کاربری شوید
        </Text>
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

      {/* Show counter UI if item is in cart (count > 0) */}
      {count > 0 ? (
        <Box
          pos="relative"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
          }}
        >
          <LoadingOverlay
            visible={isPending || isLoading}
            zIndex={10}
            overlayProps={{ radius: "md", blur: 2 }}
            loaderProps={{ size: "xs" }}
          />
          <Flex
            align="center"
            gap="2px"
            style={{
              border: "1px solid var(--mantine-color-gray-4)",
              borderRadius: "var(--mantine-radius-xl)",
              padding: "2px 4px",
              minWidth: "fit-content",
              maxWidth: "100%",
              backgroundColor: "var(--mantine-color-white)",
            }}
          >
            {/* Plus button */}
            <ActionIcon
              size="xs"
              variant="transparent"
              color="gray"
              onClick={increment}
              disabled={!item?.stock || count >= item.stock}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconPlus size={14} />
            </ActionIcon>

            {/* Divider */}
            <Box
              style={{
                width: "0.5px",
                height: "16px",
                backgroundColor: "var(--mantine-color-gray-4)",
                flexShrink: 0,
              }}
            />

            {/* Count display */}
            <Text
              fw={500}
              size="xs"
              c="blue"
              style={{
                minWidth: `${getTextWidth(count)}px`,
                textAlign: "center",
                padding: "0 2px",
              }}
            >
              {count}
            </Text>

            {/* Divider */}
            <Box
              style={{
                width: "0.5px",
                height: "16px",
                backgroundColor: "var(--mantine-color-gray-4)",
                flexShrink: 0,
              }}
            />

            {/* Minus/Trash button */}
            <ActionIcon
              size="xs"
              variant="transparent"
              color="red"
              onClick={decrement}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {count === (Number(item?.minOrder) || 1) ? <IconTrash size={14} /> : <IconMinus size={14} />}
            </ActionIcon>
          </Flex>
        </Box>
      ) : (
        // Show add button if item is not in cart
        <Box
          pos="relative"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%"
          }}
        >
          <LoadingOverlay
            visible={isPending || isLoading || isComponentLoading}
            zIndex={10}
            overlayProps={{ radius: "6px", blur: 2 }}
            loaderProps={{ size: "sm" }}
          />
          <ActionIcon
            size="36px"
            radius="6px"
            variant="filled"
            onClick={handleAddToCart}
            disabled={!item?.stock || item.stock === 0}
            styles={{
              root: {
                backgroundColor: "white",
                border: "1px solid #ccc",
                color: "black",
                "&:hover": {
                  backgroundColor: "#f8f8f8",
                },
                "&:disabled": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#e0e0e0",
                  opacity: 0.6,
                  cursor: "not-allowed",
                },
              },
            }}
          >
            <IconPlus size={16} />
          </ActionIcon>
        </Box>
      )}
    </>
  );
};

export default CounterFastOrder;