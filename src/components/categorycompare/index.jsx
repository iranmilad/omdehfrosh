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
import { IconFilter, IconSortDescending } from "@tabler/icons-react";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import qs from "qs";
import Filters from "./Filters";
import ProductList from "./ProductList";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryData } from "../../redux/category/getcategorydata/getCategoryDataActions";
import DelayedFullScreenLoader from "../centerloading";

const sortFilter = [
  { label: "جدیدترین", value: "newest" },
  { label: "ارزان‌ترین", value: "lowest_price" },
  { label: "گران‌ترین", value: "highest_price" },
  { label: "پرفروش‌ترین", value: "best_selling" },
];

function CategoryCompare({ enabled, url = "/seller/123/products", slug: propSlug, onSelectProduct }) {
  const { slug: routeSlug } = useParams();
  const slug = propSlug || routeSlug;

  const dispatch = useDispatch();
  const { categoryData, loadingCategoryData, errorCategoryData } = useSelector((state) => state.categoryData);

  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 600);
  const filterDisclosure = useDisclosure(false);

  const form = useForm({
    initialValues: {
      price: { min: 0, max: 0 },
      dynamic: {},
    },
  });

  const changeFilters = useCallback(
    (customSortValue) => {
      const filters = {
        price_min: form.values.price.min,
        price_max: form.values.price.max,
        ...form.values.dynamic,
        limit: 20,
        page,
        sort: customSortValue ?? sortValue,
        s: debouncedSearch,
      };

      return {
        filters,
        query: qs.stringify(filters, {
          addQueryPrefix: true,
          arrayFormat: "comma",
        }),
      };
    },
    [form.values, page, sortValue, debouncedSearch]
  );

  const queryKey = changeFilters().query;


  useEffect(() => {
    // Fetch data when modal is opened and slug is available
    if (enabled && slug) {
      const filters = changeFilters().filters;
      dispatch(getCategoryData({ slug, filters }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, slug, queryKey, enabled]);





  useEffect(() => {
    if (categoryData) {
      form.setDirty("price", categoryData?.price);
    }
  }, [loadingCategoryData]);

  const changeSort = useCallback(
    (val) => {
      setSortValue(val);
      setPage(1);
      const newFilters = changeFilters(val).filters;
      dispatch(getCategoryData({ slug, filters: newFilters }));
    },
    [slug, changeFilters, dispatch]
  );

  const handleDynamicChange = useCallback(
    (key, value) => {
      form.setFieldValue(`dynamic.${key}`, value);
      setPage(1);
    },
    [form]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      setPage(newPage);
      // The useEffect will automatically trigger when page changes via queryKey
    },
    []
  );

  if (loadingCategoryData) {
    return <DelayedFullScreenLoader showR={true} />;
  }

  // Show error message if API call failed
  if (errorCategoryData) {
    return (
      <Center p="xl">
        <Text c="red" size="lg">
          خطا در دریافت اطلاعات: {errorCategoryData}
        </Text>
      </Center>
    );
  }

  // Show message if no data and not loading
  if (!loadingCategoryData && (!categoryData || !categoryData.products || categoryData.products.length === 0)) {
    return (
      <Center p="xl">
        <Text c="dimmed" size="lg">
          {slug ? `محصولی در دسته‌بندی "${slug}" یافت نشد` : 'لطفا دسته‌بندی را انتخاب کنید'}
        </Text>
        {slug && (
          <Text c="dimmed" size="sm" mt="md">
            ممکن است نام دسته‌بندی در URL با نام موجود در سیستم مطابقت نداشته باشد
          </Text>
        )}
      </Center>
    );
  }

  return (
    <Box pos="relative">
      {/* <LoadingOverlay visible={isFetching} zIndex={50} /> */}
      {categoryData && categoryData.products && categoryData.products.length > 0 && (
        <Grid>
          <GridCol span={{md:3}}>
          <Stack visibleFrom="md">
              <Filters
                data={categoryData}
                form={form}
                slug={slug}
                changeFilters={changeFilters().filters}
                getCategoryData={getCategoryData}
                setSearch={setSearch}
                handleDynamicChange={handleDynamicChange}
                setPage={setPage}
                filterDisclosure={filterDisclosure}
                // isFetching={isFetching}
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
            <ProductList onSelectProduct={onSelectProduct} products={categoryData?.products}  />
            {categoryData?.totalPages && categoryData.totalPages >= 1 && (
              <Center mt="xl" mb="150px">
                <Pagination 
                  total={categoryData.totalPages} 
                  value={page} 
                  onChange={handlePageChange}
                />
              </Center>
            )}
          </GridCol>
        </Grid>
      )}
    </Box>
  );
}

export default CategoryCompare;
