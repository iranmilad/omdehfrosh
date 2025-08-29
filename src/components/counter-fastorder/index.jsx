import { ActionIcon, Button, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useData, useSend } from "../../Libs/api";
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
    // isPending = false,
    item,
    priceFormat
  } = props;

  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();
  
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const [matchingCombination, setMatchingCombination] = useState(undefined);
  const [count, setCount] = useState(1); // Local count state
  const [isPending, setIsPending] = useState(false);  // This will handle the loading state
  const [showAuthModal, setShowAuthModal] = useState(false); // New state for modal

  const { data = { cart: [] }, isLoading } = useData({ url: "/cart" });
  const items = useSelector((state) => state.cart?.items || []);

  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });

  const getItemCount = (cartData, item) => {
    if (!Array.isArray(cartData)) {
        // console.error("cartData is not an array:", cartData);
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

  const itemCount = getItemCount(data.cart, item);

  const extractAttributes = (attributes) => {
    let result = [{}]; // Initialize with an empty object

    attributes?.forEach(attr => {
        if (attr.type === "color") {
            result[0].color = attr.label || "";
        } else if (attr.type === "warranty") {
            result[0].warranty = attr.label || "";
        }
    });

    return result;
  };
  
  useEffect(() => {
    setCount(itemCount); 
  }, [itemCount]);

  const handleChange = (value) => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setIsPending(true);

    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);



    updateQuery.mutateAsync(
        {
            "productId": item?.id,
            "seller": item?.seller,
            "count": newCount,
            "combinationsID": item?.combinationsID,
        },
        {
        onSuccess: (data) => {
          if (data.cart) {
            dispatch(setInitial([...data.cart]));

            // Find updated count in new cart data
            const foundItem = items.find(
              (cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.seller.id === item.seller.id &&
                cartItem.combinationsID === item.combinationsID
            );
          
          } else {
            throw new Error("Failed to fetch cart data");
          }
        },
        onSettled: () => {
          setIsPending(false); // Reset loading state
        }
      }
    );
  };

  const handleRemove = (value) => {
    // Check if user is authenticated
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);

    setIsPending(true);

    removeQuery.mutateAsync(
        {
            productId: item?.id,
            seller: item?.seller,
            combinationsID: item?.combinationsID,
        },
        {
        onSuccess: (data) => {
          if (data.cart) {
            dispatch(setInitial({
              items: data.cart,
              totalPrice: data.totalPrice || 0
            }));
              
            // Find updated count in new cart data
            const foundItem = items.find(
              (cartItem) =>
                cartItem.productId === item.productId &&
                cartItem.seller.id === item.seller.id &&
                cartItem.combinationsID === item.combinationsID
            );

            setCount(0);
          
          } else {
            throw new Error("Failed to fetch cart data");
          }
        },
        onSettled: () => {
          setIsPending(false); // Reset loading state
        }
      }
    );
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
      handleRemove(0); // Remove item when reaching minOrder
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
          onClick={increment} // Trigger increment logic
        >
          <IconPlus size={15} />
        </ActionIcon>

        {/* Removed individual Loader - now handled by LoadingOverlay */}
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
          onClick={decrement} // Trigger decrement logic
        >
          <IconMinus size={10} />
        </ActionIcon>
      </Flex>) : (
        <Button
          fullWidth
          leftSection={<IconBasket />}
          h={45}
          onClick={handleAddToCart} // Use new handler instead of direct handleChange
        >
          افزودن  
        </Button>
        )}
    </>
  );
};

export default CounterFastOrder;