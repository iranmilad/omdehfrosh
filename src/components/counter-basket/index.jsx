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
    onRemoveComplete, // NEW: Callback to notify parent when removal is complete
    productImage,
    attributes,
    poductName,
    price,
    max,
    min
  } = props;

  const productIdStr = typeof productId === 'string' ? productId : String(productId || '');
  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const isRemoving = useRef(false);
  const items = useSelector((state) => state.cart?.items || []);

  // Calculate dynamic width based on number of digits
  const getInputWidth = (number) => {
    const digits = String(number).length;
    // Base width + additional width per digit
    return Math.max(35, 20 + (5 * 7));
  };

  const getProductCount = (items, productId, seller, combinationsID) => {
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
      const currentCount = getProductCount(items, productId, seller, combinationsID);
      setLocalCount(currentCount);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isPageLoading || isRemoving.current) return;
    
    isRemoving.current = true;
    setIsPageLoading(true);
    
    try {
      const response = await cartAPI.removeFromCart({
        productId,
        seller: seller,
        combinationsID,
      });
      
      if (response?.cart !== undefined) {
        // Update Redux store
        dispatch(setInitial([...response.cart]));
        
        // Set local count to 0
        setLocalCount(0);
        
        // Call UI-only remove function
        if (removeFun && typeof removeFun === 'function') {
          removeFun();
        }
        
        // NEW: Notify parent component that removal is complete
        if (onRemoveComplete && typeof onRemoveComplete === 'function') {
          onRemoveComplete();
        }
      }
      
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setIsPageLoading(false);
      isRemoving.current = false;
    }
  };

  const shouldShowCounter = localCount > 0 && !productIdStr.toLowerCase().includes("subscription");

  return (
    <>
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
        <Flex align="center" gap="2px" style={{ minWidth: 'fit-content' }}>
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
            onClick={increment}
            disabled={isPageLoading || localCount >= realMax}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconPlus color="#093572" size={15} />
          </ActionIcon>

          <Input
            type="number"
            w={getInputWidth(localCount)}
            styles={{ 
              input: { 
                textAlign: "center",
                padding: "0 2px",
                fontSize: "14px",
                fontWeight: 500,
              } 
            }}
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
              onClick={decrement}
              disabled={isPageLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconMinus size={15} />
            </ActionIcon>
          ) : (
            <ActionIcon
              radius="999999"
              size="md"
              variant="light"
              color=""
              onClick={handleRemove}
              disabled={isPageLoading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
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