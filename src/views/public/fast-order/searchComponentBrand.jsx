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
import { logout, verifyTokenSilent } from "../../../redux/auth/authusers/auth";
import { clearCart } from "../../../redux/cart";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import { useNavigate } from "react-router-dom";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import { clearUpdateFilterState } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsSlice";
import { clearDeleteFilterState } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import SavedFiltersModalBrandModeFastOrder from "./savedfilters/brandmode/SavedFiltersModalBrandModeFastOrder";
import { fetchFastOrderBrandModeTableData } from "../../../redux/fastorder/fastordertabledata/fastordertablebrandmode/fastOrderTableBrandModeDataActions";

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
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { saveError } = useSelector((state) => state.saveFilterSettings || {});
  const { updateError } = useSelector((state) => state.updateFilterSettings || {});
  const { deleteError } = useSelector((state) => state.deleteFilterSettings || {});
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
        await dispatch(verifyTokenSilent());
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
  const verifyAuthFromServer = async () => {
    const token = localStorage.getItem("user");
    
    if (!token) {
      setShowAuthModal(true);
      return false;
    }

    try {
      setAuthVerificationLoading(true);
      const result = await dispatch(verifyTokenSilent());
      
      if (result.type.includes('rejected') || result.error) {
        await handleTokenExpiration({ status: 401, message: 'Unauthorized' });
        return false;
      }
      
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

  const handleMenuClick = async () => {
    if (!user || !isVerified) {
      setShowAuthModal(true);
      return;
    }

    const isServerAuthenticated = await verifyAuthFromServer();
    
    if (isServerAuthenticated) {
      setFilterSettingsModalOpened(true);
    }
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

  // OPTIMIZED: Combined data fetching effect with duplicate prevention
  useEffect(() => {
    const currentParams = {
      searchType,
      filterBrandStorage,
      filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage,
      checkedRowsSize: checkedRows.size,
      checkedRowIds: Array.from(checkedRows).sort().join(','),
      hasCheckedRows: checkedRows.size > 0,
      filters: JSON.stringify(filters || localFilters)
    };

    if (isEqual(lastFetchParams.current, currentParams)) {
      return;
    }

    lastFetchParams.current = currentParams;

    if (checkedRows.size === 0) {
      const currentFiltersArray = buildCurrentFilterArray();
      dispatch(fetchFastOrderBrandModeTableData(currentFiltersArray));
    }
  }, [
    dispatch, 
    searchType,
    filterBrandStorage,
    filterBrandsCategoryStorage,
    filterBrandsCategorySubCategoryStorage,
    checkedRows.size,
    filters,
    localFilters,
    buildCurrentFilterArray
  ]);

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
  // console.log('🔄 [SearchComponent] Cookie reload triggered', { cookieUpdateTrigger });
  
  const storedFilters = Cookies.get(COOKIE_NAME);

  if (storedFilters) {
    try {
      const parsedFilters = JSON.parse(storedFilters);
      
      // console.log('📦 [SearchComponent] Loaded from cookie:', parsedFilters);

      // Mark as manual update to prevent URL effect from interfering
      isManualFilterUpdate.current = true;

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

      // Dispatch after state updates
      setTimeout(() => {
        const filterArray = [{
          searchType: parsedFilters.searchType || 'brand',
          uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || [],
          filters: parsedFilters.filters || {}
        }];
        // console.log('🚀 [SearchComponent] Dispatching fetchFastOrderBrandModeTableData');
        dispatch(fetchFastOrderBrandModeTableData(filterArray));
        
        // Reset manual update flag after dispatch
        setTimeout(() => {
          isManualFilterUpdate.current = false;
        }, 500);
      }, 100);
    } catch (error) {
      // console.error('[SearchComponent] Error parsing stored filters:', error);
    }
  }
}, [cookieUpdateTrigger, COOKIE_NAME, dispatch, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, setFilters, setSearchType]);
  // Sync localFilters with parent filters
  useEffect(() => {
    if (filters && JSON.stringify(filters) !== JSON.stringify(localFilters)) {
      setLocalFilters(filters);
    }
  }, [filters, localFilters, setLocalFilters]);

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

  // Clear filters when checkboxes are active
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


  useEffect(() => {
    if (searchType === 'brand') {
      const pathSegments = location.pathname.split('/');
      const currentMode = pathSegments[2];
      const urlBrandName = pathSegments[3];
      
      // Only reset if we're in category mode, not if we're navigating between brands
      if (currentMode === 'category') {
        // console.log('🔄 [SearchComponent] Switching to brand mode, resetting URL');
        navigate('/fastorder/brand', { replace: true });
      }
    }
  }, [searchType, navigate, location.pathname]);
// ✅ NEW: Update filters from URL pathname when in brand mode
useEffect(() => {
  // Skip if this is a manual filter update (from saved filters, etc.)
  // Check BOTH ref AND sessionStorage
  if (isManualFilterUpdate.current || sessionStorage.getItem('manualFilterUpdate') === 'true') {
    // console.log('⏭️ [SearchComponent] Skipping URL update - manual filter change in progress');
    return;
  }

  const pathSegments = location.pathname.split('/');
  const urlBrandName = pathSegments[3];
  
  // console.log('🔗 [SearchComponent] URL check - pathname:', location.pathname);
  // console.log('🔗 [SearchComponent] URL check - urlBrandName:', urlBrandName);
  // console.log('🔗 [SearchComponent] URL check - tableData?.brands:', tableData?.brands);
  
  if (urlBrandName && searchType === 'brand' && tableData?.brands && tableData.brands.length > 0) {
    const matchingBrand = tableData.brands.find(
      brand => brand.name === urlBrandName
    );
    
    // console.log('🔗 [SearchComponent] Matching brand found:', matchingBrand);
    
    if (matchingBrand && matchingBrand.idBrand) {
      const currentBrandId = filterBrandStorage[0];
      const urlBrandId = matchingBrand.idBrand;
      
      if (currentBrandId !== urlBrandId) {
        // console.log('✅ [SearchComponent] Setting brand filter from URL:', urlBrandId);
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
        
        dispatch(fetchFastOrderBrandModeTableData([{
          searchType: 'brand',
          uniqueIDClickedBrands: [urlBrandId],
          uniqueIDClickedBrandsCategories: [],
          filterBrandsCategorySubCategoryStorage: [],
          filters: localFilters,
        }]));
      }
    }
  }
}, [location.pathname, searchType, tableData?.brands, COOKIE_NAME, filterBrandStorage, localFilters, dispatch, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, cookieUpdateTrigger]);

useEffect(() => {
    if (searchType === 'brand') {
      const pathSegments = location.pathname.split('/');
      const currentMode = pathSegments[2];
      
      if (currentMode === 'category') {
        // console.log('🔄 [SearchComponent] Switching to brand mode, resetting URL');
        navigate('/fastorder/brand', { replace: true });
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
        {/* Loading Overlay for auth verification */}
        <LoadingOverlay 
          pos="fixed" 
          visible={authVerificationLoading || loading} 
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
                border: searchType === 'brand' ? '1px solid #093572' : '1px solid #e0e0e0',
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
                border: searchType === 'category' ? '1px solid #093572' : '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: searchType === 'category' ? '#093572' : 'white',
                color: searchType === 'category' ? 'white' : '#333',
              }}
            >
              {isMobile ? "دسته‌بندی" : "دسته‌بندی"}
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