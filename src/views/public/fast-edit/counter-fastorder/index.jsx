import { ActionIcon, Button, Flex, Input, Loader } from "@mantine/core";
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
  } = props;



  const [cookies] = useCookies(["user"]);
  const dispatch = useDispatch();

  const [matchingCombination, setMatchingCombination] = useState(undefined);

  const [count, setCount] = useState(1); // Local count state

  const { data = { cart: [] } } = useData({ url: "/cart" });

  const [isPending, setIsPending] = useState(false);  // This will handle the loading state

  const items = useSelector((state) => state.cart?.items || []);

  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });


  const getItemCount = (cartData, item) => {
    if (!Array.isArray(cartData)) {
        return 0;
    }

    const matchedItem = cartData.find(cartItem =>
        cartItem.productId === item.id &&
        cartItem.combinationsID === item.combinationsID &&
        cartItem.seller.id === item.seller.id &&
        cartItem.attributes.every(attr =>
            item.attributes.some(itemAttr => 
                itemAttr.label === attr.color || itemAttr.label === attr.warranty
            )
        )
    );

    return matchedItem ? matchedItem.count : 0;
};




const itemCount = getItemCount(data.cart, item);


  const extractAttributes = (attributes) => {
    let result = [{}]; // Initialize with an empty object

    attributes.forEach(attr => {
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

    setIsPending(true)

    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);


    updateQuery.mutateAsync(
        {
            name: item?.name,
            image: item?.image,
            productId: item?.id,
            max: Number(item?.stock),
            min: Number(item?.minOrder),
            attributes: extractedAttributes,
            seller: item?.seller,
            count: newCount,
            combinationsID: item?.combinationsID,
            price: {
                regularPrice: 1000000,
                discountedPrice: 950000,
                discountPercent: null,
            },
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
          
          } else {
            throw new Error("Failed to fetch cart data");
          }
        },
      }
    );

    setIsPending(false)

  };

  const handleRemove = (value) => {
    const newCount = Math.max(1, parseInt(value, 10));
    setCount(newCount);

    const extractedAttributes = extractAttributes(item?.attributes || []);

    setIsPending(true)


    removeQuery.mutateAsync(
        {
            // name: item?.name,
            // image: item?.image,
            productId: item?.id,
            // max: item?.stock,
            // attributes: extractedAttributes,
            seller: item?.seller,
            // count: newCount,
            combinationsID: item?.combinationsID,
            // price: {
            //     regularPrice: 1000000,
            //     discountedPrice: 950000,
            //     discountPercent: null,
            // },
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
  

          //   if (updatedItem) {
          //     setCount(updatedItem.count); // Ensure local state updates for this row only
          // }
          
          } else {
            throw new Error("Failed to fetch cart data");
          }
        },
      }
    );

    setIsPending(false)

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


  

  return (
    <>
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

        {isPending && <Loader size="md" w={35} />}
        {!isPending ? (
          <Input
            type="number"
            w={25}
            styles={{ input: { textAlign: "center" } }}
            variant="unstyled"
            value={count}
            readOnly
            px={0}
          />
        ) : null}

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
          onClick={() => handleChange(Number(item?.minOrder) || 1)} // Now starts at minOrder
        >
            
        </Button>
        )}
    </>
  );
};

export default CounterFastOrder;
