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
import { fetchFastEditBrandModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataActions";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { useMediaQuery } from "@mantine/hooks";
import { IconFilter } from '@tabler/icons-react';
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import isEqual from "lodash/isEqual";
import { useBrandRowSelection } from "./BrandRowSelectionContext";
import SavedFiltersModalBrandMode from "./savedfilters/brandmode/SavedFiltersModalBrand";

const SearchComponentBrand = ({ 
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

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Brand-specific context for Fast Edit
  const { 
    checkedRows, 
  } = useBrandRowSelection();

  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });
  
  const { tableData, loading } = useSelector(
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

  const [filterBrandStorage, setFilterBrandStorage] = useState(initialFilters.uniqueIDClickedBrands);
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(initialFilters.uniqueIDClickedBrandsCategories);
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(initialFilters.filterBrandsCategorySubCategoryStorage);
  
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  // filters in category mode
  const [filterCategoryStorage, setFilterCategoryStorage] = useState([]);
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState([]);
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState([]);

  const { setFilterValues } = useFastOrder();
  
  const { id } = useParams();

  // Refs for preventing duplicate API calls
  const lastFetchParams = useRef(null);
  const hasLoadedInitialFilters = useRef(false);

  // Helper functions to build filter arrays
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: filters || localFilters
    }];
  }, [searchType, filterBrandStorage, filterBrandsCategoryStorage, filterBrandsCategorySubCategoryStorage, filters, localFilters]);

  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'brand',
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
        filters: filter.filters || filters || localFilters
      }));
  }, [savedFilters, checkedRows, filters, localFilters]);

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

    thisFilter.filters = filters;
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
    filters, 
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    id,
    COOKIE_NAME
  ]);

  // Modified useEffect for checked rows - now uses array format
  useEffect(() => {
    if (checkedRows.size > 0) {
      const checkedFiltersArray = buildCheckedFiltersArray();
      if (checkedFiltersArray.length > 0) {
        dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
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
        dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
      }
    } else {
      // When no checkboxes are selected, fetch normal filtered data as array with filters
      const currentFiltersArray = buildCurrentFilterArray();
      dispatch(fetchFastEditBrandModeTableData(currentFiltersArray));
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

  // OPTIMIZED: Load saved filters only once when user is available
  useEffect(() => {
    if (user && !hasLoadedInitialFilters.current) {
      const slug = "brand-fast-edit";
      dispatch(getFilterSettings(slug));
      hasLoadedInitialFilters.current = true;
    }
  }, [dispatch, user]);

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

        setTimeout(() => {
          const filterArray = [{
            searchType: parsedFilters.searchType || 'brand',
            uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
            uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
            filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || [],
            filters: parsedFilters.filters || {}
          }];
          dispatch(fetchFastEditBrandModeTableData(filterArray));
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

  console.log("render SearchComponentBrand Fast Edit", filters);

  return (
    <>
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
              transition: 'all 0.2s ease',
              '&[data-active]': {
                backgroundColor: '#093572',
                color: 'white',
                borderColor: '#093572',
              },
              '&[data-active]:hover': {
                backgroundColor: '#0a4080',
              },
            }
          }} 
          variant="pills" 
          defaultValue="brand" 
          value={searchType} 
          onChange={setSearchType}
          orientation="horizontal"
        >
          <Tabs.List grow={false} style={{ width: '100%', display: 'flex', gap: isMobile ? '8px' : '12px' }}>
            {/* Tab 1 - Takes 1/2 of space */}
            <Tabs.Tab value="brand" style={{ flex: '1 1 0', minWidth: 0 }}>
              {isMobile ? "برند" : "برند"}
            </Tabs.Tab>
            
            {/* Tab 2 - Takes 1/2 of space */}
            <Tabs.Tab value="category" style={{ flex: '1 1 0', minWidth: 0 }}>
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
              />
            )}
          </Tabs.Panel>
        </Tabs>

      </Paper>
    </>
  );
};

export default SearchComponentBrand;