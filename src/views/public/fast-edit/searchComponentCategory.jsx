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
  Button,
  Flex,
} from "@mantine/core";
import qs from "qs";
import { useParams } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { fetchFastEditCategoryModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablecategorymode/fastEditTableCategoryModeDataActions";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "@mantine/hooks";
import { IconFilter } from '@tabler/icons-react';
import isEqual from "lodash/isEqual";
import { useCategoryRowSelection } from "./CategoryRowSelectionContext";
import SavedFiltersModalCategory from "./savedfilters/categorymode/SavedFiltersModalCategory";
import { useApiQuery } from "../../../Libs/reactQuery";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";

const SearchComponentCategory = ({
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
  filterCategoryStorage,
  setFilterCategoryStorage,
  filterCategorySubCategoryStorage,
  setFilterCategorySubCategoryStorage,
  filterCategorySubCategoryBrandsStorage,
  setFilterCategorySubCategoryBrandsStorage,
  savedFilters: savedFiltersProp,
}) => {

  const dispatch = useDispatch();
  
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { saveError } = useSelector((state) => state.saveFilterSettings || {});
  const savedFilters = savedFiltersProp ?? [];
  const { tableData: tableDataFromRedux, loading: loadingFromRedux } = useSelector((state) => state.fastEditCategoryModeData || {});

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Category-specific context for Fast Edit
  const { 
    checkedRows, 
  } = useCategoryRowSelection();

  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });

  const COOKIE_NAME = "search_filters_category_fast_edit";

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

  // filterCategoryStorage, filterCategorySubCategoryStorage, filterCategorySubCategoryBrandsStorage come from parent (fast-edit index) for cookie reload / restore-on-tab

  // Keep local filters state for UI - not sent to backend
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  const { setFilterValues } = useFastOrder();

  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);

  // Helper functions to build filter arrays (without filters property)
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedCategories: filterCategoryStorage,
      uniqueIDClickedSubCategories: filterCategorySubCategoryStorage,
      uniqueIDClickedSubCategoriesBrands: filterCategorySubCategoryBrandsStorage,
      // filters property removed
    }];
  }, [searchType, filterCategoryStorage, filterCategorySubCategoryStorage, filterCategorySubCategoryBrandsStorage]);

  const filterArray = useMemo(() => buildCurrentFilterArray(), [buildCurrentFilterArray]);
  const TABLE_STALE_MS = 5 * 60 * 1000; // 5 min - avoid refetch when switching tabs back
  const { data: tableDataFromQuery, isLoading: loadingFromQuery } = useApiQuery({
    endpoint: "/fast-edit-category-mode",
    queryKey: ["fast-edit-category-mode", JSON.stringify(filterArray)],
    method: "post",
    body: filterArray,
    strategy: "CACHED",
    enabled: checkedRows.size === 0 && filterArray?.length > 0,
    staleTime: TABLE_STALE_MS,
    queryOptions: { refetchOnMount: false, refetchOnWindowFocus: false },
  });
  const tableData = checkedRows.size === 0 ? (tableDataFromQuery ?? null) : tableDataFromRedux ?? null;
  const loading = checkedRows.size === 0 ? loadingFromQuery : loadingFromRedux;

  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'category',
        uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
        uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
        uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
        // filters property removed
      }));
  }, [savedFilters, checkedRows]);

  const updateFiltersAndStore = useCallback(() => {
    let thisFilter = {};
    // This component is only rendered when searchType === "category"
    thisFilter.searchType = "category";
    thisFilter.parent = category.parent;
    thisFilter.subCategory = category.subCategory;
    thisFilter.uniqueIDClickedCategories = filterCategoryStorage;
    thisFilter.uniqueIDClickedSubCategories = filterCategorySubCategoryStorage;
    thisFilter.uniqueIDClickedSubCategoriesBrands = filterCategorySubCategoryBrandsStorage;

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
    category,
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
      dispatch(fetchFastEditCategoryModeTableData(checkedFiltersArray));
    }
  }, [checkedRows, checkedRows.size, dispatch, buildCheckedFiltersArray]);

  // Saved filters come from parent (index) via useApiQuery - no dispatch here to avoid API calls on tab switch

  // Save to cookies whenever relevant state changes (includes filters for UI state)
  useEffect(() => {
    const dataToSave = {
      searchType: searchType,
      uniqueIDClickedCategories: filterCategoryStorage,
      uniqueIDClickedSubCategories: filterCategorySubCategoryStorage,
      uniqueIDClickedSubCategoriesBrands: filterCategorySubCategoryBrandsStorage,
      filters: localFilters, // Save for UI state, but won't be sent to backend
    };
    
    Cookies.set(COOKIE_NAME, JSON.stringify(dataToSave), { expires: 7 });
  }, [
    searchType, 
    filterCategoryStorage, 
    filterCategorySubCategoryStorage, 
    filterCategorySubCategoryBrandsStorage, 
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
      setNodesSubCategories(tableData?.products || []);
      setFilterValues(tableData?.filters || {});
      setAvailableLocations(tableData?.supplierLocations || []);
    }
  }, [tableData, setNodes, setNodesSubCategories, setFilterValues, setAvailableLocations]);

  // Clear filters when checkboxes are active - Modified to use array format (filters kept for UI)
  useEffect(() => {
    if (checkedRows.size > 0) {
      setFilterCategoryStorage([]);
      setFilterCategorySubCategoryStorage([]);
      setFilterCategorySubCategoryBrandsStorage([]);
      setLocalFilters({ ...initialFilters.filters }); // Reset to default

      if (setFilters) {
        setFilters({ ...initialFilters.filters });
      }

      if (setSearchType) {
        setSearchType("category");
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

        <LoadingOverlay 
          pos="fixed" 
          visible={loading} 
          zIndex={1000} 
          h="100%" 
        />

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
            {/* ✅ Brand Tab - Inline styles */}
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
          
          {/* Panel for Category Mode */}
          <Tabs.Panel value="category">
            {!loading && searchType === "category" && tableData && (
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
      <SavedFiltersModalCategory
        opened={filterSettingsModalOpened}
        onClose={() => setFilterSettingsModalOpened(false)}
        isMobile={isMobile}
        COOKIE_NAME={COOKIE_NAME}
        getInitialFilters={getInitialFilters}
        setFilterCategoryStorage={setFilterCategoryStorage}
        setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
        setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
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

export default SearchComponentCategory;