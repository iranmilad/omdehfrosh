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
  Modal,
} from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { useDebouncedState, useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import qs from "qs";
import Filters from "./Filters";
import ProductList from "./ProductList";
import SortingAndPagination from "./SortingAndPagination";
import ProductBox from "../productBox";
import { IconSortDescending } from "@tabler/icons-react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getCategoryData } from "../../redux/category/getcategorydata/getCategoryDataActions";
import DelayedFullScreenLoader from "../centerloading";
import { verifyToken } from "../../redux/auth/authusers/auth";
import { fetchUserInfo } from "../../redux/users/userinfo/userInfo";

const DEFAULT_FILTERS = {
  brands: ["samsung"],
  colors: ["black"],
  delivery_areas: ["fars"]
};

const sortFilter = [
  { label: "جدیدترین", value: "newest" },
  { label: "ارزان‌ترین", value: "lowest_price" },
  { label: "گران‌ترین", value: "highest_price" },
  { label: "پرفروش‌ترین", value: "best_selling" },
];

function Category({ enabled, onSelectProduct }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const {
    categoryData,
    loadingCategoryData,
    errorCategoryData
  } = useSelector((state) => state.categoryData);


  const [page, setPage] = useState(1);
  const [sortValue, setSortValue] = useState("newest");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 600);
  const filterDisclosure = useDisclosure(false);
  
  const form = useForm({
    initialValues: {
      price: {min: 0, max: 0},
      dynamic: DEFAULT_FILTERS
    }
  });

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  // Call fetchUserInfo when user exists
  useEffect(() => {
    if (user) {
      dispatch(fetchUserInfo());
    }
  }, [user, dispatch]);

  const changeFilters = useCallback((customSortValue) => {
    const filters = {
      price_min: form.values.price.min || 0,
      price_max: form.values.price.max || 9000000,
      ...form.values.dynamic,
      limit: 20,
      page,
      sort: customSortValue ?? sortValue,
      s: debouncedSearch,
    };

    // Remove undefined/null values and empty arrays to clean up the request
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
        delete filters[key];
      }
      if (Array.isArray(filters[key]) && filters[key].length === 0) {
        delete filters[key];
      }
    });
  
    return {
      filters,
      query: qs.stringify(filters, {
        addQueryPrefix: true,
        arrayFormat: "comma",
      })
    };
  }, [form.values, page, sortValue, debouncedSearch]);

  useEffect(() => {
    if (slug) { 
      const filtersData = changeFilters().filters;
      dispatch(getCategoryData({slug: slug, filters: filtersData}));
    }
  }, [dispatch, slug, changeFilters]);

  useEffect(() => {
    if(categoryData && !errorCategoryData){
      // Set price defaults
      form.setDirty('price', categoryData?.price);
      
      // Set default filter values if they haven't been set yet
      if (!form.values.dynamic.brands && categoryData?.brands?.length > 0) {
        form.setFieldValue('dynamic.brands', [categoryData.brands[0].name || categoryData.brands[0]]);
      }
      if (!form.values.dynamic.colors && categoryData?.colors?.length > 0) {
        form.setFieldValue('dynamic.colors', [categoryData.colors[0].name || categoryData.colors[0]]);
      }
      if (!form.values.dynamic.delivery_areas && categoryData?.delivery_areas?.length > 0) {
        form.setFieldValue('dynamic.delivery_areas', [categoryData.delivery_areas[0].name || categoryData.delivery_areas[0]]);
      }
    };
  },[categoryData, loadingCategoryData, errorCategoryData, form]);

  const changeSort = useCallback((val) => {
    setSortValue(val);
    setPage(1);
  
    const newFilters = changeFilters(val).filters;
    
    dispatch(getCategoryData({ slug, filters: newFilters }));
  }, [slug, changeFilters, dispatch]);
  
  const handleDynamicChange = useCallback((key, value) => {
    form.setFieldValue(`dynamic.${key}`, value);
    setPage(1);
    
    // Trigger new category data fetch with updated filters
    const newFilters = changeFilters().filters;
    newFilters.dynamic = { ...newFilters.dynamic, [key]: value };
    
    dispatch(getCategoryData({ slug, filters: newFilters }));
  }, [form, changeFilters, slug, dispatch]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    
    const newFilters = changeFilters().filters;
    newFilters.page = newPage;
    
    dispatch(getCategoryData({ slug, filters: newFilters }));
  }, [changeFilters, slug, dispatch]);

  // Handle API error case with retry functionality
  if (errorCategoryData && !loadingCategoryData) {
    const handleRetry = () => {
      const filtersData = changeFilters().filters;
      dispatch(getCategoryData({slug: slug, filters: filtersData}));
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
          <Text size="sm" c="gray.6">خطا: {errorCategoryData}</Text>
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
                  isFetching={loadingCategoryData}
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
        zIndex={50}
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
                isFetching={loadingCategoryData}
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