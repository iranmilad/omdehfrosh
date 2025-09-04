import {
  ActionIcon,
  Badge,
  Box,
  Flex,
  Group,
  Image,
  Paper,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from "@mantine/core";
import {
  IconSwitch3,
  IconTrash,
  IconTrashFilled,
  IconUser,
} from "@tabler/icons-react";
import Counter from "../../../components/counter";
import CompareButton from "../../../components/compareBtn";
import { setInitial } from "../../../redux/cart";
import { useDispatch, useSelector } from "react-redux";
import CounterBasket from "../../../components/counter-basket";
import { useState, useEffect } from "react";
import { DEFAULT_COLOR_MAP } from '../../../Libs/attribute_colors/colors';
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";

const Product = (props) => {
  const cartItems = useSelector((state) => state.cart.items || []);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Convert productId to string for comparison and passing to components
  const productIdStr = String(props.productId);

  // Check if item is in cart using Redux state
  const isInCart = cartItems.some(
    (item) =>
      String(item.productId) === String(props.productId) &&
      parseInt(item.combinationsID) === parseInt(props.combinationsID) &&
      (item.seller?.id || item.seller_id) === (props.seller?.id || props.seller_id)
  );

  // Hide component if item is not in cart
  useEffect(() => {
    setIsVisible(isInCart);
  }, [isInCart]);

  const { primaryColor } = useMantineTheme();
  const dispatch = useDispatch();

  // Helper function to check if attributes should be rendered
  const shouldRenderAttributes = (attrs) => {
    if (!attrs) return false;
    if (Array.isArray(attrs)) {
      if (attrs.length === 0) return false;
      return attrs.some(attr => attr && attr !== "");
    }
    return attrs !== "";
  };

  // Helper function to get color code from color name or value
  const getColorCode = (colorValue) => {
    if (!colorValue || colorValue === "") return null;
    
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    
    const lowerColorValue = colorValue.toLowerCase();
    return DEFAULT_COLOR_MAP[lowerColorValue] || DEFAULT_COLOR_MAP[colorValue] || colorValue;
  };

  // Updated remove function that refetches cart data - ONLY for direct IconTrash clicks
  const removeFromCartAPI = async (productId, seller, combinationsID) => {
    const token = localStorage.getItem("user");
    
    try {
      // Remove item from cart
      const response = await fetch(getApiUrl("/cart/remove"), {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          seller,
          combinationsID
        })
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      const data = await response.json();

      return {
        message: "ok",
        cart: data.cart || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw error;
    }
  };

  // Full remove function (with API call) - ONLY for direct IconTrash clicks
  const removeItem = async () => {
    if (isRemoving || !isInCart) return; // Prevent double clicks and invalid removes
    
    setIsRemoving(true);
    
    // Notify parent component
    if (props.onRemoveStart) {
      props.onRemoveStart();
    }
    
    try {
      // Make API call to remove item and get updated cart
      const response = await removeFromCartAPI(
        props.productId,
        props.seller,
        props.combinationsID
      );
      
      // Update Redux state with server response
      if (response?.cart !== undefined) {
        dispatch(setInitial([...response.cart]));  
      }
      
      // Hide the component immediately after successful removal
      setIsVisible(false);
      
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // Don't hide on error, let user try again
    } finally {
      setIsRemoving(false);
    }
  };

  // UI-only remove function - for CounterBasket callback (no API call)
  const removeItemUIOnly = () => {
    setIsVisible(false);
  };

  // Don't render if item is not visible or not in cart
  if (!isVisible || !isInCart) {
    return null;
  }

  return (
    <Paper 
      p="xl"
      style={{
        opacity: isRemoving ? 0.5 : 1,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: isRemoving ? 'scale(0.95)' : 'scale(1)'
      }}
    >
      <Flex justify="space-between" gap="xl">
        <Box w="120" h="120" pos="relative">
          <Image w="100" h="120" fit="contain" src={props.image} />
        </Box>
        <div className="flex-1">
          <Flex justify="space-between" gap="md" direction="column">
            <Flex direction="column" gap="md">
              <Title size="md">{props.name}</Title>
              
              {shouldRenderAttributes(props.attributes) && (
                <Flex gap="xs" wrap="wrap">
                  {props.attributes?.map((item, index) => (
                    <Flex key={index} gap="xs">
                      {/* Color attribute */}
                      {item.color && item.color !== "" && (
                        <Badge variant="light" color="dark" size="xs">
                          <span style={{ color: getColorCode(item.color) }}>⬤</span>
                        </Badge>
                      )}
                      {/* Material attribute */}
                      {item.material && item.material !== "" && (
                        <Badge variant="light" color="dark" size="xs">
                          <Text size="xs">{item.material}</Text>
                        </Badge>
                      )}
                      {/* Warranty attribute */}
                      {item.warranty && item.warranty !== "" && (
                        <Badge variant="light" color="blue" size="xs">
                          <Text size="xs">{item.warranty}</Text>
                        </Badge>
                      )}
                    </Flex>
                  ))}
                </Flex>
              )}
              
              <Flex c={primaryColor} align="center" gap="xs">
                <IconUser size={12} />
                <Text size="xs" component="span">
                  {props.seller?.label || props.seller?.name}
                </Text>
              </Flex>
            </Flex>
            <Flex gap="5">
              <ActionIcon 
                color="red" 
                variant="light" 
                size="lg" 
                onClick={removeItem}  // This makes API call
                loading={isRemoving}
                disabled={isRemoving}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Flex>
          <Flex justify="space-between" mt="lg">
            <CounterBasket
              fullWidth
              withButton
              productId={productIdStr}
              seller={props.seller}
              stock={props.stock}
              combinationsID={props.combinationsID}
              removeFun={removeItemUIOnly}  // This is UI-only, no API call
              count={props.count}
              productImage={props.image}
              attributes={props.attributes}
              poductName={props.name}
              price={props.price}
              max={props.max}
              min={props.min}
            />
          </Flex>
        </div>
      </Flex>
    </Paper>
  );
};

export default Product;