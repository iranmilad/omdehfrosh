import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
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
  Modal,
  TextInput,
  Checkbox,
} from "@mantine/core";
import { IconFilter, IconSearch, IconSortDescending } from "@tabler/icons-react";
import { useDebouncedState, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import qs from "qs";
import ProductList from "./ProductList";
import SortingAndPagination from "./SortingAndPagination";
import ProductBox from "../productBox";
import Price from './price';
import PaperCollpase from '../PaperCollapse';
import { useParams, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryData } from "../../redux/category/getcategorydata/getCategoryDataActions";
import DelayedFullScreenLoader from "../centerloading";
import { verifyToken } from "../../redux/auth/authusers/auth";
import { fetchUserInfo } from "../../redux/users/userinfo/userInfo";

const sortFilter = [
  { label: "جدیدترین", value: "newest" },
  { label: "ارزان‌ترین", value: "lowest_price" },
  { label: "گران‌ترین", value: "highest_price" },
  { label: "پرفروش‌ترین", value: "best_selling" },
];

// Internal Filters Component
const FiltersSection = React.memo(({ 
  isFetching, 
  data, 
  slug, 
  form, 
  handleDynamicChange, 
  setSearch, 
  setPage, 
  filterDisclosure,
  onFiltersSubmit
}) => {
  const dynamicFilters = data?.filters || [];

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handlePriceChange = (updatedPrice) => {
    form.setFieldValue("price", updatedPrice);
    setPage(1);
  };

  const handleFilterChange = (filterKey, optionValue, checked) => {
    const currentValues = form.values.dynamic[filterKey] || [];
    const updatedValues = checked
      ? [...currentValues, optionValue]
      : currentValues.filter((val) => val !== optionValue);
    handleDynamicChange(filterKey, updatedValues);
  };

  const FilterContent = () => (
    <>
      <Paper h={83} display="flex" style={{ alignItems: "center" }}>
        <TextInput
          w="100%"
          variant="filled"
          styles={{ input: { height: 45 } }}
          rightSection={<IconSearch size={18} />}
          placeholder="جستجو محصول"
          onChange={handleSearchChange}
        />
      </Paper>
      <Price
        priceRange={data?.price}
        data={data ?? data}
        priceSliderMin={100}
        priceSliderMax={200000}
        onPriceChange={handlePriceChange}
      />

      {dynamicFilters.map((filter, index) => (
        <PaperCollpase key={index} title={filter.title}>
          <Stack mt="xs">
            {filter.options.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={form.values.dynamic[filter.key]?.includes(option.value)}
                onChange={(e) => handleFilterChange(filter.key, option.value, e.target.checked)}
              />
            ))}
          </Stack>
        </PaperCollpase>
      ))}
    </>
  );

  return (
    <>
      {/* Desktop view */}
      <Stack visibleFrom="md">
        <FilterContent />
      </Stack>

      {/* Mobile Filter Button */}
      <Button
        hiddenFrom="md"
        leftSection={<IconFilter size={18} />}
        onClick={filterDisclosure[1].open}
      >
        فیلتر ها
      </Button>

      {/* Mobile Drawer */}
      <Drawer
        opened={filterDisclosure[0]}
        onClose={filterDisclosure[1].close}
        title="فیلترها"
        size="100%"
        position="right"
      >
        <LoadingOverlay visible={isFetching} />
        <Stack>
          <FilterContent />
          <Button h={35} size="xs" radius={99999} w="max-content" onClick={onFiltersSubmit}>
            فیلتر
          </Button>
        </Stack>
      </Drawer>
    </>
  );
});

function Category({ enabled, onSelectProduct }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const initialLoadRef = useRef(false);

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const DEFAULT_FILTERS = {
    brands: [],
    colors: [],
    delivery_areas: []
  };

  // Helper function to parse URL parameters
  const parseUrlFilters = useCallback(() => {
    const urlFilters = { ...DEFAULT_FILTERS };
    
    // Parse brands
    const brandsParam = searchParams.get('brands');
    if (brandsParam) {
      try {
        const parsedBrands = JSON.parse(brandsParam);
        if (Array.isArray(parsedBrands)) {
          urlFilters.brands = parsedBrands;
        }
      } catch (e) {
        console.warn('Failed to parse brands parameter:', e);
      }
    }

    // Parse colors
    const colorsParam = searchParams.get('colors');
    if (colorsParam) {
      try {
        const parsedColors = JSON.parse(colorsParam);
        if (Array.isArray(parsedColors)) {
          urlFilters.colors = parsedColors;
        }
      } catch (e) {
        console.warn('Failed to parse colors parameter:', e);
      }
    }

    // Parse delivery_areas
    const deliveryAreasParam = searchParams.get('delivery_areas');
    if (deliveryAreasParam) {
      try {
        const parsedDeliveryAreas = JSON.parse(deliveryAreasParam);
        if (Array.isArray(parsedDeliveryAreas)) {
          urlFilters.delivery_areas = parsedDeliveryAreas;
        }
      } catch (e) {
        console.warn('Failed to parse delivery_areas parameter:', e);
      }
    }

    return urlFilters;
  }, [searchParams]);

  const {
    categoryData,
    loadingCategoryData,
    errorCategoryData
  } = useSelector((state) => state.categoryData);

  // Initialize state from URL parameters
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [sortValue, setSortValue] = useState(searchParams.get('sort') || "newest");
  const [search, setSearch] = useState(searchParams.get('s') || "");
  const [debouncedSearch] = useDebouncedValue(search, 600);
  const filterDisclosure = useDisclosure(false);
  
  // Parse URL filters once and use them in form initialization
  const urlFilters = useMemo(() => parseUrlFilters(), [parseUrlFilters]);
  
  const form = useForm({
    initialValues: {
      price: {
        min: parseInt(searchParams.get('price_min')) || 0,
        max: parseInt(searchParams.get('price_max')) || 0
      },
      dynamic: urlFilters
    }
  });

  // Single function to build and dispatch API call
  const fetchCategoryData = useCallback((customFilters = {}) => {
    const filters = {
      price_min: form.values.price.min || 0,
      price_max: form.values.price.max || 9000000,
      ...form.values.dynamic,
      limit: 20,
      page,
      sort: sortValue,
      s: debouncedSearch,
      ...customFilters // Override with any custom filters
    };

    // Remove undefined/null values and empty arrays
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key];
      }
    });

    dispatch(getCategoryData({ slug, filters }));
  }, [dispatch, slug, form.values, page, sortValue, debouncedSearch]);

  // Auth effects
  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchUserInfo());
    }
  }, [user, dispatch]);

  // Main data fetching effect - only runs once on mount and when essential params change
  useEffect(() => {
    if (slug && !initialLoadRef.current) {
      initialLoadRef.current = true;
      fetchCategoryData();
    }
  }, [slug, fetchCategoryData]);

  // Handle debounced search changes
  useEffect(() => {
    if (initialLoadRef.current) {
      fetchCategoryData();
    }
  }, [debouncedSearch]);

  // Set default values only after first successful API call
  useEffect(() => {
    if (categoryData && !errorCategoryData && initialLoadRef.current) {
      let shouldUpdate = false;
      const updates = {};

      // Set price defaults only if not already set from URL
      if (form.values.price.min === 0 && form.values.price.max === 0 && categoryData?.price) {
        updates.price = categoryData.price;
        shouldUpdate = true;
      }
      
      // Only set default filters if no URL params were provided AND no existing values
      if (!searchParams.get('brands') && (!form.values.dynamic.brands || form.values.dynamic.brands.length === 0) && categoryData?.brands?.length > 0) {
        updates['dynamic.brands'] = [categoryData.brands[0].name || categoryData.brands[0]];
        shouldUpdate = true;
      }
      if (!searchParams.get('colors') && (!form.values.dynamic.colors || form.values.dynamic.colors.length === 0) && categoryData?.colors?.length > 0) {
        updates['dynamic.colors'] = [categoryData.colors[0].name || categoryData.colors[0]];
        shouldUpdate = true;
      }
      if (!searchParams.get('delivery_areas') && (!form.values.dynamic.delivery_areas || form.values.dynamic.delivery_areas.length === 0) && categoryData?.delivery_areas?.length > 0) {
        updates['dynamic.delivery_areas'] = [categoryData.delivery_areas[0].name || categoryData.delivery_areas[0]];
        shouldUpdate = true;
      }

      if (shouldUpdate) {
        Object.keys(updates).forEach(key => {
          form.setFieldValue(key, updates[key]);
        });
      }
    }
  }, [categoryData, errorCategoryData, form, searchParams]);

  const changeSort = useCallback((val) => {
    setSortValue(val);
    setPage(1);
    fetchCategoryData({ sort: val, page: 1 });
  }, [fetchCategoryData]);
  
  const handleDynamicChange = useCallback((key, value) => {
    form.setFieldValue(`dynamic.${key}`, value);
    setPage(1);
    fetchCategoryData({ [key]: value, page: 1 });
  }, [form, fetchCategoryData]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    fetchCategoryData({ page: newPage });
  }, [fetchCategoryData]);

  const handleFiltersSubmit = useCallback(() => {
    fetchCategoryData();
    filterDisclosure[1].close();
  }, [fetchCategoryData, filterDisclosure]);

  // Handle API error case with retry functionality (skip for 401 – only show relogin modal)
  const errStr = typeof errorCategoryData === 'string' ? errorCategoryData : (errorCategoryData?.message || '');
  const isAuthError = errStr && (String(errStr).includes('401') || String(errStr).toLowerCase().includes('unauthorized'));
  if (errorCategoryData && !loadingCategoryData && !isAuthError) {
    const handleRetry = () => {
      fetchCategoryData();
    };

    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="خطا در بارگذاری داده‌ها"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={50}
      >
        <Stack>
          <Text>خطایی در بارگذاری اطلاعات رخ داده است. لطفاً دوباره تلاش کنید.</Text>
          <Text size="sm" c="gray.6">خطا: {typeof errorCategoryData === 'string' ? errorCategoryData : errorCategoryData?.message}</Text>
          <Button
            onClick={handleRetry}
            variant="filled"
            color="blue"
            fullWidth
          >
            تلاش مجدد
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            fullWidth
          >
            بازگشت به صفحه اصلی
          </Button>
        </Stack>
      </Modal>
    );
  }

  if (loadingCategoryData || authLoading) {
    return (
      <DelayedFullScreenLoader showR={true} />
    );
  }

  // Check if categoryData is empty (undefined category) AFTER loading is complete
  if (!loadingCategoryData && !categoryData) {
    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="صفحه یافت نشد"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={50}
      >
        <Stack>
          <Text>صفحه مورد نظر یافت نشد</Text>
          <Button
            onClick={() => navigate("/")}
            variant="filled"
            color="blue"
            fullWidth
          >
            بازگشت به صفحه اصلی
          </Button>
        </Stack>
      </Modal>
    );
  }

  // If the subscription model is "basic", show the page to everyone
  if (categoryData?.subscriptionModel?.modelId === "basic") {
    return (
      <Box pos="relative">
        <LoadingOverlay visible={loadingCategoryData} zIndex={50} />
        {categoryData && (
          <Grid>
            <GridCol span={{md:3}}>
              <FiltersSection
                data={categoryData}
                form={form}
                slug={slug}
                setSearch={setSearch}
                handleDynamicChange={handleDynamicChange}
                setPage={setPage}
                filterDisclosure={filterDisclosure}
                isFetching={loadingCategoryData}
                onFiltersSubmit={handleFiltersSubmit}
              />
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
              <Center>
                <Pagination 
                  total={Math.ceil((categoryData?.totalCount || 0) / 20)} 
                  value={page} 
                  onChange={handlePageChange} 
                />
              </Center>
            </GridCol>
          </Grid>
        )}
      </Box>
    );
  }

  // For non-basic pages, check authentication first
  if (!user) {
    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="ورود به حساب کاربری"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={2000}
      >
        <Stack>
          <Text>برای مشاهده این صفحه ابتدا وارد وبسایت شوید.</Text>
          <Button
            onClick={() => navigate("/login")}
            variant="filled"
            color="blue"
            fullWidth
          >
            ورود به حساب کاربری
          </Button>
        </Stack>
      </Modal>
    );
  }

  // Check if user has empty subscriptions - they can only access basic pages
  const hasEmptySubscriptions = !user.subscriptions || Object.keys(user.subscriptions).length === 0;

  if (hasEmptySubscriptions) {
    // User with empty subscriptions trying to access non-basic page
    const subscriptionModelName = categoryData?.subscriptionModel?.modelName || "اشتراک مورد نظر";
    
    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="نیاز به خرید اشتراک"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={50}
      >
        <Stack>
          <Text>برای مشاهده این صفحه نیاز به خرید {subscriptionModelName} دارید.</Text>
          <Button
            onClick={() => navigate("/subscription")}
            variant="filled"
            color="blue"
            fullWidth
          >
            ورود به صفحه خرید
          </Button>
        </Stack>
      </Modal>
    );
  }

  // Check subscription requirements for users who have subscriptions
  if (categoryData?.subscriptionRequired && categoryData?.userHasPurchasedSubscription === false) {
    const subscriptionModelName = categoryData?.subscriptionModel?.modelName || "اشتراک مورد نظر";
    
    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="نیاز به خرید اشتراک"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={50}
      >
        <Stack>
          <Text>برای مشاهده این صفحه نیاز به خرید {subscriptionModelName} دارید.</Text>
          <Button
            onClick={() => navigate("/subscription")}
            variant="filled"
            color="blue"
            fullWidth
          >
            ورود به صفحه خرید
          </Button>
        </Stack>
      </Modal>
    );
  }

  // Show the main page content
  return (
    <Box pos="relative">
      <LoadingOverlay visible={loadingCategoryData} zIndex={50} />
      {categoryData && (
        <Grid>
          <GridCol span={{md:3}}>
            <FiltersSection
              data={categoryData}
              form={form}
              slug={slug}
              setSearch={setSearch}
              handleDynamicChange={handleDynamicChange}
              setPage={setPage}
              filterDisclosure={filterDisclosure}
              isFetching={loadingCategoryData}
              onFiltersSubmit={handleFiltersSubmit}
            />
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
            <Center>
              <Pagination 
                total={Math.ceil((categoryData?.totalCount || 0) / 20)} 
                value={page} 
                onChange={handlePageChange} 
              />
            </Center>
          </GridCol>
        </Grid>
      )}
    </Box>
  );
}

export default Category;