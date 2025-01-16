import { Alert, Badge, Button, Divider, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react";
import React from "react";
import PriceText from "../../../components/priceText"
import Product from "./product";

function Account_Order() {
  return (
    <>
      <Title display="flex" style={{ alignItems: "center" }}>
        <IconArrowRight style={{ marginLeft: "10px" }} /> جزئیات سفارش
      </Title>
      <Alert mt="md" title="آیا سفارش به دستتان رسیده است ؟">
        <Group>
          <Button size="xs" h={35} color="red">خیر</Button>
          <Button size="xs" h={35}>بله</Button>
        </Group>
      </Alert>
      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">تحویل گیرنده : </Text>
          <Text>فرهاد باقری</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">شماره موبایل : </Text>
          <Text>09374039436</Text>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">آدرس : </Text>
          <Text>فارس - شیراز - بلوار ارم - نبش کوچه 4 - پلاک 596 - درب سفید مشکی</Text>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Flex columnGap={90} rowGap={30} wrap={"wrap"}>
        <Flex gap="xs">
          <Text c="gray">مبلغ : </Text>
          <PriceText>2000000</PriceText>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">مقدار تخفیف : </Text>
          <PriceText>2000000</PriceText>
        </Flex>
        <Flex gap="xs">
          <Text c="gray">کد تخفیف استفاده شده : </Text>
          <Badge>XCODE</Badge>
        </Flex>
      </Flex>
      <Divider my="xl" />
      <Title mb="lg">مرسولات</Title>
      <Stack>
        <Product />
        <Product />
        <Product />
      </Stack>
    </>
  );
}

export default Account_Order;
