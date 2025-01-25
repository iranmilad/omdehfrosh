import React, { useState } from "react";
import Counter from "../../../components/counter";
import { useSend } from "../../../Libs/api";
import { Button } from "@mantine/core";

function OrderRow({id=0,sku=0,inventory=2}) {
  const updateCart = useSend({ url: "/cart/update" });
  const [cart, setCart] = useState(0);
  const addToCart = (value, max) => {
    let val = value;
    if (!value) val = cart + 1;
    updateCart.mutateAsync(
      { id, sku, count: val, max },
      {
        onSuccess: (data) => {
          if (data.error) {
          } else {
            if (data?.max) setCart(data.max);
            else setCart(val);
          }
        },
      }
    );
  };
  const removeCart = () => {
    updateCart.mutateAsync(
      { id, sku, count: 0 },
      {
        onSuccess: (data) => {
          if (data.error) {
          } else {
            setCart(0);
          }
        },
      }
    );
  };
  if (cart > 0) {
    return (
      <Counter
        value={cart}
        onChange={addToCart}
        removeCart={removeCart}
        count={cart}
        isPending={updateCart.isPending}
      />
    );
  } else {
    return (
      <Button
        fullWidth
        disabled={inventory === 0}
        onClick={() => addToCart()}
        loading={updateCart.isPending}
        size="xs"
        w="max-content"
        h={30}
      >
        افزودن
      </Button>
    );
  }
}

export default OrderRow;
