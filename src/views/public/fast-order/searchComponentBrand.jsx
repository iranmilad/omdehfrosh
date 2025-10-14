import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useParams } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { useDispatch, useSelector } from "react-redux";
import { fetchFastOrderBrandModeTableData } from "../../../redux/fastorder/fastordertabledata/fastordertablebrandmode/fastOrderTableBrandModeDataActions";
import { IconPlus, IconTrash, IconFilter, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
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
import { logout, verifyTokenSilent } from "../../../redux/auth/authusers/auth"; // Add auth actions
import { clearCart } from "../../../redux/cart"; // Add clearCart import
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils"; // Add API utils
import { useNavigate } from "react-router-dom"; // Add navigation
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import { clearUpdateFilterState } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsSlice";
import { clearDeleteFilterState } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";

const SearchComponentBrand = ({ 
  searchType, 
  setSearchType, 
  setAvailableLocations, 
  filters, 
  setFilters, 
  setNodes, 
  setNodesSubCategories 
}) => {
  
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Add navigation hook
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings || {});
  const { updateStatus, updateLoading, updateError } = useSelector((state) => state.updateFilterSettings || {});
  const { deleteStatus, deleteLoading, deleteError } = useSelector((state) => state.deleteFilterSettings || {});

  console.log(savedFilters, saveLoading, saveError);

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Brand-specific context
  const { 
    checkedRows, 
    selectedRow, 
    setSelectedRow, 
    toggleCheck, 
    isChecked, 
    clearAll 
  } = useBrandRowSelection();
  
  // Modal states
  const [openedAddModal, setOpenedAddModal] = useState(false);
  const [filterName, setFilterName] = useState('');

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState('');
  // Edit mode states
  const [editingFilterId, setEditingFilterId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilterName, setEditingFilterName] = useState('');

  // Menu control state
  const [menuOpened, setMenuOpened] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authVerificationLoading, setAuthVerificationLoading] = useState(false);

  // Component state
  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  
  // Redux selectors
  const { tableData, loading } = useSelector(
    (state) => state.fastOrderBrandModeData || {}
  );

  const { tableDataFromSavedFilters, loadingTableDataFromSavedFilters } = useSelector(
    (state) => state.fastOrderTableDataBrandModeSavedFilters || {}
  );
  
  const COOKIE_NAME = "search_filters_brand_fast_edit";

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
        
        // Silent re-verification to update auth state across all components
        await dispatch(verifyTokenSilent());
        
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
      });
      return false;
    }
    
    // Handle other errors with general notification
    notifications.show({
      title: 'خطا',
      message: message,
      color: 'red', 
      autoClose: 4000,
    });
    return false;
  };

  // Server authentication verification function using Redux action
  const verifyAuthFromServer = async () => {
    const token = localStorage.getItem("user");
    
    if (!token) {
      setShowAuthModal(true);
      return false;
    }

    try {
      setAuthVerificationLoading(true);
      
      // Use the existing Redux action for token verification
      const result = await dispatch(verifyTokenSilent());
      
      // Check if verification was successful
      if (result.type.includes('rejected') || result.error) {
        // Token is invalid or expired
        await handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        return false;
      }
      
      // If we get here, token is valid
      return true;
      
    } catch (error) {
      console.error("Error verifying auth:", error);
      await handleTokenExpiration(error);
      return false;
    } finally {
      setAuthVerificationLoading(false);
    }
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  // Enhanced menu click handler with server verification
  const handleMenuClick = async () => {
    // First check local auth state
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    // If local state shows authenticated, verify with server
    const isServerAuthenticated = await verifyAuthFromServer();
    
    if (isServerAuthenticated) {
      // If server confirms authentication, open the menu
      setMenuOpened(!menuOpened);
    }
    // If server auth fails, modal will be shown by verifyAuthFromServer
  };

  // Initial filters configuration
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

  const initialFilters = useMemo(() => getInitialFilters(), [getInitialFilters]);

  // State initialization
  const [filterBrandStorage, setFilterBrandStorage] = useState(initialFilters.uniqueIDClickedBrands);
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(initialFilters.uniqueIDClickedBrandsCategories);
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(initialFilters.filterBrandsCategorySubCategoryStorage);
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  const { setFilterValues } = useFastOrder();
  
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);
  const hasLoadedInitialFilters = useRef(false);

  // Form validation
  const form = useForm({
    initialValues: {
      inputBox: "",
    },
    validate: {
      title: (value) => (value?.trim() ? null : "نام الزامی است"),
    },
  });

  // Helper function to build filter array from current state
const buildCurrentFilterArray = useCallback(() => {
  return [{
    searchType,
    uniqueIDClickedBrands: filterBrandStorage,
    uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
    filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
    filters: filters || localFilters // Include current filters
  }];
}, [searchType, filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage, filters, localFilters]);

  // Helper function to build filter array from checked rows
  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'brand',
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
        filters: filter.filters || filters || localFilters // Include filter's saved filters or current filters
      }));
  }, [savedFilters, checkedRows, filters, localFilters]);


  // Helper function to build initial filter array
    const buildInitialFilterArray = useCallback(() => {
      const initialData = getInitialFilters();
      return [{
        searchType: 'brand',
        uniqueIDClickedBrands: initialData.uniqueIDClickedBrands,
        uniqueIDClickedBrandsCategories: initialData.uniqueIDClickedBrandsCategories,
        filterBrandsCategorySubCategoryStorage: initialData.filterBrandsCategorySubCategoryStorage,
        filters: initialData.filters || filters || localFilters // Include initial filters or current filters
      }];
    }, [getInitialFilters, filters, localFilters]);

  // Edit filter handler - Modified to use array format
  const handleEditFilter = useCallback((filter) => {
    setEditingFilterId(filter.id);
    setEditingFilterName(filter.filterName || 'بدون نام');
    setIsEditMode(true);
    
    const cookieValue = {
      searchType: 'brand',
      filters: filter.filters || {},
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
    };

    Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
    
    setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
    setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
    setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
    setLocalFilters(filter.filters || {});
    
    if (setFilters) {
      setFilters(filter.filters || {});
    }
    if (setSearchType) {
      setSearchType('brand');
    }

    setSelectedRow(filter.id);
    setMenuOpened(false);

    // Send single filter as array to API
    const filterArray = [{
      searchType: 'brand',
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || []
    }];

    dispatch(fetchFastOrderBrandModeTableData(filterArray));

    notifications.show({
      title: 'حالت ویرایش',
      message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد. تغییرات را اعمال کنید و سپس ذخیره کنید.`,
      color: 'blue',
      autoClose: 4000,
    });
  }, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch]);


  console.log("updateStatus", updateStatus)

// Fixed version of the saveEditedFilter function
const saveEditedFilter = useCallback(async () => {
  if (!editingFilterId || !editingFilterName.trim()) return;

  const slug = "brand-fast-order";
  const cookieRaw = Cookies.get(COOKIE_NAME);
  let fullCookieData;

  try {
    fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
  } catch (error) {
    fullCookieData = {};
  }

  try {
    const result = await dispatch(
      updateFilterSettings({
        slug,
        id: editingFilterId,
        filterName: editingFilterName.trim(),
        ...fullCookieData,
      })
    );

    // Check if the update was successful
    if (result?.type === 'category/updateFilterSettings/fulfilled') {
      // Check if the payload indicates an error state
      if (result?.payload?.state === "error") {
        // Server returned success action but with error state - show the error message
        notifications.show({
          title: 'خطا در به‌روزرسانی',
          message: result.payload.message,
          color: 'red',
          autoClose: 4000,
        });
        return;
      }
      
      // True success case
      dispatch(getFilterSettings(slug));
      setIsEditMode(false);
      setEditingFilterId(null);
      setEditingFilterName('');
      
      notifications.show({
        title: 'ذخیره شد',
        message: `فیلتر "${editingFilterName.trim()}" با موفقیت به‌روزرسانی شد.`,
        color: 'green',
        autoClose: 3000,
      });
    } else if (result?.type === 'category/updateFilterSettings/rejected') {
      // Handle rejected case - let the error handling useEffect handle it
      console.error("Update filter was rejected:", result.error);
      // Don't show notification here, let the useEffect handle it
    }
  } catch (error) {
    console.error("Update filter error:", error);
    // Let the useEffect handle the error display
  }
}, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch]);

  // Cancel edit mode - Modified to use array format
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditingFilterId(null);
    setEditingFilterName('');
    
    const initialData = getInitialFilters();
    setFilterBrandStorage(initialData.uniqueIDClickedBrands);
    setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
    setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
    setLocalFilters(initialData.filters);
    
    if (setFilters) {
      setFilters(initialData.filters);
    }
    
    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });
    setSelectedRow(null);

    // Send initial filter as array to API
    dispatch(fetchFastOrderBrandModeTableData(buildInitialFilterArray()));
    
    notifications.show({
      title: 'لغو ویرایش',
      message: 'تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.',
      color: 'gray',
      autoClose: 2000,
    });
  }, [getInitialFilters, setFilters, setSelectedRow, COOKIE_NAME, dispatch, buildInitialFilterArray]);

  // Handle checkbox change - Modified to use array format
  const handleFilterCheckboxChange = useCallback((filterId, checked) => {
    if (checked) {
      // Check the checkbox in the context
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      // Apply this filter immediately
      const selectedFilter = savedFilters?.find(f => f.id === filterId);
      if (selectedFilter) {
        const cookieValue = {
          searchType: 'brand',
          filters: selectedFilter.filters || {},
          uniqueIDClickedBrands: selectedFilter.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories: selectedFilter.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage: selectedFilter.filterBrandsCategorySubCategoryStorage || [],
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

        setFilterBrandStorage(selectedFilter.uniqueIDClickedBrands || []);
        setFilterBrandsCategoryStorage(selectedFilter.uniqueIDClickedBrandsCategories || []);
        setFilterBrandsCategorySubCategoryStorage(selectedFilter.filterBrandsCategorySubCategoryStorage || []);
        setLocalFilters(selectedFilter.filters || {});

        if (setFilters) setFilters(selectedFilter.filters || {});
        if (setSearchType) setSearchType('brand');

        // Build array of all checked filters (including the one just checked)
        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
        }, 0);
      }
    } else {
      // Uncheck the checkbox in the context
      if (isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      // Build array of remaining checked filters
      setTimeout(() => {
        const newCheckedRows = new Set(checkedRows);
        newCheckedRows.delete(filterId);
        
        if (newCheckedRows.size > 0) {
          // If there are still checked filters, send them as array
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
        } else {
          // If no filters are checked, reset to initial filters
          const initialData = getInitialFilters();
          setFilterBrandStorage(initialData.uniqueIDClickedBrands);
          setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
          setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
          setLocalFilters(initialData.filters);

          if (setFilters) setFilters(initialData.filters);
          if (setSearchType) setSearchType('brand');

          Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

          // Send initial filter as array
          dispatch(fetchFastOrderBrandModeTableData(buildInitialFilterArray()));
        }
      }, 0);
    }
  }, [savedFilters, COOKIE_NAME, setFilters, setSearchType, getInitialFilters, dispatch, isChecked, toggleCheck, checkedRows, buildCheckedFiltersArray, buildInitialFilterArray]);

  // Clear selected filters
  const clearSelectedFilters = useCallback(() => {
    clearAll();
    
    // Reset to initial state and send to API
    const initialData = getInitialFilters();
    setFilterBrandStorage(initialData.uniqueIDClickedBrands);
    setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
    setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
    setLocalFilters(initialData.filters);

    if (setFilters) setFilters(initialData.filters);
    if (setSearchType) setSearchType('brand');

    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

    // Send initial filter as array to API
    dispatch(fetchFastOrderBrandModeTableData(buildInitialFilterArray()));
  }, [clearAll, getInitialFilters, setFilters, setSearchType, COOKIE_NAME, dispatch, buildInitialFilterArray]);

const saveFiltersSettings = useCallback(async () => {
  if (!filterName.trim()) return;

  const slug = "brand-fast-order";
  const cookieRaw = Cookies.get(COOKIE_NAME);
  let fullCookieData;

  try {
    fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
  } catch (error) {
    fullCookieData = {};
  }

  try {
    const result = await dispatch(
      saveFilterSettings({
        slug,
        filters: fullCookieData,
        filterName: filterName.trim(),
      })
    );

    // Wait for the result and check if it was successful
    if (result?.type === 'brand/saveFilterSettings/fulfilled') {
      // Check if the payload indicates an error state
      if (result?.payload?.state === "error") {
        // Server returned success action but with error state - keep modal open
        console.log("Server validation error:", result.payload);
        return; // Don't close modal, let validation errors show
      }
      
      // True success case - close modal
      console.log("Save successful, closing modal");
      setOpenedAddModal(false);
      setFilterName("");
      
      // Add a small delay before fetching updated data
      setTimeout(() => {
        dispatch(getFilterSettings(slug));
      }, 500);
      
      // Clear the save state
      setTimeout(() => {
        dispatch(clearSaveFilterState());
      }, 1000);
      
      // notifications.show({
      //   title: 'موفق',
      //   message: 'فیلتر با موفقیت ذخیره شد',
      //   color: 'green',
      //   autoClose: 3000,
      // });
    } else if (result?.payload?.status === "error") {
      // Handle validation errors - keep modal open
      // The form will show the validation errors from saveStatus
      return;
    }
    
  } catch (error) {
    console.error("Save filter error:", error);
    // Let the useEffect handle the error display
  }
}, [filterName, COOKIE_NAME, dispatch]);

  // Delete filter handler
  const handleDeleteSavedFilter = useCallback(async (id) => {
    const slug = "brand-fast-order";
    
    try {
      const result = await dispatch(deleteFilterSettings({ slug, id }));

      // Wait for the result and check if it was successful  
      if (result?.type === 'category/deleteFilterSettings/fulfilled' || result?.payload?.id) {
        dispatch(getFilterSettings(slug));
        if (isChecked(id)) {
          toggleCheck(id);
        }
        if (editingFilterId === id) {
          cancelEditMode();
        }
        
        notifications.show({
          title: 'حذف شد',
          message: 'فیلتر با موفقیت حذف شد',
          color: 'green',
          autoClose: 3000,
        });
      } else if (result?.payload?.status === "error") {
        // Handle validation errors if any
        return;
      }
    } catch (error) {
      console.error("Delete filter error:", error);
      // Let the useEffect handle the error display
    }
  }, [dispatch, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

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
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
      }
    }
  }, [checkedRows, dispatch, buildCheckedFiltersArray]);

  // OPTIMIZED: Combined data fetching effect with duplicate prevention - Modified to use array format
    useEffect(() => {
      const currentParams = {
        searchType,
        filterBrandStorage,
        filterBrandsCategoryStorage,
        filterBrandsCategorySubCategoryStorage,
        checkedRowsSize: checkedRows.size,
        checkedRowIds: Array.from(checkedRows).sort().join(','),
        hasCheckedRows: checkedRows.size > 0,
        filters: JSON.stringify(filters || localFilters) // Add filters to comparison
      };

      // Skip if parameters haven't changed
      if (isEqual(lastFetchParams.current, currentParams)) {
        return;
      }

      lastFetchParams.current = currentParams;

      // Always make an API request when there are changes
      if (checkedRows.size > 0) {
        // When checkboxes are selected, fetch data based on checked rows
        const checkedFiltersArray = buildCheckedFiltersArray();
        if (checkedFiltersArray.length > 0) {
          dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
        }
      } else {
        // When no checkboxes are selected, fetch normal filtered data as array
        const currentFiltersArray = buildCurrentFilterArray();
        dispatch(fetchFastOrderBrandModeTableData(currentFiltersArray));
      }
    }, [
      dispatch, 
      searchType,
      filterBrandStorage,
      filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage,
      checkedRows,
      checkedRows.size,
      filters,
      localFilters,
      buildCheckedFiltersArray,
      buildCurrentFilterArray
    ]);

    console.log("saveStatus", saveStatus);

  // OPTIMIZED: Load saved filters only once when user is available
useEffect(() => {
  if (saveStatus?.state == "ok") {
    setOpenedAddModal(false);
    setFilterName("");
    
    // Refresh the filter list after successful save
    const slug = "brand-fast-order";
    setTimeout(() => {
      dispatch(getFilterSettings(slug));
    }, 500);
  }
}, [saveStatus, dispatch]);

useEffect(() => {
  if (saveStatus?.state == "error") {
    setOpenedAddModal(true);
    setFilterName("");
    
    // Refresh the filter list after successful save
    const slug = "brand-fast-order";
    setTimeout(() => {
      dispatch(getFilterSettings(slug));
    }, 500);
  }
}, [saveStatus, dispatch]);
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

  // Load filters from cookies on component mount - Modified to use array format
  useEffect(() => {
    const storedFilters = Cookies.get(COOKIE_NAME);
  
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);

        setFilterBrandStorage(parsedFilters.uniqueIDClickedBrands || []);
        setFilterBrandsCategoryStorage(parsedFilters.uniqueIDClickedBrandsCategories || []);
        setFilterBrandsCategorySubCategoryStorage(parsedFilters.filterBrandsCategorySubCategoryStorage || []);
        setLocalFilters(parsedFilters.filters || {});
        
        if (setFilters) {
          setFilters(parsedFilters.filters || {});
        }
        
        if (setSearchType && parsedFilters.searchType) {
          setSearchType(parsedFilters.searchType);
        }

        // Send loaded filters as array to API
        setTimeout(() => {
          const filterArray = [{
            searchType: parsedFilters.searchType || 'brand',
            uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
            uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
            filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || []
          }];
          dispatch(fetchFastOrderBrandModeTableData(filterArray));
        }, 0);
      } catch (error) {
        console.error('Error parsing stored filters:', error);
      }
    }
  }, [COOKIE_NAME, setFilters, setSearchType, dispatch]);

  // Sync localFilters with parent filters
  useEffect(() => {
    if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters)) {
      setLocalFilters(filters);
    }
  }, [filters, localFilters]);

  // Handle table data updates
  useEffect(() => {
    if (tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.subCategoriesData || []);
      setFilterValues(tableData?.filters || {});
      setAvailableLocations(tableData?.supplierLocations || []);
    }
  }, [tableData, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Handle saved filters table data
  useEffect(() => {
    if (tableDataFromSavedFilters) {
      setNodes(tableDataFromSavedFilters?.products || []);
      setNodesSubCategories(tableDataFromSavedFilters?.subCategoriesData || []);
      setFilterValues(tableDataFromSavedFilters?.filters || {});
      setAvailableLocations(tableDataFromSavedFilters?.supplierLocations || []);
    }
  }, [tableDataFromSavedFilters, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Clear filters when checkboxes are active - Modified to use array format
  useEffect(() => {
    if (checkedRows.size > 0) {
      setFilterBrandStorage([]);
      setFilterBrandsCategoryStorage([]);
      setFilterBrandsCategorySubCategoryStorage([]);
      setLocalFilters({ ...initialFilters.filters });

      if (setFilters) {
        setFilters({ ...initialFilters.filters });
      }

      if (setSearchType) {
        setSearchType("brand");
      }

      Cookies.set(COOKIE_NAME, JSON.stringify(initialFilters), { expires: 7 });
    }
  }, [checkedRows.size, initialFilters, setFilters, setSearchType, COOKIE_NAME]);

  // Monitor save status for error handling
  useEffect(() => {
    if (saveError) {
      
      // Skip handling validation errors here - let the form handle them
      if (saveError?.state === "error" && saveError?.error && typeof saveError.error === 'object') {
        return; // Don't clear state for validation errors
      }
      
      // Handle all other errors (including 403) by showing them in ErrorMessageModal
      if (saveError?.status) {
        if (saveError.status === 401) {
          // Handle auth errors specially
          handleTokenExpiration(saveError);
          setOpenedAddModal(false);
          setFilterName("");
        } else if (saveError.status >= 400) {
          // Show all other HTTP errors (including 403) in ErrorMessageModal
          setOpenedAddModal(false);
          setFilterName("");
          // Try different ways to extract the message
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
        return; // Don't clear state for validation errors
      }
      
      // Handle all other errors (including 403) by showing them in ErrorMessageModal
      if (updateError?.status) {
        if (updateError.status === 401) {
          // Handle auth errors specially
          handleTokenExpiration(updateError);
          setIsEditMode(false);
          setEditingFilterId(null);
          setEditingFilterName('');
        } else if (updateError.status >= 400) {
          // Show all other HTTP errors (including 403) in ErrorMessageModal
          // Try different ways to extract the message
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
          // Try different ways to extract the message
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

  return (
    <>
      {/* Authentication Modal */}
      <Modal
        opened={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="ورود به حساب کاربری"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
        overlayProps={{
          backgroundOpacity: 0,
          blur: 0,
        }}
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

      {/* Add Filter Modal */}
      <Modal
        opened={openedAddModal}
        onClose={() => {
          setOpenedAddModal(false);
          setFilterName('');
          // Clear any validation errors when manually closing
          dispatch(clearSaveFilterState());
        }}
        title="افزودن فیلتر جدید - برند"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
      >
        <TextInput
          label="نام فیلتر"
          placeholder="نام را وارد کنید"
          {...form.getInputProps("inputBox")} 
          value={filterName}
          onChange={(event) => setFilterName(event.currentTarget.value)}
          size={isMobile ? "sm" : "md"}
          error={
            // Show validation errors from saveStatus if it's a client error
            (saveStatus?.state === "error" && saveStatus?.error?.inputBox) || form.errors.inputBox ? (
              <div>
                {saveStatus?.state === "error" && saveStatus?.error?.inputBox && (
                  <div>{saveStatus.error.inputBox}</div>
                )}
                {form.errors.inputBox && <div>{form.errors.inputBox}</div>}
              </div>
            ) : null
          }
        />
        <Button 
          mt="md" 
          onClick={saveFiltersSettings}
          disabled={!filterName.trim() || saveLoading}
          loading={saveLoading}
          size={isMobile ? "sm" : "md"}
          fullWidth={isMobile}
        >
          ذخیره
        </Button>
      </Modal>

      <Paper 
        mt={{ base: "xs", md: "xs" }} 
        id="fastorder-search"
        p={isMobile ? "sm" : "md"}
        style={{ 
          overflow: 'hidden'
        }}
      >
        {/* Loading Overlay for auth verification */}
        <LoadingOverlay 
          pos="fixed" 
          visible={authVerificationLoading || loading} 
          zIndex={1000} 
          h="100%" 
        />

        {/* Header */}
        <Flex
          direction={isMobile ? "column" : "row"}
          justify={isMobile ? "flex-start" : "space-between"}
          align={isMobile ? "stretch" : "center"}
          gap={isMobile ? "" : "md"}
          mb={isTablet ? "sm" : ""}
        >
          <div>
            <XTitle>سفارش سریع</XTitle>
            {isEditMode && (
              <Group gap="xs" mt="xs">
                <Badge color="blue" variant="light" size="sm">
                  حالت ویرایش: {editingFilterName}
                </Badge>
                <Group gap="xs">
                  <ActionIcon
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={saveEditedFilter}
                    title="ذخیره تغییرات"
                    loading={updateLoading}
                    disabled={updateLoading}
                  >
                    <IconDeviceFloppy size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={cancelEditMode}
                    title="لغو ویرایش"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            )}
          </div>
          
          {/* Action Buttons */}
          <Flex 
            direction={isMobile ? "column" : "row"}
            gap={isMobile ? "xs" : "sm"}
            align={isMobile ? "stretch" : "center"}
          >

            {/* Filter Settings Menu - Always show button, but with server verification */}
            <Menu 
              shadow="md" 
              width={isMobile ? "90vw" : isTablet ? 350 : 400} 
              position={isMobile ? "bottom" : "bottom-end"}
              offset={isMobile ? 5 : 10}
              opened={menuOpened}
              onChange={setMenuOpened}
            >
              <Menu.Target>
                <Button 
                  variant="light" 
                  leftSection={!isMobile && <IconFilter size={16} />}
                  size={isMobile ? "sm" : "md"}
                  fullWidth={isMobile}
                  compact={isMobile}
                  onClick={handleMenuClick} // Use our enhanced handler
                  loading={authVerificationLoading}
                  styles={{
                    root: {
                      height: isMobile ? '32px' : '36px',
                      fontSize: isMobile ? '11px' : '13px'
                    }
                  }}
                >
                  {isMobile ? "تنظیمات جستجو" : "تنظیمات جستجو"}
                  {checkedRows.size > 0 && ` (${checkedRows.size})`}
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>فیلترهای ذخیره شده</Menu.Label>
                
                <Menu.Item
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setOpenedAddModal(true);
                  }}
                >
                  افزودن فیلتر جدید
                </Menu.Item>

                {savedFilters && savedFilters.length > 0 && (
                  <>
                    <Menu.Divider />
                    
                    {checkedRows.size > 0 && (
                      <>
                        <Group p="xs" gap="xs" justify={isMobile ? "center" : "flex-start"}>
                          <Button 
                            size="xs" 
                            variant="subtle" 
                            color="gray"
                            onClick={clearSelectedFilters}
                            fullWidth={isMobile}
                            disabled={isEditMode}
                            style={{
                              opacity: isEditMode ? 0.5 : 1
                            }}
                          >
                            پاک کردن انتخاب
                          </Button>
                        </Group>
                        <Menu.Divider />
                      </>
                    )}
                    
                    <Box style={{ 
                      maxHeight: isMobile ? '250px' : '300px', 
                      overflowY: 'auto',
                      overflowX: 'hidden'
                    }}>
                      {savedFilters.map((filter, index) => (
                        <React.Fragment key={filter.id}>
                          <Menu.Item>
                            <Group justify="space-between" w="100%" wrap="nowrap">
                              <Group gap="xs" flex={1} maw="calc(100% - 60px)">
                                <Checkbox
                                  checked={isChecked(filter.id)}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    
                                    if (isEditMode) return;
                                    
                                    const isCurrentlyChecked = event.currentTarget.checked;
                                    handleFilterCheckboxChange(filter.id, isCurrentlyChecked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  size={isMobile ? "sm" : "md"}
                                  disabled={isEditMode}
                                  style={{
                                    opacity: isEditMode ? 0.5 : 1,
                                    cursor: isEditMode ? 'not-allowed' : 'pointer'
                                  }}
                                />
                                <Text 
                                  size={isMobile ? "xs" : "sm"}
                                  fw={editingFilterId === filter.id ? 600 : 500}
                                  c={editingFilterId === filter.id ? "blue" : undefined}
                                  style={{ 
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    opacity: (isEditMode && editingFilterId !== filter.id) ? 0.6 : 1
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    if (isEditMode && editingFilterId !== filter.id) {
                                      notifications.show({
                                        title: 'در حال ویرایش',
                                        message: 'ابتدا ویرایش فعلی را تمام کنید یا لغو کنید.',
                                        color: 'orange',
                                        autoClose: 3000,
                                      });
                                      return;
                                    }

                                    const cookieValue = {
                                      searchType: 'brand',
                                      filters: filter.filters || {},
                                      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
                                      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
                                      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
                                    };

                                    Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
                                    
                                    setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
                                    setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
                                    setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
                                    setLocalFilters(filter.filters || {});
                                    
                                    if (setFilters) {
                                      setFilters(filter.filters || {});
                                    }
                                    if (setSearchType) {
                                      setSearchType('brand');
                                    }

                                    setSelectedRow(filter.id);

                                    // Send filter as array to API
                                    const filterArray = [{
                                      searchType: 'brand',
                                      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
                                      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
                                      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || []
                                    }];
                                    dispatch(fetchFastOrderBrandModeTableData(filterArray));
                                  }}
                                  title={filter.filterName || 'بدون نام'}
                                >
                                  {filter.filterName || 'بدون نام'}
                                </Text>
                              </Group>
                              
                              <Group gap="xs" style={{ flexShrink: 0 }}>
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  size={isMobile ? "sm" : "md"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFilter(filter);
                                  }}
                                  title="ویرایش"
                                  disabled={isEditMode && editingFilterId !== filter.id}
                                  style={{
                                    opacity: (isEditMode && editingFilterId !== filter.id) ? 0.5 : 1
                                  }}
                                >
                                  <IconEdit size={isMobile ? 12 : 14} />
                                </ActionIcon>
                                
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size={isMobile ? "sm" : "md"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    if (isEditMode && editingFilterId !== filter.id) {
                                      notifications.show({
                                        title: 'در حال ویرایش',
                                        message: 'ابتدا ویرایش فعلی را تمام کنید یا لغو کنید.',
                                        color: 'orange',
                                        autoClose: 3000,
                                      });
                                      return;
                                    }
                                    handleDeleteSavedFilter(filter.id);
                                  }}
                                  disabled={deleteLoadingId === filter.id || (isEditMode && editingFilterId !== filter.id)}
                                  title="حذف"
                                  loading={deleteLoading && deleteLoadingId === filter.id}
                                  style={{
                                    opacity: (deleteLoadingId === filter.id || (isEditMode && editingFilterId !== filter.id)) ? 0.5 : 1
                                  }}
                                >
                                  <IconTrash size={isMobile ? 12 : 14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          </Menu.Item>
                          {index < savedFilters.length - 1 && <Menu.Divider />}
                        </React.Fragment>
                      ))}
                    </Box>
                  </>
                )}

                {(!savedFilters || savedFilters.length === 0) && (
                  <>
                    <Menu.Divider />
                    <Menu.Item disabled>
                      <Text size={isMobile ? "xs" : "sm"} c="dimmed" ta="center">
                        فیلتری ذخیره نشده است
                      </Text>
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>

            <ShareModal 
              filters={updateFiltersAndStore().thisFilter} 
              isMobile={isMobile}
            />
          </Flex>
        </Flex>

        {/* Tabs */}
        <Tabs 
          styles={{ 
            panel: { marginTop: isMobile ? "15px" : "20px" },
            list: {
              overflowX: 'auto',
              flexWrap: 'nowrap',
              justifyContent: 'center',
              display: 'flex',
              width: '100%'
            },
            tab: {
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '8px 12px' : '10px 16px',
              whiteSpace: 'nowrap',
              flex: '1 1 50%',
              textAlign: 'center'
            }
          }} 
          variant="pills" 
          defaultValue="brand" 
          value={searchType} 
          onChange={setSearchType}
          orientation="horizontal"
        >
          <Tabs.List grow={false}>
            <Tabs.Tab value="brand">
              {isMobile ? "برند" : "جستجو بر اساس برند"}
            </Tabs.Tab>
            <Tabs.Tab value="category">
              {isMobile ? "دسته‌بندی" : "جستجو بر اساس دسته بندی"}
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="brand">
            {!loading && searchType === "brand" && tableData && (
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
              />
            )}
          </Tabs.Panel>
        </Tabs>

      </Paper>
    </>
  );
};

export default SearchComponentBrand;