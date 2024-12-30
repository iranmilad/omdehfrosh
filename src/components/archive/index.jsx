import {
  Button,
  Center,
  Checkbox,
  Flex,
  Grid,
  GridCol,
  Loader,
  LoadingOverlay,
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
import {
  IconChevronLeft,
  IconSearch,
  IconSortDescending,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import ProductBox from "../productBox";
import PaperCollpase from "../PaperCollapse";
import Tooman from "../tooman";
import { useData } from "../../Libs/api";
import Price from "./price";
import { useForm } from "@mantine/form";
import qs from "qs";

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

function Archive({ products, url }) {
  const { data, isLoading } = useData({ url: `${url}?` });
  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("newest"); // Added state for sort value

  // ساختار داده داینامیک برای فیلترها از سرور
  const dynamicFilters = data?.filters || []; // فرض کنیم داده فیلترها از سرور می‌آید

  const form = useForm({
    initialValues: {
      price: { min: 0, max: data?.price?.max || 0 },
      dynamic: {}, // فیلترهای داینامیک
    },
  });

  // این تابع برای ساخت URL با فیلترها استفاده می‌شود
  const getFilteredUrl = (page, sortValue) => {
    const filters = {
      ...form.values.price, // فیلترهای قیمت
      ...form.values.dynamic, // فیلترهای داینامیک
      page, // اضافه کردن صفحه به فیلترها
      sort: sortValue,
    };

    // استفاده از qs برای تبدیل فیلترها به query string
    const queryString = qs.stringify(filters, {
      addQueryPrefix: true,
      arrayFormat: "comma",
    });
    return `${url}${queryString}`;
  };

  // این تابع برای به روزرسانی فیلترهای داینامیک استفاده می‌شود
  const handleDynamicChange = (key, value) => {
    form.setFieldValue(`dynamic.${key}`, value); // به‌روزرسانی فیلتر داینامیک
  };

  // هنگام ارسال داده‌ها، URL با فیلترها آپدیت می‌شود
  const { data: filteredData, isLoading: filteredLoading } = useData({
    url: getFilteredUrl(page, sortValue), // URL فیلتر شده
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Track if filtering has occurred before to show overlay loader
  const [isFilteredOnce, setIsFilteredOnce] = useState(false);

  // Handle sort value change
  const handleSortChange = (value) => {
    setSortValue(value); // Update the sort value
    setPage(1); // Reset to first page when sorting changes
  };

  useEffect(() => {
    if (!isLoading && filteredData) {
      setIsFilteredOnce(true); // Mark that filtering has happened once
    }
  }, [filteredData, isLoading]);

  console.log(filteredData)

  return (
    <>
      {!isLoading ? (
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
              <Price price={data.price} />
              {/* حلقه برای رندر کردن فیلترهای داینامیک */}
              {dynamicFilters.map((filter, index) => (
                <PaperCollpase key={index} title={filter.title}>
                  <Stack mt="xs">
                    {filter.options.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={form.values.dynamic[filter.key]?.includes(
                          option.value
                        )}
                        onChange={(e) => {
                          const currentValues =
                            form.values.dynamic[filter.key] || [];
                          const updatedValues = e.target.checked
                            ? [...currentValues, option.value]
                            : currentValues.filter(
                                (val) => val !== option.value
                              );
                          handleDynamicChange(filter.key, updatedValues); // به‌روزرسانی فیلتر با handleDynamicChange
                        }}
                      />
                    ))}
                  </Stack>
                </PaperCollpase>
              ))}
            </Stack>
          </GridCol>
          <GridCol span={{ lg: 9 }} pos="relative">
            <LoadingOverlay visible={isFilteredOnce && filteredLoading} />
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
                  data={sortFilter} // Make sure sortFilter contains the sort options
                  value={sortValue} // Bind the value to the state
                  onChange={handleSortChange} // Handle sort change
                />
              </Flex>
            </Paper>
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 3, lg: 4 }} my="xl">
              {filteredData?.products.map((item, index) => (
                <ProductBox key={index} {...item} />
              ))}
            </SimpleGrid>
            <Center>
              <Pagination
                page={page}
                onChange={handlePageChange}
                total={filteredData?.totalPages || 1} // Assuming the API provides totalPages
              />
            </Center>
          </GridCol>
        </Grid>
      ) : (
        <Paper p="xl">
          <Center>
            <Loader />
          </Center>
        </Paper>
      )}
    </>
  );
}

export default Archive;
