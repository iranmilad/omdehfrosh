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
import { useData, useSend } from "../../../Libs/api";
import { setInitial } from "../../../redux/cart";
import { useDispatch, useSelector } from "react-redux";
import CounterBasket from "../../../components/counter-basket";
import { useEffect } from "react";
import { DEFAULT_COLOR_MAP } from '../../../Libs/attribute_colors/colors';

const Product = (props) => {
  
  const { data } = useData({ url: "/cart", queryKey: [''] });

  const cartItems = useSelector((state) => state.cart.items || []);

  // Convert productId to string for comparison and passing to components
  const productIdStr = String(props.productId);

  const isInCart = data?.cart.some(
    (item) =>
      item.productId === props.productId &&
      item.combinationsID === props.combinationsID &&
      item.seller.id === props.seller.id
  );

  const { primaryColor } = useMantineTheme();
  const removeQuery = useSend({ url: "/cart/remove" });
  const dispatch = useDispatch();

  // Helper function to check if attributes should be rendered
  const shouldRenderAttributes = (attrs) => {
    if (!attrs) return false;
    if (Array.isArray(attrs)) {
      if (attrs.length === 0) return false;
      // Check if all elements are empty strings
      return attrs.some(attr => attr && attr !== "");
    }
    return attrs !== "";
  };

  // Helper function to get color code from color name or value
  const getColorCode = (colorValue) => {
    if (!colorValue || colorValue === "") return null;
    
    // If it's already a hex color code, return as is
    if (colorValue.startsWith('#')) {
      return colorValue;
    }
    
    const lowerColorValue = colorValue.toLowerCase();
    return DEFAULT_COLOR_MAP[lowerColorValue] || DEFAULT_COLOR_MAP[colorValue] || colorValue;
  };

  const removeItem = async () => {
    if (props.onRemoveStart) {
      props.onRemoveStart();
    }
    
    dispatch(setInitial(cartItems.filter(item => item.productId !== props.productId))); 
  
    try {
      const response = await removeQuery.mutateAsync({
        productId: props.productId,
        seller: props.seller,
        combinationsID: props.combinationsID,
      });
      
      
      if (response?.cart) {
        dispatch(setInitial([...response.cart]));  
      } else {
      }
    } catch (error) {
    }
  };
  
  useEffect(() => {
    if (data?.cart) {
      dispatch(setInitial([...data.cart]));
    }
  }, [data, dispatch]);

  // if (!isInCart) {
  //   return null;  
  // }

  return (
    <Paper p="xl">
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
                  {props.seller.label}
                </Text>
              </Flex>
            </Flex>
            <Flex gap="5">
              {/* <CompareButton id="123" variant="light" size="lg" /> */}
              <ActionIcon 
                color="red" 
                variant="light" 
                size="lg" 
                onClick={removeItem}
              >
                <IconTrash />
              </ActionIcon>
            </Flex>
          </Flex>
          <Flex justify="space-between" mt="lg">
            <CounterBasket
              fullWidth
              withButton
              productId={productIdStr} // Pass as string
              seller={props.seller}
              combinationsID={props.combinationsID}
              removeFun={removeItem}
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