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
  Badge,
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

const RowSeller = ({ item, index }) => {
  const {supplier,data} = useProduct();

  return (
    <Box key={index}>
      <Grid align="center">
        <GridCol span={{ lg: 3 }}>
          <Flex align="center" gap="md">
            <IconBuildingStore />
            <Flex direction="column">
              <Text size="sm" component={NavLink} to={`/seller/${123}`}>
                {item.name}
              </Text>
              <Flex gap="xs">
                <Text size="xs" c="gray">
                  امتیاز
                </Text>
                <Rating value={item.rating} readOnly size="xs" />
              </Flex>
            </Flex>
          </Flex>
        </GridCol>
        <GridCol span={{ lg: 3 }}>
          <Flex direction="column" gap="xs">
            <Flex gap="xs">
              <IconCash size={20} />
              <Text size="sm" c="gray">
                {item.payment_type === "Cash" ? "نقدی" : "پیش فروش"}
              </Text>
            </Flex>
            <Flex gap="xs">
              <IconTruckDelivery size={20} />
              <Text size="sm" c="gray">
                ارسال در {item.delivery}
              </Text>
            </Flex>
          </Flex>
        </GridCol>
        <GridCol span={{ lg: 3 }}>
          <Flex gap="sm" align="center">
            <IconTruckDelivery size={20} />
            <Text size="sm" c="gray">
              فروش {item.buy_type === "Wholesale" ? "عمده" : "تکی"}
            </Text>
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
              <PriceText>{item.price.regularPrice}</PriceText>
              {item.price.discountedPrice ? (
                <Box component="del" c="gray" fz="sm">
                  <NumberFormatter
                    value={item.price.discountedPrice}
                    thousandSeparator
                  />
                </Box>
              ) : null}
            </Flex>
            <Flex align="end" direction="column" gap="xs">
              <Counter
                fullWidth
                withButton
                productId={data.id}
                seller={item.id}
                attributes={supplier.id}
               />
              {item.special_offer ? <CountdownTimer shamsiDate={item.special_offer} /> : null}
            </Flex>
          </Flex>
        </GridCol>
      </Grid>
    </Box>
  );
};

function Sellers({ items }) {
  const [opened, { open, close, toggle }] = useDisclosure(false);
  return (
    <Paper my={50} p="xl">
      <Title>فروشندگان این کالا</Title>
      <Stack mt="xl" gap="40">
        {items.slice(0, 2).map((item, index) => (
          <RowSeller key={index} item={item} />
        ))}
      </Stack>
      <Collapse in={opened}>
        <Stack gap="40" mt="40">
          {items.slice(2, items.length).map((item, index) => (
            <RowSeller key={index} item={item} />
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
