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
  Alert,
  Modal,
  Group,
  Title,
} from "@mantine/core";
import { IconFilter, IconSortDescending, IconAlertCircle, IconRefresh, IconX, IconPackageOff } from "@tabler/icons-react";
import { useDebouncedState, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useParams, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchbrandProductsData, 
  searchProducts 
} from "../../redux/brands/brandproducts/brandProductsActions";
import {
  updatePage,
  updateSort,
  updateSearchTerm,
  updatePriceRange,
  updateDynamicFilter,
  updateFilter,
  clearError
} from "../../redux/brands/brandproducts/brandProductsSlice";
import Filters from "./Filters";
import ProductList from "./ProductList";
import SortingAndPagination from "./SortingAndPagination";
import ProductBox from "../productBox";
import getHttpCodeMessage from "../../Libs/httpcodes/httpcodes";

const sortFilter = [
  { label: "جدیدترین", value: "newest" },
  { label: "ارزان‌ترین", value: "lowest_price" },
  { label: "گران‌ترین", value: "highest_price" },
  { label: "پرفروش‌ترین", value: "best_selling" },
];

function Archive({ enabled = true, url: apiPath }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Redux state
  const {
    products,
    totalPages,
    currentPage,
    totalProducts,
    price,
    filters,
    loading,
    error,
    currentFilters,
    sortValue,
    searchTerm
  } = useSelector((state) => state.brandProducts);

  // Extract brand slug from query parameter
  const brandSlug = searchParams.get('brand');
  
  // Local state
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 600);
  const filterDisclosure = useDisclosure(false);
  const [errorModalOpened, errorModalHandlers] = useDisclosure(false);
  const [initialized, setInitialized] = useState(false); // NEW
  
  const form = useForm({
    initialValues: {
      price: { min: 0, max: 0 },
      dynamic: {}
    }
  });

  // Reset initialized when enabled changes to true (e.g. tab switch)
  useEffect(() => {
    if (enabled) setInitialized(false);
  }, [enabled]);

  // Mark as initialized once the first fetch completes
  useEffect(() => {
    if (!loading && !initialized) {
      setInitialized(true);
    }
  }, [loading]);

  // Update search term in Redux when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      dispatch(updateSearchTerm(debouncedSearch));
    }
  }, [debouncedSearch, searchTerm, dispatch]);

  // Update brand filter when brandSlug changes
  useEffect(() => {
    if (brandSlug && brandSlug !== currentFilters.brand) {
      dispatch(updateFilter({ key: 'brand', value: brandSlug }));
    }
  }, [brandSlug, currentFilters.brand, dispatch]);

  // Show error modal when error occurs
  useEffect(() => {
    if (error && !errorModalOpened) {
      errorModalHandlers.open();
    }
  }, [error, errorModalOpened, errorModalHandlers]);

  // Fetch data when filters change
  useEffect(() => {
    if (enabled) {
      const filtersToSend = {
        ...currentFilters,
        brand: brandSlug || currentFilters.brand,
      };
      
      if (currentFilters.priceRange) {
        filtersToSend.price_min = currentFilters.priceRange.min;
        filtersToSend.price_max = currentFilters.priceRange.max;
        delete filtersToSend.priceRange;
      }
      
      delete filtersToSend.brands;
      
      Object.keys(filtersToSend).forEach(key => {
        const value = filtersToSend[key];
        if (
          value === undefined || 
          value === null || 
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          delete filtersToSend[key];
        }
      });
            
      dispatch(fetchbrandProductsData(apiPath ? { filters: filtersToSend, apiPath } : filtersToSend));
    }
  }, [currentFilters, brandSlug, enabled, dispatch, apiPath]);

  // Update form when price data is available
  useEffect(() => {
    if (price && (price.min !== form.values.price.min || price.max !== form.values.price.max)) {
      form.setValues({
        ...form.values,
        price: price
      });
    }
  }, [price]);

  // Handlers
  const changeSort = useCallback((val) => {
    dispatch(updateSort(val));
  }, [dispatch]);

  const handlePageChange = useCallback((page) => {
    dispatch(updatePage(page));
  }, [dispatch]);

  const handleDynamicChange = useCallback((key, value) => {
    dispatch(updateDynamicFilter({ key, value }));
    form.setFieldValue(`dynamic.${key}`, value);
  }, [dispatch, form]);

  const handlePriceChange = useCallback((priceRange) => {
    form.setFieldValue("price", priceRange);
    dispatch(updatePriceRange(priceRange));
  }, [dispatch, form]);

  const handleSearchChange = useCallback((searchValue) => {
    setSearch(searchValue);
  }, []);

  const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.status) return getHttpCodeMessage(error.status);
    return 'خطای نامشخص رخ داده است';
  };

  const getErrorTitle = (error) => {
    if (error?.status >= 500) return 'خطای سرور';
    if (error?.status >= 400) return 'خطای درخواست';
    if (error?.status) return `خطا ${error.status}`;
    return 'خطا';
  };

  const getErrorColor = (error) => {
    if (error?.status >= 500) return 'red';
    if (error?.status >= 400) return 'orange';
    return 'red';
  };

  const handleRetry = useCallback(() => {
    dispatch(clearError('error'));
    errorModalHandlers.close();
    
    const filtersToSend = {
      ...currentFilters,
      brand: brandSlug || currentFilters.brand,
    };
    
    if (currentFilters.priceRange) {
      filtersToSend.price_min = currentFilters.priceRange.min;
      filtersToSend.price_max = currentFilters.priceRange.max;
      delete filtersToSend.priceRange;
    }
    
    delete filtersToSend.brands;
    
    Object.keys(filtersToSend).forEach(key => {
      const value = filtersToSend[key];
      if (
        value === undefined || 
        value === null || 
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete filtersToSend[key];
      }
    });
    
    dispatch(fetchbrandProductsData(apiPath ? { filters: filtersToSend, apiPath } : filtersToSend));
  }, [dispatch, currentFilters, brandSlug, errorModalHandlers, apiPath]);

  const handleCloseErrorModal = useCallback(() => {
    dispatch(clearError('error'));
    errorModalHandlers.close();
  }, [dispatch, errorModalHandlers]);

  // Show loading state for initial load (UPDATED)
  if ((!initialized || loading) && products.length === 0 && !error) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  // Show error state for initial load failures
  if (error && products.length === 0 && !errorModalOpened) {
    return (
      <Center>
        <Stack align="center" gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={getErrorTitle(error)}
            color={getErrorColor(error)}
            variant="light"
            style={{ maxWidth: 400 }}
          >
            <Text size="sm" mb="md">
              {getErrorMessage(error)}
            </Text>
            <Button 
              leftSection={<IconRefresh size={16} />}
              onClick={handleRetry}
              size="sm"
              variant="light"
            >
              تلاش مجدد
            </Button>
          </Alert>
        </Stack>
      </Center>
    );
  }

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={50} />
      
      {/* Error Modal */}
      <Modal
        opened={errorModalOpened}
        onClose={handleCloseErrorModal}
        title={
          <Group gap="xs">
            <IconAlertCircle size={20} color="var(--mantine-color-red-6)" />
            <Title order={4} c="red">
              خطا
            </Title>
          </Group>
        }
        centered
        size="sm"
        padding="lg"
        styles={{
          title: { fontWeight: 600 },
          body: { padding: 0 },
        }}
      >
        <Stack gap="lg" p="lg" pt={0}>
          <Text size="sm" c="dimmed" ta="center">
            {getErrorMessage(error)}
          </Text>
          
          <Group justify="center" gap="sm">
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={handleRetry}
              color="red"
              variant="light"
              size="sm"
            >
              تلاش مجدد
            </Button>
            <Button
              leftSection={<IconX size={16} />}
              onClick={handleCloseErrorModal}
              variant="subtle"
              color="gray"
              size="sm"
            >
              بستن
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Grid>
        <GridCol span={{ md: 3 }}>
          <Stack visibleFrom="md">
            <Filters
              data={{ price, filters }}
              form={form}
              setSearch={handleSearchChange}
              handleDynamicChange={handleDynamicChange}
              handlePriceChange={handlePriceChange}
              setPage={() => dispatch(updatePage(1))}
              filterDisclosure={filterDisclosure}
              isFetching={loading}
              slug={brandSlug}
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
        
        <GridCol span={{ md: 9 }}>
          <Paper py="md">
            <Flex 
              w="100%" 
              gap="lg" 
              align="center" 
              justify={{ base: "space-between", xs: "initial" }}
            >
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
                onChange={changeSort}
              />
              <Select
                w="150"
                hiddenFrom="md"
                data={sortFilter}
                value={sortValue}
                onChange={changeSort}
              />
            </Flex>
          </Paper>
          
          {products.length > 0 ? (
            <>
              <ProductList products={products} />
              <Center>
                <Pagination 
                  total={totalPages} 
                  value={currentPage} 
                  onChange={handlePageChange} 
                />
              </Center>
            </>
          ) : initialized && !loading && !error ? (
            <Paper withBorder p="xl" mt="md">
              <Stack align="center" gap="md" py="xl">
                <IconPackageOff size={48} stroke={1.2} color="var(--mantine-color-gray-5)" />
                <Text size="lg" fw={500} c="dimmed">
                  هیچ محصولی یافت نشد
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={400}>
                  با فیلترهای دیگر امتحان کنید یا عبارت جستجو را تغییر دهید.
                </Text>
              </Stack>
            </Paper>
          ) : null}
        </GridCol>
      </Grid>
      
      {/* Mobile Filter Drawer */}
      <Drawer
        opened={filterDisclosure[0]}
        onClose={filterDisclosure[1].close}
        title="فیلتر ها"
        position="right"
      >
        <Filters
          data={{ price, filters }}
          form={form}
          setSearch={handleSearchChange}
          handleDynamicChange={handleDynamicChange}
          handlePriceChange={handlePriceChange}
          setPage={() => dispatch(updatePage(1))}
          filterDisclosure={filterDisclosure}
          isFetching={loading}
          slug={brandSlug}
        />
      </Drawer>
    </Box>
  );
}

export default Archive;