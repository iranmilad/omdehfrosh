import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Text
} from "@mantine/core";
import qs from "qs";
import { useParams } from "react-router";
import { useFastOrder } from ".";
import ShareModal from "./shareModal";
import XTitle from "../../../components/title";
import { fetchFastEditCategoryModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablecategorymode/fastEditTableCategoryModeDataActions";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "@mantine/hooks";


const SearchComponentCategory = ({ searchType, setSearchType, setAvailableLocations, filters, setFilters, setNodes, setNodesSubCategories }) => {

  const dispatch = useDispatch();
  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const [brands, setBrands] = useState({ parent: [], clickedBrands: [], categories: [] });
  const [category, setCategory] = useState({ parent: [], clickedCategories: [], subCategory: [], brands: [] });

  const { tableData, loading } = useSelector((state) => state.fastEditCategoryModeData);

  const COOKIE_NAME = "search_filters_category_fast_edit";

  const getInitialFilters = () => {
    const storedFilters = Cookies.get(COOKIE_NAME);
    if (storedFilters) {
      try {
        return JSON.parse(storedFilters);
      } catch (error) {
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
  };

  const initialFilters = getInitialFilters();

  const [filterBrandStorage, setFilterBrandStorage] = useState(initialFilters.uniqueIDClickedBrands);
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(initialFilters.uniqueIDClickedBrandsCategories);
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(initialFilters.filterBrandsCategorySubCategoryStorage);
  
  const [localFilters, setLocalFilters] = useState(initialFilters.filters);

  // filters in category mode
  const [filterCategoryStorage, setFilterCategoryStorage] = useState(initialFilters.uniqueIDClickedCategories);
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState(initialFilters.uniqueIDClickedSubCategories);
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState(initialFilters.uniqueIDClickedSubCategoriesBrands);

  const { setFilterValues } = useFastOrder();
  
  const url = "/fastorder";
  const { id } = useParams();

  // ✅ This effect updates the cookie whenever filters change (like in brand mode)
  useEffect(() => {
    Cookies.set(COOKIE_NAME, JSON.stringify({
      searchType: searchType,
      uniqueIDClickedCategories: filterCategoryStorage,
      uniqueIDClickedSubCategories: filterCategorySubCategoryStorage,
      uniqueIDClickedSubCategoriesBrands: filterCategorySubCategoryBrandsStorage,
      filters: filters, // ✅ Use the actual filters prop instead of localFilters
    }), { expires: 7 });
  }, [
    searchType, 
    filterCategoryStorage, 
    filterCategorySubCategoryStorage, 
    filterCategorySubCategoryBrandsStorage, 
    filters // ✅ Add filters as dependency
  ]);
  
  useEffect(() => {
    const storedFilters = Cookies.get(COOKIE_NAME);
  
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);

        setFilterCategoryStorage(parsedFilters.uniqueIDClickedCategories || []);
        setFilterCategorySubCategoryStorage(parsedFilters.uniqueIDClickedSubCategories || []);
        setFilterCategorySubCategoryBrandsStorage(parsedFilters.uniqueIDClickedSubCategoriesBrands || []);

        setLocalFilters(parsedFilters.filters || {});
        setFilters(parsedFilters.filters || {});  

        setSearchType(parsedFilters.searchType || "category");
      } catch (error) {
      }
    } else {
    }
  }, []);

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

    thisFilter.filters = filters; // ✅ Use the actual filters prop
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
    filters, // ✅ Use filters instead of localFilters
    filterBrandStorage, 
    filterBrandsCategoryStorage, 
    filterBrandsCategorySubCategoryStorage,
    filterCategoryStorage,
    filterCategorySubCategoryStorage,
    filterCategorySubCategoryBrandsStorage,
    id
  ]);

  const queryKey = updateFiltersAndStore().query;

  console.log("filters", filters)

  useEffect(() => {
    dispatch(fetchFastEditCategoryModeTableData({
      searchType,
      uniqueIDClickedCategories: updateFiltersAndStore().thisFilter.uniqueIDClickedCategories,
      uniqueIDClickedSubCategories: updateFiltersAndStore().thisFilter.uniqueIDClickedSubCategories,
      uniqueIDClickedSubCategoriesBrands: updateFiltersAndStore().thisFilter.uniqueIDClickedSubCategoriesBrands
    }));
  }, [
    dispatch, 
    searchType,
    updateFiltersAndStore().thisFilter.uniqueIDClickedCategories,
    updateFiltersAndStore().thisFilter.uniqueIDClickedSubCategories,
    updateFiltersAndStore().thisFilter.uniqueIDClickedSubCategoriesBrands,
    filterCategoryStorage
  ]);

  useEffect(() => {
    if (tableData) {
      setNodes(tableData?.products || []);
      setNodesSubCategories(tableData?.products || []);
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
            <XTitle>ویرایش سریع</XTitle>
          </div>
          <div className="flex">
            <ShareModal filters={updateFiltersAndStore().thisFilter} />
          </div>
        </div>

        <Tabs styles={{ panel: { marginTop: "20px" } }} variant="pills" defaultValue="brand" value={searchType} onChange={setSearchType}>
          <Tabs.List>
            <Tabs.Tab value="brand">جستجو بر اساس برند</Tabs.Tab>
            <Tabs.Tab value="category">جستجو بر اساس دسته بندی</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="category">
            {searchType === "category" && (
              loading ? (
                <Center>
                  <Loader />
                </Center>
              ) : (
                tableData?.category ? (
                  <SlideCategory
                    tab={category}
                    items={tableData.category}
                    searchType={searchType}
                    click={setCategory}
                    filterCategoryStorage={filterCategoryStorage}
                    setFilterCategoryStorage={setFilterCategoryStorage}
                    filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
                    setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                    filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
                    setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                  />
                ) : (
                  <Center>
                    <Text>No categories available</Text>
                  </Center>
                )
              )
            )}
          </Tabs.Panel>
        </Tabs>

      </Paper>
    </>
  );
};

export default SearchComponentCategory;