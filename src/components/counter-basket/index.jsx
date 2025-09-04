import { ActionIcon, Button, Flex, Input, Loader, LoadingOverlay } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useProduct } from "../../views/public/product";
import { useEffect, useState, useRef } from "react";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

// Direct API functions


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

      // Get fresh cart data
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
        total: serverD.total || 0,
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

      // Return the response data directly since backend already returns fresh cart
      return {
        message: "ok",
        cart: data.cart || [],
        total: data.total || 0,
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
        // localStorage.removeItem("user");
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

const CounterBasket = (props) => {
  const {
    productId,
    seller,
    combinationsID,
    removeFun,
    productImage,
    attributes,
    poductName,
    price,
    max,
    min
  } = props;


  // Safely convert productId to string for string operations
  const productIdStr = typeof productId === 'string' ? productId : String(productId || '');

  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  const [isPageLoading, setIsPageLoading] = useState(false);
  
  // Add ref to prevent double calls
  const isRemoving = useRef(false);

  // Get items from Redux store
  const items = useSelector((state) => state.cart?.items || []);

  const getProductCount = (items, productId, seller, combinationsID) => {
    // Normalize both values for comparison
    const normalizeId = (id) => String(id).trim();
    const normalizeCombinationId = (id) => parseInt(id);
    
    const searchProductId = normalizeId(productId);
    const searchSellerId = seller?.id || seller;
    const searchCombinationId = normalizeCombinationId(combinationsID);
    
    const foundItem = items.find((item) => {
      const itemProductId = normalizeId(item.productId);
      const itemSellerId = item.seller?.id || item.seller_id;
      const itemCombinationId = normalizeCombinationId(item.combinationsID);
      
      return (
        itemProductId === searchProductId &&
        itemSellerId === searchSellerId &&
        itemCombinationId === searchCombinationId
      );
    });

    return foundItem ? foundItem.count : 0;
  };
    
  const count = getProductCount(items, productId, seller, combinationsID);
  const [localCount, setLocalCount] = useState(count);

  // Update local count when Redux store changes
  useEffect(() => {
    const currentCount = getProductCount(items, productId, seller, combinationsID);
    setLocalCount(currentCount);
  }, [items, productId, seller, combinationsID]);


const realMax = Math.min(max || Infinity, props.stock || Infinity);

const increment = () => {
  if (localCount >= realMax || isPageLoading) return;

  const newCount = localCount + 1;
  setLocalCount(newCount);
  handleChange({ value: newCount });
};

const handleMaxClick = () => {
  if (realMax && !isPageLoading) {
    setLocalCount(realMax);
    handleChange({ value: realMax });
  }
};

  



  const decrement = () => {
    if (isPageLoading) return;
    
    if (localCount > min) {
      const newCount = localCount - 1;
      setLocalCount(newCount);
      handleChange({ value: newCount });
    } else if (localCount === min || localCount === 1) {
      handleRemove();
    }
  };

  const handleChange = async ({value}) => {
    setIsPageLoading(true);
    
    try {
      const response = await cartAPI.updateCart({
        "productId": productId,
        "seller": seller, 
        "count": Number(value),
        "combinationsID": combinationsID,
      });
      
      if (response?.cart) {
        dispatch(setInitial([...response.cart]));
      }
    } catch (error) {
      console.error("Update failed:", error);
      // Revert local count on error
      const currentCount = getProductCount(items, productId, seller, combinationsID);
      setLocalCount(currentCount);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleRemove = async () => {
    // Prevent double calls
    if (isPageLoading || isRemoving.current) return;
    
    isRemoving.current = true;
    setIsPageLoading(true);
    
    try {
      
      const response = await cartAPI.removeFromCart({
        productId,
        seller: seller,
        combinationsID,
      });
      
      
      // Force update Redux store with fresh cart data
      if (response?.cart !== undefined) {
        dispatch(setInitial([...response.cart]));
        
        // Set local count to 0 immediately
        setLocalCount(0);
        
        // Call the UI-only remove function to hide the Product component
        if (removeFun && typeof removeFun === 'function') {
          removeFun();
        }
      }

      const response2 = await cartAPI.getCart();

      if (response2?.cart) {
        dispatch(setInitial([...response.cart]));
      }
      
    } catch (error) {
      // Don't show error for "Cart not found" as it might be a double call
      if (!error.message?.includes("Cart not found")) {
        // Handle other errors appropriately
      }
    } finally {
      setIsPageLoading(false);
      isRemoving.current = false;
    }
  };


  // Show counter only if item is in cart and not a subscription
  const shouldShowCounter = localCount > 0 && !productIdStr.toLowerCase().includes("subscription");

  return (
    <>
      {/* Full page loading overlay */}
      <LoadingOverlay 
        pos="fixed" 
        visible={isPageLoading} 
        zIndex={1000} 
        h="100%" 
        w="100%"
        top={0}
        left={0}
      />
      
      {shouldShowCounter ? (
        <Flex align="center" gap="4">
          <Button 
            p={0} 
            px={4} 
            h={15} 
            variant="transparent" 
            size="10px" 
            onClick={handleMaxClick}
            disabled={isPageLoading}
          >
            حداکثر
          </Button>
          <ActionIcon
            size="md"
            radius="999999"
            variant="light"
            color="green"
            onClick={increment}
            disabled={isPageLoading || localCount >= realMax}
          >
            <IconPlus size={15} />
          </ActionIcon>

          
          <Input
            type="number"
            w={35}
            styles={{ input: { textAlign: "center" } }}
            variant="unstyled"
            value={localCount}
            readOnly
            px={0}
          />
          
          {localCount > min ? (
            <ActionIcon
              size="md"
              radius="999999"
              variant="light"
              color="red"
              onClick={decrement}
              disabled={isPageLoading}
            >
              <IconMinus size={15} />
            </ActionIcon>
          ) : (
            <ActionIcon
              radius="999999"
              size="md"
              variant="light"
              color="red"
              onClick={handleRemove}
              disabled={isPageLoading}
            >
              <IconTrash size={15} />
            </ActionIcon>
          )}
        </Flex>
      ) : (
        <Button
          fullWidth
          leftSection={<IconBasket />}
          h={45}
          onClick={() => handleChange({ value: min || 1 })}
          disabled={isPageLoading}
        >
          افزودن  
        </Button>
      )}
    </>
  );
};

export default CounterBasket;