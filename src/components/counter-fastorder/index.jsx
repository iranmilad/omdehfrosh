import { ActionIcon, Button, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial, clearCart } from "../../redux/cart";
import { logout, verifyTokenSilent } from "../../redux/auth/authusers/auth";
import { useEffect, useState } from "react";
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
        await dispatch(verifyTokenSilent());
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

  // Improved function to get item count from Redux items
  const getItemCount = (cartItems, currentItem) => {
    if (!Array.isArray(cartItems) || !currentItem) {
      return 0;
    }

    const matchedItem = cartItems.find(cartItem => {
      const productMatch = cartItem.productId === currentItem.productId;
      const sellerMatch = cartItem.seller?.id === currentItem.seller?.id;
      const combinationMatch = cartItem.combinationsID === currentItem.combinationsID;
      
      if (!currentItem.combinationsID && !cartItem.combinationsID) {
        return productMatch && sellerMatch;
      }
      
      return productMatch && sellerMatch && combinationMatch;
    });

    return matchedItem ? matchedItem.count : 0;
  };

  // Calculate current item count using Redux items
  const itemCount = getItemCount(items, item);

  // Load cart data on component mount and when user changes
  useEffect(() => {
    if (user && isVerified) {
      fetchCartData();
    } else {
      dispatch(setInitial([]));
    }
  }, [user, isVerified]);
  
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

  // Check if component is still loading essential data
  const isComponentLoading = !item;

  // Calculate dynamic width based on number of digits
  const getInputWidth = (number) => {
    const digits = String(number).length;
    // Base width + additional width per digit
    return Math.max(35, 20 + (5 * 7));
  };

  return (
    <>
      {/* Authentication Modal */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
        overlayProps={{
          backgroundOpacity: 0,
          blur: 0,
        }}
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

      {/* Show counter UI if item is in cart (count > 0) */}
      {count > 0 ? (
        <Flex align="center" gap="2px" style={{ minWidth: 'fit-content' }}>
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
              flexShrink: 0,
            }}
          >
            <IconPlus size={15} />
          </ActionIcon>

          <Input
            type="number"
            w={getInputWidth(count)}
            styles={{ 
              input: { 
                textAlign: "center",
                padding: "0 4px",
                fontSize: "14px",
                fontWeight: 500,
              } 
            }}
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
              flexShrink: 0,
            }}
          >
            <IconMinus size={10} />
          </ActionIcon>
        </Flex>
      ) : (
        // Show "افزودن" button if item is not in cart
        <Button
          fullWidth
          h={30}
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