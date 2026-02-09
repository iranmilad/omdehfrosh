import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";  
import SlideCategory from "./SlideCategory";
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
  Badge,
} from "@mantine/core";
import qs from "qs";
import { useParams, useLocation } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { useDispatch, useSelector } from "react-redux";
import { IconPlus, IconTrash, IconFilter, IconEdit, IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useBrandRowSelection } from "./BrandRowSelectionContext";
import { fetchCheckedRowsTableData } from "../../../redux/fastorder/fastordertabledata/fastordertabledatabrandmodesavedfilters/fastOrderTableDataBrandModeSavedFiltersActions";
import { useMediaQuery } from "@mantine/hooks";
import { updateFilterSettings } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import isEqual from "lodash/isEqual";
import { logout } from "../../../redux/auth/authusers/auth";
import { clearCart } from "../../../redux/cart";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { useNavigate } from "react-router-dom";

// Stable empty objects for useSelector fallbacks (avoids "selector returned different result" warning)
const EMPTY_AUTH = {};
const EMPTY_SAVE_FILTER = {};
const EMPTY_UPDATE_FILTER = {};
const EMPTY_DELETE_FILTER = {};
const EMPTY_SAVED_FILTERS_TABLE = {};
const EMPTY_BRAND_MODE_DATA = {};
import { useApiQuery } from "../../../Libs/reactQuery";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import { clearUpdateFilterState } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsSlice";
import { clearDeleteFilterState } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import SavedFiltersModalBrandModeFastOrder from "./savedfilters/brandmode/SavedFiltersModalBrandModeFastOrder";

const DEFAULT_FILTER_VALUES = { colors: [], sellers: [] };

const SearchComponentBrandFastOrder = ({ 
  searchType, 
  setSearchType, 
  setAvailableLocations, 
  filters, 
  setFilters, 
  setNodes, 
  setNodesSubCategories,
  onCookieUpdate,
  cookieUpdateTrigger,
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  localFilters,
  setLocalFilters
}) => {
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth ?? EMPTY_AUTH);
  const { saveError } = useSelector((state) => state.saveFilterSettings ?? EMPTY_SAVE_FILTER);
  const { updateError } = useSelector((state) => state.updateFilterSettings ?? EMPTY_UPDATE_FILTER);
  const { deleteError } = useSelector((state) => state.deleteFilterSettings ?? EMPTY_DELETE_FILTER);
  // console.log('🔍 [SearchComponent] Received onCookieUpdate?', !!onCookieUpdate);
  // console.log('🔍 [SearchComponent] cookieUpdateTrigger:', cookieUpdateTrigger);
  
  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
    const isManualFilterUpdate = useRef(false);
  // Brand-specific context
  const { 
    checkedRows, 
  } = useBrandRowSelection();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');

  const [filterSettingsModalOpened, setFilterSettingsModalOpened] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Component state
  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  
  // Redux selectors (saved-filters table data only; main table data + loading from React Query)
  const { tableDataFromSavedFilters, loadingTableDataFromSavedFilters } = useSelector(
    (state) => state.fastOrderTableDataBrandModeSavedFilters ?? EMPTY_SAVED_FILTERS_TABLE
  );
  // When a saved filter is applied (checkedRows.size > 0), use Redux table data so sliders stay visible
  const { tableData: reduxTableData, loading: reduxTableLoading } = useSelector(
    (state) => state.fastOrderBrandModeData ?? EMPTY_BRAND_MODE_DATA
  );
  
  const COOKIE_NAME = "search_filters_brand_fast_order";

  // Enhanced helper function to handle token expiration and update global auth state
  const handleTokenExpiration = async (error) => {
    if (error.message.includes('توکن نامعتبر است') ||
        error.message.includes('Unauthorized') ||
        error.status === 401) {

      try {
        localStorage.removeItem("user");
        dispatch(logout());
        dispatch(clearCart());
        setShowAuthModal(true);
        return true;
      } catch (authError) {
        console.error("Error during token expiration handling:", authError);
        setShowAuthModal(true);
        return true;
      }
    }
    return false;
  };

  // ✅ ADD THIS FUNCTION
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
  }, [COOKIE_NAME]);

  // Enhanced helper function to handle different error types
  const handleApiError = async (error, context = '') => {
    const status = error?.status || error?.response?.status;
    const message = error?.message || 'خطای ناشناخته رخ داده است';
    
    console.error(`API Error in ${context}:`, error);
    
    if (status === 401) {
      return await handleTokenExpiration(error);
    } else if (status >= 400 && status < 500) {
      setErrorModalMessage(message);
      setShowErrorModal(true);
      return false;
    } else if (status >= 500) {
      notifications.show({
        title: 'خطای سرور',
        message: message || 'خطای داخلی سرور رخ داده است. لطفا بعداً تلاش کنید.',
        color: 'red',
        autoClose: 5000,
        position: 'top-right',
      });
      return false;
    }
    
    notifications.show({
      title: 'خطا',
      message: message,
      color: 'red', 
      autoClose: 4000,
    });
    return false;
  };

  // Server authentication verification function using Redux action
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

  const handleMenuClick = () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    setFilterSettingsModalOpened(true);
  };

  const initialFilters = useMemo(() => getInitialFilters(), [getInitialFilters]);

  const { setFilterValues } = useFastOrder();
  
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);
  const hasLoadedInitialFilters = useRef(false);

  // Helper function to build filter array from current state
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: filters || localFilters
    }];
  }, [searchType, filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage, filters, localFilters]);

  const filterArray = useMemo(() => buildCurrentFilterArray(), [buildCurrentFilterArray]);

  // Stable query key so same filter payload always hits cache (table data available on refresh like category mode)
  const stableBrandQueryKey = useMemo(() => {
    if (!filterArray?.length) return null;
    const canonical = filterArray.map((item) => ({
      searchType: item.searchType,
      uniqueIDClickedBrands: [...(item.uniqueIDClickedBrands || [])].sort(),
      uniqueIDClickedBrandsCategories: [...(item.uniqueIDClickedBrandsCategories || [])].sort(),
      filterBrandsCategorySubCategoryStorage: [...(item.filterBrandsCategorySubCategoryStorage || [])].sort(),
      filters: item.filters && typeof item.filters === 'object' ? Object.keys(item.filters).sort().reduce((acc, k) => { acc[k] = item.filters[k]; return acc; }, {}) : item.filters
    }));
    return JSON.stringify(canonical);
  }, [filterArray]);

  const { data: tableDataFromQuery, isLoading: loadingFromQuery } = useApiQuery({
    endpoint: "/fast-order-brand-mode",
    queryKey: stableBrandQueryKey != null ? ["fast-order-brand-mode", stableBrandQueryKey] : ["fast-order-brand-mode", "disabled"],
    method: "post",
    body: filterArray,
    strategy: "CACHED",
    enabled: checkedRows.size === 0 && filterArray?.length > 0 && stableBrandQueryKey != null,
  });
  // When no filter applied: use React Query data. When filter applied: use Redux data so sliders stay visible (first disabled, second/third cleared)
  const tableDataWhenChecked = reduxTableData && typeof reduxTableData === 'object' && !Array.isArray(reduxTableData) ? reduxTableData : null;
  const tableData = checkedRows.size === 0 ? (tableDataFromQuery ?? null) : tableDataWhenChecked;
  const tableLoading = checkedRows.size === 0 ? loadingFromQuery : (reduxTableLoading ?? false);

  // Update filters and store in cookies
  const updateFiltersAndStore = useCallback(() => {
    let thisFilter = {
      searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: localFilters
    };

    if (id) thisFilter.userId = id;

    return {
      thisFilter,
      query: qs.stringify(thisFilter, {
        addQueryPrefix: true,
        arrayFormat: "comma",
      }),
    };
  }, [
    searchType, 
    localFilters,
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage,
    id
  ]);

  // Modified useEffect for checked rows - now uses array format
  useEffect(() => {
    if (checkedRows.size > 0) {
      // Placeholder - will be handled by the SavedFiltersModalBrandMode component
    }
  }, [checkedRows]);

  // Table data is fetched via useApiQuery (fast-order-brand-mode) with cache; no dispatch here

  // Save to cookies whenever relevant state changes
  useEffect(() => {
    const dataToSave = {
      searchType: searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: localFilters,
    };
    Cookies.set(COOKIE_NAME, JSON.stringify(dataToSave), { expires: 7 });
  }, [
    searchType, 
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage, 
    localFilters,
    COOKIE_NAME
  ]);

// ✅ Cookie reload effect triggered by onCookieUpdate
useEffect(() => {
  const storedFilters = Cookies.get(COOKIE_NAME);
  console.log('[FO SearchBrand] Cookie reload effect: running', { cookieUpdateTrigger, hasCookie: !!storedFilters });

  if (storedFilters) {
    try {
      const parsedFilters = JSON.parse(storedFilters);
      const brands = parsedFilters.uniqueIDClickedBrands || [];
      const cats = parsedFilters.uniqueIDClickedBrandsCategories || [];
      const subcats = parsedFilters.filterBrandsCategorySubCategoryStorage || [];
      console.log('[FO SearchBrand] Cookie reload effect: setting state FROM cookie', { brandsLen: brands.length, catsLen: cats.length, subcatsLen: subcats.length });

      // Mark as manual update to prevent URL effect from interfering
      isManualFilterUpdate.current = true;

      setFilterBrandStorage(brands);
      setFilterBrandsCategoryStorage(cats);
      setFilterBrandsCategorySubCategoryStorage(subcats);
      setLocalFilters(parsedFilters.filters || {});
      
      if (setFilters) {
        setFilters(parsedFilters.filters || {});
      }

      // In brand component: only set searchType to 'brand' from URL; never set to 'category' (URL may still be /fastorder/category before navigate runs)
      if (setSearchType && parsedFilters.searchType) {
        const pathSegments = location.pathname.split('/');
        const urlMode = pathSegments[2];
        if (urlMode === 'brand') {
          setSearchType('brand');
        } else if (urlMode !== 'category') {
          setSearchType(parsedFilters.searchType);
        }
        // When urlMode === 'category' do nothing – we're in brand branch so user chose brand; URL will update in next effect
      }

      // Reset manual update flag; table data will refetch via useApiQuery when filter state updates
      setTimeout(() => {
        isManualFilterUpdate.current = false;
      }, 500);
    } catch (error) {}
  }
}, [cookieUpdateTrigger, COOKIE_NAME, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, setFilters, setSearchType, location.pathname]);
  // Sync localFilters with parent filters
  useEffect(() => {
    if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters)) {
      setLocalFilters(filters);
    }
  }, [filters, localFilters, setLocalFilters]);

  // Handle table data updates (main query; skip when in saved-filters/checked-rows mode)
  // Merge with default so FiltersBrandMode always has colors/sellers arrays and displays on first open
  useEffect(() => {
    if (checkedRows.size === 0 && tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.subCategoriesData || []);
      setFilterValues({ ...DEFAULT_FILTER_VALUES, ...(tableData?.filters || {}) });
      setAvailableLocations(tableData?.supplierLocations || []);
    }
  }, [checkedRows.size, tableData, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Handle saved filters table data (keep default colors/sellers so filters UI stays visible)
  useEffect(() => {
    if (tableDataFromSavedFilters) {
      setNodes(tableDataFromSavedFilters?.products || []);
      setNodesSubCategories(tableDataFromSavedFilters?.subCategoriesData || []);
      setFilterValues({ ...DEFAULT_FILTER_VALUES, ...(tableDataFromSavedFilters?.filters || {}) });
      setAvailableLocations(tableDataFromSavedFilters?.supplierLocations || []);
    }
  }, [tableDataFromSavedFilters, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Clear filters when checkboxes are active
  useEffect(() => {
    if (checkedRows.size > 0) {
      console.log('[FO SearchBrand] Clear-when-checked effect: running', { checkedRowsSize: checkedRows.size, initialFiltersSliders: { brands: (initialFilters?.uniqueIDClickedBrands || []).length, cats: (initialFilters?.uniqueIDClickedBrandsCategories || []).length, subcats: (initialFilters?.filterBrandsCategorySubCategoryStorage || []).length } });
      setFilterBrandStorage([]);
      setFilterBrandsCategoryStorage([]);
      setFilterBrandsCategorySubCategoryStorage([]);
      setLocalFilters({ ...(initialFilters?.filters || {}) });

      if (setFilters) {
        setFilters(initialFilters?.filters || {});
      }

      if (setSearchType) {
        setSearchType("brand");
      }

      const clearedCookie = { ...(initialFilters || {}), searchType: "brand", uniqueIDClickedBrands: [], uniqueIDClickedBrandsCategories: [], filterBrandsCategorySubCategoryStorage: [], filters: initialFilters?.filters || {} };
      console.log('[FO SearchBrand] Clear-when-checked effect: setting cookie to EMPTY sliders', { clearedCookieSliders: { brands: clearedCookie.uniqueIDClickedBrands?.length, cats: clearedCookie.uniqueIDClickedBrandsCategories?.length, subcats: clearedCookie.filterBrandsCategorySubCategoryStorage?.length } });
      Cookies.set(COOKIE_NAME, JSON.stringify(clearedCookie), { expires: 7 });
    }
  }, [checkedRows.size, initialFilters, setFilters, setSearchType, COOKIE_NAME, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters]);

  // Monitor save status for error handling
  useEffect(() => {
    if (saveError) {
      if (saveError?.state === "error" && saveError?.error && typeof saveError.error === 'object') {
        return;
      }
      
      if (saveError?.status) {
        if (saveError.status === 401) {
          handleTokenExpiration(saveError);
        } else if (saveError.status >= 400) {
          const errorMessage = saveError?.message || 
                              saveError?.data?.message || 
                              saveError?.response?.data?.message ||
                              (typeof saveError === 'string' ? saveError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        const errorMessage = saveError?.message || 
                            saveError?.data?.message || 
                            saveError?.response?.data?.message ||
                            (typeof saveError === 'string' ? saveError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      dispatch(clearSaveFilterState());
    }
  }, [saveError, dispatch]);

  // Monitor update status for error handling
  useEffect(() => {
    if (updateError) {
      if (updateError?.state === "error" && updateError?.error && typeof updateError.error === 'object') {
        return;
      }
      
      if (updateError?.status) {
        if (updateError.status === 401) {
          handleTokenExpiration(updateError);
        } else if (updateError.status >= 400) {
          const errorMessage = updateError?.message || 
                              updateError?.data?.message || 
                              updateError?.response?.data?.message ||
                              (typeof updateError === 'string' ? updateError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        const errorMessage = updateError?.message || 
                            updateError?.data?.message || 
                            updateError?.response?.data?.message ||
                            (typeof updateError === 'string' ? updateError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      dispatch(clearUpdateFilterState());
    }
  }, [updateError, dispatch]);

  // Monitor delete status for error handling
  useEffect(() => {
    if (deleteError) {
      if (deleteError?.status) {
        if (deleteError.status === 401) {
          handleTokenExpiration(deleteError);
        } else if (deleteError.status >= 400) {
          const errorMessage = deleteError?.message || 
                              deleteError?.data?.message || 
                              deleteError?.response?.data?.message ||
                              (typeof deleteError === 'string' ? deleteError : null) ||
                              'خطای ناشناخته رخ داده است';
          setErrorModalMessage(errorMessage);
          setShowErrorModal(true);
        }
      } else {
        const errorMessage = deleteError?.message || 
                            deleteError?.data?.message || 
                            deleteError?.response?.data?.message ||
                            (typeof deleteError === 'string' ? deleteError : null) ||
                            'خطای ناشناخته رخ داده است';
        setErrorModalMessage(errorMessage);
        setShowErrorModal(true);
      }
      
      dispatch(clearDeleteFilterState());
    }
  }, [deleteError, dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearSaveFilterState());
      dispatch(clearUpdateFilterState());
      dispatch(clearDeleteFilterState());
    };
  }, [dispatch]);


// Sync filters from URL when landing on /fastorder/brand/:name – prefer URL over cookie so sliders set correctly
// Only run when path is actually /fastorder/brand/... – when path is /fastorder/category/others, pathSegments[3] is category slug "others", not a brand; must not clear brand state
useEffect(() => {
  const pathSegments = location.pathname.split('/');
  const currentMode = pathSegments[2];
  
  console.log('🔗 [FO SearchBrand] URL sync effect: RUNNING', {
    pathname: location.pathname,
    currentMode,
    searchType,
    filterBrandStorage,
    hasBrands: !!tableData?.brands?.length,
    brandsCount: tableData?.brands?.length,
    cookieUpdateTrigger,
    timestamp: Date.now()
  });
  
  if (currentMode !== 'brand') {
    console.log('🔗 [FO SearchBrand] URL sync effect: SKIPPED - not brand mode');
    return;
  }

  const urlBrandName = pathSegments[3];
  // Skip URL sync when manual filter update is in progress (e.g. saved filter applied/unapplied)
  if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
    console.log('🔗 [FO SearchBrand] URL sync effect: SKIPPED - manual filter update in progress');
    return;
  }

  if (urlBrandName && searchType === 'brand' && tableData?.brands && tableData.brands.length > 0) {
    const normalized = (s) => (s && String(s).toLowerCase().trim()) || '';
    const matchingBrand = tableData.brands.find(
      (brand) =>
        brand.name === urlBrandName ||
        normalized(brand.name) === normalized(urlBrandName) ||
        (brand.slug && (brand.slug === urlBrandName || normalized(brand.slug) === normalized(urlBrandName)))
    );

    if (matchingBrand && matchingBrand.idBrand) {
      const currentBrandId = filterBrandStorage[0];
      const urlBrandId = matchingBrand.idBrand;

      console.log('🔗 [FO SearchBrand] URL sync effect: comparing IDs', {
        currentBrandId,
        urlBrandId,
        willUpdate: currentBrandId !== urlBrandId
      });

      const hasSecondOrThirdRow = (filterBrandsCategoryStorage?.length > 0) || (filterBrandsCategorySubCategoryStorage?.length > 0);
      if (currentBrandId !== urlBrandId && !hasSecondOrThirdRow) {
        console.log('🔗 [FO SearchBrand] URL sync effect: UPDATING state from URL', { urlBrandId });
        setFilterBrandStorage([urlBrandId]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);

        const cookieValue = {
          searchType: 'brand',
          uniqueIDClickedBrands: [urlBrandId],
          uniqueIDClickedBrandsCategories: [],
          filterBrandsCategorySubCategoryStorage: [],
          filters: localFilters,
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
      }
    } else if (filterBrandStorage?.length > 0 && tableData.brands.length > 0) {
      // Do NOT clear when we have any selection: on refresh, tableData.brands is often the
      // categories/subcategories for the selected brand, so URL slug (brand name) won't be in the list.
      // Clearing here would wipe cookie-restored state. Only allow clear when we have no 2nd/3rd row
      // AND we're sure we're at root (we can't be sure on refresh), so never clear when filterBrandStorage has content.
      const hasAnySelection = filterBrandStorage?.length > 0 || (filterBrandsCategoryStorage?.length > 0) || (filterBrandsCategorySubCategoryStorage?.length > 0);
      if (!hasAnySelection) {
        console.log('🔗 [FO SearchBrand] URL sync effect: URL brand not found, CLEARING state');
        setFilterBrandStorage([]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
      }
    }
  }
}, [location.pathname, searchType, tableData?.brands, COOKIE_NAME, filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage, localFilters, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, cookieUpdateTrigger]);

// Reset URL when switching TO brand mode – preserve previous brand selection; never use category slug for brand URL
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const currentMode = pathSegments[2];
    const urlBrandSlug = pathSegments[3];

    if (searchType === 'brand') {
      if (currentMode === 'category') {
        // Switching from category: use only actual brand from state/cookie – pathSegments[3] is the category slug (e.g. "digital"), not brand
        const matchingBrand = tableData?.brands?.find(
          (brand) => brand.idBrand && filterBrandStorage?.includes(brand.idBrand)
        );
        const slug = matchingBrand?.name ?? null;
        navigate(slug ? `/fastorder/brand/${slug}` : '/fastorder/brand', { replace: true });
      } else if (currentMode === 'brand' && !urlBrandSlug && filterBrandStorage?.length > 0 && tableData?.brands?.length) {
        const match = tableData.brands.find((brand) => brand.idBrand && filterBrandStorage.includes(brand.idBrand));
        if (match?.name) navigate(`/fastorder/brand/${match.name}`, { replace: true });
      }
    }
  }, [searchType, navigate, location.pathname, tableData?.brands, filterBrandStorage]);

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
        }}
        overlayProps={{ style: { zIndex: 2147483647 }, backgroundOpacity: 0, blur: 0 }}
        closeOnClickOutside={false}
        closeOnEscape={false}
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

      {/* <SavedFiltersModalBrandModeFastOrder
        opened={filterSettingsModalOpened}
        onClose={() => setFilterSettingsModalOpened(false)}
        isMobile={isMobile}
        COOKIE_NAME={COOKIE_NAME}
        getInitialFilters={getInitialFilters}
        setFilterBrandStorage={setFilterBrandStorage}
        setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
        setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
        setLocalFilters={setLocalFilters}
        setFilters={setFilters}
        setSearchType={setSearchType}
        filters={filters}
        localFilters={localFilters}
        onCookieUpdate={onCookieUpdate}
        tableData={tableData}
      /> */}

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
          visible={tableLoading}
          zIndex={1000}
          h="100%"
        />

        {/* Tabs */}
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
          
          <Tabs.Panel value="brand">
            {!tableLoading && searchType === "brand" && tableData && (
              <SlideCategory 
                tab={brands} 
                items={tableData?.brands} 
                searchType={searchType}
                click={setBrands} 
                filterBrandStorage={filterBrandStorage}
                setFilterBrandStorage={setFilterBrandStorage}
                filterBrandsCategoryStorage={filterBrandsCategoryStorage}
                setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
                setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                isMobile={isMobile}
                isTablet={isTablet}
                key={`brand-${cookieUpdateTrigger}-${JSON.stringify(filterBrandStorage)}-${JSON.stringify(filterBrandsCategoryStorage)}-${JSON.stringify(filterBrandsCategorySubCategoryStorage)}`}
              />
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </>
  );
};

export default SearchComponentBrandFastOrder;