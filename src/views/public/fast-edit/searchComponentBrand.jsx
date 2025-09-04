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
  Tabs 
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


const SearchComponentBrand = ({ searchType, setSearchType, setAvailableLocations, filters, setFilters, setNodes, setNodesSubCategories }) => {
  
  const dispatch = useDispatch();

  // const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });
  
  
  const { tableData, loading } = useSelector(
    (state) => state.fastEditBrandModeData || {} // Ensure it's never undefined
  );
  

  const COOKIE_NAME = "search_filters_brand_fast_edit";


  const getInitialFilters = () => {
    const storedFilters = Cookies.get(COOKIE_NAME);
    if (storedFilters) {
      try {
        return JSON.parse(storedFilters);
      } catch (error) {
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
  };

  const initialFilters = getInitialFilters();

  const [filterBrandStorage, setFilterBrandStorage] = useState(initialFilters.uniqueIDClickedBrands);
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(initialFilters.uniqueIDClickedBrandsCategories);
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(initialFilters.filterBrandsCategorySubCategoryStorage);
  
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  // filters in category mode
  const [filterCategoryStorage, setFilterCategoryStorage] = useState([]);
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState([]);
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState([]);

  const { setFilterValues } = useFastOrder();
  
  const url = "/fastorder";
  const { id } = useParams();


  useEffect(() => {

    Cookies.set(COOKIE_NAME, JSON.stringify({
      searchType: searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: localFilters,

    }), { expires: 7 });
  }, [
    searchType, 
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage, 
    filters, 
    localFilters
  ]);
  
  
  useEffect(() => {
    const storedFilters = Cookies.get(COOKIE_NAME);
  
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);

        setFilterBrandStorage(parsedFilters.uniqueIDClickedBrands || []);
        setFilterBrandsCategoryStorage(parsedFilters.uniqueIDClickedBrandsCategories || []);
        setFilterBrandsCategorySubCategoryStorage(parsedFilters.filterBrandsCategorySubCategoryStorage || []);

        setLocalFilters(parsedFilters.filters || {});
        setFilters(parsedFilters.filters || {});  

        setSearchType(parsedFilters.searchType || "brand");
      } catch (error) {
      }
    } else {
    }
  }, []);

  
  const updateFiltersAndStore = useCallback(() => {
    let thisFilter = {};

    if (searchType === "brand") {
      
      // thisFilter.filters = filters;
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

    // ✅ Store in cookie (valid for 7 days)
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
    id
  ]);

  const queryKey = updateFiltersAndStore().query;



  useEffect(() => {

    // if(user?.id) {

      dispatch(fetchFastEditBrandModeTableData({
        searchType,
        // supplierId: user?.id,
        uniqueIDClickedBrands: updateFiltersAndStore().thisFilter.uniqueIDClickedBrands,
        uniqueIDClickedBrandsCategories: updateFiltersAndStore().thisFilter.uniqueIDClickedBrandsCategories,
        filterBrandsCategorySubCategoryStorage: updateFiltersAndStore().thisFilter.filterBrandsCategorySubCategoryStorage
      }));
      
    // }

  }, [
    dispatch, 
    // user?.id,
    updateFiltersAndStore().thisFilter.uniqueIDClickedBrands,
    updateFiltersAndStore().thisFilter.uniqueIDClickedBrandsCategories,
    updateFiltersAndStore().thisFilter.filterBrandsCategorySubCategoryStorage,
    filterBrandStorage
  ]); // Only trigger when parent brands change
  


  useEffect(() => {
    if (tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.subCategoriesData || []);
      setFilterValues(tableData?.filters || {});
      setAvailableLocations(tableData?.supplierLocations || [])
    }
  }, [tableData, filterBrandStorage]); 


    const isMobile = useMediaQuery("(max-width: 768px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");


  return (
    <>
      <Paper mt={{ base: "xs", md: "xs" }} mb={isTablet ? "sm" : ""} id="fastorder-search">

        <div className="flex flex-row justify-between mb-4">
          <div className="flex">
            <XTitle>سفارش سریع</XTitle>
          </div>
          <div className="flex">
            <ShareModal filters={updateFiltersAndStore().thisFilter} />
          </div>
        </div>

        <LoadingOverlay pos="fixed" visible={loading} zIndex={1000} h="100%" />

        <Tabs styles={{ panel: { marginTop: "20px" } }} variant="pills" defaultValue="brand" value={searchType} onChange={setSearchType}>
          <Tabs.List>
            <Tabs.Tab value="brand">جستجو بر اساس برند</Tabs.Tab>
            <Tabs.Tab value="category">جستجو بر اساس دسته بندی</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="brand">
            {searchType === "brand" ? (
              tableData ? 
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
              /> : null
            ) : null}
          </Tabs.Panel>
        </Tabs>

      </Paper>
    </>
  );
};

export default SearchComponentBrand;
