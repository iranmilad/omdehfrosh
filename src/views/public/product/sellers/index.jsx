import {
  Paper,
  Box,
  Text,
  Flex,
  Grid,
  GridCol,
  Badge,
  Stack,
  Rating,
  NumberFormatter,
} from "@mantine/core";
import { NavLink } from "react-router";
import {
  IconBuildingStore,
  IconUserPin,
  IconTruckDelivery,
  IconShield,
  IconCashBanknote,
  IconTruckLoading,
  IconCash,
  IconPercentage,
  IconClock12,
} from "@tabler/icons-react";
import PriceText from "../../../../components/priceText";
import Title from "../../../../components/title";
import CountdownTimer from "../../../../components/countDownTimer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useProduct } from "..";
import Counter from "../../../../components/counter";
import CounterSellers from "../../../../components/counter-sellers/counter-sellers";
import persianDate from "persian-date";

const RowSeller = ({ item, index }) => {
  const { supplier, product, options, selectedCombination } = useProduct();

  const [matchingCombination, setMatchingCombination] = useState(undefined);

  const findMatchingCombination = (productId, options, combinations) => {
    if (!Array.isArray(options) || !Array.isArray(combinations)) return null;
  
    const sortedOptionsStr = JSON.stringify([...options].sort((a, b) => a.id - b.id));
  
    return combinations.find(combination => {
      return JSON.stringify([...combination.options].sort((a, b) => a.id - b.id)) === sortedOptionsStr;
    }) || null;
  };

  // Helper function to get delivery info
  const getDeliveryInfo = () => {
    if (item.delivery && item.delivery.length > 0) {
      return item.delivery.map(d => d.locationLabel).join('، ');
    }
    if (item.deliveryTime) {
      return item.deliveryTime.label;
    }
    return "اطلاعات ارسال موجود نیست";
  };

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
    if (typeof item.special_offer === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.special_offer.split('T')[0])) {
      const datePart = item.special_offer.split('T')[0];
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
    const offerDate = parseSpecialOfferDate(item.special_offer);
    
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
    <Box key={index}>
      <Grid align="center">
        <GridCol span={{ lg: 3 }}>
          <Flex align="center" gap="md">
            <IconBuildingStore />
            <Flex direction="column">
              <Text size="sm" component={NavLink} to={`/seller/${item.id}`}>
                {item.name}
              </Text>
              <Flex gap="xs">
                <Text size="xs" c="gray">
                  امتیاز
                </Text>
                <Rating value={parseFloat(item.rating)} readOnly size="xs" />
              </Flex>
              <div className="text-xs text-red-400">
                {item.stock > 0 ? `موجودی انبار ${item.stock} عدد میباشد` : "ناموجود"}
              </div>
            </Flex>
          </Flex>
        </GridCol>
        
        <GridCol span={{ lg: 3 }}>
          <Flex direction="column" gap="xs">
            <Flex gap="xs">
              <IconCash size={20} />
              <Text size="sm" c="gray">
                {item.payment_type === "Cash" ? "نقدی" : 
                 item.payment_type ? item.payment_type : "نقدی"}
              </Text>
            </Flex>
            <Flex gap="xs">
              <IconTruckDelivery size={20} />
              <Text size="sm" c="gray">
                ارسال: {getDeliveryInfo()}
              </Text>
            </Flex>
          </Flex>
        </GridCol>
        
        <GridCol span={{ lg: 3 }}>
          <Flex gap="sm" align="center" direction="column">
            <Flex gap="xs">
              <IconTruckDelivery size={20} />
              <Text size="sm" c="gray">
                فروش {item.buy_type === "Wholesale" ? "عمده" : 
                       item.buy_type ? item.buy_type : "تکی"}
              </Text>
            </Flex>
            {/* <Flex align="end" direction="column" gap="xs">
              <Flex gap="4px" align="center">
                <Text size="sm" c="gray">حداقل سفارش:</Text>
                <Text size="sm" c="gray">{item.minOrder}</Text>
              </Flex>
              <Flex gap="4px" align="center">
                <Text size="sm" c="gray">حداکثر سفارش:</Text>
                <Text size="sm" c="gray">{item.maxOrder}</Text>
              </Flex>
            </Flex> */}
          </Flex>
        </GridCol>
        
        <GridCol span={{ lg: 3 }}>
          <Flex align="start" justify="end" gap="lg">
            {item.price.discountPercent && (
              <Badge
                display="flex"
                style={{ flexDirection: "row" }}
                styles={{
                  label: { display: "flex" },
                  root: { paddingInline: 5, borderBottomLeftRadius: 0 },
                }}
              >
                {item.price.discountPercent}
                <IconPercentage size={16} style={{ marginRight: 5 }} />
              </Badge>
            )}

            <Flex direction="column" align="end">
              {/* Fixed: Show discounted price as main price if available */}
              <PriceText>
                {item.price.discountedPrice || item.price.regularPrice}
              </PriceText>
              {/* Fixed: Show regular price as strikethrough if there's a discount */}
              {item.price.discountedPrice && item.price.discountedPrice !== item.price.regularPrice ? (
                <Box component="del" c="gray" fz="sm">
                  <NumberFormatter
                    value={item.price.regularPrice}
                    thousandSeparator
                  />
                </Box>
              ) : null}
            </Flex>
            
            <Flex align="end" direction="column" gap="xs">
              <CounterSellers
                item={item}
                fullWidth
                withButton
                productId={product?.id}
                seller={item.id}
                options={options}
                combinationsID={selectedCombination?.id}
                productName={product?.general?.title}
                productImages={product?.general?.images?.[0]}
                min={item.minOrder}
                max={item.maxOrder}
                stock={item.stock}
              />
              {validSpecialOffer ? (
                <CountdownTimer shamsiDate={validSpecialOffer} />
              ) : null}
            </Flex>
          </Flex>
        </GridCol>
      </Grid>
    </Box>
  );
};

function Sellers({ items }) {
  return (
    <Paper my={50} p="xl">
      <Title>فروشندگان این کالا</Title>
      <Stack mt="xl" gap="40">
        {items.map((item, index) => (
          <RowSeller key={item.id ?? index} item={item} index={index} />
        ))}
      </Stack>
    </Paper>
  );
}

export default Sellers;