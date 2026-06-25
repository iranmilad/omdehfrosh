import { useState, useEffect, useCallback, useId, createContext, useContext, useMemo, useRef } from "react";
import React from "react";
import Cookies from "js-cookie";
import {
  Group,
  Paper,
  Button,
  Box,
  Flex,
  Modal,
  Stack,
  Checkbox,
  Text,
  Loader,
  LoadingOverlay,
} from "@mantine/core";
import { IconEdit, IconSettings, IconFilter, IconBookmark } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router";

// Import saved filters modals
import SavedFiltersModalBrandModeFastOrder from "./savedfilters/brandmode/SavedFiltersModalBrandModeFastOrder";
import SavedFiltersModalCategoryMode from "./savedfilters/categorymode/SavedFiltersModalCategoryModeFastOrder";

// Import other components
import XTitle from "../../../components/title";
import OrderRow, { Attributes } from "./orderRow";
import Filters from "./filtersBrandMode";
import SearchComponent from "./searchComponentBrand";
import ShareModal from "./shareModal";
import FastTable from "./fasttablebrand";
import FastTableCategory from "./fasttablecategory";
import FastTableBrand from "./fasttablebrand";
import { FilterProvider } from "./filterscontext";
import { useProduct } from "../product";
import FiltersBrandMode from "./filtersBrandMode";
import FiltersCategoryMode from "./filtersCategoryMode";
import SearchComponentCategory from "./searchComponentCategory";
import { FaRotate } from "react-icons/fa6";
import isEqual from "lodash/isEqual";

import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { useApiQuery } from "../../../Libs/reactQuery";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";

// Import Row Selection Contexts
import { RowSelectionProvider, useRowSelection } from "./RowSelectionContext";
import { BrandRowSelectionProvider } from "./BrandRowSelectionContext";
import { CategoryRowSelectionProvider } from "./CategoryRowSelectionContext";
import RotateModal from "../../../components/rotatemodal";
import SearchComponentBrandFastOrder from "./searchComponentBrand";

const FastOrderContext = createContext();

function FastOrder() {
  const dispatch = useDispatch();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    componentsLoading: true,   // Show search + filters on first open (no placeholder flash)
    tableLoading: true,       // Table area visible; rows show when nodes load via React Query
  });


  const [cookieUpdateTrigger, setCookieUpdateTrigger] = useState(0);

const handleCookieUpdate = useCallback(() => {
  setCookieUpdateTrigger(prev => prev + 1);
}, []);






  const { deleteLoadingId } = useSelector((state) => state.getFilterSettings);

  const [filterName, setFilterName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const VISIBLE_COLUMNS_STORAGE_KEY = "fastOrderVisibleColumns";
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes] = useState(null);
  const [nodesSubCategoriesData, setNodesSubCategoriesData] = useState(null);
  const [categoryTableLoading, setCategoryTableLoading] = useState(false);

  const [availableLocations, setAvailableLocations] = useState(null);

  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [openedM, setOpenedM] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => setIsOpen((prev) => !prev);

  const [filterValues, setFilterValues] = useState({ colors: [], sellers: [] });
  // Initialize from URL so /fastorder/category/mobile opens in category mode (no shift to brand)
  const [searchType, setSearchType] = useState(() => {
    if (typeof window === 'undefined') return 'brand';
    const segments = window.location.pathname.split('/');
    const mode = segments[2];
    return mode === 'category' || mode === 'brand' ? mode : 'brand';
  });
  const [filterModalOpened, setFilterModalOpened] = useState(false);

  const slug = searchType === "brand" ? "brand-fast-order" : "category-fast-order";
  const { data: savedFiltersFromQuery } = useApiQuery({
    endpoint: `/save-filters/${slug}`,
    queryKey: ["save-filters", slug],
    strategy: "USER_DATA",
    transformer: (r) => (Array.isArray(r?.data?.data) ? r.data.data : r?.data ?? []),
  });
  const savedFilters = savedFiltersFromQuery ?? [];

  // ✅ NEW: Saved filters modal states
  const [savedFiltersModalOpened, setSavedFiltersModalOpened] = useState(false);

  // Brand mode cookies and filters
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_order";

  const getInitialFilters_brand_mode = () => {
    const storedFilters_brand_mode = Cookies.get(COOKIE_NAME_BRAND_MODE);
    if (storedFilters_brand_mode) {
      try {
        return JSON.parse(storedFilters_brand_mode);
      } catch (error) {}
    }
    return {
      searchType: "brand",
      uniqueIDClickedBrands: [],
      uniqueIDClickedBrandsCategories: [],
      filterBrandsCategorySubCategoryStorage: [],
      filters: {
        color: "all",
        province: "all",
        stockStatus: "all",
        minStock: "",
        deliveryTime: "",
        paymentType: "",
        supplier: "",
        sort: "bestPrice",
        priceFormat: "hezar",
      },
    };
  };

  const initialFilters_brand_mode = getInitialFilters_brand_mode();
  const [filters_brand_mode, setFilters_brand_mode] = useState(initialFilters_brand_mode.filters);

  // ✅ NEW: Brand mode storage states
  const [filterBrandStorage, setFilterBrandStorage] = useState(
    initialFilters_brand_mode.uniqueIDClickedBrands || []
  );
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(
    initialFilters_brand_mode.uniqueIDClickedBrandsCategories || []
  );
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(
    initialFilters_brand_mode.filterBrandsCategorySubCategoryStorage || []
  );
  const [localFilters_brand, setLocalFilters_brand] = useState(initialFilters_brand_mode.filters);

  // Category mode cookies and filters
  const COOKIE_NAME_CATEGORY_MODE = "search_filters_category_fast_order";

  const getInitialFilters_category_mode = () => {
    const storedFilters_category_mode = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
    if (storedFilters_category_mode) {
      try {
        return JSON.parse(storedFilters_category_mode);
      } catch (error) {}
    }
    return {
      searchType: "category",
      uniqueIDClickedCategories: [],
      uniqueIDClickedSubCategories: [],
      uniqueIDClickedSubCategoriesBrands: [],
      filters: {
        color: "all",
        province: "all",
        stockStatus: "all",
        minStock: "",
        deliveryTime: "",
        paymentType: "",
        supplier: "",
        sort: "bestPrice",
        priceFormat: "hezar",
      },
    };
  };

  const initialFilters_category_mode = getInitialFilters_category_mode();
  const [filters_category_mode, setFilters_category_mode] = useState(
    initialFilters_category_mode.filters
  );

  // ✅ NEW: Category mode storage states
  const [filterCategoryStorage, setFilterCategoryStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedCategories || []
  );
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedSubCategories || []
  );
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedSubCategoriesBrands || []
  );
  const [localFilters_category, setLocalFilters_category] = useState(
    initialFilters_category_mode.filters
  );

  // When a category saved filter is checked, skip restoring from cookie so slider state stays cleared
  const [categorySavedFilterActive, setCategorySavedFilterActive] = useState(false);
  const prevCategorySavedFilterActiveRef = useRef(categorySavedFilterActive);

  const [opened, setOpened] = useState(false);

  let priceFormatLabel = 'تومان';
  if (filters_brand_mode.priceFormat === "tooman") priceFormatLabel = "تومان";
  else if (filters_brand_mode.priceFormat === "hezar") priceFormatLabel = "هزار تومان";
  else priceFormatLabel = "میلیون تومان";

  // Table columns
  const COLUMNS = [
    { key: "image", label: "تصویر", width: "160px" },
    { key: "shortName", label: "نام کالا", width: "160px" },
    { key: "attributes", label: "ویژگی ها", width: "60px" },
    { key: "price", label: "قیمت", width: "160px" },
    { key: "stock", label: "موجودی", width: "160px" },
    { key: "minOrder", label: "حداقل سفارش", width: "120px" },
    { key: "maxOrder", label: "حداکثر سفارش", width: "120px" },
    { key: "seller", label: "تامین کننده", width: "120px" },
    { key: "deliveryTime", label: "زمان تحویل", width: "120px" },
    { key: "action", label: "عملیات", width: "120px" }
  ];

  const [modalOpen, setModalOpen] = useState(false);

  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings);

  const updatedColumns = COLUMNS;

  // Restore persisted column visibility on mount (validated against current COLUMNS)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(VISIBLE_COLUMNS_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      const validKeys = COLUMNS.map((c) => c.key);
      const filtered = saved.filter((k) => validKeys.includes(k));
      if (filtered.length >= 0) setVisibleColumns(filtered);
    } catch (_) {}
  }, []);

  // Persist column visibility when it changes
  useEffect(() => {
    try {
      localStorage.setItem(VISIBLE_COLUMNS_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch (_) {}
  }, [visibleColumns]);

  const handleSave = () => setOpened(false);

  const handleVisibleColumnsChange = (event, columnKey) => {
    const isChecked = event.target.checked;
    setVisibleColumns((prev) =>
      isChecked
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Simplified loading effect - only 2 loading states
  useEffect(() => {
    // Components (search + filters) load first
    setLoadingStates(prev => ({ ...prev, componentsLoading: true }));

    // Table loads after components
    const timer = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, tableLoading: true }));
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Redirect /fastorder/bran (typo) to /fastorder/brand so URL stays correct when switching back to brand
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const mode = pathSegments[2];
    if (mode === 'bran') {
      const slug = pathSegments[3] ?? '';
      navigate(slug ? `/fastorder/brand/${slug}` : '/fastorder/brand', { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const urlSearchType = pathSegments[2];
    if (urlSearchType !== 'category' && urlSearchType !== 'brand') return;
    // Don't overwrite tab when URL lags: user switched to brand but URL still category (or vice versa).
    // Let the active tab's navigate() update the URL; then pathname will change and we'll sync.
    if (urlSearchType === 'category' && searchType === 'brand') return;
    if (urlSearchType === 'brand' && searchType === 'category') return;
    setSearchType(urlSearchType);
  }, [location.pathname, searchType]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const supplierId = params.get("supplierid");
    const supplierName = params.get("suppliername");

    if (supplierId && supplierName) {
      setFilters_brand_mode((prevFilters) => ({
        ...prevFilters,
        supplier: supplierId,
      }));
    }

    if (supplierId && supplierName) {
      setFilters_category_mode((prevFilters) => ({
        ...prevFilters,
        supplier: supplierId,
      }));
    }
  }, [location, searchType]);

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
  
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Saved filters loaded via useApiQuery (save-filters) with cache + invalidation on save/delete/update

  useEffect(() => {
    if (saveStatus && saveStatus?.state === "ok") {
      notifications.show({
        title: saveStatus.message,
        color: "green",
        autoClose: true
      });
    }
    if (saveStatus && saveStatus?.state === "error") {
      notifications.show({
        title: saveStatus.message,
        color: "red",
        autoClose: true
      });
    }
  }, [saveStatus]);

  // ✅ This should already exist around line 200-220
// FIND this useEffect (around line 200-220) and REPLACE it:
useEffect(() => {
  const storedFilters = Cookies.get(COOKIE_NAME_BRAND_MODE);
  if (storedFilters) {
    try {
      const parsed = JSON.parse(storedFilters);
      const brands = parsed.uniqueIDClickedBrands || [];
      const cats = parsed.uniqueIDClickedBrandsCategories || [];
      const subcats = parsed.filterBrandsCategorySubCategoryStorage || [];
      setFilterBrandStorage(brands);
      setFilterBrandsCategoryStorage(cats);
      setFilterBrandsCategorySubCategoryStorage(subcats);
      setLocalFilters_brand(
        parsed.filters || initialFilters_brand_mode.filters
      );
      setFilters_brand_mode(
        parsed.filters || initialFilters_brand_mode.filters
      );
    } catch (error) {}
  }
}, [cookieUpdateTrigger, COOKIE_NAME_BRAND_MODE]); // ✅ Add cookieUpdateTrigger dependency

// CATEGORY cookie effect: when saved filter is applied (onCookieUpdate), re-sync category slider state from cookie
// When saved filter is unchecked (categorySavedFilterActive goes true -> false), force-empty sliders so we never load stale cookie
useEffect(() => {
  const wasActive = prevCategorySavedFilterActiveRef.current;
  prevCategorySavedFilterActiveRef.current = categorySavedFilterActive;

  if (categorySavedFilterActive) return;

  // Just unchecked: force empty sliders and cookie; do not read cookie (avoids loading previous slider state)
  if (wasActive) {
    setFilterCategoryStorage([]);
    setFilterCategorySubCategoryStorage([]);
    setFilterCategorySubCategoryBrandsStorage([]);
    setLocalFilters_category(initialFilters_category_mode.filters);
    setFilters_category_mode(initialFilters_category_mode.filters);
    const emptyCookie = {
      searchType: "category",
      uniqueIDClickedCategories: [],
      uniqueIDClickedSubCategories: [],
      uniqueIDClickedSubCategoriesBrands: [],
      filters: initialFilters_category_mode.filters,
    };
    Cookies.set(COOKIE_NAME_CATEGORY_MODE, JSON.stringify(emptyCookie), {
      expires: 7,
    });
    return;
  }

  const stored = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    const categories = parsed.uniqueIDClickedCategories || [];
    const subCategories = parsed.uniqueIDClickedSubCategories || [];
    const subCategoriesBrands = parsed.uniqueIDClickedSubCategoriesBrands || [];
    setFilterCategoryStorage(categories);
    setFilterCategorySubCategoryStorage(subCategories);
    setFilterCategorySubCategoryBrandsStorage(subCategoriesBrands);
    setLocalFilters_category(
      parsed.filters || initialFilters_category_mode.filters
    );
    setFilters_category_mode(
      parsed.filters || initialFilters_category_mode.filters
    );
  } catch (e) {
    console.error("[FastOrder] Error loading category cookie:", e);
  }
}, [cookieUpdateTrigger, COOKIE_NAME_CATEGORY_MODE, categorySavedFilterActive]);

// When switching back to brand tab, restore brand slider state from cookie (so sliders persist like category mode)
useEffect(() => {
  if (searchType !== "brand") return;
  const stored = Cookies.get(COOKIE_NAME_BRAND_MODE);
  if (!stored) return;
  try {
    const parsed = JSON.parse(stored);
    const brands = parsed.uniqueIDClickedBrands || [];
    const cats = parsed.uniqueIDClickedBrandsCategories || [];
    const subcats = parsed.filterBrandsCategorySubCategoryStorage || [];
    setFilterBrandStorage(brands);
    setFilterBrandsCategoryStorage(cats);
    setFilterBrandsCategorySubCategoryStorage(subcats);
    setLocalFilters_brand(parsed.filters || initialFilters_brand_mode.filters);
    setFilters_brand_mode(parsed.filters || initialFilters_brand_mode.filters);
  } catch (e) {}
}, [searchType]);

// Brand mode table data in index so nodes is set on refresh (same query key as SearchComponentBrand = deduped)
const brandFilterArray = useMemo(
  () => [
    {
      searchType: "brand",
      uniqueIDClickedBrands: filterBrandStorage || [],
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage || [],
      filterBrandsCategorySubCategoryStorage:
        filterBrandsCategorySubCategoryStorage || [],
      filters: localFilters_brand || filters_brand_mode,
    },
  ],
  [
    filterBrandStorage,
    filterBrandsCategoryStorage,
    filterBrandsCategorySubCategoryStorage,
    localFilters_brand,
    filters_brand_mode,
  ]
);
const stableBrandQueryKey = useMemo(() => {
  if (!brandFilterArray?.length) return null;
  const canonical = brandFilterArray.map((item) => ({
    searchType: item.searchType,
    uniqueIDClickedBrands: [...(item.uniqueIDClickedBrands || [])].sort(),
    uniqueIDClickedBrandsCategories: [
      ...(item.uniqueIDClickedBrandsCategories || []),
    ].sort(),
    filterBrandsCategorySubCategoryStorage: [
      ...(item.filterBrandsCategorySubCategoryStorage || []),
    ].sort(),
    filters:
      item.filters && typeof item.filters === "object"
        ? Object.keys(item.filters)
            .sort()
            .reduce((acc, k) => {
              acc[k] = item.filters[k];
              return acc;
            }, {})
        : item.filters,
  }));
  return JSON.stringify(canonical);
}, [brandFilterArray]);
const { data: brandTableData, isLoading: isBrandTableLoading, isFetching: isBrandTableFetching } = useApiQuery({
  endpoint: "/fast-order-brand-mode",
  queryKey:
    stableBrandQueryKey != null
      ? ["fast-order-brand-mode", stableBrandQueryKey]
      : ["fast-order-brand-mode", "disabled"],
  method: "post",
  body: brandFilterArray,
  strategy: "CACHED",
  keepPrevious: true,
  enabled:
    searchType === "brand" &&
    brandFilterArray?.length > 0 &&
    stableBrandQueryKey != null,
});
const brandTableBusy = isBrandTableLoading || isBrandTableFetching;
useEffect(() => {
  if (searchType !== "brand") return;
  if (brandTableData?.products != null) {
    setNodes(
      Array.isArray(brandTableData.products) ? brandTableData.products : []
    );
  }
}, [searchType, brandTableData]);

useEffect(() => {
  if (
    saveError &&
    Number(saveError.status) !== 400 &&
    Number(saveError.status) !== 401 &&
    Number(saveError.status) !== 403 &&
    Number(saveError.status) !== 404 &&
    Number(saveError.status) !== 405 &&
    Number(saveError.status) !== 408 &&
    Number(saveError.status) !== 409 &&
    Number(saveError.status) !== 410 &&
    Number(saveError.status) !== 411 &&
    Number(saveError.status) !== 412 &&
    Number(saveError.status) !== 413 &&
    Number(saveError.status) !== 414 &&
    Number(saveError.status) !== 415 &&
    Number(saveError.status) !== 416 &&
    Number(saveError.status) !== 417 &&
    Number(saveError.status) !== 422 &&
    Number(saveError.status) !== 429
  ) {
    notifications.show({
      title: saveError.message,
      color: "red",
      autoClose: true,
    });
  }
}, [saveError]);

// Only run save-error modal/navigate in brand mode; category mode handles errors in SearchComponentCategory
useEffect(() => {
  if (searchType !== "brand" || !saveError) return;
  if (saveError.status === 401) {
    setModalOpen(true);
    setTimeout(() => {
      setModalOpen(false);
      dispatch(clearSaveFilterState());
      navigate("/");
    }, 4000);
  }

  if (saveError.status === 403) {
    setModalOpen(true);
    setTimeout(() => {
      dispatch(clearSaveFilterState());
      setModalOpen(false);
    }, 4000);
  }
}, [searchType, saveError, dispatch, navigate]);

useEffect(() => {
  if (searchType !== "brand" || !saveError?.status) return;
  handleKnownErrors(saveError.status, setModalOpen, navigate);
}, [searchType, saveError, saveStatus]);

const form = useForm({
  initialValues: {
    inputBox: "",
  },
  validate: {
    title: (value) => (value.trim() ? null : "نام الزامی است"),
  },
});

const [isFixed, setIsFixed] = useState(false);
const componentRef = useRef(null);
const containerRef = useRef(null);
const lastScrollY = useRef(0);
const originalTop = useRef(0);
const [containerWidth, setContainerWidth] = useState("100%");
const [containerLeft, setContainerLeft] = useState(0);
const isManualFilterUpdate = useRef(false); // ✅ ADD THIS LINE FOR CATEGORY MODE

useEffect(() => {
  if (componentRef.current) {
    originalTop.current = componentRef.current.offsetTop;
  }

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY < lastScrollY.current) {
      if (currentScrollY > originalTop.current) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    } else {
      setIsFixed(false);
    }

    lastScrollY.current = currentScrollY;
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// Update container width and left position
useEffect(() => {
  const updateContainerDimensions = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerWidth(`${rect.width}px`);
      setContainerLeft(rect.left);
    }
  };

  updateContainerDimensions();
  window.addEventListener("resize", updateContainerDimensions);
  window.addEventListener("scroll", updateContainerDimensions);
  return () => {
    window.removeEventListener("resize", updateContainerDimensions);
    window.removeEventListener("scroll", updateContainerDimensions);
  };
}, []);

const LoadingPlaceholder = ({ height = "200px" }) => (
  <Box
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height,
      backgroundColor: "#f8f9fa",
      border: "1px dashed #dee2e6",
      borderRadius: "8px",
    }}
  >
    <Loader size="lg" />
  </Box>
);

// ✅ Check screen size for modal responsiveness
const isMobile = window.innerWidth < 768;

return (
  <>
    <RotateModal isPortrait={isPortrait} />

    <Box
      ref={containerRef}
      style={{ width: "100%", maxWidth: "100%", overflow: "hidden" }}
    >
      <RowSelectionProvider>
        {/* ✅ Wrap brand mode in BrandRowSelectionProvider */}
        {searchType === "brand" ? (
          <BrandRowSelectionProvider>
            <FastOrderContext.Provider
              value={{
                visibleColumns,
                setVisibleColumns,
                filters_brand_mode,
                filterValues,
                setFilters_brand_mode,
                setFilterValues,
                searchType,
                opened,
                setOpened,
                handleVisibleColumnsChange,
                updatedColumns: COLUMNS,
              }}
            >
              <FilterProvider>
                {loadingStates.componentsLoading ? (
                  <>
                    <div>
                      <SearchComponentBrandFastOrder
                        filters={filters_brand_mode}
                        setFilters={setFilters_brand_mode}
                        setNodesSubCategories={setNodesSubCategoriesData}
                        setNodes={setNodes}
                        setAvailableLocations={setAvailableLocations}
                        searchType={searchType}
                        setSearchType={setSearchType}
                        cookieUpdateTrigger={cookieUpdateTrigger}
                        filterBrandStorage={filterBrandStorage}
                        setFilterBrandStorage={setFilterBrandStorage}
                        filterBrandsCategoryStorage={
                          filterBrandsCategoryStorage
                        }
                        setFilterBrandsCategoryStorage={
                          setFilterBrandsCategoryStorage
                        }
                        filterBrandsCategorySubCategoryStorage={
                          filterBrandsCategorySubCategoryStorage
                        }
                        setFilterBrandsCategorySubCategoryStorage={
                          setFilterBrandsCategorySubCategoryStorage
                        }
                        localFilters={localFilters_brand}
                        setLocalFilters={setLocalFilters_brand}
                        onCookieUpdate={handleCookieUpdate}
                      />
                    </div>

                    <Group gap={0}>
                      <div
                        ref={componentRef}
                        style={{
                          position: isFixed ? "fixed" : "static",
                          top: isFixed ? 0 : "auto",
                          left: isFixed ? containerLeft : "auto",
                          width: isFixed ? containerWidth : "100%",
                          zIndex: 999,
                          background: isFixed ? "white" : "transparent",
                          boxShadow: isFixed
                            ? "0 2px 8px rgba(0,0,0,0.1)"
                            : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FiltersBrandMode
                          setFilters={setFilters_brand_mode}
                          nodes={nodes}
                          setNodesSubCategories={setNodesSubCategoriesData}
                          setNodes={setNodes}
                          filters={filters_brand_mode}
                          searchType={searchType}
                          setSearchType={setSearchType}
                          COOKIE_NAME={COOKIE_NAME_BRAND_MODE}
                          getInitialFilters={getInitialFilters_brand_mode}
                          setFilterBrandStorage={setFilterBrandStorage}
                          setFilterBrandsCategoryStorage={
                            setFilterBrandsCategoryStorage
                          }
                          setFilterBrandsCategorySubCategoryStorage={
                            setFilterBrandsCategorySubCategoryStorage
                          }
                          setLocalFilters={setLocalFilters_brand}
                          localFilters={localFilters_brand}
                          onCookieUpdate={handleCookieUpdate}
                          savedFilters={savedFilters}
                        />
                      </div>
                    </Group>
                  </>
                ) : (
                  <LoadingPlaceholder height="200px" />
                )}

                {loadingStates.tableLoading ? (
                  <Box pos="relative">
                    <LoadingOverlay visible={brandTableBusy} zIndex={10} />
                    <FastTableBrand
                      type="head"
                      isPortrait={isPortrait}
                      isLandscape={isLandscape}
                      filters_brand_mode={filters_brand_mode}
                      filterValues={filterValues}
                      availableLocations={availableLocations}
                      COLUMNS={updatedColumns}
                      nodes={nodes?.[0]?.items?.slice(0, 1) || []}
                      setVisibleColumns={setVisibleColumns}
                      visibleColumns={visibleColumns}
                    />
                    {nodes != null && nodes?.length > 0
                      ? nodes.map((item, index) => (
                          <React.Fragment key={index}>
                            <Flex
                              h={40}
                              align="center"
                              justify="center"
                              bg="#e5e7eb"
                            >
                              <Text size="16px" fw={600} c="dark">
                                {item.label}
                              </Text>
                            </Flex>
                            <FastTableBrand
                              keyIndex={index}
                              isPortrait={isPortrait}
                              isLandscape={isLandscape}
                              filters_brand_mode={filters_brand_mode}
                              filterValues={filterValues}
                              setNodes={setNodes}
                              availableLocations={availableLocations}
                              type="data"
                              COLUMNS={updatedColumns}
                              nodes={item.items || []}
                              setVisibleColumns={setVisibleColumns}
                              visibleColumns={visibleColumns}
                            />
                          </React.Fragment>
                        ))
                      : null}
                  </Box>
                ) : (
                  <LoadingPlaceholder height="300px" />
                )}

                {/* ✅ Modal moved to context but kept here */}
                <Modal
                  opened={opened}
                  removeScrollProps={{ removeScrollBar: false }}
                  onClose={() => setOpened(false)}
                  title="نمایش دادن ستون‌ها"
                  zIndex={1100}
                  styles={{
                    header: {
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      backgroundColor: "var(--mantine-color-body)",
                      borderBottom: "1px solid var(--mantine-color-gray-3)",
                      paddingBottom: "var(--mantine-spacing-md)",
                      margin: 0,
                      marginTop: 0,
                      paddingTop: 0,
                    },
                    title: {
                      margin: 0,
                      marginTop: 0,
                      paddingTop: 0,
                    },
                    body: {
                      paddingTop: "var(--mantine-spacing-md)",
                      paddingBottom: "var(--mantine-spacing-lg)",
                      maxHeight: "calc(100vh - 140px)",
                      overflowY: "auto",
                      overflowX: "hidden",
                      marginBottom: 0,
                    },
                    content: {
                      overflow: "visible",
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: "90vh",
                    },
                    inner: {
                      padding: 0,
                    },
                  }}
                  lockScroll={false}
                  removeScrollBar={false}
                >
                  <Stack gap="sm" pb="xs">
                    {updatedColumns.map((column) => (
                      <Checkbox
                        key={column.key}
                        label={column.label}
                        checked={!visibleColumns.includes(column.key)}
                        onChange={(event) =>
                          handleVisibleColumnsChange(event, column.key)
                        }
                      />
                    ))}
                  </Stack>
                </Modal>
              </FilterProvider>
            </FastOrderContext.Provider>
          </BrandRowSelectionProvider>
        ) : (
          /* ✅ Wrap category mode in CategoryRowSelectionProvider */
          <CategoryRowSelectionProvider>
            <FastOrderContext.Provider
              value={{
                visibleColumns,
                setVisibleColumns,
                filters_brand_mode,
                filterValues,
                setFilters_brand_mode,
                setFilterValues,
                searchType,
                opened,
                setOpened,
                handleVisibleColumnsChange,
                updatedColumns: COLUMNS,
              }}
            >
              <FilterProvider>
                {loadingStates.componentsLoading ? (
                  <>
                    <div>
                      <SearchComponentCategory
                        filters={filters_category_mode}
                        setFilters={setFilters_category_mode}
                        setNodesSubCategories={setNodesSubCategoriesData}
                        setNodes={setNodes}
                        setAvailableLocations={setAvailableLocations}
                        searchType={searchType}
                        setSearchType={setSearchType}
                        cookieUpdateTrigger={cookieUpdateTrigger}
                        onCookieUpdate={handleCookieUpdate}
                        setCategoryTableLoading={setCategoryTableLoading}
                        filterCategoryStorage={filterCategoryStorage}
                        setFilterCategoryStorage={setFilterCategoryStorage}
                        filterCategorySubCategoryStorage={
                          filterCategorySubCategoryStorage
                        }
                        setFilterCategorySubCategoryStorage={
                          setFilterCategorySubCategoryStorage
                        }
                        filterCategorySubCategoryBrandsStorage={
                          filterCategorySubCategoryBrandsStorage
                        }
                        setFilterCategorySubCategoryBrandsStorage={
                          setFilterCategorySubCategoryBrandsStorage
                        }
                        localFilters={localFilters_category}
                        setLocalFilters={setLocalFilters_category}
                      />
                    </div>

                    <Group gap={0}>
                      <div
                        ref={componentRef}
                        style={{
                          position: isFixed ? "fixed" : "static",
                          top: isFixed ? 0 : "auto",
                          left: isFixed ? containerLeft : "auto",
                          width: isFixed ? containerWidth : "100%",
                          zIndex: 999,
                          background: isFixed ? "white" : "transparent",
                          boxShadow: isFixed
                            ? "0 2px 8px rgba(0,0,0,0.1)"
                            : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FiltersCategoryMode
                          setFilters={setFilters_category_mode}
                          nodes={nodes}
                          setNodesSubCategories={setNodesSubCategoriesData}
                          setNodes={setNodes}
                          filters={filters_category_mode}
                          searchType={searchType}
                          setSearchType={setSearchType}
                          COOKIE_NAME={COOKIE_NAME_CATEGORY_MODE}
                          getInitialFilters={getInitialFilters_category_mode}
                          setFilterCategoryStorage={setFilterCategoryStorage}
                          setFilterCategorySubCategoryStorage={
                            setFilterCategorySubCategoryStorage
                          }
                          setFilterCategorySubCategoryBrandsStorage={
                            setFilterCategorySubCategoryBrandsStorage
                          }
                          setLocalFilters={setLocalFilters_category}
                          localFilters={localFilters_category}
                          onCookieUpdate={handleCookieUpdate}
                          onCategorySavedFilterActiveChange={
                            setCategorySavedFilterActive
                          }
                        />
                      </div>
                    </Group>
                  </>
                ) : (
                  <LoadingPlaceholder height="200px" />
                )}

                {loadingStates.tableLoading ? (
                  <Paper
                    p={0}
                    className="overflow-hidden"
                    bg="white"
                    id="tables"
                    pos="relative"
                  >
                    <LoadingOverlay visible={categoryTableLoading} zIndex={10} />
                    <FastTableCategory
                      type="head"
                      isPortrait={isPortrait}
                      isLandscape={isLandscape}
                      filters_category_mode={filters_category_mode}
                      filterValues={filterValues}
                      availableLocations={availableLocations}
                      COLUMNS={updatedColumns}
                      nodes={
                        nodesSubCategoriesData?.[0]?.items?.slice(0, 1) || []
                      }
                      setVisibleColumns={setVisibleColumns}
                      visibleColumns={visibleColumns}
                    />
                    {nodesSubCategoriesData != null &&
                    nodesSubCategoriesData?.length > 0
                      ? nodesSubCategoriesData.map((item, index) => (
                          <React.Fragment key={index}>
                            <Flex
                              h={40}
                              align="center"
                              justify="center"
                              bg="#e5e7eb"
                            >
                              <Text size="16px" fw={600} c="dark">
                                {item.label}
                              </Text>
                            </Flex>
                            <FastTableCategory
                              isPortrait={isPortrait}
                              isLandscape={isLandscape}
                              filters_category_mode={filters_category_mode}
                              filterValues={filterValues}
                              keyIndex={index}
                              availableLocations={availableLocations}
                              setNodes={setNodesSubCategoriesData}
                              type="data"
                              COLUMNS={updatedColumns}
                              nodes={item.items || []}
                              setVisibleColumns={setVisibleColumns}
                              visibleColumns={visibleColumns}
                            />
                          </React.Fragment>
                        ))
                      : null}
                  </Paper>
                ) : (
                  <LoadingPlaceholder height="300px" />
                )}

                {/* ✅ Modal moved to context but kept here */}
                <Modal
                  opened={opened}
                          removeScrollProps={{ removeScrollBar: false }}

                  onClose={() => setOpened(false)}
                  title="نمایش دادن ستون‌ها"
                  zIndex={1100}
                  styles={{
                    header: {
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      backgroundColor: "var(--mantine-color-body)",
                      borderBottom: "1px solid var(--mantine-color-gray-3)",
                      paddingBottom: "var(--mantine-spacing-md)",
                      margin: 0,
                      marginTop: 0,
                      paddingTop: 0,
                    },
                    title: {
                      margin: 0,
                      marginTop: 0,
                      paddingTop: 0,
                    },
                    body: {
                      paddingTop: "var(--mantine-spacing-md)",
                      paddingBottom: "var(--mantine-spacing-lg)",
                      maxHeight: "calc(100vh - 140px)",
                      overflowY: "auto",
                      overflowX: "hidden",
                      marginBottom: 0,
                    },
                    content: {
                      overflow: "visible",
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: "90vh",
                    },
                    inner: {
                      padding: 0,
                    },
                  }}
                  lockScroll={false}
                  removeScrollBar={false}
                >
                  <Stack gap="sm" pb="xs">
                    {updatedColumns.map((column) => (
                      <Checkbox
                        key={column.key}
                        label={column.label}
                        checked={!visibleColumns.includes(column.key)}
                        onChange={(event) =>
                          handleVisibleColumnsChange(event, column.key)
                        }
                      />
                    ))}
                  </Stack>
                </Modal>
              </FilterProvider>
            </FastOrderContext.Provider>
          </CategoryRowSelectionProvider>
        )}
      </RowSelectionProvider>
    </Box>
  </>
);
}

export const useFastOrder = () => useContext(FastOrderContext);

export default FastOrder;