import { ActionIcon, Button, Center, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
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

const Counter = (props) => {
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
  const queryClient = useQueryClient();

  const [matchingCombination, setMatchingCombination] = useState(undefined);
  const [maxOrder, setMaxOrder] = useState(undefined);
  const [minOrder, setMinOrder] = useState(undefined);
  const [stock, setStock] = useState(undefined);
  const [sellerName, setSellerName] = useState(undefined);
  const [isSellerAvailable, setIsSellerAvailable] = useState(true);
  const [price, setPrice] = useState(undefined);

  // Replace hook state with regular state
  const [isPending, setIsPending] = useState(false);

  const { combinations = [] } = useProduct() || {};

  // Authentication state
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const items = useSelector((state) => state.cart?.items || []);

  // Calculate dynamic width based on number of digits
  const getInputWidth = (number) => {
    const digits = String(number).length;
    // Base width + additional width per digit
    return Math.max(35, 20 + (5 * 7));
  };

  const findMatchingCombination = (productId, options, combinations) => {
    if (!Array.isArray(options) || !Array.isArray(combinations) || options.length === 0) {
      return null;
    }
  
    return (
      combinations.find(combination => {
        const combinationOptions = combination.options;
        return (
          options.length === combinationOptions.length &&
          options.every(opt =>
            combinationOptions.some(
              combOpt => combOpt.id === opt.id && combOpt.value === opt.value
            )
          )
        );
      }) || null
    );
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
    if (!matchingCombination || !Array.isArray(matchingCombination.suppliers)) {
        return null;
    }

    const sellerIdStr = String(sellerId);
    const sellerIdNum = Number(sellerId);

    const selectedSupplier = matchingCombination.suppliers.find(supplier => 
        supplier.id === sellerId || 
        supplier.id === sellerIdStr || 
        supplier.id === sellerIdNum ||
        String(supplier.id) === sellerIdStr ||
        Number(supplier.id) === sellerIdNum
    );

    if (!selectedSupplier) {
        return null;
    }

    if (typeof selectedSupplier.maxOrder === "undefined" || selectedSupplier.maxOrder === null) {
        return null;
    }

    return selectedSupplier.maxOrder;
  };

  const findMinOrderBySeller = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
        return null;
    }

    const sellerIdStr = String(sellerId);
    const sellerIdNum = Number(sellerId);

    const selectedSupplier = matchingCombination.suppliers.find(supplier => 
        supplier.id === sellerId || 
        supplier.id === sellerIdStr || 
        supplier.id === sellerIdNum ||
        String(supplier.id) === sellerIdStr ||
        Number(supplier.id) === sellerIdNum
    );

    if (!selectedSupplier || typeof selectedSupplier.minOrder === "undefined") {
        return null;
    }

    return selectedSupplier.minOrder;
  };

  const findSellerName = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
        return null;
    }

    const sellerIdStr = String(sellerId);
    const sellerIdNum = Number(sellerId);

    const selectedSupplier = matchingCombination.suppliers.find(supplier => 
        supplier.id === sellerId || 
        supplier.id === sellerIdStr || 
        supplier.id === sellerIdNum ||
        String(supplier.id) === sellerIdStr ||
        Number(supplier.id) === sellerIdNum
    );

    if (!selectedSupplier) {
        return null;
    }

    return selectedSupplier.name;
  };

  const findStockBySeller = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers) {
      return 0;
    }
  
    const sellerIdStr = String(sellerId);
    const sellerIdNum = Number(sellerId);

    const selectedSupplier = matchingCombination.suppliers.find(supplier => 
        supplier.id === sellerId || 
        supplier.id === sellerIdStr || 
        supplier.id === sellerIdNum ||
        String(supplier.id) === sellerIdStr ||
        Number(supplier.id) === sellerIdNum
    );
  
    if (!selectedSupplier) {
      return 0;
    }
  
    if (selectedSupplier.stock === null || selectedSupplier.stock === undefined) {
      return 0;
    }
  
    return selectedSupplier.stock;
  };

  const checkSellerAvailability = (matchingCombination, sellerId) => {
    if (!matchingCombination || !matchingCombination.suppliers || !sellerId) {
      return false;
    }

    const sellerIdStr = String(sellerId);
    const sellerIdNum = Number(sellerId);

    const selectedSupplier = matchingCombination.suppliers.find(supplier => 
        supplier.id === sellerId || 
        supplier.id === sellerIdStr || 
        supplier.id === sellerIdNum ||
        String(supplier.id) === sellerIdStr ||
        Number(supplier.id) === sellerIdNum
    );

    return selectedSupplier !== undefined;
  };

  const getProductCount = (items, productId, seller, matchingCombination) => {
    if (!items || !Array.isArray(items) || productId == null || seller == null) {
      return 0;
    }
    const norm = (v) => (v == null ? '' : String(v).trim());
    const normCombo = (v) => (v == null || v === '' ? null : Number(v));
    const comboId = matchingCombination?.id;
    const foundItem = items.find((item) => {
      const productMatch = norm(item.productId) === norm(productId);
      const sellerMatch = norm(item.seller?.id ?? item.seller) === norm(seller);
      const a = normCombo(item.combinationsID);
      const b = normCombo(comboId);
      const comboMatch = a === b || (a == null && b == null);
      return productMatch && sellerMatch && comboMatch;
    });
    return foundItem ? foundItem.count : 0;
  };
  
  const count = getProductCount(items, productId, seller, matchingCombination);

  const increment = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    // Ensure we don't exceed stock or maxOrder
    const maxAllowed = Math.min(maxOrder || stock, stock);
    if (count < maxAllowed) {
      handleChange(`${+count + 1}`);
    }
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
      handleChange(count - 1);
    } else {
      handleRemove(0); 
    }
  };
  
  const handleChange = async (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    setIsPending(true);

    try {
      const result = await cartAPI.updateCart({
        "productId": productId,
        "seller": {"id": seller, "label": sellerName}, 
        "count": Number(value),
        "combinationsID": matchingCombination?.id,
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

  const handleRemove = async (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    setIsPending(true);

    try {
      const result = await cartAPI.removeFromCart({
        "productId": productId,
        "seller": {"id": seller, "label": sellerName}, 
        "combinationsID": matchingCombination?.id,
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

  const handleAddToCart = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }
    
    handleChange(minOrder);
  };

  useEffect(() => {
    if (!combinations || combinations.length === 0) {
      setMatchingCombination(null);
      return;
    }

    if (!options || options.length === 0) {
      setMatchingCombination(combinations[0] || null);
      return;
    }

    const foundCombination = findMatchingCombination(productId, options, combinations);
    
    setMatchingCombination(foundCombination);
  }, [options, combinations, productId]);

  useEffect(() => {
    if (!matchingCombination || !seller) {
      setIsSellerAvailable(false);
      setMaxOrder(null);
      setMinOrder(null);
      setStock(0);
      setSellerName(null);
      setPrice(null);
      return;
    }

    const isAvailable = checkSellerAvailability(matchingCombination, seller);
    
    setIsSellerAvailable(isAvailable);

    if (isAvailable) {
      const max = findMaxOrderBySeller(matchingCombination, seller);
      const min = findMinOrderBySeller(matchingCombination, seller);
      const stockValue = findStockBySeller(matchingCombination, seller);
      const name = findSellerName(matchingCombination, seller);
      
      const sellerIdStr = String(seller);
      const sellerIdNum = Number(seller);
      
      const selectedSupplier = matchingCombination.suppliers?.find(sup => 
          sup.id === seller || 
          sup.id === sellerIdStr || 
          sup.id === sellerIdNum ||
          String(sup.id) === sellerIdStr ||
          Number(sup.id) === sellerIdNum
      );
      
      setMaxOrder(max);
      setMinOrder(min || 1);
      setStock(stockValue);
      setSellerName(name);
      setPrice(selectedSupplier ? selectedSupplier.price : null);
    } else {
      setMaxOrder(null);
      setMinOrder(null);
      setStock(0);
      setSellerName(null);
      setPrice(null);
    }
  }, [matchingCombination, seller]);

  const isComponentLoading = !productName || !productImages;

  const renderContent = () => {
    if (isComponentLoading) {
      return null;
    }

    if (!seller || seller === "" || seller === null || seller === undefined) {
      return null;
    }

    if (options && options.length > 0 && !matchingCombination) {
      return (
        <Center>
          <Text size="sm" c="orange">
            ترکیب انتخابی موجود نیست
          </Text>
        </Center>
      );
    }

    if (matchingCombination && !isSellerAvailable) {
      return (
        <Center>
          <Text size="sm" c="orange">
            این تامین کننده برای ترکیب انتخابی موجود نیست
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
                if (maxOrder !== undefined && maxOrder !== null && stock !== undefined) {
                  handleChange(Math.min(maxOrder, stock));
                } else {
                  console.error("maxOrder or stock is missing", { maxOrder, stock });
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

export default Counter;