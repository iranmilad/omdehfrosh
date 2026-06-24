// src\components\counterhomepage\index.jsx
import { ActionIcon, Flex, Input, LoadingOverlay, Modal, Text, Box, Button } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
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
  maxOrder = 0,
  dense = false,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
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

  // Get the count for this specific product (normalized IDs so add-to-cart updates UI)
  const getProductCount = () => {
    if (!items || !Array.isArray(items) || productId == null) {
      return 0;
    }
    const norm = (v) => (v == null ? '' : String(v).trim());
    const normCombo = (v) => (v == null || v === '' ? null : Number(v));
    const foundItem = items.find((item) => {
      const productMatch = norm(item.productId) === norm(productId);
      const sellerMatch = defaultSellerId == null || norm(item.seller?.id ?? item.seller) === norm(defaultSellerId);
      const comboMatch = normCombo(item.combinationsID) === normCombo(defaultCombinationId) || (defaultCombinationId == null && (item.combinationsID == null || item.combinationsID === ''));
      return productMatch && sellerMatch && comboMatch;
    });
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
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
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
        queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
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

  const addButtonSize = dense ? 26 : 36;
  const addIconSize = dense ? 12 : 16;
  const counterIconSize = dense ? 11 : 14;

  // Don't render unavailable message if stock is 0 - just show disabled button
  if (stock === 0) {
    return (
      <Box pos="relative">
        <ActionIcon
          size={dense ? "xs" : "sm"}
          radius="md"
          variant="light"
          color="gray"
          disabled
        >
          <IconPlus size={counterIconSize} />
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
                removeScrollProps={{ removeScrollBar: false }}

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
            gap={dense ? "1px" : "2px"}
            style={{
              border: "1px solid var(--mantine-color-gray-4)",
              borderRadius: dense ? "var(--mantine-radius-md)" : "var(--mantine-radius-xl)",
              padding: dense ? "1px 2px" : "2px 4px",
              minWidth: "fit-content",
              maxWidth: "100%",
              backgroundColor: "var(--mantine-color-white)",
            }}
          >
            {/* Increment button */}
            <ActionIcon
              size={dense ? 18 : "xs"}
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
              <IconPlus size={counterIconSize} />
            </ActionIcon>
          
            {/* Divider */}
            <Box
              style={{
                width: "0.5px",
                height: dense ? "12px" : "16px",
                backgroundColor: "var(--mantine-color-gray-4)",
                flexShrink: 0,
              }}
            />
            
            {/* Count display */}
            <Text
              fw={500}
              size={dense ? "10px" : "xs"}
              c="blue"
              style={{ 
                minWidth: `${getTextWidth(count)}px`, 
                textAlign: "center",
                padding: "0 2px",
                lineHeight: 1.1,
              }}
            >
              {count}
            </Text>

            {/* Divider */}
            <Box
              style={{
                width: "0.5px",
                height: dense ? "12px" : "16px",
                backgroundColor: "var(--mantine-color-gray-4)",
                flexShrink: 0,
              }}
            />

            {/* Minus/Trash button */}
            <ActionIcon
              size={dense ? 18 : "xs"}
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
              {count === minOrder ? <IconTrash size={counterIconSize} /> : <IconMinus size={counterIconSize} />}
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
            size={addButtonSize}
            radius={dense ? "4px" : "6px"}
            variant="filled"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            styles={{
              root: {
                backgroundColor: "white",
                border: "1px solid #ccc",
                color: "black",
                width: addButtonSize,
                height: addButtonSize,
                minWidth: addButtonSize,
                minHeight: addButtonSize,
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
            <IconPlus size={addIconSize} />
          </ActionIcon>
        </Box>
      )}
    </>
  );
};

export default CounterHomePage;