import { ActionIcon, Button, Center, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useProduct } from "../../views/public/product";
import { useEffect, useState } from "react";
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

// Helper function to validate if images exist and are valid
const hasValidImages = (images) => {
  // Handle null, undefined, or non-array cases
  if (!images || !Array.isArray(images)) {
    return false;
  }

  // Handle empty array
  if (images.length === 0) {
    return false;
  }

  // Check if all images are valid (not empty strings, null, or invalid paths)
  const validImages = images.filter(image => {
    // Handle null, undefined, or empty string
    if (!image || image === "" || image === null) {
      return false;
    }

    // Handle whitespace-only strings
    if (typeof image === 'string' && image.trim() === "") {
      return false;
    }

    return true;
  });

  return validImages.length > 0;
};

const CounterSellers = (props) => {
  const {
    productId,
    seller,
    onChange,
    options,
    productName,
    productImages,
    item
  } = props;

  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  const [itemSellerId, setItemSellerId] = useState(undefined);
  const [itemSellerName, setItemSellerName] = useState(undefined);
  const [matchingCombination, setMatchingCombination] = useState(undefined);
  const [maxOrder, setMaxOrder] = useState(undefined);
  const [minOrder, setMinOrder] = useState(undefined);
  const [stock, setStock] = useState(undefined);
  const [isSellerAvailable, setIsSellerAvailable] = useState(true);
  const [price, setPrice] = useState(undefined);

  // Replace hook state with regular state
  const [isPending, setIsPending] = useState(false);

  // Authentication state
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { combinations } = useProduct();
  const items = useSelector((state) => state.cart?.items || []);

  // Calculate dynamic width based on number of digits
  const getInputWidth = (number) => {
    const digits = String(number).length;
    // Base width + additional width per digit
    return Math.max(35, 20 + (5 * 7));
  };

  const findMatchingCombination = (productId, options, combinations) => {
    if (!Array.isArray(options) || !Array.isArray(combinations)) return null;
  
    const sortedOptionsStr = JSON.stringify([...options].sort((a, b) => a.id - b.id));
  
    return combinations.find(combination => {
      return JSON.stringify([...combination.options].sort((a, b) => a.id - b.id)) === sortedOptionsStr;
    }) || null;
  };
  
  const extractedAttributes = options?.reduce((acc, item) => {
    if (item.attribute_name === "رنگ") {
        acc.color = item.value;
    }
    if (item.attribute_name === "جنس") {
        acc.material = item.value;
    }
    return acc;
  }, { color: "", material: "" }) || { color: "", material: "" };

  const findMaxOrderBySeller = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
      return null;
    }
    
    const selectedSupplier = matchingCombination.suppliers.find(supplier => supplier.id === sellerId);
  
    if (!selectedSupplier || typeof selectedSupplier.maxOrder === "undefined") {
      return null;
    }
  
    return selectedSupplier.maxOrder;
  };

  const findStockBySeller = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
      return null;
    }
  
    const selectedSupplier = matchingCombination.suppliers.find(supplier => supplier.id === sellerId);
  
    if (!selectedSupplier || typeof selectedSupplier.maxOrder === "undefined") {
      return null;
    }
  
    const stock = selectedSupplier.stock;
    if (stock === null || stock === undefined) {
      return 0;
    }
  
    return stock;
  };

  const findMinOrderBySeller = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
        return null;
    }

    const selectedSupplier = matchingCombination.suppliers.find(supplier => supplier.id === sellerId);

    if (!selectedSupplier || typeof selectedSupplier.minOrder === "undefined") {
        return null;
    }

    return selectedSupplier.minOrder;
  };

  const checkSellerAvailability = (matchingCombination, item) => {
    if (!matchingCombination || !matchingCombination.suppliers || !item) {
      return false;
    }

    const selectedSupplier = matchingCombination.suppliers.find(supplier => supplier.id === item.id);
    return selectedSupplier !== undefined;
  };

  const getProductCount = (items, productId, itemSellerId, matchingCombination) => {
    if (!items || !Array.isArray(items) || !productId || !itemSellerId || !matchingCombination) {
      return 0;
    }
    const foundItem = items.find(
      (item) => 
        item.productId === productId &&
        item.seller.id === itemSellerId &&
        item.combinationsID === matchingCombination.id
    );
  
    return foundItem ? foundItem.count : 0;
  };
  
  const count = getProductCount(items, productId, itemSellerId, matchingCombination);

  const increment = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    if (!item || count >= Math.min(maxOrder, stock)) {
        return;
    }
    handleChange({ value: count + 1, item });
  };
  
  const decrement = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    if (count > minOrder) {
      handleChange({ value: count - 1, item });
    } else if (count === minOrder) {
      handleRemove({ value: 0, item });
    }
  };

  const handleChange = async ({value, item}) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    if (!item) {
      return;
    }

    const newSellerId = item.id; 
    const newSellerName = item.name; 

    setItemSellerId(newSellerId);
    setItemSellerName(newSellerName); 

    setIsPending(true);

    try {
      const result = await cartAPI.updateCart({
        "productId": productId,
        "seller": {"id": newSellerId, "label": newSellerName}, 
        "count": Number(value),
        "combinationsID": matchingCombination?.id,
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

  const handleRemove = async ({ value, item }) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    if (!item) {
      return;
    }
  
    setIsPending(true);
  
    try {
      const result = await cartAPI.removeFromCart({
        "productId": productId,
        "seller": { "id": item.id, "label": item.name },
        "combinationsID": matchingCombination?.id
      });

      if (result.cart) {
        dispatch(setInitial([...result.cart]));
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleAddToCart = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }
    
    if (item) {
      // Use the minimum between minOrder and available stock
      const safeMinOrder = Math.min(minOrder || 1, stock || 1, maxOrder || 1);
      handleChange({ value: safeMinOrder, item });
    }
  };

  useEffect(() => {
    if (item?.id) {
      setItemSellerId(item.id);
    }
  }, [item?.id]);

  useEffect(() => {
    if (!options || !combinations) {
      setMatchingCombination(null);
      return;
    }
  
    const foundCombination = findMatchingCombination(productId, options, combinations);
    setMatchingCombination(foundCombination);

  }, [options, combinations, productId, seller, price]);
  
  useEffect(() => {
    if (!matchingCombination) {
      setPrice(undefined);
      return;
    }
    
    const selectedSupplier = matchingCombination.suppliers?.find(sup => sup.id === seller);
    setPrice(selectedSupplier ? selectedSupplier.price : undefined);
  }, [matchingCombination, seller]);

  useEffect(() => {
    if (!matchingCombination || !item) {
      setIsSellerAvailable(false);
      setMaxOrder(null);
      setMinOrder(null);
      setStock(0);
      return;
    }

    const isAvailable = checkSellerAvailability(matchingCombination, item);
    setIsSellerAvailable(isAvailable);

    if (isAvailable) {
      const max = findMaxOrderBySeller(matchingCombination, item.id);
      const min = findMinOrderBySeller(matchingCombination, item.id);
      const stockValue = findStockBySeller(matchingCombination, item.id);
      
      setMaxOrder(max);
      setMinOrder(min || 1);
      setStock(stockValue);
    } else {
      setMaxOrder(null);
      setMinOrder(null);
      setStock(0);
    }
  }, [matchingCombination, item]);

  // Updated loading condition with robust image validation
  // Handle cases where productImages might not be passed as prop
  const isComponentLoading = !productName || 
    (productImages !== undefined && !hasValidImages(productImages)) ||
    !options || 
    !combinations;

  const renderContent = () => {
    if (isComponentLoading) {
      return null;
    }

    if (!matchingCombination) {
      return (
        <Center>
          <Text size="sm" c="orange">
            تامین کننده ای وجود ندارد
          </Text>
        </Center>
      );
    }

    if (!isSellerAvailable) {
      return (
        <Center>
          <Text size="sm" c="orange">
            تامین کننده ای وجود ندارد
          </Text>
        </Center>
      );
    }

    return (
      <>
        { count > 0 ? (
          <Flex align="center" gap="2px" style={{ minWidth: 'fit-content' }}>
            <Button 
              p={0} 
              px={4} 
              h={15} 
              variant="transparent" 
              size="10px"
              onClick={() => {
                if (maxOrder && item) {
                  handleChange({ value: Math.min(maxOrder, stock), item });
                } else {
                  console.error("Max order or item is missing");
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
                  padding: "0 2px",
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
              <IconMinus size={15} />
            </ActionIcon>
          </Flex>
        ) : (
          <Button
            fullWidth
            leftSection={<IconBasket />}
            h={45}
            onClick={handleAddToCart}
          >
            افزودن به سبد خرید
          </Button>
        )}
      </>
    );
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

      <LoadingOverlay
        pos="fixed"
        visible={isPending}
        zIndex={1000}
        h="100%"
        w="100%"
        top={0}
        left={0}
      />

      {renderContent()}
    </>
  );
};

export default CounterSellers;