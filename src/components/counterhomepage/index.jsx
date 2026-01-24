// src\components\counterhomepage\index.jsx
import { ActionIcon, Flex, Input, LoadingOverlay, Modal, Text, Box, Button } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useState } from "react";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

const cartAPI = {
  updateCart: async (body) => {
    const token = localStorage.getItem("user");
    
    try {
      const response = await fetch(getApiUrl("/cart/update"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
        body: JSON.stringify(body),
      });
    
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update cart");
      }

      const cartResponse = await fetch(getApiUrl("/cart"), {
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
      });
      
      if (!cartResponse.ok) {
        throw new Error("Failed to fetch cart data");
      }
      
      const serverD = await cartResponse.json();

      return {
        message: "ok",
        cart: serverD.cart || [],
        total: serverD.cart
          ? serverD.cart.reduce(
              (sum, item) => sum + item.price.discountedPrice * item.count,
              0
            )
          : 0,
      };
    } catch (error) {
      console.error("Update cart error:", error);
      throw error;
    }
  },

  removeFromCart: async (body) => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
        body: JSON.stringify(body),
      });
    
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from cart");
      }

      const cartResponse = await fetch(getApiUrl("/cart"), {
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
      });
      
      if (!cartResponse.ok) {
        throw new Error("Failed to fetch cart data");
      }
      
      const serverD = await cartResponse.json();

      return {
        message: "ok",
        cart: serverD.cart || [],
        total: serverD.cart
          ? serverD.cart.reduce(
              (sum, item) => sum + item.price.discountedPrice * item.count,
              0
            )
          : 0,
      };
    } catch (error) {
      console.error("Remove from cart error:", error);
      throw error;
    }
  },

  getCart: async () => {
    const token = localStorage.getItem("user");

    try {
      const response = await fetch(getApiUrl("/cart"), {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`, 
          "Content-Type": "application/json"      
        },
      });

      if (!response.ok) {
        localStorage.removeItem("user");
        throw new Error("Failed to fetch cart data");
      }
      
      const serverD = await response.json();

      return {
        message: "ok",
        cart: serverD.cart || [],
        totalPrice: serverD.total || 0
      };
    } catch (error) {
      console.error("Get cart error:", error);
      return {
        message: "error",
        cart: [],
        totalPrice: 0,
      };
    }
  }
};

const CounterHomePage = ({ 
  productId, 
  defaultSellerId, 
  defaultCombinationId,
  stock = 0,
  minOrder = 1,
  maxOrder = 0
}) => {
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication state
  const { isVerified, user } = useSelector((state) => state.auth);
  const items = useSelector((state) => state.cart?.items || []);

  // Calculate dynamic width based on number of digits
  const getTextWidth = (number) => {
    const digits = String(number).length;
    // Minimum width of 20px, add 8px per digit
    return Math.max(20, digits * 8);
  };

  // Get the count for this specific product
  const getProductCount = () => {
    if (!items || !Array.isArray(items) || !productId) {
      return 0;
    }
  
    const foundItem = items.find(
      (item) => 
        item.productId === productId &&
        (!defaultSellerId || item.seller.id === defaultSellerId) &&
        (!defaultCombinationId || item.combinationsID === defaultCombinationId)
    );
  
    return foundItem ? foundItem.count : 0;
  };
  
  const count = getProductCount();

  // Check if product is available
  const isAvailable = stock > 0;
  const effectiveMaxOrder = Math.min(maxOrder || stock, stock);

  const handleChange = async (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    try {
      const result = await cartAPI.updateCart({
        "productId": productId,
        "seller": {"id": defaultSellerId}, 
        "count": Number(value),
        "combinationsID": defaultCombinationId,
      });

      if (result.cart) {
        dispatch(setInitial([...result.cart]));
      } else {
        throw new Error("Failed to fetch cart data");              
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
      const result = await cartAPI.removeFromCart({
        "productId": productId,
        "seller": {"id": defaultSellerId}, 
        "combinationsID": defaultCombinationId,
      });

      if (result.cart) {
        dispatch(setInitial([...result.cart]));
      } else {
        throw new Error("Failed to fetch cart data");
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    } finally {
      setIsPending(false);
    }
  };

  const increment = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isAvailable) {
      return;
    }

    // Don't exceed stock or maxOrder
    if (count < effectiveMaxOrder) {
      handleChange(count + 1);
    }
  };

  const decrement = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isAvailable) {
      return;
    }

    if (count > minOrder) {
      handleChange(count - 1);
    } else if (count === minOrder) {
      // If we're at minOrder, remove from cart
      handleRemove();
    }
  };

  const handleAddToCart = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isAvailable) {
      return;
    }
    
    handleChange(minOrder);
  };

  const handleSetMax = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isAvailable) {
      return;
    }

    handleChange(effectiveMaxOrder);
  };

  // Don't render unavailable message if stock is 0 - just show disabled button
  if (stock === 0) {
    return (
      <Box pos="relative">
        <ActionIcon
          size="sm"
          radius="md"
          variant="light"
          color="gray"
          disabled
        >
          <IconPlus size={14} />
        </ActionIcon>
      </Box>
    );
  }

  return (
    <>
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
      >
        <Text>لطفا وارد حساب کاربری شوید</Text>
      </Modal>

      {count > 0 ? (
        <Box pos="relative">
          <LoadingOverlay 
            visible={isPending} 
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
              backgroundColor: "var(--mantine-color-white)",
            }}
          >
            {/* Plus button */}
            <ActionIcon
              size="xs"
              variant="transparent"
              color="gray"
              onClick={increment}
              disabled={count >= effectiveMaxOrder}
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
              {count === minOrder ? <IconTrash size={14} /> : <IconMinus size={14} />}
            </ActionIcon>
          </Flex>
        </Box>
      ) : (
        <Box pos="relative">
          <LoadingOverlay 
            visible={isPending} 
            zIndex={10} 
            overlayProps={{ radius: "6px", blur: 2 }}
            loaderProps={{ size: "sm" }}
          />
          <ActionIcon
            size="36px"
            radius="6px"
            variant="filled"
            onClick={handleAddToCart}
            disabled={!isAvailable}
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

export default CounterHomePage;