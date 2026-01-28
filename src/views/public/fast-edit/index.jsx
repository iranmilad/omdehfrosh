// FastEdit.jsx - Complete file with currency price feature and bulk price update added
import { useState, useEffect, useCallback, useId, createContext, useContext, useMemo, useRef } from "react";
import XTitle from "../../../components/title";
import OrderRow, { Attributes } from "./orderRow";
import Filters from "./filtersBrandMode";
import SearchComponent from "./searchComponentBrand";
import React from "react";
import "./style.css";
import ShareModal from "./shareModal";
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
  LoadingOverlay,
  Center,
  Loader,
  Overlay,
  Badge,
} from "@mantine/core";
import { IconColumns, IconFilter, IconCurrencyDollar, IconPercentage } from "@tabler/icons-react";
import FastTable from "./fasttablebrand";
import FastTableCategory from "./fasttablecategory";
import FastTableBrand from "./fasttablebrand";
import { FilterProvider } from "./filterscontext";
import { useLocation, useNavigate } from "react-router";
import { useProduct } from "../product";
import Cookies from "js-cookie";
import SearchComponentBrand from "./searchComponentBrand";
import FiltersBrandMode from "./filtersBrandMode";
import FiltersCategoryMode from "./filtersCategoryMode";
import SearchComponentCategory from "./searchComponentCategory";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { FaRotate } from "react-icons/fa6";
import { clearFastEditBrandModeState } from "../../../redux/fastedit/fasteditbrandmode/fastEditBrandModeUpdateSlice";
import DelayedFullScreenLoader from "../../../components/centerloading";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import RotateModal from "../../../components/rotatemodal";
import { BrandRowSelectionProvider, useBrandRowSelection } from "./BrandRowSelectionContext";
import { CategoryRowSelectionProvider, useCategoryRowSelection } from "./CategoryRowSelectionContext";
import ColumnVisibilityManager from "./ColumnVisibilityManager";
import { useMediaQuery } from "@mantine/hooks";
import CurrencyPriceModal from './CurrencyPriceModal'
import BulkPriceUpdateModal from "./bulkpriceupdate/BulkPriceUpdateModal";
import { getCurrencyPrice } from "../../../redux/currencyPrice/currencyPriceActions";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

import { fetchFastEditBrandModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataActions";
import { fetchFastEditCategoryModeTableData } from "../../../redux/fastedit/fastedittabledata/fastedittablecategorymode/fastEditTableCategoryModeDataActions";



const FastOrderContext = createContext();

// ✅ NEW: Separate component for Brand Mode content (inside BrandRowSelectionProvider)
function FastEditBrandContent({
  user,
  filters_brand_mode,
  setFilters_brand_mode,
  setNodesSubCategories,
  setNodes,
  setAvailableLocations,
  searchType,
  setSearchType,
  filterSettingsModalOpened,
  setFilterSettingsModalOpened,
  setCurrencyModalOpened,
  setBulkPriceModalOpened,
  nodes,
  updatedColumns,
  visibleColumns,
  setVisibleColumns,
  isPortrait,
  isLandscape,
  filterValues,
  availableLocations,
  isMobile,
  isEditMode,
  onEditModeChange,
  loadingStates
}) {
  const { checkedRows } = useBrandRowSelection();
  const { currencyPrice } = useSelector((state) => state.currencyPrice);

  // Calculate total product count from nodes
  const productCount = useMemo(() => {
    if (!nodes || nodes.length === 0) return 0;
    return nodes.reduce((total, group) => total + (group.items?.length || 0), 0);
  }, [nodes]);

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

  return (
    <>
      {loadingStates.componentsLoading ? (
        <>
          <div>
            <SearchComponentBrand
              filters={filters_brand_mode}
              setFilters={setFilters_brand_mode}
              setNodesSubCategories={setNodesSubCategories}
              setNodes={setNodes}
              setAvailableLocations={setAvailableLocations}
              searchType={searchType}
              setSearchType={setSearchType}
              filterSettingsModalOpened={filterSettingsModalOpened}
              setFilterSettingsModalOpened={setFilterSettingsModalOpened}
              onEditModeChange={onEditModeChange}
            />
          </div>

          <Paper
            id="fastorder-tablesettings"
            p={isMobile ? "sm" : "md"}
            bg="white"
            style={{
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Swiper
              modules={[FreeMode]}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={true}
              style={{
                height: '32px',
                overflow: 'visible'
              }}
            >
              {/* Column Visibility Manager */}
              <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                <ColumnVisibilityManager
                  columns={updatedColumns}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                />
              </SwiperSlide>

              {/* Currency Price Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setCurrencyModalOpened(true)}
                  >
                    <IconCurrencyDollar size={16} />
                  </Button>
                </SwiperSlide>
              )}

              {/* Bulk Price Update Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setBulkPriceModalOpened(true)}
                  >
                    <IconPercentage size={16} />
                  </Button>
                </SwiperSlide>
              )}

              {/* Filters Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setFilterSettingsModalOpened(true)}
                    color={isEditMode ? "red" : undefined}
                    style={{
                      backgroundColor: isEditMode ? '#ffe0e0' : undefined,
                      borderColor: isEditMode ? '#ff6b6b' : undefined,
                    }}
                  >
                    <IconFilter size={16} color={isEditMode ? "#ff6b6b" : undefined} />
                  </Button>
                </SwiperSlide>
              )}
            </Swiper>
          </Paper>
        </>
      ) : (
        <LoadingPlaceholder height="200px" />
      )}

      {loadingStates.tableLoading ? (
        <>
          {nodes !== null && nodes?.length > 0 && (
            <Paper p={0} className="overflow-hidden" bg="white" id="tables">
              <FastTableBrand
                type="head"
                isPortrait={isPortrait}
                setNodes={setNodes}
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
                    <Text size="18px" c="dark">
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
            </Paper>
          )}
        </>
      ) : (
        <LoadingPlaceholder height="300px" />
      )}
    </>
  );
}

// ✅ FIXED: Category Mode content with green button indicator
function FastEditCategoryContent({
  user,
  filters_category_mode,
  setFilters_category_mode,
  setNodesSubCategories,
  setNodes,
  setAvailableLocations,
  searchType,
  setSearchType,
  filterSettingsModalOpened,
  setFilterSettingsModalOpened,
  setCurrencyModalOpened,
  setBulkPriceModalOpened,
  nodesSubCategoriesData,
  updatedColumns,
  visibleColumns,
  setVisibleColumns,
  isPortrait,
  isLandscape,
  filterValues,
  availableLocations,
  isMobile,
  isEditMode,
  onEditModeChange,
  loadingStates
}) {
  const { checkedRows } = useCategoryRowSelection();
  const { currencyPrice } = useSelector((state) => state.currencyPrice);

  // Calculate total product count from nodesSubCategoriesData
  const productCount = useMemo(() => {
    if (!nodesSubCategoriesData || nodesSubCategoriesData.length === 0) return 0;
    return nodesSubCategoriesData.reduce((total, group) => total + (group.items?.length || 0), 0);
  }, [nodesSubCategoriesData]);

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

  return (
    <>
      {loadingStates.componentsLoading ? (
        <>
          <div>
            <SearchComponentCategory
              filters={filters_category_mode}
              setFilters={setFilters_category_mode}
              setNodesSubCategories={setNodesSubCategories}
              setNodes={setNodes}
              setAvailableLocations={setAvailableLocations}
              searchType={searchType}
              setSearchType={setSearchType}
              filterSettingsModalOpened={filterSettingsModalOpened}
              setFilterSettingsModalOpened={setFilterSettingsModalOpened}
              onEditModeChange={onEditModeChange}
            />
          </div>

          <Paper
            id="fastorder-tablesettings"
            p={isMobile ? "sm" : "md"}
            bg="white"
            style={{
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <Swiper
              modules={[FreeMode]}
              spaceBetween={8}
              slidesPerView="auto"
              freeMode={true}
              style={{
                height: '32px',
                overflow: 'visible'
              }}
            >
              {/* Column Visibility Manager */}
              <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                <ColumnVisibilityManager
                  columns={updatedColumns}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                />
              </SwiperSlide>

              {/* Currency Price Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setCurrencyModalOpened(true)}
                  >
                    <IconCurrencyDollar size={16} />
                  </Button>
                </SwiperSlide>
              )}

              {/* Bulk Price Update Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setBulkPriceModalOpened(true)}
                  >
                    <IconPercentage size={16} />
                  </Button>
                </SwiperSlide>
              )}

              {/* Filters Button */}
              {user && (
                <SwiperSlide style={{ width: 'auto', display: 'flex', alignItems: 'center' }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => setFilterSettingsModalOpened(true)}
                    color={isEditMode ? "red" : undefined}
                    style={{
                      backgroundColor: isEditMode ? '#ffe0e0' : undefined,
                      borderColor: isEditMode ? '#ff6b6b' : undefined,
                    }}
                  >
                    <IconFilter size={16} color={isEditMode ? "#ff6b6b" : undefined} />
                  </Button>
                </SwiperSlide>
              )}
            </Swiper>
          </Paper>
        </>
      ) : (
        <LoadingPlaceholder height="200px" />
      )}

      {loadingStates.tableLoading ? (
        <>
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
                    <Text size="18px" c="dark">
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
                    setNodes={setNodesSubCategories}
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
    </>
  );
}

function FastEdit() {

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch()

  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);

  // Loading states - simplified to 2 states
  const [loadingStates, setLoadingStates] = useState({
    componentsLoading: false,  // For search and filters
    tableLoading: false,       // For table only
  });

  // ✅ KEEP: visibleColumns state (managed by ColumnVisibilityManager)
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes ] = useState(null);
  const [nodesSubCategoriesData, setNodesSubCategoriesData] = useState(null);

  const [availableLocations, setAvailableLocations] = useState(null)

  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [filterValues, setFilterValues] = useState({colors:[], sellers:[]});

  const [searchType, setSearchType] = useState("brand");
  
  // ✅ NEW: Filter settings modal state
  const [filterSettingsModalOpened, setFilterSettingsModalOpened] = useState(false);

  // ✅ NEW: Currency price modal state
  const [currencyModalOpened, setCurrencyModalOpened] = useState(false);

  // ✅ NEW: Bulk price update modal state
  const [bulkPriceModalOpened, setBulkPriceModalOpened] = useState(false);

  // Edit mode state for red IconFilter indicator
  const [isEditModeBrand, setIsEditModeBrand] = useState(false);
  const [editingFilterNameBrand, setEditingFilterNameBrand] = useState('');
  const [isEditModeCategory, setIsEditModeCategory] = useState(false);
  const [editingFilterNameCategory, setEditingFilterNameCategory] = useState('');

  const handleEditModeChangeBrand = useCallback((editMode, filterName) => {
    setIsEditModeBrand(editMode);
    setEditingFilterNameBrand(filterName || '');
  }, []);

  const handleEditModeChangeCategory = useCallback((editMode, filterName) => {
    setIsEditModeCategory(editMode);
    setEditingFilterNameCategory(filterName || '');
  }, []);

  const [errMessage, setErrMessage] = useState()

  const navigate = useNavigate();

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");

  // cookie brand mode
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_edit";

  const getInitialFilters_brand_mode = () => {
    const storedFilters_brand_mode = Cookies.get(COOKIE_NAME_BRAND_MODE);
    if (storedFilters_brand_mode) {
      try {
        return JSON.parse(storedFilters_brand_mode);
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

  const initialFilters_brand_mode = getInitialFilters_brand_mode();
  const [filters_brand_mode, setFilters_brand_mode] = useState(initialFilters_brand_mode.filters);

  // cookie category mode
  const COOKIE_NAME_CATEGORY_MODE = "search_filters_category_fast_edit";

  const getInitialFilters_category_mode = () => {
    const storedFilters_category_mode = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
    if (storedFilters_category_mode) {
      try {
        return JSON.parse(storedFilters_category_mode);
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

  const initialFilters_category_mode = getInitialFilters_category_mode();
  const [filters_category_mode, setFilters_category_mode] = useState(initialFilters_category_mode.filters);

  let priceFormatLabel = 'تومان';
  if(filters_brand_mode?.priceFormat === "tooman") priceFormatLabel = "تومان";
  else if(filters_brand_mode?.priceFormat === "hezar") priceFormatLabel = "هزار تومان";
  else if(filters_brand_mode?.priceFormat === "million") priceFormatLabel = "میلیون تومان";
  else priceFormatLabel = "هزار تومان"; // default fallback

  const COLUMNS = [
    { key: "image", label: "تصویر", width: "160px" },
    { key: "shortName", label: "نام اختصاری کالا", width: "160px" },
    { key: "name", label: "نام کالا", width: "160px" },
    { key: "viewPrice", label: "قیمت قبلی", width: "160px" },
    { key: "price", label: "قیمت", width: "160px" },
    { key: "foreignCurrencyPrice", label: "قیمت ارزی", width: "160px" },
    { key: "secondaryCost", label: "هزینه فرعی" }, 
    { key: "percentagePrice1", label: "قیمت درصدی 1" },
    { key: "percentagePrice2", label: "قیمت درصدی 2" },
    { key: "percentagePrice3", label: "قیمت درصدی 3" },
    { key: "attributes", label: "ویژگی ها", width: "160px" },
    { key: "stock", label: "موجودی", width: "160px" },
    { key: "minOrder", label: "حداقل سفارش", width: "120px" },
    { key: "maxOrder", label: "حداکثر سفارش", width: "120px" },
    { key: "seller", label: "تامین کننده", width: "120px" },
    { key: "deliveryTime", label: "زمان تحویل", width: "120px" },
    { key: "payment_type", label: "نوع پرداخت", width: "120px" },
    { key: "delivery", label: "محل ارسال", width: "120px" },
    { key: "action", label: "عملیات", width: "120px" }
  ];

  const updatedColumns = COLUMNS;

  // Simplified loading effect - only 2 loading states
  useEffect(() => {
    // Components (search + filters) load first
    setLoadingStates(prev => ({ ...prev, componentsLoading: true }));

    // Table loads after components
    const timer = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, tableLoading: true }));
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

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

  const { 
    loadingBrandModeUpdate, 
    brandModeUpdate,
    errorBrandModeUpdate, 
    successMessageBrandModeUpdate 
  } = useSelector((state) => state.fastEditBrandMode);

  useEffect(() => {
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
    const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;
  
    const hasValidStatus = errorBrandModeUpdate && typeof errorBrandModeUpdate.status !== "undefined" && !isNaN(Number(errorBrandModeUpdate.status));
  
    if (!isEmpty(errorBrandModeUpdate) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorBrandModeUpdate.status))) {

      notifications.show({
        title: errorBrandModeUpdate?.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }

    dispatch(clearFastEditBrandModeState())

  }, [errorBrandModeUpdate]);
  

  useEffect(() => {
    if (errorBrandModeUpdate?.status) {
      handleKnownErrors(errorBrandModeUpdate?.status, setModalOpen, navigate);
      setErrMessage(errorBrandModeUpdate?.message)
    }

    dispatch(clearFastEditBrandModeState())

  }, [errorBrandModeUpdate]);

  useEffect(() => {
    if (!brandModeUpdate || brandModeUpdate.state !== "error") return;

    if (Array.isArray(brandModeUpdate.errors) && brandModeUpdate.errors.length > 0) {
      const combinedMessage = brandModeUpdate.errors
        .map((err) => {
          const label = err.label ? `<span style="color: red;">${err.label}</span>` : "خطا";
          return `• ${label}: ${err.message}`;
        })
        .join("<br />");

        const additionalMessage = brandModeUpdate.product.general.title

      notifications.show({
        title: "خطاهای اعتبارسنجی",
        message: 
        <div className="">
          <div style={{ color: "green", marginTop: 2, fontWeight: 'bold', fontSize: '10x' }}>{additionalMessage}</div>
          <div style={{ color: "", marginTop: 2, fontWeight: '', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: combinedMessage }} />
        </div>,
        color: "red",
        autoClose: true,
      });

    } else {
      notifications.show({
        title: brandModeUpdate?.message || "خطا",
        color: "red",
        autoClose: true,
      });
    }
  
    if (brandModeUpdate && brandModeUpdate.state === "ok") {
      notifications.show({
        title: brandModeUpdate?.message,
        color: "green",
        autoClose: true,
      });
    }

    dispatch(clearFastEditBrandModeState())
    
  }, [brandModeUpdate]);

  useEffect(() => {
    if (brandModeUpdate && brandModeUpdate.state === "ok" ) {
      notifications.show({
        title: brandModeUpdate?.message,
        color: "green",
        autoClose: true
      });
    }

    dispatch(clearFastEditBrandModeState())
    
  }, [ brandModeUpdate]);

  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    if(errorBrandModeUpdate) {
      setErrMessage(errorBrandModeUpdate?.message)
    }
  }, [errorBrandModeUpdate])

  const [isFixed, setIsFixed] = useState(false);
  const componentRef = useRef(null);
  const lastScrollY = useRef(0);
  const originalTop = useRef(0);

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

  const [openedM, setOpenedM] = useState(false);

  useEffect(() => {
    if (authError) {
      setOpenedM(true);
    }
  }, [authError]);

  // ✅ NEW: Load currency price on component mount
  useEffect(() => {
    if (user && user.role === "supplier") {
      dispatch(getCurrencyPrice());
    }
  }, [dispatch, user]);

  const handleBulkPriceUpdateSuccess = useCallback(() => {
    // Refetch data based on current search type
    if (searchType === "brand") {
      const storedFilters = Cookies.get(COOKIE_NAME_BRAND_MODE);
      if (storedFilters) {
        try {
          const parsedFilters = JSON.parse(storedFilters);
          const filterArray = [{
            searchType: 'brand',
            uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
            uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
            filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || [],
          }];
          dispatch(fetchFastEditBrandModeTableData(filterArray));
        } catch (error) {
          console.error('Error refetching brand data:', error);
        }
      }
    } else if (searchType === "category") {
      const storedFilters = Cookies.get(COOKIE_NAME_CATEGORY_MODE);
      if (storedFilters) {
        try {
          const parsedFilters = JSON.parse(storedFilters);
          const filterArray = [{
            searchType: 'category',
            uniqueIDClickedCategories: parsedFilters.uniqueIDClickedCategories || [],
            uniqueIDClickedSubCategories: parsedFilters.uniqueIDClickedSubCategories || [],
            uniqueIDClickedSubCategoriesBrands: parsedFilters.uniqueIDClickedSubCategoriesBrands || [],
          }];
          dispatch(fetchFastEditCategoryModeTableData(filterArray));
        } catch (error) {
          console.error('Error refetching category data:', error);
        }
      }
    }
  }, [searchType, dispatch, COOKIE_NAME_BRAND_MODE, COOKIE_NAME_CATEGORY_MODE]);

  // Calculate product counts for bulk price modal
  const brandProductCount = useMemo(() => {
    if (!nodes || nodes.length === 0) return 0;
    return nodes.reduce((total, group) => total + (group.items?.length || 0), 0);
  }, [nodes]);

  const categoryProductCount = useMemo(() => {
    if (!nodesSubCategoriesData || nodesSubCategoriesData.length === 0) return 0;
    return nodesSubCategoriesData.reduce((total, group) => total + (group.items?.length || 0), 0);
  }, [nodesSubCategoriesData]);

  if (authLoading) {
    return <DelayedFullScreenLoader />;
  }

  if (!user || user.role !== "supplier") {
    return (
      <Modal
        opened={true}
        onClose={() => {}}
        title="ورود به حساب کاربری"
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        zIndex={50}
        lockScroll={false}
        removeScrollBar={false}
      >
        <Stack>
          <Text>برای مشاهده این صفحه نیاز به دسترسی تامین کننده دارید.</Text>
          <Button
            onClick={() => navigate("/login")}
            variant="filled"
            color="blue"
            fullWidth
          >
            ورود به حساب کاربری
          </Button>
        </Stack>
      </Modal>
    );
  }
  
  
  if (user.role === "supplier") {

  return (
    <>
      {/* ✅ FIXED: RotateModal at root level - ALWAYS renders when isPortrait is true */}
      {/* <RotateModal isPortrait={isPortrait} /> */}

      {
        !loadingBrandModeUpdate &&
        <ErrorMessageModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          message={errMessage}
      />
      }

      {/* ✅ NEW: Currency Price Modal */}
      <CurrencyPriceModal
        opened={currencyModalOpened}
        onClose={() => setCurrencyModalOpened(false)}
      />

      {/* ✅ NEW: Bulk Price Update Modal */}
      <BulkPriceUpdateModal
        opened={bulkPriceModalOpened}
        onClose={() => setBulkPriceModalOpened(false)}
        searchType={searchType}
        productCount={searchType === "brand" ? brandProductCount : categoryProductCount}
        COOKIE_NAME_BRAND={COOKIE_NAME_BRAND_MODE}
        onSuccess={handleBulkPriceUpdateSuccess} 
        COOKIE_NAME_CATEGORY={COOKIE_NAME_CATEGORY_MODE}
      />

      <FastOrderContext.Provider 
        value={{
          visibleColumns, 
          setVisibleColumns, 
          filters_category_mode, 
          filters_brand_mode, 
          filterValues, 
          setFilters_category_mode,
          setFilters_brand_mode, 
          setFilterValues, 
          searchType }}>
            
            <FilterProvider>

              {
                searchType === "brand" ?
                <BrandRowSelectionProvider>
                  <FastEditBrandContent
                    user={user}
                    filters_brand_mode={filters_brand_mode}
                    setFilters_brand_mode={setFilters_brand_mode}
                    setNodesSubCategories={setNodesSubCategoriesData}
                    setNodes={setNodes}
                    setAvailableLocations={setAvailableLocations}
                    searchType={searchType}
                    setSearchType={setSearchType}
                    filterSettingsModalOpened={filterSettingsModalOpened}
                    setFilterSettingsModalOpened={setFilterSettingsModalOpened}
                    setCurrencyModalOpened={setCurrencyModalOpened}
                    setBulkPriceModalOpened={setBulkPriceModalOpened}
                    nodes={nodes}
                    updatedColumns={updatedColumns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    isPortrait={isPortrait}
                    isLandscape={isLandscape}
                    filterValues={filterValues}
                    availableLocations={availableLocations}
                    isMobile={isMobile}
                    isEditMode={isEditModeBrand}
                    onEditModeChange={handleEditModeChangeBrand}
                    loadingStates={loadingStates}
                  />
                </BrandRowSelectionProvider>
                :
                <CategoryRowSelectionProvider>
                  <FastEditCategoryContent
                    user={user}
                    filters_category_mode={filters_category_mode}
                    setFilters_category_mode={setFilters_category_mode}
                    setNodesSubCategories={setNodesSubCategoriesData}
                    setNodes={setNodes}
                    setAvailableLocations={setAvailableLocations}
                    searchType={searchType}
                    setSearchType={setSearchType}
                    filterSettingsModalOpened={filterSettingsModalOpened}
                    setFilterSettingsModalOpened={setFilterSettingsModalOpened}
                    setCurrencyModalOpened={setCurrencyModalOpened}
                    setBulkPriceModalOpened={setBulkPriceModalOpened}
                    nodesSubCategoriesData={nodesSubCategoriesData}
                    updatedColumns={updatedColumns}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                    isPortrait={isPortrait}
                    isLandscape={isLandscape}
                    filterValues={filterValues}
                    availableLocations={availableLocations}
                    isMobile={isMobile}
                    isEditMode={isEditModeCategory}
                    onEditModeChange={handleEditModeChangeCategory}
                    loadingStates={loadingStates}
                  />
                </CategoryRowSelectionProvider>
              }

          </FilterProvider>

        </FastOrderContext.Provider>
    </>
  );
  }
}

export const useFastOrder = () => useContext(FastOrderContext)

export default FastEdit;