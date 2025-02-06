import React, { useState } from "react";
import Counter from "../../../components/counter";
import { useSend } from "../../../Libs/api";
import { Badge, Button, ColorSwatch, Group, Stack, Text, Tooltip } from "@mantine/core";
import { CONTAINER_SIZES } from "../../../Libs/theme";
import { IconShield, IconShieldCheck } from "@tabler/icons-react";

function OrderRow({ id = 0, attributes, inventory = 2,seller, onReplace }) {
  const updateCart = useSend({ url: "/cart/update" });
  const [cart, setCart] = useState(0);

  const addToCart = (value, max) => {
    let val = value || cart + 1;
    updateCart.mutateAsync(
      { productId: id,attributes,seller:seller, count: val, max },
      {
        onSuccess: (data) => {
          if (!data.error) {
            if (data?.max) setCart(data.max);
            else setCart(val);
            onReplace(); // بعد از اضافه کردن، نود اصلی جایگزین شود
          }
        },
      }
    );
  };

  const removeCart = () => {
    updateCart.mutateAsync({productId:id,seller,count:0},{
      onSuccess: (data) =>{
        if(data.error){
        }
        else{
          setCart(0);
        }
      }
    })
  }

  return cart > 0 ? (
    <Counter value={cart} onChange={addToCart} count={cart} isPending={updateCart.isPending} removeCart={removeCart} />
  ) : (
    <Button disabled={inventory === 0} onClick={() => addToCart()} loading={updateCart.isPending} size="xs">
      انتخاب
    </Button>
  );
}

export function Attributes({items}){
  return (
    <Stack gap="xs">
      {items.map(it => <Attribute {...it} />)}
    </Stack>
  )
}

function Attribute (props){
  let {type,label,value} = props;
  switch (type) {
    case 'color':
      return (
        <Group gap="xs" >
          <ColorSwatch size="20" color={value} />
          <Text component="span" size="xs">{label}</Text>
        </Group>
      )
    case 'warranty':
      return (
        <Group gap="xs" >
          <Tooltip label={label} visibleFrom="sm">
            <IconShieldCheck size={18} />
          </Tooltip>
        </Group>
      )
    default:
      break;
  }
}

export default OrderRow;
