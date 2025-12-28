import { useState, useEffect, useCallback, useId, createContext, useContext, useMemo, useRef } from "react";
import React from "react";
import Cookies from "js-cookie";
import {
  Group,
  Paper,
  Button,
  Box,
  Flex,
  Modal,
  Stack,
  Checkbox,
  Text,
  Loader,
} from "@mantine/core";
import { IconEdit, IconSettings, IconFilter, IconBookmark } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useLocation, useNavigate } from "react-router";

// Import saved filters modals
import SavedFiltersModalBrandModeFastOrder from "./savedfilters/brandmode/SavedFiltersModalBrandModeFastOrder";
import SavedFiltersModalCategoryMode from "./savedfilters/categorymode/SavedFiltersModalCategoryModeFastOrder";

// Import other components
import XTitle from "../../../components/title";
import OrderRow, { Attributes } from "./orderRow";
import Filters from "./filtersBrandMode";
import SearchComponent from "./searchComponentBrand";
import ShareModal from "./shareModal";
import FastTable from "./fasttablebrand";
import FastTableCategory from "./fasttablecategory";
import FastTableBrand from "./fasttablebrand";
import { FilterProvider } from "./filterscontext";
import { useProduct } from "../product";
import FiltersBrandMode from "./filtersBrandMode";
import FiltersCategoryMode from "./filtersCategoryMode";
import SearchComponentCategory from "./searchComponentCategory";
import { FaRotate } from "react-icons/fa6";
import isEqual from "lodash/isEqual";

import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";

// Import Row Selection Contexts
import { RowSelectionProvider, useRowSelection } from "./RowSelectionContext";
import { BrandRowSelectionProvider } from "./BrandRowSelectionContext";
import { CategoryRowSelectionProvider } from "./CategoryRowSelectionContext";
import RotateModal from "../../../components/rotatemodal";
import SearchComponentBrandFastOrder from "./searchComponentBrand";

const FastOrderContext = createContext();

function FastOrder() {
  const dispatch = useDispatch();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    searchComponent: false,
    filtersComponent: false,
    tableComponent: false,
  });


  const [cookieUpdateTrigger, setCookieUpdateTrigger] = useState(0);

const handleCookieUpdate = useCallback(() => {
  // console.log('🔄 [FastOrder] Cookie update triggered - incrementing cookieUpdateTrigger');
  setCookieUpdateTrigger(prev => {
    const newValue = prev + 1;
    // console.log('🔄 [FastOrder] cookieUpdateTrigger updated:', prev, '->', newValue);
    return newValue;
  });
}, []);






  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings);

  const [filterName, setFilterName] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes] = useState(null);
  const [nodesSubCategoriesData, setNodesSubCategoriesData] = useState(null);

  const [availableLocations, setAvailableLocations] = useState(null);

  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [openedM, setOpenedM] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => setIsOpen((prev) => !prev);

  const [filterValues, setFilterValues] = useState({ colors: [], sellers: [] });
  const [searchType, setSearchType] = useState("brand");
  const [filterModalOpened, setFilterModalOpened] = useState(false);

  // ✅ NEW: Saved filters modal states
  const [savedFiltersModalOpened, setSavedFiltersModalOpened] = useState(false);

  // Brand mode cookies and filters
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_order";

  const getInitialFilters_brand_mode = () => {
    const storedFilters_brand_mode = Cookies.get(COOKIE_NAME_BRAND_MODE);
    if (storedFilters_brand_mode) {
      try {
        return JSON.parse(storedFilters_brand_mode);
      } catch (error) {}
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

  const initialFilters_brand_mode = getInitialFilters_brand_mode();
  const [filters_brand_mode, setFilters_brand_mode] = useState(initialFilters_brand_mode.filters);

  // ✅ NEW: Brand mode storage states
  const [filterBrandStorage, setFilterBrandStorage] = useState(
    initialFilters_brand_mode.uniqueIDClickedBrands || []
  );
  const [filterBrandsCategoryStorage, setFilterBrandsCategoryStorage] = useState(
    initialFilters_brand_mode.uniqueIDClickedBrandsCategories || []
  );
  const [filterBrandsCategorySubCategoryStorage, setFilterBrandsCategorySubCategoryStorage] = useState(
    initialFilters_brand_mode.filterBrandsCategorySubCategoryStorage || []
  );
  const [localFilters_brand, setLocalFilters_brand] = useState(initialFilters_brand_mode.filters);

  // Category mode cookies and filters
  const COOKIE_NAME_CATEGORY_MODE = "search_filters_category_fast_order";

  const getInitialFilters_category_mode = () => {
    const storedFilters_category_mode = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
    if (storedFilters_category_mode) {
      try {
        return JSON.parse(storedFilters_category_mode);
      } catch (error) {}
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

  const initialFilters_category_mode = getInitialFilters_category_mode();
  const [filters_category_mode, setFilters_category_mode] = useState(
    initialFilters_category_mode.filters
  );

  // ✅ NEW: Category mode storage states
  const [filterCategoryStorage, setFilterCategoryStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedCategories || []
  );
  const [filterCategorySubCategoryStorage, setFilterCategorySubCategoryStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedSubCategories || []
  );
  const [filterCategorySubCategoryBrandsStorage, setFilterCategorySubCategoryBrandsStorage] = useState(
    initialFilters_category_mode.uniqueIDClickedSubCategoriesBrands || []
  );
  const [localFilters_category, setLocalFilters_category] = useState(
    initialFilters_category_mode.filters
  );

  const [opened, setOpened] = useState(false);

  let priceFormatLabel = 'تومان';
  if (filters_brand_mode.priceFormat === "tooman") priceFormatLabel = "تومان";
  else if (filters_brand_mode.priceFormat === "hezar") priceFormatLabel = "هزار تومان";
  else priceFormatLabel = "میلیون تومان";

  // Table columns
  const COLUMNS = [
    { key: "image", label: "تصویر", width: "160px" },
    { key: "name", label: "نام کالا", width: "160px" },
    { key: "price", label: "قیمت", width: "160px" },
    { key: "attributes", label: "ویژگی ها", width: "60px" },
    { key: "stock", label: "موجودی", width: "160px" },
    { key: "minOrder", label: "حداقل سفارش", width: "120px" },
    { key: "maxOrder", label: "حداکثر سفارش", width: "120px" },
    { key: "seller", label: "تامین کننده", width: "120px" },
    { key: "deliveryTime", label: "زمان تحویل", width: "120px" },
    { key: "action", label: "عملیات", width: "120px" }
  ];

  const [modalOpen, setModalOpen] = useState(false);

  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings);

  const updatedColumns = COLUMNS;

  const handleSave = () => setOpened(false);

  const handleVisibleColumnsChange = (event, columnKey) => {
    const isChecked = event.target.checked;
    setVisibleColumns((prev) =>
      isChecked
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Staggered loading effect
  useEffect(() => {
    setLoadingStates(prev => ({ ...prev, searchComponent: true }));

    const timer1 = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, filtersComponent: true }));
    }, 2000);

    const timer2 = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, tableComponent: true }));
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const urlSearchType = pathSegments[2];
    
    if (urlSearchType === 'category' || urlSearchType === 'brand') {
      setSearchType(urlSearchType);
    }
  }, [location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const supplierId = params.get("supplierid");
    const supplierName = params.get("suppliername");

    if (supplierId && supplierName) {
      setFilters_brand_mode((prevFilters) => ({
        ...prevFilters,
        supplier: supplierId,
      }));
    }

    if (supplierId && supplierName) {
      setFilters_category_mode((prevFilters) => ({
        ...prevFilters,
        supplier: supplierId,
      }));
    }
  }, [location, searchType]);

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
  
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Load saved filters on component mount
  useEffect(() => {
    const slug = searchType === "brand" ? "brand-fast-order" : "category-fast-order";
    dispatch(getFilterSettings(slug));
  }, [searchType, dispatch]);

  useEffect(() => {
    if (saveStatus && saveStatus?.state === "ok") {
      notifications.show({
        title: saveStatus.message,
        color: "green",
        autoClose: true
      });
    }
    if (saveStatus && saveStatus?.state === "error") {
      notifications.show({
        title: saveStatus.message,
        color: "red",
        autoClose: true
      });
    }
  }, [saveStatus]);

  // ✅ This should already exist around line 200-220
// FIND this useEffect (around line 200-220) and REPLACE it:
useEffect(() => {
  // console.log('🔄 [FastOrder] Cookie reload effect triggered', { cookieUpdateTrigger });
  
  const storedFilters = Cookies.get(COOKIE_NAME_BRAND_MODE);
  if (storedFilters) {
    try {
      const parsed = JSON.parse(storedFilters);
      // console.log('📦 [FastOrder] Loaded from cookie:', parsed);
      
      setFilterBrandStorage(parsed.uniqueIDClickedBrands || []);
      setFilterBrandsCategoryStorage(parsed.uniqueIDClickedBrandsCategories || []);
      setFilterBrandsCategorySubCategoryStorage(parsed.filterBrandsCategorySubCategoryStorage || []);
      setLocalFilters_brand(parsed.filters || initialFilters_brand_mode.filters);
      setFilters_brand_mode(parsed.filters || initialFilters_brand_mode.filters);
      
      // console.log('✅ [FastOrder] State updated from cookie');
    } catch (error) {
      console.error('❌ [FastOrder] Error loading cookies:', error);
    }
  }
}, [cookieUpdateTrigger, COOKIE_NAME_BRAND_MODE]); // ✅ Add cookieUpdateTrigger dependency















  useEffect(() => {
    if (
      saveError && 
      Number(saveError.status) !== 400 
      && Number(saveError.status) !== 401 
      && Number(saveError.status) !== 403
      && Number(saveError.status) !== 404
      && Number(saveError.status) !== 405
      && Number(saveError.status) !== 408
      && Number(saveError.status) !== 409
      && Number(saveError.status) !== 410
      && Number(saveError.status) !== 411
      && Number(saveError.status) !== 412
      && Number(saveError.status) !== 413
      && Number(saveError.status) !== 414
      && Number(saveError.status) !== 415
      && Number(saveError.status) !== 416
      && Number(saveError.status) !== 417
      && Number(saveError.status) !== 422   
      && Number(saveError.status) !== 429
    ) {
      notifications.show({
        title: saveError.message,
        color: "red",
        autoClose: true
      });
    }
  }, [saveError]);
  
  useEffect(() => {
    if (saveError?.status === 401) {
      setModalOpen(true);
      setTimeout(() => {
        setModalOpen(false);
        dispatch(clearSaveFilterState());
        navigate("/");
      }, 4000);
    }

    if (saveError?.status === 403) {
      setModalOpen(true);
      setTimeout(() => {
        dispatch(clearSaveFilterState());
        setModalOpen(false);
      }, 4000);
    }
  }, [saveError, dispatch, navigate]);

  useEffect(() => {
    if (saveError?.status) {
      handleKnownErrors(saveError.status, setModalOpen, navigate);
    }
  }, [saveError, saveStatus]);

  const form = useForm({
    initialValues: {
      inputBox: "",
    },
    validate: {
      title: (value) => (value.trim() ? null : "نام الزامی است"),
    },
  });

  const [isFixed, setIsFixed] = useState(false);
  const componentRef = useRef(null);
  const containerRef = useRef(null);
  const lastScrollY = useRef(0);
  const originalTop = useRef(0);
  const [containerWidth, setContainerWidth] = useState('100%');
  const [containerLeft, setContainerLeft] = useState(0);
  const isManualFilterUpdate = useRef(false); // ✅ ADD THIS LINE FOR CATEGORY MODE

  useEffect(() => {
    if (componentRef.current) {
      originalTop.current = componentRef.current.offsetTop;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY.current) {
        if (currentScrollY > originalTop.current) {
          setIsFixed(true);
        } else {
          setIsFixed(false);
        }
      } else {
        setIsFixed(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update container width and left position
  useEffect(() => {
    const updateContainerDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(`${rect.width}px`);
        setContainerLeft(rect.left);
      }
    };

    updateContainerDimensions();
    window.addEventListener("resize", updateContainerDimensions);
    window.addEventListener("scroll", updateContainerDimensions);
    return () => {
      window.removeEventListener("resize", updateContainerDimensions);
      window.removeEventListener("scroll", updateContainerDimensions);
    };
  }, []);

  const LoadingPlaceholder = ({ height = "200px" }) => (
    <Box
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height,
        backgroundColor: "#f8f9fa",
        border: "1px dashed #dee2e6",
        borderRadius: "8px",
      }}
    >
      <Loader size="lg" />
    </Box>
  );

  // ✅ Check screen size for modal responsiveness
  const isMobile = window.innerWidth < 768;

  return (
    <>
      <Box ref={containerRef} style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        <RowSelectionProvider>
          {/* ✅ Wrap brand mode in BrandRowSelectionProvider */}
          {searchType === "brand" ? (
            <BrandRowSelectionProvider>
              <FastOrderContext.Provider 
                value={{
                  visibleColumns, 
                  setVisibleColumns, 
                  filters_brand_mode, 
                  filterValues, 
                  setFilters_brand_mode, 
                  setFilterValues, 
                  searchType,
                  opened,
                  setOpened,
                  handleVisibleColumnsChange,
                  updatedColumns: COLUMNS
                }}
              >
                <FilterProvider>

                  {loadingStates.searchComponent ? (
                    <div>
                      <SearchComponentBrandFastOrder
                        filters={filters_brand_mode} 
                        setFilters={setFilters_brand_mode}
                        setNodesSubCategories={setNodesSubCategoriesData} 
                        setNodes={setNodes} 
                        setAvailableLocations={setAvailableLocations}
                        searchType={searchType} 
                        setSearchType={setSearchType}
                        cookieUpdateTrigger={cookieUpdateTrigger} 
                        // ✅ ADD THESE PROPS:
                        filterBrandStorage={filterBrandStorage}
                        setFilterBrandStorage={setFilterBrandStorage}
                        filterBrandsCategoryStorage={filterBrandsCategoryStorage}
                        setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                        filterBrandsCategorySubCategoryStorage={filterBrandsCategorySubCategoryStorage}
                        setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                        localFilters={localFilters_brand}
                        setLocalFilters={setLocalFilters_brand}
                        onCookieUpdate={handleCookieUpdate} 
                      />
                    </div>
                  ) : (
                    <LoadingPlaceholder height="120px" />
                  )}

                  <Group>
                    {loadingStates.filtersComponent ? (
                      <div
                        ref={componentRef}
                        style={{
                          position: isFixed ? "fixed" : "static",
                          top: isFixed ? 0 : "auto",
                          left: isFixed ? containerLeft : "auto",
                          width: isFixed ? containerWidth : "100%",
                          zIndex: 999,
                          background: isFixed ? "white" : "transparent",
                          boxShadow: isFixed ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FiltersBrandMode
                          setFilters={setFilters_brand_mode}
                          nodes={nodes}
                          setNodesSubCategories={setNodesSubCategoriesData}
                          setNodes={setNodes}
                          filters={filters_brand_mode}
                          searchType={searchType}
                          setSearchType={setSearchType}
                          COOKIE_NAME={COOKIE_NAME_BRAND_MODE}
                          getInitialFilters={getInitialFilters_brand_mode}
                          setFilterBrandStorage={setFilterBrandStorage}
                          setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                          setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                          setLocalFilters={setLocalFilters_brand}
                          localFilters={localFilters_brand}
                          onCookieUpdate={handleCookieUpdate}
                          
                        />
                      </div>
                    ) : (
                      <LoadingPlaceholder height="80px" />
                    )}
                  </Group>

                  {loadingStates.tableComponent ? (
                    <>

                      {/* ✅ Saved filters modal - already inside BrandRowSelectionProvider */}
                          {/* <SavedFiltersModalBrandModeFastOrder
                            opened={savedFiltersModalOpened}
                            onClose={() => setSavedFiltersModalOpened(false)}
                            isMobile={isMobile}
                            COOKIE_NAME={COOKIE_NAME_BRAND_MODE}
                            getInitialFilters={getInitialFilters_brand_mode}
                            // ✅ These should already be there:
                            setFilterBrandStorage={setFilterBrandStorage}
                            setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
                            setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
                            setLocalFilters={setLocalFilters_brand}
                            setFilters={setFilters_brand_mode}
                            setSearchType={setSearchType}
                            filters={filters_brand_mode}
                            localFilters={localFilters_brand}
                            onCookieUpdate={handleCookieUpdate}
                          /> */}

                      {nodes !== null && nodes?.length > 0 && (
                        <>
                          <FastTableBrand 
                            type="head" 
                            isPortrait={isPortrait} 
                            isLandscape={isLandscape} 
                            filters_brand_mode={filters_brand_mode} 
                            filterValues={filterValues} 
                            availableLocations={availableLocations} 
                            COLUMNS={updatedColumns} 
                            nodes={nodes[0]?.items?.slice(0, 1) || []} 
                            setVisibleColumns={setVisibleColumns} 
                            visibleColumns={visibleColumns} 
                          />
                          {nodes.map((item, index) => (
                            <React.Fragment key={index}>
                              <Flex h={40} align="center" justify="center" bg="#e5e7eb">
                                <Text size="16px" fw={600} c="dark">
                                  {item.label}
                                </Text>
                              </Flex>
                              <FastTableBrand 
                                keyIndex={index} 
                                isPortrait={isPortrait} 
                                isLandscape={isLandscape} 
                                filters_brand_mode={filters_brand_mode} 
                                filterValues={filterValues} 
                                setNodes={setNodes} 
                                availableLocations={availableLocations}  
                                type="data" 
                                COLUMNS={updatedColumns} 
                                nodes={item.items || []} 
                                setVisibleColumns={setVisibleColumns} 
                                visibleColumns={visibleColumns} 
                              />
                            </React.Fragment>
                          ))}
                        </>
                      )}
                    </>
                  ) : (
                    <LoadingPlaceholder height="300px" />
                  )}

                  {/* ✅ Modal moved to context but kept here */}
                  <Modal
                    opened={opened}
                    onClose={() => setOpened(false)}
                    title="نمایش دادن ستون‌ها"
                    zIndex={1100}
                  >
                    <Stack>
                      {updatedColumns.map((column) => (
                        <Checkbox
                          key={column.key}
                          label={column.label}
                          checked={!visibleColumns.includes(column.key)}
                          onChange={(event) => handleVisibleColumnsChange(event, column.key)}
                        />
                      ))}
                    </Stack>
                  </Modal>

                </FilterProvider>
              </FastOrderContext.Provider>
            </BrandRowSelectionProvider>
          ) : (
            /* ✅ Wrap category mode in CategoryRowSelectionProvider */
            <CategoryRowSelectionProvider>
              <FastOrderContext.Provider 
                value={{
                  visibleColumns, 
                  setVisibleColumns, 
                  filters_brand_mode, 
                  filterValues, 
                  setFilters_brand_mode, 
                  setFilterValues, 
                  searchType,
                  opened,
                  setOpened,
                  handleVisibleColumnsChange,
                  updatedColumns: COLUMNS
                }}
              >
                <FilterProvider>

                  {loadingStates.searchComponent ? (
                    <div>
                    <SearchComponentCategory 
                      filters={filters_category_mode} 
                      setFilters={setFilters_category_mode}
                      setNodesSubCategories={setNodesSubCategoriesData} 
                      setNodes={setNodes} 
                      setAvailableLocations={setAvailableLocations}
                      searchType={searchType} 
                      setSearchType={setSearchType}
                      cookieUpdateTrigger={cookieUpdateTrigger}
                      onCookieUpdate={handleCookieUpdate}  // ✅ VERIFY THIS LINE EXISTS
                      filterCategoryStorage={filterCategoryStorage}
                      setFilterCategoryStorage={setFilterCategoryStorage}
                      filterCategorySubCategoryStorage={filterCategorySubCategoryStorage}
                      setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                      filterCategorySubCategoryBrandsStorage={filterCategorySubCategoryBrandsStorage}
                      setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                      localFilters={localFilters_category}
                      setLocalFilters={setLocalFilters_category}
                    />
                    </div>
                  ) : (
                    <LoadingPlaceholder height="120px" />
                  )}

                  <Group>
                    {loadingStates.filtersComponent ? (
                      <div
                        ref={componentRef}
                        style={{
                          position: isFixed ? "fixed" : "static",
                          top: isFixed ? 0 : "auto",
                          left: isFixed ? containerLeft : "auto",
                          width: isFixed ? containerWidth : "100%",
                          zIndex: 999,
                          background: isFixed ? "white" : "transparent",
                          boxShadow: isFixed ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FiltersCategoryMode
                          setFilters={setFilters_category_mode}
                          nodes={nodes}
                          setNodesSubCategories={setNodesSubCategoriesData}
                          setNodes={setNodes}
                          filters={filters_category_mode}
                          searchType={searchType}
                          setSearchType={setSearchType}
                          COOKIE_NAME={COOKIE_NAME_CATEGORY_MODE}
                          getInitialFilters={getInitialFilters_category_mode}
                          setFilterCategoryStorage={setFilterCategoryStorage}
                          setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                          setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                          setLocalFilters={setLocalFilters_category}
                          localFilters={localFilters_category}
                          onCookieUpdate={handleCookieUpdate}
                        />
                      </div>
                    ) : (
                      <LoadingPlaceholder height="80px" />
                    )}
                  </Group>

                  {loadingStates.tableComponent ? (
                    <>
                      {/* ✅ REMOVED: Column settings button group */}

                      {/* ✅ Saved filters modal - already inside CategoryRowSelectionProvider */}
                      {/* <SavedFiltersModalCategoryMode
                        opened={savedFiltersModalOpened}
                        onClose={() => setSavedFiltersModalOpened(false)}
                        isMobile={isMobile}
                        COOKIE_NAME={COOKIE_NAME_CATEGORY_MODE}
                        getInitialFilters={getInitialFilters_category_mode}
                        setFilterCategoryStorage={setFilterCategoryStorage}
                        setFilterCategorySubCategoryStorage={setFilterCategorySubCategoryStorage}
                        setFilterCategorySubCategoryBrandsStorage={setFilterCategorySubCategoryBrandsStorage}
                        setLocalFilters={setLocalFilters_category}
                        setFilters={setFilters_category_mode}
                        setSearchType={setSearchType}
                        filters={filters_category_mode}
                        onCookieUpdate={handleCookieUpdate}  // ✅ ADD THIS LINE
                        localFilters={localFilters_category}
                          isManualFilterUpdateRef={isManualFilterUpdate}  // ✅ ADD THIS LINE - pass the ref

                      /> */}

                      {nodesSubCategoriesData !== null && nodesSubCategoriesData?.length > 0 && (
                        <Paper p={0} className="overflow-hidden" bg="white" id="tables">
                          <FastTableCategory 
                            type="head" 
                            isPortrait={isPortrait} 
                            isLandscape={isLandscape} 
                            filters_category_mode={filters_category_mode} 
                            filterValues={filterValues} 
                            availableLocations={availableLocations} 
                            COLUMNS={updatedColumns} 
                            nodes={nodesSubCategoriesData[0]?.items?.slice(0, 1) || []} 
                            setVisibleColumns={setVisibleColumns} 
                            visibleColumns={visibleColumns} 
                          />
                          {nodesSubCategoriesData?.map((item, index) => (
                            <React.Fragment key={index}>
                              <Flex h={40} align="center" justify="center" bg="#e5e7eb">
                                <Text size="16px" fw={600} c="dark">
                                  {item.label}
                                </Text>
                              </Flex>
                              <FastTableCategory 
                                isPortrait={isPortrait} 
                                isLandscape={isLandscape} 
                                filters_category_mode={filters_category_mode} 
                                filterValues={filterValues} 
                                keyIndex={index} 
                                availableLocations={availableLocations}  
                                setNodes={setNodesSubCategoriesData} 
                                type="data" 
                                COLUMNS={updatedColumns} 
                                nodes={item.items || []} 
                                setVisibleColumns={setVisibleColumns} 
                                visibleColumns={visibleColumns} 
                              />
                            </React.Fragment>
                          ))}
                        </Paper>
                      )}
                    </>
                  ) : (
                    <LoadingPlaceholder height="300px" />
                  )}

                  {/* ✅ Modal moved to context but kept here */}
                  <Modal
                    opened={opened}
                    onClose={() => setOpened(false)}
                    title="نمایش دادن ستون‌ها"
                    zIndex={1100}
                  >
                    <Stack>
                      {updatedColumns.map((column) => (
                        <Checkbox
                          key={column.key}
                          label={column.label}
                          checked={!visibleColumns.includes(column.key)}
                          onChange={(event) => handleVisibleColumnsChange(event, column.key)}
                        />
                      ))}
                    </Stack>
                  </Modal>

                </FilterProvider>
              </FastOrderContext.Provider>
            </CategoryRowSelectionProvider>
          )}
        </RowSelectionProvider>
      </Box>
    </>
  );
}

export const useFastOrder = () => useContext(FastOrderContext);

export default FastOrder;