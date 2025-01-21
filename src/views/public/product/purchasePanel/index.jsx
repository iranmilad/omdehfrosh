import { Badge, Button, Flex, Text } from "@mantine/core";
import {
  IconBasket,
  IconBuildingStore,
  IconCash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import React from "react";
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
}) {
  return (
    <>
      {/* Payment Type */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm pt-3 mb-4">
        <IconCash size={20} stroke={1.3} className="text-zinc-700" />
        <div>{payment_type.join(" | ")}</div>
      </div>

      {/* Delivery Info */}
      <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-4">
        <IconTruckDelivery size={20} stroke={1.3} className="text-zinc-700" />
        <div>{buy_type.join(" | ")}</div>
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
                  rating === 5
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
                {rating === 5
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

      {/* Add to Cart Button */}
      <Button
        fullWidth
        leftSection={<IconBasket />}
        h={45}
        disabled={inventory === 0}
      >
        افزودن به سبد خرید
      </Button>

      {/* Counter */}
      <Counter min={min_order} max={max_order} />

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
