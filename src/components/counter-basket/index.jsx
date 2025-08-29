import { ActionIcon, Button, Flex, Input, Loader, LoadingOverlay } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useData, useSend } from "../../Libs/api";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../redux/cart";
import { useProduct } from "../../views/public/product";
import { useEffect, useState } from "react";

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

  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });

  const { data, isLoading, isFetching } = useData({ url: "/cart" });

  const items = useSelector((state) => state.cart?.items || []);


  const getProductCount = (items, productId, seller, matchingCombination) => {
    // Normalize both values to strings for comparison
    const normalizeId = (id) => String(id);
    
    const searchProductId = normalizeId(productId);
    
    const foundItem = items.find(
      (item) => 
        normalizeId(item.productId) === searchProductId &&
        item.seller.id === seller &&
        item.combinationsID === matchingCombination
    );

    return foundItem ? foundItem.count : 0;
  };
    
  const count = getProductCount(items, productId, seller.id, combinationsID);
  const [localCount, setLocalCount] = useState(count);

  const increment = () => {
    if (localCount >= max || isPageLoading) return;

    const newCount = localCount + 1;
    setLocalCount(newCount);
    handleChange({ value: newCount });
  };
  
  const decrement = () => {
    if (isPageLoading) return;
    
    if (localCount > min) {
      const newCount = localCount - 1;
      setLocalCount(newCount);
      handleChange({ value: newCount });
    } else if (localCount === min) {
      handleRemove();
    }
  };

  const handleChange = async ({value}) => {
    setIsPageLoading(true);
    
    try {
      const response = await updateQuery.mutateAsync({
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
      setLocalCount(count);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isPageLoading) return;
    
    setIsPageLoading(true);
    
    try {
      const response = await removeQuery.mutateAsync({
        productId,
        seller: seller,
        combinationsID,
      });
      
      if (response?.cart) {
        dispatch(setInitial([...response.cart]));
        setLocalCount(0); // Reset local count
      }
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleMaxClick = () => {
    if (max && !isPageLoading) {
      setLocalCount(max);
      handleChange({ value: max });
    }
  };
  
  // Simplified useEffect - only one is needed
  useEffect(() => {
    if (data?.cart) {
      dispatch(setInitial([...data.cart]));
    }
  }, [data?.cart, dispatch]);
  
  useEffect(() => {
    setLocalCount(count);
  }, [count]);

  // Show counter only if item is in cart and not a subscription
  const shouldShowCounter = count > 0 && !productIdStr.toLowerCase().includes("subscription");

  return (
    <>
      {/* Full page loading overlay */}
      <LoadingOverlay 
        pos="fixed" 
        visible={isPageLoading || isFetching || isLoading} 
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
            disabled={isPageLoading || localCount >= max}
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