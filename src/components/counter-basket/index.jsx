import { ActionIcon, Button, Flex, Input, Loader, LoadingOverlay } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { setInitial, clearCart } from "../../redux/cart";
import { logout } from "../../redux/auth/authusers/auth";
import { logout as logoutMaster } from "../../redux/auth/authmaster/authMasterSlice";
import { clearCacheOnLogout } from "../../Libs/reactQuery";
import { useEffect, useState, useRef, useCallback } from "react";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";
import ReloginRequiredModal from "../ReloginRequiredModal";

// Direct API functions (no separate /cart fetch; use userInitialData cache)
// Throws error with .status === 401 when backend returns 401 so callers can show relogin modal
const cartAPI = {
  updateCart: async (body) => {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/cart/update"), {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      const err = new Error(data.message || "Unauthorized");
      err.status = 401;
      throw err;
    }
    if (!response.ok) {
      throw new Error(data.message || "Failed to update cart");
    }
    return {
      message: data.message || "ok",
      cart: data.cart,
      total: data.total,
    };
  },

  removeFromCart: async (body) => {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/cart/remove"), {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      const err = new Error(data.message || "Unauthorized");
      err.status = 401;
      throw err;
    }
    if (!response.ok) {
      throw new Error(data.message || "Failed to remove from cart");
    }
    return {
      message: "ok",
      cart: data.cart || [],
      total: data.total || 0,
    };
  },

  getCart: async () => {
    const token = localStorage.getItem("user");
    const response = await fetch(getApiUrl("/cart"), {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    const serverD = await response.json().catch(() => ({}));
    if (response.status === 401) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }
    if (!response.ok) {
      return { message: "error", cart: [], totalPrice: 0 };
    }
    return {
      message: "ok",
      cart: serverD.cart || [],
      totalPrice: serverD.total || 0
    };
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
    min,
    stock,
  } = props;

  const productIdStr = typeof productId === 'string' ? productId : String(productId || '');
  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [showReloginModal, setShowReloginModal] = useState(false);
  const isRemoving = useRef(false);
  const items = useSelector((state) => state.cart?.items || []);

  const clearAuthAndShowReloginModal = useCallback(() => {
    localStorage.removeItem("user");
    if (queryClient) clearCacheOnLogout(queryClient);
    dispatch(logout());
    dispatch(logoutMaster());
    dispatch(clearCart());
    dispatch(setInitial([]));
    setShowReloginModal(true);
  }, [queryClient, dispatch]);

  const getInputWidth = (number) => {
    const digits = String(number).length;
    return Math.max(35, 20 + digits * 7);
  };

  const numMax = max != null && max !== "" ? Number(max) : NaN;
  const numStock = stock != null && stock !== "" ? Number(stock) : NaN;
  const numMin = min != null && min !== "" ? Number(min) : 1;

  const realMax =
    !Number.isNaN(numMax) && !Number.isNaN(numStock)
      ? Math.min(numMax, numStock)
      : !Number.isNaN(numMax)
        ? numMax
        : !Number.isNaN(numStock)
          ? numStock
          : 999;

  const clampCount = (value) => Math.min(Math.max(value, numMin), realMax);

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
  const [inputValue, setInputValue] = useState(String(count));

  useEffect(() => {
    const currentCount = getProductCount(items, productId, seller, combinationsID);
    setLocalCount(currentCount);
  }, [items, productId, seller, combinationsID]);

  useEffect(() => {
    setInputValue(String(localCount));
  }, [localCount]);

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
    
    if (localCount > numMin) {
      const newCount = localCount - 1;
      setLocalCount(newCount);
      handleChange({ value: newCount });
    } else {
      handleRemove();
    }
  };

  const applyInputValue = () => {
    if (isPageLoading) return;

    const trimmed = inputValue.trim();
    if (trimmed === "") {
      setInputValue(String(localCount));
      return;
    }

    const parsed = Number.parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      setInputValue(String(localCount));
      return;
    }

    const nextCount = clampCount(parsed);
    setInputValue(String(nextCount));

    if (nextCount === localCount) {
      return;
    }

    setLocalCount(nextCount);
    handleChange({ value: nextCount });
  };

  const handleInputChange = (event) => {
    const { value } = event.currentTarget;
    if (value === "") {
      setInputValue("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      return;
    }

    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      return;
    }

    if (parsed > realMax) {
      setInputValue(String(realMax));
      return;
    }

    setInputValue(value);
  };

  const handleInputBlur = () => {
    applyInputValue();
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
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
      if (Array.isArray(response?.cart)) {
        dispatch(setInitial([...response.cart]));
      }
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      if (error?.status === 401) {
        clearAuthAndShowReloginModal();
        setLocalCount(0);
        return;
      }
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
      
      if (Array.isArray(response?.cart)) {
        dispatch(setInitial([...response.cart]));
      }
      // Always invalidate both queries to ensure cache stays fresh
      queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      setLocalCount(0);
      if (removeFun && typeof removeFun === 'function') {
        removeFun();
      }
      if (onRemoveComplete && typeof onRemoveComplete === 'function') {
        onRemoveComplete();
      }
      
    } catch (error) {
      if (error?.status === 401) {
        clearAuthAndShowReloginModal();
        setLocalCount(0);
        return;
      }
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
      
      <ReloginRequiredModal opened={showReloginModal} onClose={() => setShowReloginModal(false)} />
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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            w={getInputWidth(inputValue || localCount)}
            styles={{ 
              input: { 
                textAlign: "center",
                padding: "0 2px",
                fontSize: "14px",
                fontWeight: 500,
                MozAppearance: "textfield",
              } 
            }}
            variant="unstyled"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            disabled={isPageLoading}
            px={0}
          />
          
          {localCount > numMin ? (
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