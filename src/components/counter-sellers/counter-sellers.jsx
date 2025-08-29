import { ActionIcon, Button, Center, Flex, Input, LoadingOverlay, Modal, Text } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useData, useSend } from "../../Libs/api";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useProduct } from "../../views/public/product";
import { useEffect, useState } from "react";

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
    productImages, // This might not be passed, so we'll handle it gracefully
    item
  } = props;


  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  const [ itemSellerId, setItemSellerId ] = useState(undefined) 
  const [ itemSellerName, setItemSellerName ] = useState(undefined) 

  const [ matchingCombination, setMatchingCombination ] = useState(undefined);
  const [ maxOrder, setMaxOrder ] = useState(undefined);
  const [ minOrder, setMinOrder ] = useState(undefined);
  const [ stock, setStock ] = useState(undefined);
  const [ isSellerAvailable, setIsSellerAvailable ] = useState(true);

  const [ price, setPrice ] = useState(undefined);

  // Authentication state
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [isPending, setIsPending] = useState(false);

  const { combinations } = useProduct()

  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });

  const { data, isLoading } = useData({ url: "/cart" });
  const items = useSelector((state) => state.cart?.items || []);

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

  const handleChange = ({value, item}) => {
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

    updateQuery.mutateAsync(
      {
        "productId": productId,
        "seller": {"id": newSellerId, "label": newSellerName}, 
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

  const handleRemove = ({ value, item }) => {
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
  
    removeQuery.mutateAsync(
      {
        "productId": productId,
        "seller": { "id": item.id, "label": item.name },
        "combinationsID": matchingCombination?.id
      },
      {
        onSuccess: (data) => {
          if (data.cart) {
            dispatch(setInitial([...data.cart]));
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
    
    if (item) {
      handleChange({ value: minOrder, item });
    }
  };

  useEffect(() => {
    if (data?.cart && data.cart.length > 0) {
      dispatch(setInitial([...data.cart]));
    }
  }, []);
  
  useEffect(() => {
    if (item?.id) {
      setItemSellerId(item.id);
    }
  }, [item?.id]);

  useEffect(() => {
    if (data?.cart?.length) {
      dispatch(setInitial(data.cart));
    }
  }, [data?.cart]);

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
          <Flex align="center" gap="4">
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

export default CounterSellers;