import { ActionIcon, Button, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useEffect, useState } from "react";
import { getApiUrl } from "../../Libs/utils/apiutils/apiutils";

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
  const [count, setCount] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [cartData, setCartData] = useState({ cart: [] });
  const [isLoading, setIsLoading] = useState(false);

  const items = useSelector((state) => state.cart?.items || []);



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
        localStorage.removeItem("user");
        throw new Error("Failed to fetch cart data");
      }
      
      const serverData = await response.json();
      const newCartData = {
        cart: serverData.cart || [],
        totalPrice: serverData.total || 0
      };
      
      setCartData(newCartData);
      return newCartData;
    } catch (error) {
      console.error("Error fetching cart:", error);
      const errorData = { cart: [], totalPrice: 0 };
      setCartData(errorData);
      return errorData;
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
      
      // Fetch updated cart data
      const updatedCart = await fetchCartData();
      
      if (updatedCart.cart) {
        dispatch(setInitial([...updatedCart.cart]));
      }
      
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
      
      // Fetch updated cart data
      const updatedCart = await fetchCartData();
      
      if (updatedCart.cart) {
        dispatch(setInitial({
          items: updatedCart.cart,
          totalPrice: updatedCart.totalPrice || 0
        }));
      }
      
      return data;
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  };

  const getItemCount = (cartData, item) => {
    if (!Array.isArray(cartData)) {
      return 0;
    }

    const matchedItem = cartData.find(cartItem =>
      cartItem.productId === item?.id &&
      cartItem.combinationsID === item?.combinationsID &&
      cartItem.seller?.id === item?.seller?.id &&
      cartItem.attributes?.every(attr =>
        item?.attributes?.some(itemAttr => 
          itemAttr.label === attr.color || itemAttr.label === attr.warranty
        )
      )
    );

    return matchedItem ? matchedItem.count : 0;
  };

  const itemCount = getItemCount(cartData.cart, item);

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

  // Load cart data on component mount
  useEffect(() => {
    fetchCartData();
  }, []);
  
  useEffect(() => {
    setCount(itemCount); 
  }, [itemCount]);

  const handleChange = async (value) => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);

    try {
      await updateCartItem({
        "productId": item?.id,
        "seller": item?.seller,
        "count": newCount,
        "combinationsID": item?.combinationsID,
      });

      // Find updated count in new cart data
      const foundItem = items.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.seller.id === item.seller.id &&
          cartItem.combinationsID === item.combinationsID
      );
      
    } catch (error) {
      console.error("Failed to update cart:", error);
      // Optionally show error message to user
    } finally {
      setIsPending(false);
    }
  };

  const handleRemove = async (value) => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);
    setIsPending(true);

    try {
      await removeCartItem({
        productId: item?.id,
        seller: item?.seller,
        combinationsID: item?.combinationsID,
      });

      // Find updated count in new cart data
      const foundItem = items.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.seller.id === item.seller.id &&
          cartItem.combinationsID === item.combinationsID
      );

      setCount(0);
      
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Optionally show error message to user
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
      handleRemove(0);
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

      { count > 0 ? (
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