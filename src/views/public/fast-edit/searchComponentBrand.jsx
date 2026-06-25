import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";  
import SlideCategory from "./SlideCategory";
import { 
  Center, 
  Group, 
  Loader, 
  Paper, 
  Space, 
  Stack, 
  Tabs,
  Button,
  Flex,
} from "@mantine/core";
import qs from "qs";
import { useParams } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { fetchFastEditBrandModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataActions";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { useMediaQuery } from "@mantine/hooks";
import { IconFilter } from '@tabler/icons-react';
import isEqual from "lodash/isEqual";
import { useBrandRowSelection } from "./BrandRowSelectionContext";
import SavedFiltersModalBrandMode from "./savedfilters/brandmode/SavedFiltersModalBrand";
import { useApiQuery } from "../../../Libs/reactQuery";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";

const SearchComponentBrandFastEdit = ({
  searchType,
  setSearchType,
  setAvailableLocations,
  filters,
  setFilters,
  setNodes,
  setNodesSubCategories,
  filterSettingsModalOpened,
  setFilterSettingsModalOpened,
  onEditModeChange,
  cookieUpdateTrigger,
  onCookieUpdate,
  filterBrandStorage,
  setFilterBrandStorage,
  filterBrandsCategoryStorage,
  setFilterBrandsCategoryStorage,
  filterBrandsCategorySubCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  savedFilters: savedFiltersProp,
  setTableDataLoading,
}) => {
  
  const dispatch = useDispatch();

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { saveError } = useSelector((state) => state.saveFilterSettings || {});
  const savedFilters = savedFiltersProp ?? [];

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Brand-specific context for Fast Edit
  const { 
    checkedRows, 
  } = useBrandRowSelection();

  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });
  
  const { tableData: tableDataFromRedux, loading: loadingFromRedux } = useSelector(
    (state) => state.fastEditBrandModeData || {}
  );

  const COOKIE_NAME = "search_filters_brand_fast_edit";

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

  // filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage come from parent (fast-edit index) for cookie reload / restore-on-tab

  // Keep local filters state for UI - not sent to backend
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  // filters in category mode
  const [filterCategoryStorage, setFilterCategoryStorage] = useState([]);
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState([]);
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState([]);

  const { setFilterValues } = useFastOrder();
  
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);

  // Helper functions to build filter arrays (without filters property)
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      // filters property removed
    }];
  }, [searchType, filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage]);

  const filterArray = useMemo(() => buildCurrentFilterArray(), [buildCurrentFilterArray]);
  const TABLE_STALE_MS = 5 * 60 * 1000; // 5 min - avoid refetch when switching tabs back
  const { data: tableDataFromQuery, isLoading: loadingFromQuery, isFetching: fetchingFromQuery } = useApiQuery({
    endpoint: "/fast-edit-brand-mode",
    queryKey: ["fast-edit-brand-mode", JSON.stringify(filterArray)],
    method: "post",
    body: filterArray,
    strategy: "CACHED",
    keepPrevious: true,
    enabled: checkedRows.size === 0 && filterArray?.length > 0,
    staleTime: TABLE_STALE_MS,
    queryOptions: { refetchOnMount: false, refetchOnWindowFocus: false },
  });
  const tableData = checkedRows.size === 0 ? (tableDataFromQuery ?? null) : tableDataFromRedux ?? null;
  const loading = checkedRows.size === 0
    ? loadingFromQuery || fetchingFromQuery
    : loadingFromRedux;

  useEffect(() => {
    if (typeof setTableDataLoading === "function") {
      setTableDataLoading(loading);
    }
  }, [loading, setTableDataLoading]);

  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'brand',
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
        // filters property removed
      }));
  }, [savedFilters, checkedRows]);

  const updateFiltersAndStore = useCallback(() => {
    let thisFilter = {};

    if (searchType === "brand") {
      thisFilter.searchType = searchType;
      thisFilter.uniqueIDClickedBrands = filterBrandStorage;
      thisFilter.uniqueIDClickedBrandsCategories = filterBrandsCategoryStorage;
      thisFilter.filterBrandsCategorySubCategoryStorage = filterBrandsCategorySubCategoryStorage;
   
    } else if (searchType === "category") {
      thisFilter.searchType = "category";
      thisFilter.parent = category.parent;
      thisFilter.subCategory = category.subCategory;
      thisFilter.uniqueIDClickedCategories = filterCategoryStorage;
      thisFilter.uniqueIDClickedSubCategories = filterCategorySubCategoryStorage;
      thisFilter.uniqueIDClickedSubCategoriesBrands = filterCategorySubCategoryBrandsStorage;
    }

    // filters property removed
    if (id) thisFilter.userId = id;

    Cookies.set(COOKIE_NAME, JSON.stringify(thisFilter), { expires: 7 });

    return {
      thisFilter,
      query: qs.stringify(thisFilter, {
        addQueryPrefix: true,
        arrayFormat: "comma",
      }),
    };
  }, [
    brands, 
    category,
    searchType, 
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    id,
    COOKIE_NAME
  ]);

  // When checkboxes are selected, fetch table data via Redux (combined saved-filters view). When none selected, table data comes from useApiQuery (cached).
  useEffect(() => {
    if (checkedRows.size === 0) return;
    const currentParams = {
      checkedRowIds: Array.from(checkedRows).sort().join(','),
    };
    if (isEqual(lastFetchParams.current, currentParams)) return;
    lastFetchParams.current = currentParams;
    const checkedFiltersArray = buildCheckedFiltersArray();
    if (checkedFiltersArray.length > 0) {
      dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
    }
  }, [checkedRows, checkedRows.size, dispatch, buildCheckedFiltersArray]);

  // Saved filters come from parent (index) via useApiQuery - no dispatch here to avoid API calls on tab switch

  // Save to cookies whenever relevant state changes (includes filters for UI state)
  useEffect(() => {
    const dataToSave = {
      searchType: searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: localFilters, // Save for UI state, but won't be sent to backend
    };
    
    Cookies.set(COOKIE_NAME, JSON.stringify(dataToSave), { expires: 7 });
  }, [
    searchType, 
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage, 
    localFilters, // Re-added
    COOKIE_NAME
  ]);

  // Parent (fast-edit index) owns filter storage state and initializes from cookie; restore-on-tab and cookie reload run there. No mount-only cookie read here.

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

  // Clear filters when checkboxes are active - Modified to use array format (filters kept for UI)
  useEffect(() => {
    if (checkedRows.size > 0) {
      setFilterBrandStorage([]);
      setFilterBrandsCategoryStorage([]);
      setFilterBrandsCategorySubCategoryStorage([]);
      setLocalFilters({ ...initialFilters.filters }); // Reset to default

      if (setFilters) {
        setFilters({ ...initialFilters.filters });
      }

      if (setSearchType) {
        setSearchType("brand");
      }

      Cookies.set(COOKIE_NAME, JSON.stringify(initialFilters), { expires: 7 });
    }
  }, [checkedRows.size, initialFilters, setFilters, setSearchType, COOKIE_NAME]);


 const storedFilters = Cookies.get(COOKIE_NAME);

  // Monitor save status for error handling – show backend message in modal (like fast-order)
  useEffect(() => {
    if (!saveError) return;
    if (saveError?.state === "error" && saveError?.error && typeof saveError.error === "object") return;
    const message =
      saveError?.message ||
      saveError?.data?.message ||
      saveError?.response?.data?.message ||
      (typeof saveError === "string" ? saveError : null) ||
      "خطای ناشناخته رخ داده است";
    setErrorModalMessage(message);
    setShowErrorModal(true);
    dispatch(clearSaveFilterState());
  }, [saveError, dispatch]);


  return (
    <>
      <ErrorMessageModal
        opened={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorModalMessage("");
          dispatch(clearSaveFilterState());
        }}
        message={errorModalMessage}
      />

      <Paper 
        mt={{ base: "xs", md: "xs" }} 
        id="fastedit-search"
        p={isMobile ? "sm" : "md"}
        style={{ 
          overflow: 'hidden',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        {/* Header */}
        <Flex
          direction={isMobile ? "column" : "row"}
          justify={isMobile ? "flex-start" : "space-between"}
          align={isMobile ? "stretch" : "center"}
          gap={isMobile ? "" : "md"}
          mb={isTablet ? "sm" : ""}
        >
          <div>
            {/* <XTitle>ویرایش سریع</XTitle> */}
          </div>
          
          {/* Action Buttons */}
          <Flex 
            direction={isMobile ? "column" : "row"}
            gap={isMobile ? "xs" : "sm"}
            align={isMobile ? "stretch" : "center"}
          >
            <ShareModal 
              filters={updateFiltersAndStore().thisFilter} 
              isMobile={isMobile}
            />
          </Flex>
        </Flex>

        {/* Tabs */}
<Tabs 
  styles={{ 
    panel: { 
      marginTop: isMobile ? "15px" : "20px" 
    },
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
      transition: 'all 0.2s ease',
    }
  }} 
  variant="pills" 
  defaultValue="brand" 
  value={searchType} 
  onChange={setSearchType}
  orientation="horizontal"
>
  <Tabs.List grow={false} style={{ width: '100%', display: 'flex', gap: isMobile ? '8px' : '12px' }}>
    {/* ✅ Brand Tab - Inline styles based on active state */}
    <Tabs.Tab 
      value="brand" 
      style={{ 
        flex: '1 1 0', 
        minWidth: 0,
        border: '1px solid #093572',
        borderRadius: '6px',
        backgroundColor: searchType === 'brand' ? '#093572' : 'white',
        color: searchType === 'brand' ? 'white' : '#333',
      }}
    >
      {isMobile ? "برند" : "برند"}
    </Tabs.Tab>
    
    {/* Category Tab - same border color/px as fast-order */}
    <Tabs.Tab 
      value="category" 
      style={{ 
        flex: '1 1 0', 
        minWidth: 0,
        border: '1px solid #093572',
        borderRadius: '6px',
        backgroundColor: searchType === 'category' ? '#093572' : 'white',
        color: searchType === 'category' ? 'white' : '#333',
      }}
    >
      {isMobile ? "دسته‌بندی" : "دسته‌بندی"}
    </Tabs.Tab>
  </Tabs.List>
  
  {/* Panel for Brand Mode */}
  <Tabs.Panel value="brand">
    {searchType === "brand" && tableData && (
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
  
  {/* Panel for Category Mode */}
  <Tabs.Panel value="category">
    {searchType === "category" && tableData && (
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
    )}
  </Tabs.Panel>
</Tabs>

      </Paper>

            {/* Saved Filters Modal Component */}
      <SavedFiltersModalBrandMode
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
        onEditModeChange={onEditModeChange}
        savedFilters={savedFilters}
      />
    </>
  );
};

export default SearchComponentBrandFastEdit;