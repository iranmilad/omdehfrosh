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
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import isEqual from "lodash/isEqual";
import { useCategoryRowSelection } from "./CategoryRowSelectionContext";
import SavedFiltersModalCategory from "./savedfilters/categorymode/SavedFiltersModalCategory";

const SearchComponentCategory = ({ 
  searchType, 
  setSearchType, 
  setAvailableLocations, 
  filters, 
  setFilters, 
  setNodes, 
  setNodesSubCategories,
  filterSettingsModalOpened,
  setFilterSettingsModalOpened 
}) => {

  const dispatch = useDispatch();
  
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { savedFilters } = useSelector((state) => state.getFilterSettings || {});
  const { tableData, loading } = useSelector((state) => state.fastEditCategoryModeData || {});

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

  const [filterBrandStorage, setFilterBrandStorage] = useState(initialFilters.uniqueIDClickedBrands);
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(initialFilters.uniqueIDClickedBrandsCategories);
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(initialFilters.filterBrandsCategorySubCategoryStorage);
  
  // Keep local filters state for UI - not sent to backend
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  // filters in category mode
  const [filterCategoryStorage, setFilterCategoryStorage] = useState(initialFilters.uniqueIDClickedCategories);
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState(initialFilters.uniqueIDClickedSubCategories);
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState(initialFilters.uniqueIDClickedSubCategoriesBrands);

  const { setFilterValues } = useFastOrder();
  
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);
  const hasLoadedInitialFilters = useRef(false);

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

  // Modified useEffect for checked rows - now uses array format (without filters)
  useEffect(() => {
    if (checkedRows.size > 0) {
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastEditCategoryModeTableData(checkedFiltersArray));
      }
    }
  }, [checkedRows, dispatch, buildCheckedFiltersArray]);

  // OPTIMIZED: Combined data fetching effect with duplicate prevention - Modified to use array format (without filters)
  useEffect(() => {
    const currentParams = {
      searchType,
      filterCategoryStorage,
      filterCategorySubCategoryStorage,
      filterCategorySubCategoryBrandsStorage,
      checkedRowsSize: checkedRows.size,
      checkedRowIds: Array.from(checkedRows).sort().join(','),
      hasCheckedRows: checkedRows.size > 0,
      // filters removed
    };

    // Skip if parameters haven't changed
    if (isEqual(lastFetchParams.current, currentParams)) {
      return;
    }

    lastFetchParams.current = currentParams;

    // Always make an API request when there are changes
    if (checkedRows.size > 0) {
      // When checkboxes are selected, fetch data based on checked rows (without filters)
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastEditCategoryModeTableData(checkedFiltersArray));
      }
    } else {
      // When no checkboxes are selected, fetch normal filtered data as array (without filters)
      const currentFiltersArray = buildCurrentFilterArray();
      dispatch(fetchFastEditCategoryModeTableData(currentFiltersArray));
    }
  }, [
    dispatch, 
    searchType,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    checkedRows,
    checkedRows.size,
    // filters removed
    buildCheckedFiltersArray,
    buildCurrentFilterArray
  ]);

  // OPTIMIZED: Load saved filters only once when user is available
  useEffect(() => {
    if (user && !hasLoadedInitialFilters.current) {
      const slug = "category-fast-edit";
      dispatch(getFilterSettings(slug));
      hasLoadedInitialFilters.current = true;
    }
  }, [dispatch, user]);

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

  // Load filters from cookies on component mount - Modified to use array format (without filters)
  useEffect(() => {
    const storedFilters = Cookies.get(COOKIE_NAME);

    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);

        setFilterCategoryStorage(parsedFilters.uniqueIDClickedCategories || []);
        setFilterCategorySubCategoryStorage(parsedFilters.uniqueIDClickedSubCategories || []);
        setFilterCategorySubCategoryBrandsStorage(parsedFilters.uniqueIDClickedSubCategoriesBrands || []);
        setLocalFilters(parsedFilters.filters || initialFilters.filters); // Restore local filters
        
        // Sync filters with parent component
        if (setFilters) {
          setFilters(parsedFilters.filters || initialFilters.filters);
        }
        
        if (setSearchType && parsedFilters.searchType) {
          setSearchType(parsedFilters.searchType);
        }

        setTimeout(() => {
          const filterArray = [{
            searchType: parsedFilters.searchType || 'category',
            uniqueIDClickedCategories: parsedFilters.uniqueIDClickedCategories || [],
            uniqueIDClickedSubCategories: parsedFilters.uniqueIDClickedSubCategories || [],
            uniqueIDClickedSubCategoriesBrands: parsedFilters.uniqueIDClickedSubCategoriesBrands || [],
            // filters removed
          }];
          dispatch(fetchFastEditCategoryModeTableData(filterArray));
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

  // console.log("render SearchComponentCategory Fast Edit", tableData);

  return (
    <>
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
      />

      <Paper 
        mt={{ base: "xs", md: "xs" }} 
        id="fastedit-search"
        p={isMobile ? "sm" : "md"}
        style={{ 
          overflow: 'hidden'
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
                border: searchType === 'brand' ? '1px solid #093572' : '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: searchType === 'brand' ? '#093572' : 'white',
                color: searchType === 'brand' ? 'white' : '#333',
              }}
            >
              {isMobile ? "برند" : "برند"}
            </Tabs.Tab>
            
            {/* ✅ Category Tab - Inline styles */}
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
    </>
  );
};

export default SearchComponentCategory;