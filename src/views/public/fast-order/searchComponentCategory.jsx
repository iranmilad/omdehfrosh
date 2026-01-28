import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { fetchFastOrderCategoryModeTableData } from '../../../redux/fastorder/fastordertabledata/fastordertablecategorymode/fastOrderTableCategoryModeDataActions'
import { useDispatch, useSelector } from "react-redux";
import { IconSettings, IconPlus, IconTrash, IconFilter, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { fetchCheckedRowsTableData } from "../../../redux/fastorder/fastordertabledata/fastordertabledatacategorymodesavedfilters/fastOrderTableDataCategoryModeSavedFiltersActions";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useCategoryRowSelection } from "./CategoryRowSelectionContext";
import { useMediaQuery } from "@mantine/hooks";
import { updateFilterSettings } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import isEqual from "lodash/isEqual";
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
  // console.log('🔍 [SearchComponent Category] Received props:', {
  //   hasOnCookieUpdate: !!onCookieUpdate,
  //   onCookieUpdateType: typeof onCookieUpdate,
  //   cookieUpdateTrigger
  // });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings || {});
  const { updateStatus, updateLoading, updateError } = useSelector((state) => state.updateFilterSettings || {});
  const { deleteStatus, deleteLoading, deleteError } = useSelector((state) => state.deleteFilterSettings || {});

  // Redux selectors
  const { tableData, loading } = useSelector((state) => state.fastOrderCategoryModeData || {});

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Add selector for saved filters table data
  const { tableDataFromSavedFilters, loadingTableDataFromSavedFilters } = useSelector(
    (state) => state.fastOrderTableDataCategoryModeSavedFilters || {}
  );

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
  const isManualFilterUpdate = useRef(false); // ✅ ADD THIS LINE
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

  // OPTIMIZED: Combined data fetching effect to use array format
  useEffect(() => {
    const currentParams = {
      searchType,
      filterCategoryStorage,
      filterCategorySubCategoryStorage,
      filterCategorySubCategoryBrandsStorage,
      checkedRowsSize: checkedRows.size,
      checkedRowIds: Array.from(checkedRows).sort().join(','),
      hasCheckedRows: checkedRows.size > 0,
      filters: JSON.stringify(filters || localFilters)
    };

    // Skip if parameters haven't changed
    if (isEqual(lastFetchParams.current, currentParams)) {
      return;
    }

    lastFetchParams.current = currentParams;

    // Always make an API request when there are changes
    if (checkedRows.size > 0) {
      // When checkboxes are selected, fetch data based on checked rows with filters
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
      }
    } else {
      // When no checkboxes are selected, fetch normal filtered data as array with filters
      const currentFiltersArray = buildCurrentFilterArray();
      dispatch(fetchFastOrderCategoryModeTableData(currentFiltersArray));
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
    buildCheckedFiltersArray,
    buildCurrentFilterArray
  ]);

  // OPTIMIZED: Load saved filters only once when user is available
  useEffect(() => {
    if (saveStatus?.state === "ok") {
      // Refresh the filter list after successful save
      const slug = "category-fast-order";
      setTimeout(() => {
        dispatch(getFilterSettings(slug));
      }, 500);
    }
  }, [saveStatus, dispatch]);

  useEffect(() => {
    if (saveStatus?.state === "error") {
      // Refresh the filter list after error
      const slug = "category-fast-order";
      setTimeout(() => {
        dispatch(getFilterSettings(slug));
      }, 500);
    }
  }, [saveStatus, dispatch]);

  // Save to cookies whenever relevant state changes
  useEffect(() => {
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
    COOKIE_NAME
  ]);
  
useEffect(() => {
  // console.log('🔄 [SearchComponent Category] Cookie reload triggered', { 
  //   cookieUpdateTrigger,
  //   isManualUpdate: isManualFilterUpdate.current,
  //   sessionFlag: sessionStorage.getItem('manualFilterUpdate')
  // });
  
  // Mark as manual update to prevent URL effect from running
  isManualFilterUpdate.current = true;
  
  const storedFilters = Cookies.get(COOKIE_NAME);

  if (storedFilters) {
    try {
      const parsedFilters = JSON.parse(storedFilters);
      
      // console.log('📦 [SearchComponent Category] Loaded from cookie:', parsedFilters);
      // console.log('📦 [SearchComponent Category] uniqueIDClickedCategories:', parsedFilters.uniqueIDClickedCategories);

      setFilterCategoryStorage(parsedFilters.uniqueIDClickedCategories || []);
      setFilterCategorySubCategoryStorage(parsedFilters.uniqueIDClickedSubCategories || []);
      setFilterCategorySubCategoryBrandsStorage(parsedFilters.uniqueIDClickedSubCategoriesBrands || []);
      setLocalFilters(parsedFilters.filters || {});
      
      if (setFilters) {
        setFilters(parsedFilters.filters || {});
      }
      
      if (setSearchType && parsedFilters.searchType) {
        setSearchType(parsedFilters.searchType);
      }

      // console.log('✅ [SearchComponent Category] State updated, dispatching API call');
      
      // Dispatch after state updates
      const filterArray = [{
        searchType: parsedFilters.searchType || 'category',
        uniqueIDClickedCategories: parsedFilters.uniqueIDClickedCategories || [],
        uniqueIDClickedSubCategories: parsedFilters.uniqueIDClickedSubCategories || [],
        uniqueIDClickedSubCategoriesBrands: parsedFilters.uniqueIDClickedSubCategoriesBrands || [],
        filters: parsedFilters.filters || {}
      }];
      
      dispatch(fetchFastOrderCategoryModeTableData(filterArray));

      // Clear the manual update flag after dispatch completes
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
}, [cookieUpdateTrigger]);


useEffect(() => {
  // Skip if this is a manual filter update
  if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
    // console.log('⏭️ [SearchComponent Category] Skipping URL update - manual filter change in progress');
    return;
  }

  const pathSegments = location.pathname.split('/');
  const urlCategoryName = pathSegments[3];
  
  if (urlCategoryName && searchType === 'category' && tableData?.category) {
    const matchingCategory = tableData.category.find(
      cat => cat.name === urlCategoryName
    );
    
    if (matchingCategory && matchingCategory.idCategory) {
      const currentCategoryId = filterCategoryStorage[0];
      const urlCategoryId = matchingCategory.idCategory;
      
      if (currentCategoryId !== urlCategoryId) {
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
        
        dispatch(fetchFastOrderCategoryModeTableData([{
          searchType: 'category',
          uniqueIDClickedCategories: [urlCategoryId],
          uniqueIDClickedSubCategories: [],
          uniqueIDClickedSubCategoriesBrands: [],
          filters: localFilters,
        }]));
      }
    }
  }
}, [location.pathname, searchType, tableData?.category, COOKIE_NAME, filterCategoryStorage, localFilters, dispatch, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, cookieUpdateTrigger]);
  // Sync localFilters with parent filters when parent changes
  useEffect(() => {
    if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters)) {
      setLocalFilters(filters);
    }
  }, [filters, localFilters]);

  // Handle table data updates
  useEffect(() => {
    if (tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.products || []);
      setFilterValues(tableData?.filters || {});
      setAvailableLocations(tableData?.supplierLocations || []);
    }
  }, [tableData, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Handle saved filters table data
  useEffect(() => {
    if (tableDataFromSavedFilters) {
      setNodes(tableDataFromSavedFilters?.products || []);
      setNodesSubCategories(tableDataFromSavedFilters?.products || []);
      setFilterValues(tableDataFromSavedFilters?.filters || {});
      setAvailableLocations(tableDataFromSavedFilters?.supplierLocations || []);
    }
  }, [tableDataFromSavedFilters, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Clear filters when checkboxes are active
  useEffect(() => {
    if (checkedRows.size > 0) {
      setFilterCategoryStorage([]);
      setFilterCategorySubCategoryStorage([]);
      setFilterCategorySubCategoryBrandsStorage([]);
      setLocalFilters({ ...initialFilters.filters });

      if (setFilters) {
        setFilters({ ...initialFilters.filters });
      }

      if (setSearchType) {
        setSearchType("category");
      }

      Cookies.set(COOKIE_NAME, JSON.stringify(initialFilters), { expires: 7 });
    }
  }, [checkedRows.size, initialFilters, setFilters, setSearchType, COOKIE_NAME]);

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

  // ✅ UPDATE: Extract category name from URL path and sync with state
// ✅ UPDATE: Extract category name from URL path and sync with state
  useEffect(() => {
    // Skip if this is a manual filter update
    if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
      // console.log('⏭️ [SearchComponent Category] Skipping URL category extraction - manual filter change in progress');
      return;
    }

    const pathSegments = location.pathname.split('/');
    const urlCategoryName = pathSegments[3];
    
    if (urlCategoryName && searchType === 'category' && tableData?.category) {
      const matchingCategory = tableData.category.find(
        cat => cat.name === urlCategoryName
      );
      
      if (matchingCategory && matchingCategory.idCategory) {
        if (!filterCategoryStorage.includes(matchingCategory.idCategory)) {
          setFilterCategoryStorage([matchingCategory.idCategory]);
          
          const cookieValue = {
            searchType: 'category',
            uniqueIDClickedCategories: [matchingCategory.idCategory],
            uniqueIDClickedSubCategories: [],
            uniqueIDClickedSubCategoriesBrands: [],
            filters: localFilters,
          };
          
          Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
        }
      }
    }
  }, [location.pathname, searchType, tableData?.category, COOKIE_NAME]);

// ✅ NEW: Reset URL when switching TO category mode
  useEffect(() => {
    // Skip if this is a manual filter update
    if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
      // console.log('⏭️ [SearchComponent Category] Skipping URL reset - manual filter change in progress');
      return;
    }

    if (searchType === 'category') {
      // Check if current URL is not a category URL
      const pathSegments = location.pathname.split('/');
      const currentMode = pathSegments[2]; // 'category' or 'brand'
      
      // If we're in category mode but URL shows brand, reset to base category URL
      if (currentMode === 'brand') {
        navigate('/fastorder/category', { replace: true });
      }
    }
  }, [searchType, navigate, location.pathname]);
  return (
    <>
      {/* Authentication Modal */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        closeOnClickOutside={true}
        closeOnEscape={true}
        withCloseButton={true}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
        }}
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