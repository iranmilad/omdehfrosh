import { ActionIcon, Button, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useEffect, useState } from "react";

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
  
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const [matchingCombination, setMatchingCombination] = useState(undefined);
  const [count, setCount] = useState(0); // Start with 0 instead of 1
  const [isPending, setIsPending] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get Redux cart items
  const items = useSelector((state) => state.cart?.items || []);

  // Function to get API URL
  const getApiUrl = (endpoint) => {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}${endpoint}`;
  };

  // Function to find current item count from Redux store
  const getCurrentItemCount = () => {
    const matchedItem = items.find(cartItem =>
      cartItem.productId === item?.id &&
      cartItem.combinationsID?.toString() === item?.combinationsID?.toString() &&
      cartItem.seller?.id === item?.seller?.id
    );

    return matchedItem ? matchedItem.count : 0;
  };

  // Update local count whenever Redux cart changes
  useEffect(() => {
    const currentCount = getCurrentItemCount();
    setCount(currentCount);
  }, [items, item?.id, item?.combinationsID, item?.seller?.id]);

  // Fetch cart data and sync with Redux
  const fetchAndSyncCart = async () => {
    const token = localStorage.getItem("user");
    
    if (!token) return;
    
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
          localStorage.removeItem("user");
        }
        throw new Error("Failed to fetch cart data");
      }
      
      const serverData = await response.json();
      
      if (serverData.message === "ok" && Array.isArray(serverData.cart)) {
        // Update Redux store with fresh cart data
        dispatch(setInitial(serverData.cart));
      }
      
    } catch (error) {
      console.error("Error fetching cart:", error);
      // On error, don't change the cart state
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update cart");
      }

      const data = await response.json();
      
      // Refresh cart data from server and sync with Redux
      await fetchAndSyncCart();
      
      return data;
    } catch (error) {
      console.error("Error updating cart:", error);
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
        throw new Error(errorData.message || "Failed to remove item");
      }

      const data = await response.json();
      
      // Update Redux with the cart data returned from remove API
      if (data.message === "ok") {
        dispatch(setInitial(data.cart || []));
      } else {
        // Fallback: refresh cart data from server
        await fetchAndSyncCart();
      }
      
      return data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      // On error, refresh cart to get current state
      await fetchAndSyncCart();
      throw error;
    }
  };

  // Load cart data on component mount
  useEffect(() => {
    if (user && isVerified) {
      fetchAndSyncCart();
    }
  }, [user, isVerified]);

  const extractAttributes = (attributes) => {
    let result = [{}];

    attributes?.forEach(attr => {
      if (attr.type === "color") {
        result[0].color = attr.label || "";
      } else if (attr.type === "warranty") {
        result[0].warranty = attr.label || "";
      }
    });

    return result;
  };

  const handleChange = async (value) => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    const newCount = Math.max(1, parseInt(value, 10));
    
    try {
      await updateCartItem({
        "productId": item?.id,
        "seller": item?.seller,
        "count": newCount,
        "combinationsID": item?.combinationsID,
      });

      // The count will be updated via useEffect when Redux state changes
      
    } catch (error) {
      console.error("Failed to update cart:", error);
      // Optionally show error notification here
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async () => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    try {
      await removeCartItem({
        productId: item?.id,
        seller: item?.seller,
        combinationsID: item?.combinationsID,
      });

      // The count will be updated to 0 via useEffect when Redux state changes
      
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Optionally show error notification here
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
    // Check if user is authenticated before adding to cart
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }
    
    handleChange(Number(item?.minOrder) || 1);
  };

  // Check if component is still loading essential data
  const isComponentLoading = !item;

  return (
    <>
      {/* Authentication Modal */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
      >
        <Text>لطفا وارد حساب کاربری شوید</Text>
      </Modal>

      {/* Single LoadingOverlay for all loading states */}
      <LoadingOverlay 
        pos="fixed" 
        visible={isPending || isLoading || isComponentLoading} 
        zIndex={1000} 
        h="100%" 
        w="100%"
        top={0}
        left={0}
      />

      {count > 0 ? (
        <Flex align="center" gap="1">
          <Button
            p={0}
            px={0}
            h={15}
            w={70}
            variant="transparent"
            size="10px"
            onClick={() => {
              if (item?.stock) {
                handleChange(item.stock);
              }
            }}
          >
            حداکثر
          </Button>

          <ActionIcon
            size="md"
            radius="999999"
            variant="light"
            color="green"
            onClick={increment}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPlus size={15} />
          </ActionIcon>

          <Input
            type="number"
            w={25}
            styles={{ input: { textAlign: "center" } }}
            variant="unstyled"
            value={count}
            readOnly
            px={0}
          />

          <ActionIcon
            size="md"
            radius="999999"
            variant="light"
            color="red"
            onClick={decrement}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconMinus size={10} />
          </ActionIcon>
        </Flex>
      ) : (
        <Button
          fullWidth
          h={45}
          onClick={handleAddToCart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconBasket />
        </Button>
      )}
    </>
  );
};

export default CounterFastOrder;