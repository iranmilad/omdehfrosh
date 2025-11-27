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
  Modal,
  TextInput,
  Button,
  Flex,
  Text,
  ActionIcon,
  Menu,
  Divider,
  Box,
  Checkbox,
  Badge,
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
import { IconPlus, IconTrash, IconFilter, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { saveFilterSettings } from "../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import isEqual from "lodash/isEqual";
import { useBrandRowSelection } from "./BrandRowSelectionContext";

const SearchComponentBrand = ({ searchType, setSearchType, setAvailableLocations, filters, setFilters, setNodes, setNodesSubCategories }) => {
  
  const dispatch = useDispatch();

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus, saveLoading, saveError } = useSelector((state) => state.saveFilterSettings || {});

  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Brand-specific context for Fast Edit
  const { 
    checkedRows, 
    selectedRow, 
    setSelectedRow, 
    toggleCheck, 
    isChecked, 
    clearAll 
  } = useBrandRowSelection();

  // Modal states
  const [openedAddModal, setOpenedAddModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  // Edit mode states
  const [editingFilterId, setEditingFilterId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilterName, setEditingFilterName] = useState('');

  // Menu control state
  const [menuOpened, setMenuOpened] = useState(false);

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

  // Form validation
  const form = useForm({
    initialValues: {
      inputBox: "",
    },
    validate: {
      title: (value) => (value?.trim() ? null : "نام الزامی است"),
    },
  });

  // Helper functions to build filter arrays
  const buildCurrentFilterArray = useCallback(() => {
    return [{
      searchType,
      uniqueIDClickedBrands: filterBrandStorage,
      uniqueIDClickedBrandsCategories: filterBrandsCategoryStorage,
      filterBrandsCategorySubCategoryStorage: filterBrandsCategorySubCategoryStorage,
      filters: filters || localFilters // Include current filters
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
      filters: filter.filters || filters || localFilters // Include saved filters or current filters
    }));
}, [savedFilters, checkedRows, filters, localFilters]);

const buildInitialFilterArray = useCallback(() => {
  const initialData = getInitialFilters();
  return [{
    searchType: 'brand',
    uniqueIDClickedBrands: initialData.uniqueIDClickedBrands,
    uniqueIDClickedBrandsCategories: initialData.uniqueIDClickedBrandsCategories,
    filterBrandsCategorySubCategoryStorage: initialData.filterBrandsCategorySubCategoryStorage,
    filters: initialData.filters || filters || localFilters // Include initial filters
  }];
}, [getInitialFilters, filters, localFilters]);

  // Edit filter handler - Modified to use array format
  const handleEditFilter = useCallback((filter) => {
    setEditingFilterId(filter.id);
    setEditingFilterName(filter.filterName || 'بدون نام');
    setIsEditMode(true);
    
    const cookieValue = {
      searchType: 'brand',
      filters: filter.filters || {},
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
    };

    Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
    
    setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
    setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
    setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
    setLocalFilters(filter.filters || {});
    
    if (setFilters) {
      setFilters(filter.filters || {});
    }
    if (setSearchType) {
      setSearchType('brand');
    }

    setSelectedRow(filter.id);
    setMenuOpened(false);

    // 🔥 MODIFIED: Send single filter as array with filters to API
    const filterArray = [{
      searchType: 'brand',
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
      filters: filter.filters || {} // Include the filter's own filters
    }];

    dispatch(fetchFastEditBrandModeTableData(filterArray));

    notifications.show({
      title: 'حالت ویرایش',
      message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد. تغییرات را اعمال کنید و سپس ذخیره کنید.`,
      color: 'blue',
      autoClose: 4000,
    });
  }, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch]);
  // Save edited filter
  const saveEditedFilter = useCallback(() => {
    if (!editingFilterId || !editingFilterName.trim()) return;

    const slug = "brand-fast-edit";
    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    dispatch(
      updateFilterSettings({
        slug,
        id: editingFilterId,
        filterName: editingFilterName.trim(),
        ...fullCookieData,
      })
    ).then(() => {
      dispatch(getFilterSettings(slug));
      setIsEditMode(false);
      setEditingFilterId(null);
      setEditingFilterName('');
      
      notifications.show({
        title: 'ذخیره شد',
        message: `فیلتر "${editingFilterName.trim()}" با موفقیت به‌روزرسانی شد.`,
        color: 'green',
        autoClose: 3000,
      });
    });
  }, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch]);

  // Cancel edit mode - Modified to use array format
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditingFilterId(null);
    setEditingFilterName('');
    
    const initialData = getInitialFilters();
    setFilterBrandStorage(initialData.uniqueIDClickedBrands);
    setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
    setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
    setLocalFilters(initialData.filters);
    
    if (setFilters) {
      setFilters(initialData.filters);
    }
    
    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });
    setSelectedRow(null);

    // 🔥 MODIFIED: Send initial filter as array with filters to API
    const filterArray = buildInitialFilterArray();
    dispatch(fetchFastEditBrandModeTableData(filterArray));
    
    notifications.show({
      title: 'لغو ویرایش',
      message: 'تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.',
      color: 'gray',
      autoClose: 2000,
    });
  }, [getInitialFilters, setFilters, setSelectedRow, COOKIE_NAME, dispatch, buildInitialFilterArray]);

  // Handle checkbox change - Modified to use array format
  const handleFilterCheckboxChange = useCallback((filterId, checked) => {
    if (checked) {
      // Check the checkbox in the context
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      // Apply this filter immediately
      const selectedFilter = savedFilters?.find(f => f.id === filterId);
      if (selectedFilter) {
        const cookieValue = {
          searchType: 'brand',
          filters: selectedFilter.filters || {},
          uniqueIDClickedBrands: selectedFilter.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories: selectedFilter.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage: selectedFilter.filterBrandsCategorySubCategoryStorage || [],
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

        setFilterBrandStorage(selectedFilter.uniqueIDClickedBrands || []);
        setFilterBrandsCategoryStorage(selectedFilter.uniqueIDClickedBrandsCategories || []);
        setFilterBrandsCategorySubCategoryStorage(selectedFilter.filterBrandsCategorySubCategoryStorage || []);
        setLocalFilters(selectedFilter.filters || {});

        if (setFilters) setFilters(selectedFilter.filters || {});
        if (setSearchType) setSearchType('brand');

        // 🔥 MODIFIED: Build array of all checked filters with their filters
        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
        }, 0);
      }
    } else {
      // Uncheck the checkbox in the context
      if (isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      // 🔥 MODIFIED: Build array of remaining checked filters with their filters
      setTimeout(() => {
        const newCheckedRows = new Set(checkedRows);
        newCheckedRows.delete(filterId);
        
        if (newCheckedRows.size > 0) {
          // If there are still checked filters, send them as array with filters
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
        } else {
          // If no filters are checked, reset to initial filters
          const initialData = getInitialFilters();
          setFilterBrandStorage(initialData.uniqueIDClickedBrands);
          setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
          setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
          setLocalFilters(initialData.filters);

          if (setFilters) setFilters(initialData.filters);
          if (setSearchType) setSearchType('brand');

          Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

          // Send initial filter as array with filters
          const filterArray = buildInitialFilterArray();
          dispatch(fetchFastEditBrandModeTableData(filterArray));
        }
      }, 0);
    }
  }, [savedFilters, COOKIE_NAME, setFilters, setSearchType, getInitialFilters, dispatch, isChecked, toggleCheck, checkedRows, buildCheckedFiltersArray, buildInitialFilterArray]);

  // Clear selected filters
const clearSelectedFilters = useCallback(() => {
  clearAll();
  
  // Reset to initial state and send to API
  const initialData = getInitialFilters();
  setFilterBrandStorage(initialData.uniqueIDClickedBrands);
  setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
  setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
  setLocalFilters(initialData.filters);

  if (setFilters) setFilters(initialData.filters);
  if (setSearchType) setSearchType('brand');

  Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

  // 🔥 MODIFIED: Send initial filter as array with filters to API
  const filterArray = buildInitialFilterArray();
  dispatch(fetchFastEditBrandModeTableData(filterArray));
}, [clearAll, getInitialFilters, setFilters, setSearchType, COOKIE_NAME, dispatch, buildInitialFilterArray]);

  // Save filter settings
  const saveFiltersSettings = useCallback(() => {
    if (!filterName.trim()) return;

    const slug = "brand-fast-edit";
    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    dispatch(
      saveFilterSettings({
        slug,
        filters: fullCookieData,
        filterName: filterName.trim(),
      })
    ).then(() => {
      dispatch(getFilterSettings(slug));
      if (saveStatus?.state === "ok") {
        setOpenedAddModal(false);
      }
      setFilterName("");
    });
  }, [filterName, COOKIE_NAME, dispatch, saveStatus]);

  // Delete filter handler
  const handleDeleteSavedFilter = useCallback((id) => {
    const slug = "brand-fast-edit";
    dispatch(deleteFilterSettings({ slug, id }))
      .then(() => {
        dispatch(getFilterSettings(slug));
        if (isChecked(id)) {
          toggleCheck(id);
        }
        if (editingFilterId === id) {
          cancelEditMode();
        }
      });
  }, [dispatch, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

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
    filters: JSON.stringify(filters || localFilters) // Add filters to comparison
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
  filters, // Add filters dependency
  localFilters, // Add localFilters dependency
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

      // 🔥 MODIFIED: Send loaded filters as array with filters to API
      setTimeout(() => {
        const filterArray = [{
          searchType: parsedFilters.searchType || 'brand',
          uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || [],
          filters: parsedFilters.filters || {} // Include loaded filters
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
      {/* Add Filter Modal */}
      <Modal
        opened={openedAddModal}
        onClose={() => {
          setOpenedAddModal(false);
          setFilterName('');
        }}
        title="افزودن فیلتر جدید - ویرایش سریع"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
      >
        <TextInput
          label="نام فیلتر"
          placeholder="نام را وارد کنید"
          {...form.getInputProps("inputBox")} 
          value={filterName}
          onChange={(event) => setFilterName(event.currentTarget.value)}
          size={isMobile ? "sm" : "md"}
          error={
            (saveStatus?.state === "error" && saveStatus?.error?.inputBox) || form.errors.inputBox ? (
              <div>
                {saveStatus?.state === "error" && saveStatus?.error?.inputBox && (
                  <div>{saveStatus.error.inputBox}</div>
                )}
                {form.errors.inputBox && <div>{form.errors.inputBox}</div>}
              </div>
            ) : null
          }
        />
        <Button 
          mt="md" 
          onClick={saveFiltersSettings}
          disabled={!filterName.trim()}
          size={isMobile ? "sm" : "md"}
          fullWidth={isMobile}
        >
          ذخیره
        </Button>
      </Modal>

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
            {isEditMode && (
              <Group gap="xs" mt="xs">
                <Badge color="blue" variant="light" size="sm">
                  حالت ویرایش: {editingFilterName}
                </Badge>
                <Group gap="xs">
                  <ActionIcon
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={saveEditedFilter}
                    title="ذخیره تغییرات"
                  >
                    <IconDeviceFloppy size={14} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    onClick={cancelEditMode}
                    title="لغو ویرایش"
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Group>
            )}
          </div>
          
          {/* Action Buttons */}
          <Flex 
            direction={isMobile ? "column" : "row"}
            gap={isMobile ? "xs" : "sm"}
            align={isMobile ? "stretch" : "center"}
          >
            {/* Filter Settings Menu */}
            {user && 
            <Menu 
              shadow="md" 
              width={isMobile ? "90vw" : isTablet ? 350 : 400} 
              position={isMobile ? "bottom" : "bottom-end"}
              offset={isMobile ? 5 : 10}
              opened={menuOpened}
              onChange={setMenuOpened}
            >
              {/* <Menu.Target>
                <Button 
                  variant="light" 
                  leftSection={!isMobile && <IconFilter size={16} />}
                  size={isMobile ? "sm" : "md"}
                  fullWidth={isMobile}
                  compact={isMobile}
                  styles={{
                    root: {
                      height: isMobile ? '32px' : '36px',
                      fontSize: isMobile ? '11px' : '13px'
                    }
                  }}
                >
                  {isMobile ? "تنظیمات جستجو" : "تنظیمات جستجو"}
                  {checkedRows.size > 0 && ` (${checkedRows.size})`}
                </Button>
              </Menu.Target> */}

              <Menu.Dropdown>
                <Menu.Label>فیلترهای ذخیره شده</Menu.Label>
                
                <Menu.Item
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setOpenedAddModal(true)}
                >
                  افزودن فیلتر جدید
                </Menu.Item>

                {savedFilters && savedFilters.length > 0 && (
                  <>
                    <Menu.Divider />
                    
                    {checkedRows.size > 0 && (
                      <>
                        <Group p="xs" gap="xs" justify={isMobile ? "center" : "flex-start"}>
                          <Button 
                            size="xs" 
                            variant="subtle" 
                            color="gray"
                            onClick={clearSelectedFilters}
                            fullWidth={isMobile}
                            disabled={isEditMode}
                            style={{
                              opacity: isEditMode ? 0.5 : 1
                            }}
                          >
                            پاک کردن انتخاب
                          </Button>
                        </Group>
                        <Menu.Divider />
                      </>
                    )}
                    
                    <Box style={{ 
                      maxHeight: isMobile ? '250px' : '300px', 
                      overflowY: 'auto',
                      overflowX: 'hidden'
                    }}>
                      {savedFilters.map((filter, index) => (
                        <React.Fragment key={filter.id}>
                          <Menu.Item>
                            <Group justify="space-between" w="100%" wrap="nowrap">
                              <Group gap="xs" flex={1} maw="calc(100% - 60px)">
                                <Checkbox
                                  checked={isChecked(filter.id)}
                                  onChange={(event) => {
                                    event.stopPropagation();
                                    if (isEditMode) return;
                                    
                                    const isCurrentlyChecked = event.currentTarget.checked;
                                    handleFilterCheckboxChange(filter.id, isCurrentlyChecked);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  size={isMobile ? "sm" : "md"}
                                  disabled={isEditMode}
                                  style={{
                                    opacity: isEditMode ? 0.5 : 1,
                                    cursor: isEditMode ? 'not-allowed' : 'pointer'
                                  }}
                                />
                                <Text 
                                  size={isMobile ? "xs" : "sm"}
                                  fw={editingFilterId === filter.id ? 600 : 500}
                                  c={editingFilterId === filter.id ? "blue" : undefined}
                                  style={{ 
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    opacity: isEditMode && editingFilterId !== filter.id ? 0.6 : 1
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    
                                    if (isEditMode && editingFilterId !== filter.id) {
                                      notifications.show({
                                        title: 'در حال ویرایش',
                                        message: 'ابتدا ویرایش فعلی را تمام کنید یا لغو کنید.',
                                        color: 'orange',
                                        autoClose: 3000,
                                      });
                                      return;
                                    }

                                      const cookieValue = {
                                        searchType: 'brand',
                                        filters: filter.filters || {},
                                        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
                                        uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
                                        filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
                                      };

  Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
  
  setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
  setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
  setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
  setLocalFilters(filter.filters || {});
  
  if (setFilters) {
    setFilters(filter.filters || {});
  }
  if (setSearchType) {
    setSearchType('brand');
  }

  setSelectedRow(filter.id);

  // 🔥 MODIFIED: Send filter as array with filters to API
  const filterArray = [{
    searchType: 'brand',
    uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
    uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
    filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
    filters: filter.filters || {} // Include the filter's filters
  }];
  dispatch(fetchFastEditBrandModeTableData(filterArray));
}}
                                  title={filter.filterName || 'بدون نام'}
                                >
                                  {filter.filterName || 'بدون نام'}
                                </Text>
                              </Group>
                              
                              <Group gap="xs" style={{ flexShrink: 0 }}>
                                <ActionIcon
                                  variant="subtle"
                                  color="blue"
                                  size={isMobile ? "sm" : "md"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFilter(filter);
                                  }}
                                  title="ویرایش"
                                  disabled={isEditMode && editingFilterId !== filter.id}
                                >
                                  <IconEdit size={isMobile ? 12 : 14} />
                                </ActionIcon>
                                
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  size={isMobile ? "sm" : "md"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isEditMode && editingFilterId !== filter.id) {
                                      notifications.show({
                                        title: 'در حال ویرایش',
                                        message: 'ابتدا ویرایش فعلی را تمام کنید یا لغو کنید.',
                                        color: 'orange',
                                        autoClose: 3000,
                                      });
                                      return;
                                    }
                                    handleDeleteSavedFilter(filter.id);
                                  }}
                                  disabled={deleteLoadingId === filter.id || (isEditMode && editingFilterId !== filter.id)}
                                  title="حذف"
                                >
                                  <IconTrash size={isMobile ? 12 : 14} />
                                </ActionIcon>
                              </Group>
                            </Group>
                          </Menu.Item>
                          {index < savedFilters.length - 1 && <Menu.Divider />}
                        </React.Fragment>
                      ))}
                    </Box>
                  </>
                )}

                {(!savedFilters || savedFilters.length === 0) && (
                  <>
                    <Menu.Divider />
                    <Menu.Item disabled>
                      <Text size={isMobile ? "xs" : "sm"} c="dimmed" ta="center">
                        فیلتری ذخیره نشده است
                      </Text>
                    </Menu.Item>
                  </>
                )}
                              {(!savedFilters || savedFilters.length === 0) && (
                  <>
                    <Menu.Divider />
                    <Menu.Item disabled>
                      <Text size={isMobile ? "xs" : "sm"} c="dimmed" ta="center">
                        فیلتری ذخیره نشده است
                      </Text>
                    </Menu.Item>
                  </>
                )}

                {/* --- Bottom Close Button --- */}
                <Menu.Divider />
                <Box p="xs">
                  <Button
                    fullWidth
                    onClick={() => setMenuOpened(false)}
                  >
                    بستن
                  </Button>
                </Box>
              </Menu.Dropdown>
            </Menu>
            }

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
              flex: '1 1 0',  // Each tab takes equal space
              textAlign: 'center',
              minWidth: 0,  // Allow flex to control width
              border: '1px solid transparent',
              transition: 'all 0.2s ease'
            }
          }} 
          variant="pills" 
          defaultValue="brand" 
          value={searchType} 
          onChange={setSearchType}
          orientation="horizontal"
        >
          <Tabs.List grow={false} style={{ width: '100%', display: 'flex', gap: isMobile ? '8px' : '12px' }}>
            {/* Tab 1 - Takes 1/3 of space */}
            <Tabs.Tab value="brand" style={{ flex: '1 1 0', minWidth: 0 }}>
              {isMobile ? "برند" : "برند"}
            </Tabs.Tab>
            
            {/* Tab 2 - Takes 1/3 of space */}
            <Tabs.Tab value="category" style={{ flex: '1 1 0', minWidth: 0 }}>
              {isMobile ? "دسته‌بندی" : "دسته‌بندی"}
            </Tabs.Tab>

            {/* Filter Button - Takes 1/3 of space */}
            <Button
              variant="light"
              size={isMobile ? "sm" : "md"}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpened(!menuOpened);
              }}
              styles={{
                root: {
                  height: isMobile ? '32px' : '36px',
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  fontSize: isMobile ? '11px' : '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  flex: '1 1 0',  // Takes equal space with tabs
                  minWidth: 0,
                  border: '1px solid #d0d0d0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#a0a0a0'
                  }
                },
              }}
            >
              <IconFilter size={16} />
            </Button>
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