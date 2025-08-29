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
  Loader,
} from "@mantine/core";
import { IconEdit, IconSettings, IconFilter } from "@tabler/icons-react";
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
import { FaRotate } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
// import { verifyToken } from "../../../redux/auth/authusers/auth";
import isEqual from "lodash/isEqual";

import {
  Paper,
  ActionIcon,
  Text,
  Group,
  Modal,
  Button,
  TextInput,
  Collapse
} from '@mantine/core';
import { IconPlus, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { notifications } from "@mantine/notifications";
import { clearSaveFilterState } from "../../../redux/savefiltersettings/saveFilterSettingsSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { useForm } from "@mantine/form";

// Import the new Row Selection Context
import { RowSelectionProvider, useRowSelection } from "./RowSelectionContext";
import { BrandRowSelectionProvider } from "./BrandRowSelectionContext";
import { CategoryRowSelectionProvider } from "./CategoryRowSelectionContext";
import RotateModal from "../../../components/rotatemodal";

const FastOrderContext = createContext();

function FastEdit() {
  const dispatch = useDispatch();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);


  const [loadingStates, setLoadingStates] = useState({
    searchComponent: false,
    filtersComponent: false,
    tableComponent: false,
  });

  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings);

  const [filterName, setFilterName] = useState('');

  const location = useLocation();

  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes ] = useState(null);
  const [nodesSubCategoriesData, setNodesSubCategoriesData] = useState(null);

  const [availableLocations, setAvailableLocations] = useState(null)

  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  const [openedM, setOpenedM] = useState(false);  // modal state
  const [isOpen, setIsOpen] = useState(false);    // collapse state
  const [filters, setFilters] = useState([
    { id: 1, name: 'Nike' },
    { id: 2, name: 'Adidas' },
    { id: 3, name: 'Puma' }
  ]);

  const toggleCollapse = () => setIsOpen((prev) => !prev);

  const handleDelete = (id) => {
    setFilters(filters.filter((f) => f.id !== id));
  };
  const [filterValues, setFilterValues] = useState({colors:[], sellers:[]});

  const [searchType, setSearchType] = useState("brand"); 
  
  const [icPriceLabels, setIcPriceLabels] = useState([]);

  // Add state for filter modal
  const [filterModalOpened, setFilterModalOpened] = useState(false);

  // cookie brand mode
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_edit";

  const storedFilters_brand_modee = Cookies.get(COOKIE_NAME_BRAND_MODE);

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

  // Staggered loading effect
  useEffect(() => {
    // First component loads immediately
    setLoadingStates(prev => ({ ...prev, searchComponent: true }));

    // Second component loads after 1 second
    const timer1 = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, filtersComponent: true }));
    }, 2000);

    // Third component loads after 2 seconds
    const timer2 = setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, tableComponent: true }));
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);



//   useEffect(() => {
//   if (hasCheckedAuth && user === null) {
//     setShowLoginModal(true);
//   } else {
//     setShowLoginModal(false);
//   }
// }, [user, hasCheckedAuth]);

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
  { key: "name", label: "نام کالا", width: "160px" },
  { key: "psid", label: "آی‌دی مشخصه", width: "160px" },
  { key: "price", label: "قیمت", width: "160px" }, // Insert ICPrice columns after this
  { key: "discount", label: "با تخفیف", width: "160px" },
  { key: "attributes", label: "ویژگی ها", width: "160px" },
  { key: "stock", label: "موجودی", width: "160px" },
  { key: "minOrder", label: "حداقل سفارش", width: "120px" },
  { key: "maxOrder", label: "حداکثر سفارش", width: "120px" },
  { key: "seller", label: "تامین کننده", width: "120px" },
  { key: "deliveryTime", label: "زمان تحویل", width: "120px" },
  // { key: "payment_type", label: "نوع پرداخت", width: "120px" },
  // { key: "delivery", label: "محل ارسال", width: "120px" },
  { key: "action", label: "عملیات", width: "120px" }
];

    const [modalOpen, setModalOpen] = useState(false);

    const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings);

    const navigate = useNavigate();

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
const productData = Array.isArray(nodes) ? nodes : [];

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


const saveFiltersSettings = () => {
  if (!filterName.trim()) return;

  const slug = searchType === "brand" ? "brand-fast-edit" : "category-fast-edit";
  const COOKIE_NAME_BRAND_MODE = "search_filters_brand_fast_edit";
  const COOKIE_NAME_CATEGORY_MODE = "search_filters_category_fast_edit";

  const filterSettingsCookieKey =
    searchType === "brand" ? COOKIE_NAME_BRAND_MODE : COOKIE_NAME_CATEGORY_MODE;

  const cookieRaw = Cookies.get(filterSettingsCookieKey);
  let fullCookieData;

  try {
    fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
  } catch (error) {
    fullCookieData = {};
  }

  // 🔁 Save and then refresh
  dispatch(
    saveFilterSettings({
      slug,
      filters: fullCookieData,
      filterName: filterName.trim(),
    })
  ).then(() => {
    // Re-fetch saved filters to refresh component
    dispatch(getFilterSettings(slug));

    if (saveStatus.state === "ok" ) {
          setOpenedM(false); // Close modal after save
    }

    setFilterName(""); // Reset input
  });
};

const handleDeleteSavedFilter = (id) => {
  const slug = searchType === "brand" ? "brand-fast-edit" : "category-fast-edit";
  dispatch(deleteFilterSettings({ slug, id }))
    .then(() => {
      dispatch(getFilterSettings(slug)); // refresh the list after deletion
    });
};

useEffect(() => {
  const slug = searchType === "brand" ? "brand-fast-edit" : "category-fast-edit";
  dispatch(getFilterSettings(slug));
}, [searchType]);

        useEffect(() => {
          if (saveStatus && saveStatus?.state === "ok" ) {
            notifications.show({
              title: saveStatus.message,
              color: "green",
              autoClose: true
            });
          }
          if (saveStatus && saveStatus?.state === "error" ) {
              notifications.show({
                title: saveStatus.message,
                color: "red",
                autoClose: true
              });
            }
        }, [saveStatus]);

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
              dispatch(clearSaveFilterState())
              navigate("/"); 
            }, 4000);
          }

          if (saveError?.status === 403) {
              setModalOpen(true);
            setTimeout(() => {
              dispatch(clearSaveFilterState())
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

  // Loading placeholder component
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
        <ErrorMessageModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            message={saveError?.message}
        />  

        <Box >
          {/* Wrap everything with RowSelectionProvider */}
          <RowSelectionProvider>
            <FastOrderContext.Provider 
              value={{visibleColumns, setVisibleColumns, filters_brand_mode, filterValues, setFilters_brand_mode, setFilterValues, searchType }}>
                  
                  <FilterProvider>

                {/* Search Component - Loads immediately */}
                {loadingStates.searchComponent ? (
                  searchType === "brand" ? 
                  <div>
                    <BrandRowSelectionProvider>
                      <SearchComponentBrand
                        filters={filters_brand_mode} 
                        setFilters={setFilters_brand_mode}
                        setNodesSubCategories={setNodesSubCategoriesData} 
                        setNodes={setNodes} 
                        setAvailableLocations={setAvailableLocations}
                        searchType={searchType} 
                        setSearchType={setSearchType} 
                        />
                    </BrandRowSelectionProvider>
                  </div>
                  :
                  <div>
                    <CategoryRowSelectionProvider>
                      <SearchComponentCategory 
                        filters={filters_category_mode} 
                        setFilters={setFilters_category_mode}
                        setNodesSubCategories={setNodesSubCategoriesData} 
                        setNodes={setNodes} 
                        setAvailableLocations={setAvailableLocations}
                        searchType={searchType} 
                        setSearchType={setSearchType} 
                        />
                    </CategoryRowSelectionProvider>
                  </div>
                ) : (
                  <LoadingPlaceholder height="120px" />
                )}

                {/* Filters Component - Loads after 1 second */}
                {loadingStates.filtersComponent ? (
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
                    {searchType === "brand" ? (
                      <FiltersBrandMode
                        setFilters={setFilters_brand_mode}
                        nodes={nodes}
                        setNodesSubCategories={setNodesSubCategoriesData}
                        setNodes={setNodes}
                        filters={filters_brand_mode}
                        searchType={searchType}
                      />
                    ) : (
                      <FiltersCategoryMode
                        setFilters={setFilters_category_mode}
                        nodes={nodes}
                        setNodesSubCategories={setNodesSubCategoriesData}
                        setNodes={setNodes}
                        filters={filters_category_mode}
                        searchType={searchType}
                      />
                    )}
                  </div>
                ) : (
                  <LoadingPlaceholder height="80px" />
                )}

              {/* Table Controls and Content - Loads after 2 seconds */}
              {loadingStates.tableComponent ? (
                <>
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

                    <RotateModal isPortrait={isPortrait} />
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
                </>
              ) : (
                <LoadingPlaceholder height="300px" />
              )}

              {/* Column Visibility Modal */}
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
          </RowSelectionProvider>
        </Box>

    </>
  );
}

export const useFastOrder = () => useContext(FastOrderContext)

export default FastEdit;