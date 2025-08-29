import {
  Paper,
  Box,
  Center,
  Text,
  Flex,
  Grid,
  GridCol,
  Badge,
  Button,
  Collapse,
  Stack,
  Rating,
  NumberFormatter,
  useMantineTheme,
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
import { useDisclosure } from "@mantine/hooks";
import Title from "../../../../components/title";
import CountdownTimer from "../../../../components/countDownTimer";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useProduct } from "..";
import Counter from "../../../../components/counter";
import CounterSellers from "../../../../components/counter-sellers/counter-sellers";

const RowSeller = ({ item, index }) => {
  const { supplier, product, options } = useProduct();

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
            <Flex align="end" direction="column" gap="xs">
              <Flex gap="4px" align="center">
                <Text size="sm" c="gray">حداقل سفارش:</Text>
                <Text size="sm" c="gray">{item.minOrder}</Text>
              </Flex>
              <Flex gap="4px" align="center">
                <Text size="sm" c="gray">حداکثر سفارش:</Text>
                <Text size="sm" c="gray">{item.maxOrder}</Text>
              </Flex>
            </Flex>
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
                productName={product?.general.title}
                productImages={product?.general.images?.[0]}
                // isPending={updateCart?.isPending}
                min={item.minOrder}
                max={item.maxOrder}
              />
              {item.special_offer ? (
                <CountdownTimer shamsiDate={item.special_offer} />
              ) : null}
            </Flex>
          </Flex>
        </GridCol>
      </Grid>
    </Box>
  );
};

function Sellers({ items}) {
  const [opened, { open, close, toggle }] = useDisclosure(false);

  return (
    <Paper my={50} p="xl">
      <Title>فروشندگان این کالا</Title>
      <Stack mt="xl" gap="40">
        {items.slice(0, 2).map((item, index) => (
          <RowSeller key={index} item={item} index={index} />
        ))}
      </Stack>
      <Collapse in={opened}>
        <Stack gap="40" mt="40">
          {items.slice(2, items.length).map((item, index) => (
            <RowSeller key={index + 2} item={item} index={index + 2} />
          ))}
        </Stack>
      </Collapse>
      {items.length > 2 ? (
        <Center>
          <Button radius={999} variant="light" mt="xl" onClick={() => toggle()}>
            مشاهده {opened ? "کمتر" : "بیشتر"} فروشگاه ها
          </Button>
        </Center>
      ) : null}
    </Paper>
  );
}

export default Sellers;