import { ActionIcon, Button, Flex, Input, Loader } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash } from "@tabler/icons-react";
import { useSend } from "../../Libs/api";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";
import { setInitial, updateItem, removeItem } from "../../redux/cart";
import { useDispatch, useSelector } from "react-redux";

const Counter = (props) => {
  const { productId, attributes, seller, withButton,onChange,removeFunc, text = "افزودن به سبد خرید", fullWidth = false } = props;
  const [cookies] = useCookies(["user"]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });

  // مقدار count از Redux گرفته می‌شود
  const cartItem = useSelector((state) => 
    state.cart.items?.find(item => 
      +item.productId === +productId &&
      +item.combinationsID === +attributes &&
      +item.seller.id === +seller
    )
  );
  const count = cartItem ? cartItem.count : 0;

  const updateCart = (value) => {
    updateQuery.mutateAsync(
      {
        productId,
        attributes,
        seller,
        count: value,
      },
      {
        onSuccess: (data) => {
          if (data?.max) {
          } else if (!data?.error) {
            dispatch(setInitial(data.cart));
          }
          // Call onChange after successful update
          if (onChange) {
            onChange(value, data); // Pass the updated value and server response data
          }
        },
      }
    );
  };

  const removeFromCart = (query) => {
    removeQuery.mutateAsync({
      productId,
      attributes,
      seller,
    },{onSuccess:(data) => {
      if(!data.error){
        if(removeFunc){
          removeFunc()
        }
        else{
          dispatch(setInitial(data.cart));
        }
      }
    }});
  };

  return (
    <>
      {count > 0 ? (
        <Flex align="center" direction="column" gap="0">
          <Flex align="center" gap="4">
            <ActionIcon size="md" radius="999999" variant="light" color="green" onClick={() => updateCart(count + 1)}>
              <IconPlus size={15} />
            </ActionIcon>

            {updateQuery.isPending || removeQuery.isPending ? (
              <Loader size="md" w={35} />
            ) : (
              <Input type="number" w={35} styles={{ input: { textAlign: "center" } }} variant="unstyled" value={count} readOnly px={0} />
            )}

            {count > 1 ? (
              <ActionIcon size="md" radius="999999" variant="light" color="red" onClick={() => updateCart(count - 1)}>
                <IconMinus size={15} />
              </ActionIcon>
            ) : (
              <ActionIcon radius="999999" size="md" variant="light" color="red" onClick={removeFromCart}>
                <IconTrash size={15} />
              </ActionIcon>
            )}
          </Flex>

          {withButton && (
            <Button p={0} px={4} h={15} variant="transparent" size="10px" onClick={() => updateCart(10)}>
              حداکثر
            </Button>
          )}
        </Flex>
      ) : (
        <Button fullWidth={fullWidth} size="xs" h={35} onClick={() => updateCart(1)}>
          {text}
        </Button>
      )}
    </>
  );
};

export default Counter;
