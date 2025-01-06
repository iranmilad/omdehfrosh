import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Center,
  Drawer,
  Flex,
  Grid,
  GridCol,
  Loader,
  LoadingOverlay,
  Pagination,
  Paper,
  Stack,
  Text,
  SegmentedControl,
  Select,
} from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { useDebouncedState, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import qs from "qs";
import { useData } from "../../Libs/api";
import Filters from "./Filters";
import ProductList from "./ProductList";
import SortingAndPagination from "./SortingAndPagination";
import ProductBox from "../productBox";
import { IconSortDescending } from "@tabler/icons-react";

const sortFilter = [
  { label: "جدیدترین", value: "newest" },
  { label: "ارزان‌ترین", value: "lowest_price" },
  { label: "گران‌ترین", value: "highest_price" },
  { label: "پرفروش‌ترین", value: "best_selling" },
];

function Archive({ enabled, url }) {
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("newest");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search,600);
  const filterDisclosure = useDisclosure(false);

  
  const form = useForm({
    initialValues: {
      price: {min: 0,max:0},
      dynamic: {}
    }
  })


  const changeFilters = useCallback(() => {
    const filters = {
      price_min: form.values.price.min,
      price_max: form.values.price.max,
      ...form.values.dynamic,
      limit: 20,
      page,
      sort: sortValue,
      s: debouncedSearch,
    };
    return qs.stringify(filters, {
      addQueryPrefix: true,
      arrayFormat: "comma",
    });
  }, [form.values, page, sortValue, debouncedSearch, url]);

  const queryKey = changeFilters();

  const { isLoading, isFetching, data } = useData({
    url,
    queryOptions: { staleTime: 30 * 10000,enabled },
    queryKey: [url, queryKey],
  });

  useEffect(() => {
    if(data){
      form.setDirty('price',data?.price);
    };
  },[isLoading])


  const changeSort = useCallback((val) => {
    setSortValue(val);
    setPage(1);
  },[]);


  const handleDynamicChange = useCallback((key, value) => {
    form.setFieldValue(`dynamic.${key}`, value);
    setPage(1)
  }, [form]);

  if (isLoading) return <Center><Loader /></Center>;
  return (
    <Box pos="relative">
      <LoadingOverlay visible={isFetching} zIndex={50} />
      {data && (
        <Grid>
          <GridCol span={{md:3}}>
          <Stack visibleFrom="md">
              <Filters
                data={data}
                form={form}
                setSearch={setSearch}
                handleDynamicChange={handleDynamicChange}
                setPage={setPage}
                filterDisclosure={filterDisclosure}
                isFetching={isFetching}
              />
            </Stack>
            <Button
              hiddenFrom="md"
              leftSection={<IconFilter size={18} />}
              onClick={filterDisclosure[1].open}
            >
              فیلتر ها
            </Button>
          </GridCol>
          <GridCol span={{ md:9}}>
            <Paper py="md">
              <Flex w="100%" gap="lg" align="center" justify={{base: "space-between",xs:"initial"}}>
                <Flex align="center" gap="xs" c="gray.7">
                  <IconSortDescending size={16} />
                  <Text size="sm">مرتب سازی بر اساس:</Text>
                </Flex>
                <SegmentedControl
                  visibleFrom="md"
                  withItemsBorders={false}
                  styles={{
                    root: { padding: "10px 0" },
                    control: { margin: "0 10px" },
                  }}
                  data={sortFilter}
                  value={sortValue}
                  onChange={(val) => changeSort(val)}
                />
                <Select
                  w="150"
                  hiddenFrom="md"
                  data={sortFilter}
                  value={sortValue}
                  onChange={(val) => changeSort(val)}
                />
              </Flex>
            </Paper>
            <ProductList products={data.products}  />
            <Center><Pagination total={20} value={page} onChange={setPage} /></Center>
          </GridCol>
        </Grid>
      )}
    </Box>
  );
}

export default Archive;
