import {
    Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  GridCol,
  NumberFormatter,
  NumberInput,
  Pagination,
  Paper,
  RangeSlider,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconChevronLeft, IconSearch, IconSortDescending } from "@tabler/icons-react";
import React, { useState } from "react";
import ProductBox from "../productBox";
import PaperCollpase from "../PaperCollapse";
import Tooman from "../tooman";
import { useData } from "../../Libs/api";

const sortFilter = [
  {
    label: "جدیدترین",
    value: "newest",
  },
  {
    label: "ارزان‌ترین",
    value: "lowest_price",
  },
  {
    label: "گران‌ترین",
    value: "highest_price",
  },
  {
    label: "پرفروش‌ترین",
    value: "best_selling",
  },
];

function Archive({products,url}) {
    const {data,isLoading} = useData({url: `${url}?`});
  return (
    <>
      <Grid>
        <GridCol span={{ lg: 3 }}>
          <Stack>
            <Paper>
              <TextInput
                variant="filled"
                styles={{ input: { height: 45 } }}
                rightSection={<IconSearch size={18} />}
                placeholder="جستجو محصول"
              />
            </Paper>
            <PaperCollpase title="قیمت" >
                <Stack>
                <NumberInput hideControls dir="ltr" leftSection={<span style={{fontSize:"14px"}}>از</span>} rightSection={<Tooman />} value={price[0]} styles={{input:{paddingLeft:"24px",direction:"ltr",textAlign:"start"}}} thousandSeparator onChange={(val) => setPrice(price => [val,price[1]])} />
                <NumberInput hideControls dir="ltr" leftSection={<span style={{fontSize:"14px"}}>تا</span>} rightSection={<Tooman />} value={price[1]} styles={{input:{paddingLeft:"24px",direction:"ltr",textAlign:"start"}}} thousandSeparator onChange={(val) => setPrice(price => [price[0],val])} />
                <RangeSlider value={price} min={0} step={500_000} max={20_000_000} label={(val) => <NumberFormatter value={val} thousandSeparator />} onChange={setPrice} />
                </Stack>
            </PaperCollpase>
            <PaperCollpase title="محدوده ارسال">
                <Stack mt="xs">
                  <Checkbox label="تهران" />
                  <Checkbox label="کرج" />
                  <Checkbox label="فارس" />
                </Stack>
            </PaperCollpase>
            <Paper p="lg">
                <Checkbox label="محصولات ناموجود" />
            </Paper>
          </Stack>
        </GridCol>
        <GridCol span={{ lg: 9 }}>
          <Paper py="md">
            <Flex w="100%" gap="lg">
              <Flex align="center" gap="xs" c="gray.7">
                <IconSortDescending size={16} />
                <Text size="sm">مرتب سازی بر اساس : </Text>
              </Flex>
              <SegmentedControl
                withItemsBorders={false}
                styles={{
                  root: { padding: "10px 0" },
                  control: { margin: "0 10px" },
                }}
                data={sortFilter}
              />
            </Flex>
          </Paper>
          <SimpleGrid cols={{ lg: 4 }} my="xl">
              {data.map((item,index) => <ProductBox key={index} {...item} />)}
          </SimpleGrid>
          <Center>
            <Pagination total={10} />
          </Center>
        </GridCol>
      </Grid>
    </>
  );
}

export default Archive;
