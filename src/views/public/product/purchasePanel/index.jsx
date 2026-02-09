import { Badge, Box, Button, Flex, NumberFormatter, Text } from "@mantine/core";
import {
  IconBasket,
  IconBuildingStore,
  IconCash,
  IconTruckDelivery,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router";
import { useProduct } from "..";
import Counter from "../../../../components/counter";
import PriceText from "../../../../components/priceText";
import CountdownTimer from "../../../../components/countDownTimer";
import persianDate from "persian-date";

function PurchasePanel() {
  const { selectedSupplier, selectedCombination, product, options } = useProduct();

  if (!selectedSupplier || !selectedCombination) {
    return null;
  }

  const {
    id,
    name,
    rating,
    payment_type,
    buy_type,
    price: rawPrice,
    stock,
    minOrder,
    maxOrder,
    special_offer,
  } = selectedSupplier;

  // Normalize price: support camelCase, snake_case, and flat number from API
  const price =
    rawPrice != null && typeof rawPrice === "object"
      ? {
          regularPrice: Number(rawPrice.regularPrice ?? rawPrice.regular_price ?? rawPrice.regular ?? rawPrice.final_price ?? rawPrice) || 0,
          discountedPrice: Number(rawPrice.discountedPrice ?? rawPrice.discounted_price ?? rawPrice.discounted ?? rawPrice.regularPrice ?? rawPrice.regular_price ?? rawPrice.regular ?? rawPrice) || 0,
        }
      : { regularPrice: Number(rawPrice) || 0, discountedPrice: Number(rawPrice) || 0 };

  const displayPrice = price.discountedPrice || price.regularPrice;

  const onChange = product?.onChange ?? (() => {});

  // Helper function to parse special_offer date from various formats
  const parseSpecialOfferDate = (specialOffer) => {
    if (!specialOffer) return null;

    // Handle empty objects - treat as null
    if (typeof specialOffer === 'object' && !Array.isArray(specialOffer) && Object.keys(specialOffer).length === 0) {
      return null;
    }

    let date = null;

    // Handle MongoDB date format: { "$date": { "$numberLong": "..." } }
    if (specialOffer && typeof specialOffer === 'object' && specialOffer.$date) {
      if (specialOffer.$date.$numberLong !== undefined) {
        date = new Date(parseInt(specialOffer.$date.$numberLong));
      } else if (specialOffer.$date instanceof Date) {
        date = specialOffer.$date;
      } else if (typeof specialOffer.$date === 'string' || typeof specialOffer.$date === 'number') {
        date = new Date(specialOffer.$date);
      }
    }
    // Handle Date object
    else if (specialOffer instanceof Date) {
      date = specialOffer;
    }
    // Handle ISO string or timestamp
    else if (typeof specialOffer === 'string') {
      // Check if the string contains a Persian year (1400+)
      // Format might be "1404-12-29T00:00:00.000Z" which is invalid ISO
      const yearMatch = specialOffer.match(/^(\d{4})-/);
      if (yearMatch && parseInt(yearMatch[1]) >= 1400) {
        // This is likely a Persian date in ISO-like format
        // Extract the date part and parse as Persian date
        const datePart = specialOffer.split('T')[0]; // "1404-12-29"
        try {
          const [year, month, day] = datePart.split('-').map(Number);
          // Create Persian date and convert to Gregorian for comparison
          const persianDateObj = new persianDate([year, month, day]);
          date = persianDateObj.toDate(); // Convert to JavaScript Date
        } catch (error) {
          console.error('Error parsing Persian date:', error);
          return null;
        }
      } else {
        // Try to parse as ISO date or timestamp
        if (specialOffer.includes('T') && (specialOffer.includes('Z') || specialOffer.includes('+'))) {
          date = new Date(specialOffer);
        } else {
          // Might be a timestamp string
          const timestamp = parseInt(specialOffer);
          if (!isNaN(timestamp)) {
            date = new Date(timestamp);
          } else {
            date = new Date(specialOffer);
          }
        }
      }
    } else if (typeof specialOffer === 'number') {
      date = new Date(specialOffer);
    }

    // Validate date
    if (!date || isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // Check if special_offer is valid and not passed
  const getValidSpecialOffer = () => {
    // If special_offer is already a Persian date string (YYYY-MM-DD format)
    if (typeof special_offer === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(special_offer.split('T')[0])) {
      const datePart = special_offer.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      
      // Check if it's a Persian year (1400+)
      if (year >= 1400) {
        // Validate the date is in the future
        try {
          const persianDateObj = new persianDate([year, month, day]);
          const gregorianDate = persianDateObj.toDate();
          const now = new Date();
          
          if (gregorianDate > now) {
            // Date is in the future, return the Persian date string for CountdownTimer
            return datePart;
          }
        } catch (error) {
          console.error('Error validating Persian date:', error);
          return null;
        }
      }
    }
    
    // Otherwise, parse as regular date
    const offerDate = parseSpecialOfferDate(special_offer);
    
    if (!offerDate) {
      return null;
    }

    // Check if date is in the future
    const now = new Date();
    if (offerDate <= now) {
      return null; // Date has passed
    }

    // Convert to Persian date format (YYYY-MM-DD) for CountdownTimer
    try {
      const persian = new persianDate(offerDate);
      const year = persian.year();
      const month = String(persian.month()).padStart(2, '0');
      const day = String(persian.date()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error converting date to Persian:', error);
      return null;
    }
  };

  const validSpecialOffer = getValidSpecialOffer();

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
          {displayPrice > 0 ? (
            <>
              <PriceText fontSize="25px">{displayPrice}</PriceText>
              {price.regularPrice > 0 && price.discountedPrice > 0 && price.regularPrice > price.discountedPrice ? (
                <Box component="del" c="gray" fz="sm">
                  <NumberFormatter
                    value={price.regularPrice}
                    thousandSeparator
                    style={{fontSize:"18px"}}
                  />
                </Box>
              ) : null}
            </>
          ) : (
            <Text size="sm" c="dimmed">قیمت را از فروشنده بپرسید</Text>
          )}
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

      {/* Counter: add to basket with selected combination + selected supplier */}
      <Counter
        onChange={onChange}
        min={minOrder}
        max={maxOrder}
        fullWidth
        withButton
        productId={product.id}
        seller={id}
        options={options}
        productName={product.general?.title}
        productImages={product.general?.images}
        item={selectedSupplier}
        combinationsID={selectedCombination?.id}
      />

      <Box mt="sm">
        {validSpecialOffer ? (
          <Flex align="center" justify="space-between" c="red">
            <Text fw="bold" size="sm">
              فروش ویژه
            </Text>
            <CountdownTimer shamsiDate={validSpecialOffer} />
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