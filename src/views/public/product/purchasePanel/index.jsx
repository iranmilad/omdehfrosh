import { Badge, Button, Flex, Text } from "@mantine/core";
import {
  IconBasket,
  IconBuildingStore,
  IconCash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import React, { useState } from "react";
import PriceText from "../../../../components/priceText";
import Counter from "../../../../components/counter";
import { NavLink } from "react-router";

function PurchasePanel({
  id,
  name,
  rating,
  payment_type,
  delivery,
  buy_type,
  price,
  sku,
  inventory,
  min_order,
  max_order,
  updateCart
}) {
  const [cart, setCart] = useState(0);
  const addToCart = (value,max) => {
    let val = value;
    if(!value) val = cart+1
    updateCart.mutateAsync({productId:id,attributes:[1,2],seller:sku,count:val,max},{
      onSuccess: (data) => {
        if(data.error){

        }
        else{
          if(data?.max)setCart(data.max);
          else setCart(val);
        }
      }
    })
  }
  const removeCart = () => {
    updateCart.mutateAsync({productId:id,seller:sku,count:0},{
      onSuccess: (data) =>{
        if(data.error){

        }
        else{
          setCart(0);
        }
      }
    })
  }
  return (
    <>
      {/* Payment Type */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm pt-3 mb-4">
        <IconCash size={20} stroke={1.3} className="text-zinc-700" />
        <div>{payment_type}</div>
      </div>

      {/* Delivery Info */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-4">
        <IconTruckDelivery size={20} stroke={1.3} className="text-zinc-700" />
        <div>{buy_type}</div>
      </div>

      {/* Seller Info */}
      <div className="flex flex-col justify-center py-4">
        <Flex align="start" gap="4px">
          <IconBuildingStore size={20} stroke={1.3} className="text-zinc-700" />
          <Flex direction="column">
            <Text
              size="sm"
              className="text-zinc-700"
              component={NavLink}
              to={`/seller/${id}`}
            >
              {name}
            </Text>
            <Text size="xs" c="gray">
              رضایت :{" "}
              <Badge
                color={
                  Math.round(+rating) === 5
                    ? "green"
                    : Math.round(+rating) === 4
                    ? "lime"
                    : Math.round(+rating) === 3
                    ? "yellow"
                    : Math.round(+rating) === 2
                    ? "orange"
                    : "red"
                }
              >
                {Math.round(+rating) === 5
                  ? "عالی"
                  : Math.round(+rating) === 4
                  ? "خوب"
                  : Math.round(+rating) === 3
                  ? "متوسط"
                  : Math.round(+rating) === 2
                  ? "ضعیف"
                  : "خیلی ضعیف"}
              </Badge>
            </Text>
          </Flex>
        </Flex>
        {/* Price */}
        <PriceText>{price.regularPrice}</PriceText>
        {/* Inventory */}
        <div className="text-xs text-red-400">
          {inventory > 0 ? `موجودی انبار ${inventory} عدد میباشد` : "ناموجود"}
        </div>
      </div>

      {/* Order Limits */}
      <Flex direction="column" align="start" gap="xs" className="py-4">
        <Flex gap="sm">
          <Text size="13px" c="gray">
            حداقل سفارش
          </Text>
          <Text size="13px">{min_order} عدد</Text>
        </Flex>
        <Flex gap="sm">
          <Text size="13px" c="gray">
            حداکثر سفارش
          </Text>
          <Text size="13px">{max_order} عدد</Text>
        </Flex>
      </Flex>

      {cart > 0 ? (
        <Counter
          min={min_order}
          max={max_order}
          value={cart}
          onChange={addToCart}
          removeCart={removeCart}
          count={cart}
          isPending={updateCart.isPending}
        />
      ) : (
        <Button
          fullWidth
          leftSection={<IconBasket />}
          h={45}
          disabled={inventory === 0}
          onClick={() => addToCart()}
          loading={updateCart.isPending}
        >
          افزودن به سبد خرید
        </Button>
      )}

      {/* Order Error Message */}
      {inventory === 0 && (
        <Text c="red" size="xs">
          امکان ثبت سفارش وجود ندارد
        </Text>
      )}
    </>
  );
}

export default PurchasePanel;
