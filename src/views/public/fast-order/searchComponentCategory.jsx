import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import SlideCategory from "./SlideCategory";
import SavedFiltersModalCategoryMode from "./savedfilters/categorymode/SavedFiltersModalCategoryModeFastOrder";

import { 
  Center, 
  Group, 
  Loader, 
  LoadingOverlay, 
  Paper, 
  Space, 
  Stack, 
  Tabs,
  Modal,
  TextInput,
  Button,
  Flex,
  Text,
  ActionIcon,
  Menu,
  Divider,
  Box,
  Checkbox,
  Badge
} from "@mantine/core";
import qs from "qs";
import { useParams, useNavigate } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "../../../Libs/reactQuery";
import { fetchFastOrderCategoryModeTableData } from '../../../redux/fastorder/fastordertabledata/fastordertablecategorymode/fastOrderTableCategoryModeDataActions';
import { IconSettings, IconPlus, IconTrash, IconFilter, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { fetchCheckedRowsTableData } from "../../../redux/fastorder/fastordertabledata/fastordertabledatacategorymodesavedfilters/fastOrderTableDataCategoryModeSavedFiltersActions";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useCategoryRowSelection } from "./CategoryRowSelectionContext";
import { useMediaQuery } from "@mantine/hooks";
import { updateFilterSettings } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import isEqual from "lodash/isEqual";

// Stable empty objects for useSelector fallbacks (avoids "selector returned different result" warning)
const EMPTY_AUTH = {};
const EMPTY_GET_FILTER = {};
const EMPTY_SAVE_FILTER = {};
const EMPTY_UPDATE_FILTER = {};
const EMPTY_DELETE_FILTER = {};
const EMPTY_SAVED_FILTERS_TABLE = {};
const EMPTY_CATEGORY_MODE_DATA = {};
import { logout } from "../../../redux/auth/authusers/auth";
import { clearCart } from "../../../redux/cart";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import { clearUpdateFilterState } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsSlice";
import { clearDeleteFilterState } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";

const SearchComponentCategory = ({ 
  searchType, 
  setSearchType, 
  setAvailableLocations, 
  filters, 
  setFilters, 
  setNodes, 
  cookieUpdateTrigger ,
  onCookieUpdate,  // ✅ ADD THIS
  setNodesSubCategories,
  filterCategoryStorage,  // ✅ ADD THIS
  setFilterCategoryStorage,  // ✅ ADD THIS
  filterCategorySubCategoryStorage,  // ✅ ADD THIS
  setFilterCategorySubCategoryStorage,  // ✅ ADD THIS
  filterCategorySubCategoryBrandsStorage,  // ✅ ADD THIS
  setFilterCategorySubCategoryBrandsStorage,  // ✅ ADD THIS
  localFilters,  // ✅ ADD THIS
  setLocalFilters  // ✅ ADD THIS
}) => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth ?? EMPTY_AUTH);
  const { deleteLoadingId } = useSelector((state) => state.getFilterSettings ?? EMPTY_GET_FILTER);
  const { data: savedFiltersFromQuery } = useApiQuery({
    endpoint: "/save-filters/category-fast-order",
    queryKey: ["save-filters", "category-fast-order"],
    strategy: "USER_DATA",
    transformer: (r) => (Array.isArray(r?.data?.data) ? r.data.data : r?.data ?? []),
  });
  const savedFilters = savedFiltersFromQuery ?? [];
  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings ?? EMPTY_SAVE_FILTER);
  const { updateStatus, updateLoading, updateError } = useSelector((state) => state.updateFilterSettings ?? EMPTY_UPDATE_FILTER);
  const { deleteStatus, deleteLoading, deleteError } = useSelector((state) => state.deleteFilterSettings ?? EMPTY_DELETE_FILTER);

  // Redux selectors (saved-filters table data only; main table data + loading from React Query)
  const { tableDataFromSavedFilters, loadingTableDataFromSavedFilters } = useSelector(
    (state) => state.fastOrderTableDataCategoryModeSavedFilters ?? EMPTY_SAVED_FILTERS_TABLE
  );
  // When a saved filter is applied (checkedRows.size > 0), use Redux table data so sliders stay visible
  const { tableData: reduxTableData, loading: reduxTableLoading } = useSelector(
    (state) => state.fastOrderCategoryModeData ?? EMPTY_CATEGORY_MODE_DATA
  );

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Category-specific context
  const { 
    checkedRows, 
    selectedRow, 
    setSelectedRow, 
    toggleCheck, 
    isChecked, 
    isSelected, 
    isCheckedAndSelected,
    clearAll 
  } = useCategoryRowSelection();

  const isSlideSelectionActive = selectedRow || checkedRows.size > 0;

  // Modal states - Only keep the saved filters modal state
  const [menuOpened, setMenuOpened] = useState(false);
  
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Component state
  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });

  const COOKIE_NAME = "search_filters_category_fast_order";

  // Enhanced helper function to handle token expiration and update global auth state
  const handleTokenExpiration = async (error) => {
    // Check if the error is related to token expiration
    if (error.message.includes('توکن نامعتبر است') || 
        error.message.includes('Unauthorized') || 
        error.status === 401) {
      
      try {
        // Clear localStorage
        localStorage.removeItem("user");

        // Clear Redux auth state
        dispatch(logout());

        // Clear cart state
        dispatch(clearCart());

        // Show auth modal
        setShowAuthModal(true);

        return true;
      } catch (authError) {
        console.error("Error during token expiration handling:", authError);
        // Even if there's an error, ensure user is logged out
        setShowAuthModal(true);
        return true;
      }
    }
    return false;
  };

  // Enhanced helper function to handle different error types
  const handleApiError = async (error, context = '') => {
    const status = error?.status || error?.response?.status;
    const message = error?.message || 'خطای ناشناخته رخ داده است';
    
    console.error(`API Error in ${context}:`, error);
    
    if (status === 401) {
      // Handle authentication errors
      return await handleTokenExpiration(error);
    } else if (status >= 400 && status < 500) {
      // Handle client errors (400-499) with modal
      setErrorModalMessage(message);
      setShowErrorModal(true);
      return false;
    } else if (status >= 500) {
      // Handle server errors (500+) with red notification
      notifications.show({
        title: 'خطای سرور',
        message: message || 'خطای داخلی سرور رخ داده است. لطفا بعداً تلاش کنید.',
        color: 'red',
        autoClose: 5000,
        position: 'top-right',
        zIndex: 1100
      });
      return false;
    }
    
    // Handle other errors with general notification
    notifications.show({
      title: 'خطا',
      message: message,
      color: 'red', 
      autoClose: 4000,
      zIndex: 1100
    });
    return false;
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  // Prevent body shift when auth modal is open – run before paint so no flash
  useLayoutEffect(() => {
    if (!showAuthModal) return;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const prevPaddingLeft = body.style.paddingLeft;
    body.style.overflow = '';
    body.style.paddingRight = '';
    body.style.paddingLeft = '';
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      body.style.paddingLeft = prevPaddingLeft;
    };
  }, [showAuthModal]);

  // Enhanced menu click handler
  const handleMenuClick = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setMenuOpened(!menuOpened);
  };

  const getInitialFilters = useCallback(() => {
    const storedFilters = Cookies.get(COOKIE_NAME);
    if (storedFilters) {
      try {
        return JSON.parse(storedFilters);
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
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
  }, [COOKIE_NAME]);

  const initialFilters = useMemo(() => getInitialFilters(), [getInitialFilters]);

  // State initialization
  // const [filterCategoryStorage, setFilterCategoryStorage] = useState(initialFilters.uniqueIDClickedCategories);
  // const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState(initialFilters.uniqueIDClickedSubCategories);
  // const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState(initialFilters.uniqueIDClickedSubCategoriesBrands);
  // const [localFilters, setLocalFilters] = useState(initialFilters.filters);

const { setFilterValues } = useFastOrder();
  
  const url = "/fastorder";
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);
  const hasLoadedInitialFilters = useRef(false);
  const isManualFilterUpdate = useRef(false);
  const lastCheckedRowsSizeRef = useRef(checkedRows.size);
  const justClearedCookieRef = useRef(false);
  const skipUrlSyncAfterUncheckRef = useRef(false); // skip URL sync once after unchecking saved filter so 1st row stays clear
  const COOKIE_NAME_CATEGORY_MODE = "search_filters_category_fast_order";

// useEffect(() => {
//   console.log('🔄 [FastOrder] Category cookie reload effect triggered', { cookieUpdateTrigger });
  
//   const storedFilters = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
//   if (storedFilters) {
//     try {
//       const parsed = JSON.parse(storedFilters);
//       console.log('📦 [FastOrder] Loaded category filters from cookie:', parsed);
      
//       setFilterCategoryStorage(parsed.uniqueIDClickedCategories || []);
//       setFilterCategorySubCategoryStorage(parsed.uniqueIDClickedSubCategories || []);
//       setFilterCategorySubCategoryBrandsStorage(parsed.uniqueIDClickedSubCategoriesBrands || []);
//       setLocalFilters_category(parsed.filters || initialFilters_category_mode.filters);
//       setFilters_category_mode(parsed.filters || initialFilters_category_mode.filters);
      
//       console.log('✅ [FastOrder] Category state updated from cookie');
//     } catch (error) {
//       console.error('❌ [FastOrder] Error loading category cookies:', error);
//     }
//   }
// }, [cookieUpdateTrigger, COOKIE_NAME_CATEGORY_MODE]);

  // Form for validation
  const form = useForm({
    initialValues: {
      inputBox: "",
    },
    validate: {
      title: (value) => (value?.trim() ? null : "نام الزامی است"),
    },
  });

  // Helper functions to build filter arrays
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedCategories: filterCategoryStorage,
      uniqueIDClickedSubCategories: filterCategorySubCategoryStorage,
      uniqueIDClickedSubCategoriesBrands: filterCategorySubCategoryBrandsStorage,
      filters: filters || localFilters
    }];
  }, [searchType, filterCategoryStorage, filterCategorySubCategoryStorage, filterCategorySubCategoryBrandsStorage, filters, localFilters]);

  const filterArray = useMemo(() => buildCurrentFilterArray(), [buildCurrentFilterArray]);

  // Stable query key so same filter payload always hits cache (avoids refetch when switching brand → category)
  const stableCategoryQueryKey = useMemo(() => {
    if (!filterArray?.length) return null;
    const canonical = filterArray.map((item) => ({
      searchType: item.searchType,
      uniqueIDClickedCategories: [...(item.uniqueIDClickedCategories || [])].sort(),
      uniqueIDClickedSubCategories: [...(item.uniqueIDClickedSubCategories || [])].sort(),
      uniqueIDClickedSubCategoriesBrands: [...(item.uniqueIDClickedSubCategoriesBrands || [])].sort(),
      filters: item.filters && typeof item.filters === 'object' ? Object.keys(item.filters).sort().reduce((acc, k) => { acc[k] = item.filters[k]; return acc; }, {}) : item.filters
    }));
    return JSON.stringify(canonical);
  }, [filterArray]);

  const { data: tableDataFromQuery, isLoading: loadingFromQuery } = useApiQuery({
    endpoint: "/fast-order-category-mode",
    queryKey: stableCategoryQueryKey != null ? ["fast-order-category-mode", stableCategoryQueryKey] : ["fast-order-category-mode", "disabled"],
    method: "post",
    body: filterArray,
    strategy: "CACHED",
    enabled: checkedRows.size === 0 && filterArray?.length > 0 && stableCategoryQueryKey != null,
  });
  // When no filter applied: use React Query data. When filter applied: use Redux data so sliders stay visible (first disabled, second/third cleared)
  const tableDataWhenChecked = reduxTableData && typeof reduxTableData === 'object' && !Array.isArray(reduxTableData) ? reduxTableData : null;
  const tableData = checkedRows.size === 0 ? (tableDataFromQuery ?? null) : tableDataWhenChecked;
  const loading = checkedRows.size === 0 ? loadingFromQuery : (reduxTableLoading ?? false);

  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'category',
        uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
        uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
        uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
        filters: filter.filters || filters || localFilters
      }));
  }, [savedFilters, checkedRows, filters, localFilters]);

  const buildInitialFilterArray = useCallback(() => {
    const initialData = getInitialFilters();
    return [{
      searchType: 'category',
      uniqueIDClickedCategories: initialData.uniqueIDClickedCategories,
      uniqueIDClickedSubCategories: initialData.uniqueIDClickedSubCategories,
      uniqueIDClickedSubCategoriesBrands: initialData.uniqueIDClickedSubCategoriesBrands,
      filters: initialData.filters || filters || localFilters
    }];
  }, [getInitialFilters, filters, localFilters]);

  // Update filters and store in cookies
  const updateFiltersAndStore = useCallback(() => {
    let thisFilter = {};

    if (searchType === "category") {
      thisFilter.searchType = "category";
      thisFilter.parent = category.parent;
      thisFilter.subCategory = category.subCategory;
      thisFilter.uniqueIDClickedCategories = filterCategoryStorage;
      thisFilter.uniqueIDClickedSubCategories = filterCategorySubCategoryStorage;
      thisFilter.uniqueIDClickedSubCategoriesBrands = filterCategorySubCategoryBrandsStorage;
    }

    thisFilter.filters = localFilters;
    if (id) thisFilter.userId = id;

    return {
      thisFilter,
      query: qs.stringify(thisFilter, {
        addQueryPrefix: true,
        arrayFormat: "comma",
      }),
    };
  }, [
    category,
    searchType, 
    localFilters,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    id
  ]);

  // Modified useEffect for checked rows - now uses array format
  useEffect(() => {
    if (checkedRows.size > 0) {
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
      }
    }
  }, [checkedRows, dispatch, buildCheckedFiltersArray]);

  // When checkboxes are selected, fetch data via Redux; when none selected, table data from useApiQuery (fast-order-category-mode)
  useEffect(() => {
    if (checkedRows.size === 0) return;
    const currentParams = {
      searchType,
      filterCategoryStorage,
      filterCategorySubCategoryStorage,
      filterCategorySubCategoryBrandsStorage,
      checkedRowsSize: checkedRows.size,
      checkedRowIds: Array.from(checkedRows).sort().join(','),
      filters: JSON.stringify(filters || localFilters)
    };
    if (isEqual(lastFetchParams.current, currentParams)) return;
    lastFetchParams.current = currentParams;
    const checkedFiltersArray = buildCheckedFiltersArray();
    if (checkedFiltersArray.length > 0) {
      dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
    }
  }, [
    dispatch,
    searchType,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    checkedRows,
    checkedRows.size,
    filters,
    localFilters,
    buildCheckedFiltersArray
  ]);

  // Invalidate save-filters cache after successful save so list refreshes
  useEffect(() => {
    if (saveStatus?.state === "ok" && queryClient) {
      queryClient.invalidateQueries({ queryKey: ["save-filters", "category-fast-order"] });
    }
  }, [saveStatus?.state, queryClient]);

  // Save to cookies whenever relevant state changes (skip when saved filter active or we just cleared on uncheck)
  useEffect(() => {
    if (checkedRows.size > 0) return;
    if (justClearedCookieRef.current) {
      justClearedCookieRef.current = false;
      return;
    }
    const dataToSave = {
      searchType: searchType,
      uniqueIDClickedCategories: filterCategoryStorage,
      uniqueIDClickedSubCategories: filterCategorySubCategoryStorage,
      uniqueIDClickedSubCategoriesBrands: filterCategorySubCategoryBrandsStorage,
      filters: localFilters,
    };
    
    Cookies.set(COOKIE_NAME, JSON.stringify(dataToSave), { expires: 7 });
  }, [
    searchType, 
    filterCategoryStorage, 
    filterCategorySubCategoryStorage, 
    filterCategorySubCategoryBrandsStorage, 
    localFilters,
    COOKIE_NAME,
    checkedRows.size,
  ]);

  // Explicit empty state when no saved filter – same shape as SavedFiltersModalCategory (avoids stale initialFilters from previous render overwriting modal’s empty cookie)
  const EMPTY_CATEGORY_COOKIE = useMemo(() => ({
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
  }), []);

  // When user unchecks saved filter: clear sliders and cookie with explicit empty (like fast-edit modal); do not use initialFilters so we never write stale data back
  useEffect(() => {
    const prev = lastCheckedRowsSizeRef.current;
    lastCheckedRowsSizeRef.current = checkedRows.size;
    if (prev > 0 && checkedRows.size === 0) {
      setFilterCategoryStorage([]);
      setFilterCategorySubCategoryStorage([]);
      setFilterCategorySubCategoryBrandsStorage([]);
      setLocalFilters(EMPTY_CATEGORY_COOKIE.filters);
      if (setFilters) setFilters(EMPTY_CATEGORY_COOKIE.filters);
      if (setSearchType) setSearchType("category");
      Cookies.set(COOKIE_NAME, JSON.stringify(EMPTY_CATEGORY_COOKIE), { expires: 7 });
      justClearedCookieRef.current = true;
      skipUrlSyncAfterUncheckRef.current = true; // so URL sync does not repopulate 1st row from path
      setTimeout(() => {
        skipUrlSyncAfterUncheckRef.current = false;
      }, 150);
    }
  }, [checkedRows.size, EMPTY_CATEGORY_COOKIE, setFilters, setSearchType, COOKIE_NAME, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters]);

useEffect(() => {
  if (checkedRows.size > 0) return;
  // After uncheck we cleared state and cookie; do not overwrite with a cookie read (avoids stale data)
  if (justClearedCookieRef.current) {
    justClearedCookieRef.current = false;
    return;
  }

  isManualFilterUpdate.current = true;
  const storedFilters = Cookies.get(COOKIE_NAME);

  if (storedFilters) {
    try {
      const parsedFilters = JSON.parse(storedFilters);
      const cats = parsedFilters.uniqueIDClickedCategories || [];
      const subcats = parsedFilters.uniqueIDClickedSubCategories || [];
      const brands = parsedFilters.uniqueIDClickedSubCategoriesBrands || [];

      setFilterCategoryStorage(cats);
      setFilterCategorySubCategoryStorage(subcats);
      setFilterCategorySubCategoryBrandsStorage(brands);
      setLocalFilters(parsedFilters.filters || {});
      
      if (setFilters) {
        setFilters(parsedFilters.filters || {});
      }
      
      // Only ever set category mode from category cookie; never set brand (avoids accidental switch when error modal shows)
      if (setSearchType && parsedFilters.searchType === "category") {
        setSearchType("category");
      }

      // Table data will refetch via useApiQuery when filter state updates
      setTimeout(() => {
        isManualFilterUpdate.current = false;
        sessionStorage.removeItem('manualFilterUpdate');
      }, 500);
    } catch (error) {
      console.error('[SearchComponent Category] Error parsing stored filters:', error);
      isManualFilterUpdate.current = false;
      sessionStorage.removeItem('manualFilterUpdate');
    }
  }
}, [cookieUpdateTrigger, checkedRows.size]);


useEffect(() => {
  const pathSegments = location.pathname.split('/');
  const urlCategoryName = pathSegments[3];

  if (skipUrlSyncAfterUncheckRef.current) return;
  if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
    return;
  }

  if (urlCategoryName && searchType === 'category' && tableData?.category) {
    const normalized = (s) => (s && String(s).toLowerCase().trim()) || '';
    const matchingCategory = tableData.category.find(
      (cat) =>
        cat.name === urlCategoryName ||
        normalized(cat.name) === normalized(urlCategoryName) ||
        (cat.slug && (cat.slug === urlCategoryName || normalized(cat.slug) === normalized(urlCategoryName)))
    );

    if (matchingCategory && matchingCategory.idCategory) {
      const currentCategoryId = filterCategoryStorage[0];
      const urlCategoryId = matchingCategory.idCategory;
      const hasSecondOrThirdRow = (filterCategorySubCategoryStorage?.length > 0) || (filterCategorySubCategoryBrandsStorage?.length > 0);

      if (currentCategoryId !== urlCategoryId && !hasSecondOrThirdRow) {
        setFilterCategoryStorage([urlCategoryId]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);

        const cookieValue = {
          searchType: 'category',
          uniqueIDClickedCategories: [urlCategoryId],
          uniqueIDClickedSubCategories: [],
          uniqueIDClickedSubCategoriesBrands: [],
          filters: localFilters,
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
      }
    } else if (filterCategoryStorage?.length > 0) {
      const hasSecondOrThirdRow = (filterCategorySubCategoryStorage?.length > 0) || (filterCategorySubCategoryBrandsStorage?.length > 0);
      if (!hasSecondOrThirdRow) {
        // URL slug not in current list – clear only when we don't have 2nd/3rd row (avoid clearing cookie state on refresh)
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  }
}, [location.pathname, searchType, tableData?.category, COOKIE_NAME, filterCategoryStorage, filterCategorySubCategoryStorage, filterCategorySubCategoryBrandsStorage, localFilters, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, cookieUpdateTrigger]);
  // Sync localFilters with parent filters when parent changes
  useEffect(() => {
    if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters)) {
      setLocalFilters(filters);
    }
  }, [filters, localFilters]);

  // Handle table data updates (main query; skip when in saved-filters/checked-rows mode)
  useEffect(() => {
    if (checkedRows.size === 0 && tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.products || []);
      setFilterValues(tableData?.filters || {});
      setAvailableLocations(tableData?.supplierLocations || []);
    }
  }, [checkedRows.size, tableData, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Handle saved filters table data
  useEffect(() => {
    if (tableDataFromSavedFilters) {
      setNodes(tableDataFromSavedFilters?.products || []);
      setNodesSubCategories(tableDataFromSavedFilters?.products || []);
      setFilterValues(tableDataFromSavedFilters?.filters || {});
      setAvailableLocations(tableDataFromSavedFilters?.supplierLocations || []);
    }
  }, [tableDataFromSavedFilters, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Clear filters when checkboxes are active (saved filter applied): use explicit empty sliders (same as fast-edit) so cookie is never overwritten with stale data
  useEffect(() => {
    if (checkedRows.size > 0) {
      setFilterCategoryStorage([]);
      setFilterCategorySubCategoryStorage([]);
      setFilterCategorySubCategoryBrandsStorage([]);
      setLocalFilters(EMPTY_CATEGORY_COOKIE.filters);

      if (setFilters) {
        setFilters(EMPTY_CATEGORY_COOKIE.filters);
      }

      if (setSearchType) {
        setSearchType("category");
      }

      Cookies.set(COOKIE_NAME, JSON.stringify(EMPTY_CATEGORY_COOKIE), { expires: 7 });
    }
  }, [checkedRows.size, EMPTY_CATEGORY_COOKIE, setFilters, setSearchType, COOKIE_NAME, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters]);

  // Monitor save status for error handling
  useEffect(() => {
    if (saveError) {
      
      // Skip handling validation errors here - let the form handle them
      if (saveError?.state === "error" && saveError?.error && typeof saveError.error === 'object') {
        return;
      }
      
      // Handle all other errors (including 403) by showing them in ErrorMessageModal
      if (saveError?.status) {
        if (saveError.status === 401) {
          // Handle auth errors specially
          handleTokenExpiration(saveError);
        } else if (saveError.status >= 400) {
          // Show all other HTTP errors (including 403) in ErrorMessageModal
          const errorMessage = saveError?.message || 
                              saveError?.data?.message || 
                              saveError?.response?.data?.message ||
                              (typeof saveError === 'string' ? saveError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        // Handle errors without status
        const errorMessage = saveError?.message || 
                            saveError?.data?.message || 
                            saveError?.response?.data?.message ||
                            (typeof saveError === 'string' ? saveError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      // Clear state after handling
      dispatch(clearSaveFilterState());
    }
  }, [saveError, dispatch, handleTokenExpiration]);

  // Monitor update status for error handling
  useEffect(() => {
    if (updateError) {
      
      // Skip handling validation errors here - let the form handle them
      if (updateError?.state === "error" && updateError?.error && typeof updateError.error === 'object') {
        return;
      }
      
      // Handle all other errors (including 403) by showing them in ErrorMessageModal
      if (updateError?.status) {
        if (updateError.status === 401) {
          // Handle auth errors specially
          handleTokenExpiration(updateError);
        } else if (updateError.status >= 400) {
          // Show all other HTTP errors (including 403) in ErrorMessageModal
          const errorMessage = updateError?.message || 
                              updateError?.data?.message || 
                              updateError?.response?.data?.message ||
                              (typeof updateError === 'string' ? updateError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        // Handle errors without status
        const errorMessage = updateError?.message || 
                            updateError?.data?.message || 
                            updateError?.response?.data?.message ||
                            (typeof updateError === 'string' ? updateError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      // Clear state after handling
      dispatch(clearUpdateFilterState());
    }
  }, [updateError, dispatch, handleTokenExpiration]);

  // Monitor delete status for error handling
  useEffect(() => {
    if (deleteError) {
      
      // Handle all errors by showing them in ErrorMessageModal
      if (deleteError?.status) {
        if (deleteError.status === 401) {
          // Handle auth errors specially
          handleTokenExpiration(deleteError);
        } else if (deleteError.status >= 400) {
          // Show all other HTTP errors (including 403) in ErrorMessageModal
          const errorMessage = deleteError?.message || 
                              deleteError?.data?.message || 
                              deleteError?.response?.data?.message ||
                              (typeof deleteError === 'string' ? deleteError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        // Handle errors without status
        const errorMessage = deleteError?.message || 
                            deleteError?.data?.message || 
                            deleteError?.response?.data?.message ||
                            (typeof deleteError === 'string' ? deleteError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      // Clear state after handling
      dispatch(clearDeleteFilterState());
    }
  }, [deleteError, dispatch, handleTokenExpiration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSaveFilterState());
      dispatch(clearUpdateFilterState());
      dispatch(clearDeleteFilterState());
    };
  }, [dispatch]);

  // Sync state from URL when landing on /fastorder/category/:name – prefer URL over cookie so sliders set correctly
  useEffect(() => {
    if (skipUrlSyncAfterUncheckRef.current) return;
    const pathSegments = location.pathname.split('/');
    const urlCategoryName = pathSegments[3];
    if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
      if (!urlCategoryName) return;
    }

    if (urlCategoryName && searchType === 'category' && tableData?.category) {
      const normalized = (s) => (s && String(s).toLowerCase().trim()) || '';
      const matchingCategory = tableData.category.find(
        (cat) =>
          cat.name === urlCategoryName ||
          normalized(cat.name) === normalized(urlCategoryName) ||
          (cat.slug && (cat.slug === urlCategoryName || normalized(cat.slug) === normalized(urlCategoryName)))
      );

      const hasSecondOrThirdRow = (filterCategorySubCategoryStorage?.length > 0) || (filterCategorySubCategoryBrandsStorage?.length > 0);
      if (matchingCategory && matchingCategory.idCategory && !filterCategoryStorage.includes(matchingCategory.idCategory) && !hasSecondOrThirdRow) {
        setFilterCategoryStorage([matchingCategory.idCategory]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);

        const cookieValue = {
          searchType: 'category',
          uniqueIDClickedCategories: [matchingCategory.idCategory],
          uniqueIDClickedSubCategories: [],
          uniqueIDClickedSubCategoriesBrands: [],
          filters: localFilters,
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
      } else if (!matchingCategory && filterCategoryStorage?.length > 0 && !hasSecondOrThirdRow) {
        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
      }
    }
  }, [location.pathname, searchType, tableData?.category, COOKIE_NAME, filterCategoryStorage, filterCategorySubCategoryStorage, filterCategorySubCategoryBrandsStorage, localFilters, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage]);

// Reset URL when switching TO category mode – don't skip when URL still shows brand (so link updates)
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentMode = pathSegments[2];
    const urlCategorySlug = pathSegments[3];
    // When switching from brand to category, URL must update – only skip manual-update guard if already on category URL
    if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
      if (currentMode !== 'brand') return;
    }

    if (searchType === 'category') {
      if (currentMode === 'brand') {
        // Switching from brand: use only actual category from state/cookie – pathSegments[3] is the brand slug (e.g. "apple"), not category
        const matchingCategory = tableData?.category?.find(
          (cat) => cat.idCategory && filterCategoryStorage?.includes(cat.idCategory)
        );
        const slug = matchingCategory?.name ?? null;
        navigate(slug ? `/fastorder/category/${slug}` : '/fastorder/category', { replace: true });
      } else if (currentMode === 'category' && !urlCategorySlug && filterCategoryStorage?.length > 0 && tableData?.category?.length) {
        // Sync URL to selected category slug once tableData loads (e.g. /fastorder/category → /fastorder/category/mobile)
        const match = tableData.category.find((cat) => cat.idCategory && filterCategoryStorage.includes(cat.idCategory));
        if (match?.name) navigate(`/fastorder/category/${match.name}`, { replace: true });
      }
    }
  }, [searchType, navigate, location.pathname, tableData?.category, filterCategoryStorage]);
  return (
    <>
      {/* ورود به حساب کاربری / زمان حضور شما منقضی شده است – render in portal so always on top; no scroll lock to prevent shift */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        zIndex={2147483647}
        transitionProps={{ duration: 0 }}
        removeScrollProps={{ removeScrollBar: false }}
        portalProps={typeof document !== 'undefined' && document.getElementById('auth-modal-portal') ? { target: document.getElementById('auth-modal-portal') } : {}}
        styles={{
          root: { zIndex: 2147483647, position: 'fixed', inset: 0 },
          inner: { zIndex: 2147483647, padding: 0 },
          content: { zIndex: 2147483647 },
          header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        }}
        overlayProps={{ style: { zIndex: 2147483647 }, backgroundOpacity: 0.55, blur: 3 }}
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Text mb="md">
          زمان حضور شما منقضی شده است
          <br />
          لطفا وارد حساب کاربری شوید
        </Text>
        <Flex gap="sm" justify="flex-end">
          <Button 
            onClick={handleLoginRedirect}
          >
            ورود به حساب کاربری
          </Button>
        </Flex>
      </Modal>

      <ErrorMessageModal
        opened={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorModalMessage('');
          dispatch(clearSaveFilterState());
          dispatch(clearUpdateFilterState());
          dispatch(clearDeleteFilterState());
        }}
        message={errorModalMessage}
      />


      <Paper 
        mt={{ base: "xs", md: "xs" }} 
        id="fastorder-search"
        p={isMobile ? "sm" : "md"}
        style={{ 
          overflow: 'hidden'
        }}
      >
        {/* Loading Overlay */}
        <LoadingOverlay
          pos="fixed"
          visible={loading}
          zIndex={1000}
          h="100%"
        />

        {/* Action Buttons - Responsive */}
        {/* <Flex 
          direction={isMobile ? "column" : "row"}
          gap={isMobile ? "xs" : "sm"}
          align={isMobile ? "stretch" : "center"}
          m={10}
        >
          <ShareModal 
            filters={updateFiltersAndStore().thisFilter} 
            isMobile={isMobile}
          />
        </Flex> */}

        {/* Tabs - Responsive */}
        <Tabs 
          styles={{ 
            panel: { marginTop: isMobile ? "15px" : "20px" },
            list: {
              overflowX: 'auto',
              flexWrap: 'nowrap',
              justifyContent: 'space-between',
              display: 'flex',
              width: '100%',
              gap: isMobile ? '8px' : '12px',
              flexDirection: 'row',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: isMobile ? '8px' : '12px',
              backgroundColor: '#fafafa'
            },
            tab: {
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              whiteSpace: 'nowrap',
              flex: '1 1 0',
              textAlign: 'center',
              minWidth: 0,
              border: '1px solid transparent',
              transition: 'all 0.2s ease'
            }
          }} 
          variant="pills" 
          defaultValue="brand" 
          value={searchType} 
          onChange={setSearchType}
          orientation="horizontal"
        >
          <Tabs.List grow={false} style={{ width: '100%', display: 'flex', gap: isMobile ? '8px' : '12px' }}>
            <Tabs.Tab
              value="brand"
              style={{
                flex: '1 1 0',
                minWidth: 0,
                border: searchType === 'brand' ? '1px solid #093572' : '1px solid #093572',
                borderRadius: '6px',
                backgroundColor: searchType === 'brand' ? '#093572' : 'white',
                color: searchType === 'brand' ? 'white' : '#333',
              }}
            >
              {isMobile ? "برند" : "برند"}
            </Tabs.Tab>

            <Tabs.Tab
              value="category"
              style={{
                flex: '1 1 0',
                minWidth: 0,
                border: searchType === 'category' ? '1px solid #093572' : '1px solid #093572',
                borderRadius: '6px',
                backgroundColor: searchType === 'category' ? '#093572' : 'white',
                color: searchType === 'category' ? 'white' : '#333',
              }}
            >
              {isMobile ? "دسته‌بندی" : "دسته‌بندی"}
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="category">

{!loading && searchType === "category" && tableData && (
  <>
    {/* ✅ ADD THIS DEBUG BLOCK */}
    {/* {console.log('🔍 [SearchComponent] About to render SlideCategory:', {
      filterCategoryStorage,
      filterCategorySubCategoryStorage,
      filterCategorySubCategoryBrandsStorage,
      hasCategoryStorage: !!filterCategoryStorage,
      categoryStorageLength: filterCategoryStorage?.length,
      categoryStorageValue: filterCategoryStorage
    })} */}
    
    <SlideCategory
      tab={category}
      items={tableData?.category}
      searchType={searchType}
      click={setCategory}
      filterCategoryStorage={filterCategoryStorage}
      setFilterCategoryStorage={setFilterCategoryStorage}
      filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
      setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
      filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
      setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
      isMobile={isMobile}
      isTablet={isTablet}
    />
  </>
)}
          </Tabs.Panel>
        </Tabs>
        
        <Flex
          direction={isMobile ? "column" : "row"}
          justify={isMobile ? "flex-start" : "space-between"}
          align={isMobile ? "stretch" : "center"}
          gap={isMobile ? "" : "md"}
          mb={isTablet ? "sm" : ""}
        >
          <div>
            {/* Title removed as requested */}
          </div>
        </Flex>
      </Paper>
    </>
  );
};

export default SearchComponentCategory;