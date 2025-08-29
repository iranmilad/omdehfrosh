import { ActionIcon, Button, Center, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useData, useSend } from "../../Libs/api";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useProduct } from "../../views/public/product";
import { useEffect, useState } from "react";


const Counter = (props) => {

  const {
    productId,
    seller,
    onChange,
    options,
    productName,
    productImages,
    // isPending,
    item
  } = props;


  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  const [ matchingCombination, setMatchingCombination ] = useState(undefined);
  const [ maxOrder, setMaxOrder ] = useState(undefined);
  const [ minOrder, setMinOrder ] = useState(undefined);
  const [ stock, setStock ] = useState(undefined);

  const [ sellerName, setSellerName ] = useState(undefined);
  const [ isSellerAvailable, setIsSellerAvailable ] = useState(true);

  const [ price, setPrice ] = useState(undefined);

  const { combinations = [] } = useProduct() || {}; 

  // Authentication state
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [isPending, setIsPending] = useState(false);  

  
  const updateQuery = useSend({ url: "/cart/update" });

  const removeQuery = useSend({ url: "/cart/remove" });


  const { data, isLoading } = useData({ url: "/cart" });
  
  const items = useSelector((state) => state.cart?.items || []);

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
        // console.error("Invalid matching combination or suppliers data:", matchingCombination);
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

  // FIXED: Better seller availability check
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
    if (!items || !Array.isArray(items) || !productId || !seller || !matchingCombination) {
      return 0;
    }
  
    const foundItem = items.find(
      (item) => 
        item.productId === productId &&
        item.seller.id === seller &&
        item.combinationsID === matchingCombination.id
    );
  
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

    if (maxOrder && count < Math.min(maxOrder, stock)) {
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
  
  const handleChange = (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    setIsPending(true);

    updateQuery.mutateAsync(
      {
        "productId": productId,
        "seller": {"id": seller, "label": sellerName}, 
        "count": Number(value),
        "combinationsID": matchingCombination?.id,
      },
      {
        onSuccess: (data) => {
          if (data.cart) {
            dispatch(setInitial([...data.cart]));
            
          } else {
            throw new Error("Failed to fetch cart data");              
          }
        },
        onSettled: () => {
          setIsPending(false);
        }
      
      }
    );
  };

  const handleRemove = (value) => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    if (!isSellerAvailable) {
      return;
    }

    setIsPending(true);

    removeQuery.mutateAsync(
        {
            "productId": productId,
            "seller": {"id": seller, "label": sellerName}, 
            "combinationsID": matchingCombination?.id,
        },
        {
            onSuccess: (data) => {
                if (data.cart) {
                    dispatch(setInitial([...data.cart]));
                } else {
                    throw new Error("Failed to fetch cart data");
                }
            },
            onSettled: () => {
                setIsPending(false);
            }
        }
    );
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

  // FIXED: Separate useEffect for seller availability check
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

    // Only set other values if seller is available
    if (isAvailable) {
      const max = findMaxOrderBySeller(matchingCombination, seller);
      const min = findMinOrderBySeller(matchingCombination, seller);
      const stockValue = findStockBySeller(matchingCombination, seller);
      const name = findSellerName(matchingCombination, seller);
      
      // Find price
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
      // Clear values if seller is not available
      setMaxOrder(null);
      setMinOrder(null);
      setStock(0);
      setSellerName(null);
      setPrice(null);
    }
  }, [matchingCombination, seller]);

  // FIXED: Separate useEffect for cart data
  useEffect(() => {
    if (data?.cart && data.cart.length > 0) {
      dispatch(setInitial([...data.cart]));
    }
  }, [data?.cart, dispatch]);

  // FIXED: Better loading condition
  const isComponentLoading = !productName || !productImages;

  // FIXED: Show appropriate message based on state - only check seller validity
  const renderContent = () => {
    if (isComponentLoading) {
      return null; // LoadingOverlay will handle this
    }

    // FIXED: Only check seller validity, not options or combinations
    if (!seller || seller === "" || seller === null || seller === undefined) {
      return null; // Don't display anything when seller is invalid
    }

    // If no matching combination found (after options are selected)
    if (options && options.length > 0 && !matchingCombination) {
      return (
        <Center>
          <Text size="sm" c="orange">
            ترکیب انتخابی موجود نیست
          </Text>
        </Center>
      );
    }

    // If combination exists but seller is not available in that combination
    if (matchingCombination && !isSellerAvailable) {
      return (
        <Center>
          <Text size="sm" c="orange">
            این تامین کننده برای ترکیب انتخابی موجود نیست
          </Text>
        </Center>
      );
    }

    // Show counter or add button (works with or without options selected)
    return (
      <>
        { count > 0 ? (
          <Flex align="center" gap="4">
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
            >
              <IconPlus size={15} />
            </ActionIcon>
            <Input
              type="number"
              w={35}
              styles={{ input: { textAlign: "center" }, }}
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
            افزودن  
          </Button>
        )}
      </>
    );
  };

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

      {/* LoadingOverlay only for actual loading states */}
      <LoadingOverlay 
        pos="fixed" 
        visible={isPending || isLoading} 
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