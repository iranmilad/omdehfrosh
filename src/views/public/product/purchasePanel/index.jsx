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

function PurchasePanel() {
  const { supplier, product, options } = useProduct();

  // Get the selected supplier - try from combinations first, then fall back to root supplier
  const getSelectedSupplier = () => {
    // First, try to get supplier from product combinations
    if (product?.combinations?.length) {
      const combination = product.combinations[0];
      const selectedSupplier = combination.suppliers?.find(s => s.selected) || combination.suppliers?.[0];
      if (selectedSupplier) return selectedSupplier;
    }
    
    // Fallback to root-level supplier if it exists and is selected
    if (supplier && supplier.selected) {
      return supplier;
    }
    
    return null;
  };

  const selectedSupplier = getSelectedSupplier();


  if (!selectedSupplier) {
    return <></>;
  }

  const {
    id,
    name,
    rating,
    payment_type,
    buy_type,
    price,
    stock,
    minOrder,
    maxOrder,
    special_offer,
  } = selectedSupplier;

  const onChange = product?.onChange ?? supplier?.onChange ?? (() => {});

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
                    : +rating >= 4
                    ? "lime"
                    : +rating >= 3
                    ? "yellow"
                    : +rating >= 2
                    ? "orange"
                    : "red"
                }
              >
                {Math.round(+rating) === 5
                  ? "عالی"
                  : +rating >= 4
                  ? "خوب"
                  : +rating >= 3
                  ? "متوسط"
                  : +rating >= 2
                  ? "ضعیف"
                  : "خیلی ضعیف"}
              </Badge>
            </Text>
          </Flex>
        </Flex>
        
        {/* Price */}
        <Flex direction="column" align="end">
          <PriceText fontSize="25px">{price?.discountedPrice}</PriceText>
          {price?.discountedPrice && price?.regularPrice !== price?.discountedPrice ? (
            <Box component="del" c="gray" fz="sm">
              <NumberFormatter
                value={price.regularPrice}
                thousandSeparator
                style={{fontSize:"18px"}}
              />
            </Box>
          ) : null}
        </Flex>
        
        {/* Inventory */}
        <div className="text-xs text-red-400">
          {stock > 0 ? `موجودی انبار ${stock} عدد میباشد` : "ناموجود"}
        </div>
      </div>

      {/* Order Limits */}
      {/* <Flex direction="column" align="start" gap="xs" className="py-4">
        <Flex gap="sm">
          <Text size="13px" c="gray">
            حداقل سفارش
          </Text>
          <Text size="13px">{minOrder} عدد</Text>
        </Flex>
        <Flex gap="sm">
          <Text size="13px" c="gray">
            حداکثر سفارش
          </Text>
          <Text size="13px">{maxOrder} عدد</Text>
        </Flex>
      </Flex> */}

      {/* Counter Component */}
      <Counter
        onChange={onChange}
        min={minOrder}
        max={maxOrder}
        fullWidth
        withButton
        productId={product.id}
        seller={id}
        options={options}
        productName={product.general.title}
        productImages={product.general.images}
        attributes={selectedSupplier}
        // isPending={updateCart?.isPending}
        combinationsID={product.combinations[0]?.id}
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
      {stock === 0 && (
        <Text c="red" size="xs">
          امکان ثبت سفارش وجود ندارد
        </Text>
      )}
    </>
  );
}

export default PurchasePanel;