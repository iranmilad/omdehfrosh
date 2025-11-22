import { ActionIcon, Flex, Input, LoadingOverlay, Modal, Text, Box } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useState, useEffect } from "react";
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

const CounterHomePage = ({ productId, defaultSellerId, defaultCombinationId }) => {
  const dispatch = useDispatch();
  const [isPending, setIsPending] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Authentication state
  const { isVerified, user } = useSelector((state) => state.auth);
  const items = useSelector((state) => state.cart?.items || []);

  // Load cart data on component mount
  useEffect(() => {
    const loadCartData = async () => {
      try {
        const result = await cartAPI.getCart();
        if (result.cart && result.cart.length > 0) {
          dispatch(setInitial([...result.cart]));
        }
      } catch (error) {
        console.error("Failed to load cart data:", error);
      }
    };
    
    loadCartData();
  }, [dispatch]);

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

    handleChange(count + 1);
  };

  const decrement = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (count > 1) {
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
    
    handleChange(1);
  };

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
            overlayProps={{ radius: "50px", blur: 2 }}
            loaderProps={{ size: "sm" }}
          />
          <Flex
          align="center"
          justify="space-between"
          style={{
            border: "1px solid #394343FF",
            borderRadius: "50px",
            padding: "0px 8px",
            minWidth: "120px",
            backgroundColor: "white",
          }}
        >
          <ActionIcon
            size="md"
            variant="transparent"
            color="#394343FF"
            onClick={increment}
          >
            <IconPlus size={20} />
          </ActionIcon>
        
        <Box
            style={{
              width: "0.6px",
              height: "24px",
              backgroundColor: "#394343FF",
            }}
          />
          
        <Text
            fw={400}
            fz="15px"
            c="orange"
            style={{ minWidth: "24px", textAlign: "center" }}
          >
            {count}
          </Text>
          <Box
            style={{
              width: "0.6px",
              height: "24px",
              backgroundColor: "#394343FF",
            }}
          />

        <ActionIcon
            size="md"
            variant="transparent"
            color="red"
            onClick={decrement}
          >
            {count === 1 ? <IconTrash size={20} /> : <IconMinus size={20} />}
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
          styles={{
            root: {
              backgroundColor: "white",
              border: "1px solid #ccc",
              color: "black",
              "&:hover": {
                backgroundColor: "#f8f8f8",
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