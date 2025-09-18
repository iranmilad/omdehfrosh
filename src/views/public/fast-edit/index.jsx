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
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
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
import { verifyToken } from "../../../redux/auth/authusers/auth";

const FastOrderContext = createContext();

function FastEdit() {

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  const location = useLocation();

  const [modalOpen, setModalOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes ] = useState(null);
  const [nodesSubCategoriesData, setNodesSubCategoriesData] = useState(null);

  const [availableLocations, setAvailableLocations] = useState(null)

  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [filterValues, setFilterValues] = useState({colors:[], sellers:[]});

  const [searchType, setSearchType] = useState("brand"); 
  
  const [icPriceLabels, setIcPriceLabels] = useState([]);

  const [errMessage, setErrMessage] = useState()

  const navigate = useNavigate();

  // cookie brand mode
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_edit";

  // ✅ Load filters from cookies initially
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

  // ✅ Load filters from cookies initially
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

  const [opened, setOpened] = useState(false);

  let priceFormatLabel = 'تومان';
  if(filters_brand_mode.priceFormat === "tooman") priceFormatLabel = "تومان";
  else if(filters_brand_mode.priceFormat === "hezar") priceFormatLabel = "هزار تومان";
  else priceFormatLabel = "میلیون تومان";

  // Table columns
  // Base column definitions
  const COLUMNS = [
    { key: "image", label: "تصویر", width: "160px" },
    { key: "shortName", label: "نام اختصاری کالا", width: "160px" },
    { key: "name", label: "نام کالا", width: "160px" },
    // { key: "psid", label: "آی‌دی مشخصه", width: "160px" },
    { key: "price", label: "قیمت", width: "160px" }, // Insert ICPrice columns after this
    { key: "discount", label: "تخفیف", width: "160px" },
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

  // Function to extract unique ICPrice labels
  const extractICPriceLabels = (items, icLabels = new Set()) => {
    if (!Array.isArray(items)) return icLabels; // Handle null/undefined

    items.forEach(item => {
      if (item?.price?.ICPrice) {  // Ensure price and ICPrice exist
        item.price.ICPrice.forEach(ic => icLabels.add(ic.label));
      }

      // Recursively check deeper nodes
      if (Array.isArray(item?.nodes)) {
        extractICPriceLabels(item.nodes, icLabels);
      }
    });

    return icLabels;
  };

  // Get all unique ICPrice labels from brands
  const getAllICPriceLabels = (brands) => {
    if (!Array.isArray(brands)) return [];

    const icLabels = new Set();
    
    brands.forEach(brand => {
      extractICPriceLabels(brand.items, icLabels);
    });

    return [...icLabels].map(label => ({
      key: `ICPrice_${label}`,
      label: `قیمت (${label.toUpperCase()})`,
      width: "120px"
    }));
  };

  // Example product data
  const productData = useMemo(() => (Array.isArray(nodes) ? nodes : []), [nodes]);

  // Extract ICPrice columns
  const icPriceColumns = getAllICPriceLabels(productData);

  // ✅ Find the index of "price" and insert ICPrice columns right after it
  const priceIndex = COLUMNS.findIndex(col => col.key === "price");
  const updatedColumns = [
    ...COLUMNS.slice(0, priceIndex + 1),  // Columns before and including "price"
    ...icPriceColumns,                   // Insert ICPrice columns here
    ...COLUMNS.slice(priceIndex + 1)      // Remaining columns after "price"
  ];

  useEffect(() => {
    // Extract ICPrice columns only once (or when nodes change)
    const icPriceColumns = getAllICPriceLabels(productData);

    // Extract the keys from icPriceColumns
    const icPriceKeys = icPriceColumns.map(column => column.key);

    // Set the keys to the state
    setIcPriceLabels(icPriceKeys);
  }, [productData]);  // Depend on `productData`, so it updates when productData changes

  // Handle saving column visibility settings
  const handleSave = () => setOpened(false);

  const handleVisibleColumnsChange = (event, columnKey) => {
    const isChecked = event.target.checked; // true = hiding, false = showing
    setVisibleColumns((prev) =>
      isChecked
        ? prev.filter((key) => key !== columnKey) // Remove from visible (hide)
        : [...prev, columnKey] // Add to visible (show)
    );
  };

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
      setIsPortrait(window.innerHeight > window.innerWidth); // Update isPortrait on resize
    };
  
    window.addEventListener("resize", handleResize);
    // Initial calculation when the component mounts
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
      // Combine all error messages with red style for err.label
      const combinedMessage = brandModeUpdate.errors
        .map((err) => {
          const label = err.label ? `<span style="color: red;">${err.label}</span>` : "خطا";
          return `• ${label}: ${err.message}`;
        })
        .join("<br />"); // Using <br /> for line breaks between each error

        const additionalMessage = brandModeUpdate.product.general.title

      notifications.show({
        title: "خطاهای اعتبارسنجی",
        message: 
        <div className="">
          <div style={{ color: "green", marginTop: 2, fontWeight: 'bold', fontSize: '10x' }}>{additionalMessage}</div>
          <div style={{ color: "", marginTop: 2, fontWeight: '', fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: combinedMessage }} />
        </div>,
        color: "red",
        autoClose: true, // optional: keep open longer for multiple messages
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

  // ✅ Add sticky filters functionality (same as FastOrder)
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
        // Scrolling up
        if (currentScrollY > originalTop.current) {
          setIsFixed(true); // stick to top
        } else {
          setIsFixed(false); // back to original position
        }
      } else {
        // Scrolling down
        setIsFixed(false); // normal flow
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      {
        !loadingBrandModeUpdate &&
        <ErrorMessageModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          // status={errors?.status}
          message={errMessage}
      />
      }

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
            <div>
            <SearchComponentBrand
              filters={filters_brand_mode} 
              setFilters={setFilters_brand_mode}
              setNodesSubCategories={setNodesSubCategoriesData} 
              setNodes={setNodes} 
              setAvailableLocations={setAvailableLocations}
              searchType={searchType} 
              setSearchType={setSearchType} 
              
              />
            </div>
            :
            <div>
                <SearchComponentCategory 
                  filters={filters_category_mode} 
                  setFilters={setFilters_category_mode}
                  setNodesSubCategories={setNodesSubCategoriesData} 
                  setNodes={setNodes} 
                  setAvailableLocations={setAvailableLocations}
                  searchType={searchType} 
                  setSearchType={setSearchType} 
                  />
            </div>
          }

          {/* ✅ Apply sticky behavior to filters (same as FastOrder) */}
          <div
            ref={componentRef}
            style={{
              position: isFixed ? "fixed" : "static",
              top: isFixed ? 0 : "auto",
              left: 0,
              right: 0,
              zIndex: 999,
              background: isFixed ? "white" : "transparent",
            }}
          >
            {
              searchType === "brand" ?
                <Paper id="fastorder-filters">
                  <FiltersBrandMode
                    setFilters={setFilters_brand_mode} 
                    nodes={nodes} 
                    setNodesSubCategories={setNodesSubCategoriesData} 
                    setNodes={setNodes} 
                    filters={filters_brand_mode} 
                    searchType={searchType} 
                  />
              </Paper>
              :
              <Paper id="fastorder-filters">
                <FiltersCategoryMode
                  setFilters={setFilters_category_mode} 
                  nodes={nodes} 
                  setNodesSubCategories={setNodesSubCategoriesData} 
                  setNodes={setNodes} 
                  filters={filters_category_mode} 
                  searchType={searchType} 
                />
            </Paper>
            }
          </div>

          <Group
            id="fastorder-tablesettings"
            mt="lg"
            mb="sm"
            justify="center"
            align="center"
          >
            <Button
              leftSection={<IconSettings size={16} />}
              onClick={() => setOpened(true)}
              py={0}
            >
              نمایش ستون‌ها
            </Button>

            {isPortrait && (
              <Button 
                leftSection={<FaRotate 
                size={12} />} 
                py={0} 
                fz="ls"
                color="red" 

                >
                <Text style={{ fontSize: "10px" }}>برای تجربه بهتر لطفا از حالت صفحه نمایش افقی استفاده کنید</Text>
              </Button>
            )}

          </Group>

        {
        searchType === "brand" && nodes !== null && nodes?.length > 0 ? 
          (
            <Paper p={0} className="overflow-hidden" bg="white" id="tables">
              <FastTableBrand type="head" isPortrait={isPortrait} isLandscape={isLandscape} icPriceKeys={icPriceLabels} filters_brand_mode={filters_brand_mode} filterValues={filterValues} availableLocations={availableLocations} COLUMNS={updatedColumns} nodes={nodes[0]?.items?.slice(0, 1) || []} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
              {nodes.map((item, index) => (
                <React.Fragment key={index}>
                  <Flex h={40} align="center" justify="center" bg="#e5e7eb">
                    <Text size="18px" c="dark">
                      {item.label}
                    </Text>
                  </Flex>
                  <FastTableBrand keyIndex={index} isPortrait={isPortrait} isLandscape={isLandscape} icPriceKeys={icPriceLabels} filters_brand_mode={filters_brand_mode} filterValues={filterValues} setNodes={setNodes} availableLocations={availableLocations}  type="data" COLUMNS={updatedColumns} nodes={item.items || []} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
                </React.Fragment>
              ))}
            </Paper>
          ) : searchType === "category" && nodesSubCategoriesData !== null && nodesSubCategoriesData?.length > 0 ? 
          (
            <Paper p={0} className="overflow-hidden" bg="white" id="tables">
              <FastTableCategory type="head" isPortrait={isPortrait} isLandscape={isLandscape} icPriceKeys={icPriceLabels} filters_category_mode={filters_category_mode} filterValues={filterValues} availableLocations={availableLocations} COLUMNS={updatedColumns} nodes={nodesSubCategoriesData[0]?.items?.slice(0, 1) || []} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
              {nodesSubCategoriesData?.map((item, index) => (
                <React.Fragment key={index}>
                  <Flex h={40} align="center" justify="center" bg="#e5e7eb">
                    <Text size="18px" c="dark">
                      {item.label}
                    </Text>
                  </Flex>
                  <FastTableCategory isPortrait={isPortrait} isLandscape={isLandscape} icPriceKeys={icPriceLabels} filters_category_mode={filters_category_mode} filterValues={filterValues} keyIndex={index} availableLocations={availableLocations}  setNodes={setNodesSubCategoriesData} type="data" COLUMNS={updatedColumns} nodes={item.items || []} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
                </React.Fragment>
              ))}
            </Paper>
          ) : null
        }

          <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            title="نمایش دادن ستون‌ها"
          >
            <Stack>
            {updatedColumns.map((column) => (
              <Checkbox
                key={column.key}
                label={column.label}
                checked={!visibleColumns.includes(column.key)} // Shows checked when NOT visible
                onChange={(event) => handleVisibleColumnsChange(event, column.key)} // Toggles correctly
              />
            ))}
            </Stack>
          </Modal>

          </FilterProvider>

        </FastOrderContext.Provider>
    </>
  );
  }
}

export const useFastOrder = () => useContext(FastOrderContext)

export default FastEdit;