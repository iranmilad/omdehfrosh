import { Badge, Box, Button, Flex, NumberFormatter, Text } from "@mantine/core";
import {
  IconBasket,
  IconBuildingStore,
  IconCash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { default as React, default as React, useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useProduct } from "..";
import Counter from "../../../../components/counter";
import PriceText from "../../../../components/priceText";
import CountdownTimer from "../../../../components/countDownTimer";
import { useSelector } from "react-redux";

function PurchasePanel() {
  const { supplier,data } = useProduct();
  const items = useSelector((state) => state.cart.items);
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

  useEffect(() => {
    if(supplier){
      items.map(item => {
        if(+item.productId === +data.id && +item.combinationsID === +supplier.id && +item.seller.id === supplier.suppliers[0].id){
          setCart(item.count)
        }
      })
    }
  },[supplier])

  if (supplier === null) return <></>;

  const {
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
    special_offer,
  } = supplier.suppliers[0];

  return (
    <>
      {/* Payment Type */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm pt-3 mb-4">
        <IconCash size={20} stroke={1.3} className="text-zinc-700" />
        <div>{payment_type === "Cash" ? "نقدی" : "پیش فروش"}</div>
      </div>

      {/* Delivery Info */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-4">
        <IconTruckDelivery size={20} stroke={1.3} className="text-zinc-700" />
        <div>فروش {buy_type === "Wholesale" ? "عمده" : "تکی"}</div>
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
                    : rating === 4
                    ? "lime"
                    : rating === 3
                    ? "yellow"
                    : rating === 2
                    ? "orange"
                    : "red"
                }
              >
                {Math.round(+rating) === 5
                  ? "عالی"
                  : rating === 4
                  ? "خوب"
                  : rating === 3
                  ? "متوسط"
                  : rating === 2
                  ? "ضعیف"
                  : "خیلی ضعیف"}
              </Badge>
            </Text>
          </Flex>
        </Flex>
        {/* Price */}
        <Flex direction="column" align="end">
          <PriceText fontSize="25px">{price.regularPrice}</PriceText>
          {price.discountedPrice ? (
            <Box component="del" c="gray" fz="sm">
              <NumberFormatter
                value={price.discountedPrice}
                thousandSeparator
                style={{fontSize:"18px"}}
              />
            </Box>
          ) : null}
        </Flex>
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

      <Counter
          min={min_order}
          max={max_order}
          value={cart}
          withButton
        />

        <Box mt="sm">
          {special_offer ? (
            <Flex align="center" justify="space-between" c="red">
              <Text fw="bold" size="sm">
                فروش ویژه
              </Text>
              <CountdownTimer shamsiDate={special_offer} />
            </Flex>
          ) : null}
        </Box>

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
