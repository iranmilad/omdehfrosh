import { Badge, Button, Flex, Text } from "@mantine/core";
import { IconBasket, IconBuildingStore, IconCash, IconTruckDelivery } from "@tabler/icons-react";
import { default as React, default as React, useState } from "react";
import { NavLink } from "react-router";
import { useProduct } from "..";
import Counter from "../../../../components/counter";
import PriceText from "../../../../components/priceText";

function PurchasePanel() {
  const { options, combinations } = useProduct();
  const newComb = combinations.filter((combination) =>
    combination.options.every(opt => options[opt.id] === opt.value)
  );
  console.log(newComb)

  const [cart, setCart] = useState(0);
  const addToCart = (value, max) => {
    let val = value;
    if (!value) val = cart + 1;
    updateCart.mutateAsync(
      { productId: id, attributes: [1, 2], seller: sku, count: val, max },
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
      { productId: id, seller: sku, count: 0 },
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

  return (
    <></>
  );
}

export default PurchasePanel;
