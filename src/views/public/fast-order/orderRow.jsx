import React, { useState } from "react";
import Counter from "../../../components/counter";
import { useSend } from "../../../Libs/api";
import { Button } from "@mantine/core";

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
      افزودن
    </Button>
  );
}


export default OrderRow;
