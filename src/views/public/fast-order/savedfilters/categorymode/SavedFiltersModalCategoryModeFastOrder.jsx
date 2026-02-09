// src\views\public\fast-order\savedfilters\categorymode\SavedFiltersModalCategoryModeFastOrder.jsx
import React, { useCallback, useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Modal,
  Stack,
  Button,
  Box,
  Paper,
  Group,
  Checkbox,
  Text,
  ActionIcon,
  Divider,
  TextInput,
  Badge,
  Alert,
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit, IconDeviceFloppy, IconAlertCircle } from '@tabler/icons-react';
import { NavLink } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { saveFilterSettings } from "../../../../../redux/savefiltersettings/saveFilterSettingsActions";
import { deleteFilterSettings } from "../../../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { fetchFastOrderCategoryModeTableData } from "../../../../../redux/fastorder/fastordertabledata/fastordertablecategorymode/fastOrderTableCategoryModeDataActions";
import { useApiQuery } from "../../../../../Libs/reactQuery";
import { useCategoryRowSelection } from "../../CategoryRowSelectionContext";

// Stable empty objects for useSelector fallbacks (avoids "selector returned different result" warning)
const EMPTY_GET_FILTER = {};
const EMPTY_SAVE_FILTER = {};
const EMPTY_UPDATE_FILTER = {};
const EMPTY_DELETE_FILTER = {};
const EMPTY_AUTH = {};

const SavedFiltersModalCategoryMode = ({
  opened,
  onClose,
  isMobile,
  COOKIE_NAME,
  getInitialFilters,
  setFilterCategoryStorage,
  setFilterCategorySubCategoryStorage,
  isManualFilterUpdateRef,
  setFilterCategorySubCategoryBrandsStorage,
  setLocalFilters,
  setFilters,
  setSearchType,
  filters,
  localFilters,
  onCookieUpdate,
  onEditModeChange,
  onCategorySavedFilterActiveChange,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const SAVE_FILTERS_SLUG = "category-fast-order";
  const { data: savedFiltersFromQuery, refetch: refetchSavedFilters } = useApiQuery({
    endpoint: `/save-filters/${SAVE_FILTERS_SLUG}`,
    queryKey: ["save-filters", SAVE_FILTERS_SLUG],
    strategy: "USER_DATA",
    transformer: (r) => (Array.isArray(r?.data?.data) ? r.data.data : r?.data ?? []),
  });
  const savedFilters = savedFiltersFromQuery ?? [];
  if (process.env.NODE_ENV === "development" && opened) {
    console.log("[SavedFiltersCategory] savedFilters from query", { length: savedFilters?.length, isArray: Array.isArray(savedFilters) });
  }

  // When modal opens and list is empty (e.g. after returning from brand mode), refetch so list appears
  useEffect(() => {
    if (opened && Array.isArray(savedFilters) && savedFilters.length === 0 && refetchSavedFilters) {
      refetchSavedFilters();
    }
  }, [opened]);
  const { deleteLoadingId } = useSelector((state) => state.getFilterSettings ?? EMPTY_GET_FILTER);
  const { saveStatus, saveLoading } = useSelector((state) => state.saveFilterSettings ?? EMPTY_SAVE_FILTER);
  const { updateLoading } = useSelector((state) => state.updateFilterSettings ?? EMPTY_UPDATE_FILTER);
  const { deleteLoading } = useSelector((state) => state.deleteFilterSettings ?? EMPTY_DELETE_FILTER);
  const { isVerified, user } = useSelector((state) => state.auth ?? EMPTY_AUTH);

  // Same as brand mode: when opening saved filters while not logged in, show notification and close modal
  useEffect(() => {
    if (opened) {
      if (!user || !isVerified) {
        notifications.show({
          title: 'لطفا ابتدا وارد حساب کاربری خود شوید',
          message: 'برای استفاده از فیلترهای ذخیره شده باید وارد شوید',
          color: 'red',
          autoClose: 4000,
        });
        onClose();
      }
    }
  }, [opened, user, isVerified, onClose]);

  const { 
    checkedRows, 
    setSelectedRow, 
    toggleCheck, 
    isChecked, 
    clearAll 
  } = useCategoryRowSelection();

  // Modal states
  const [openedAddModal, setOpenedAddModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  
  // Edit mode states
  const [editingFilterId, setEditingFilterId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilterName, setEditingFilterName] = useState('');

  // Notify parent component when edit mode changes
  useEffect(() => {
    if (onEditModeChange) {
      onEditModeChange(isEditMode, editingFilterName);
    }
  }, [isEditMode, editingFilterName, onEditModeChange]);

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
  const buildCheckedFiltersArray = useCallback((checkedRowIds = checkedRows) => {
    return Array.from(checkedRowIds)
      .map(id => savedFilters?.find(f => f.id === id))
      .filter(Boolean)
      .map(filter => ({
        searchType: 'category',
        uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
        uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
        uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
        filters: filter.filters || filters || localFilters
      }));
  }, [savedFilters, checkedRows, filters, localFilters]);

  const buildInitialFilterArray = useCallback(() => {
    const initialData = getInitialFilters();
    return [{
      searchType: 'category',
      uniqueIDClickedCategories: initialData.uniqueIDClickedCategories,
      uniqueIDClickedSubCategories: initialData.uniqueIDClickedSubCategories,
      uniqueIDClickedSubCategoriesBrands: initialData.uniqueIDClickedSubCategoriesBrands,
      filters: initialData.filters || filters || localFilters
    }];
  }, [getInitialFilters, filters, localFilters]);


const handleEditFilter = useCallback((filter) => {
  // console.log('🎬 [Modal Category] handleEditFilter called with filter:', filter);

  // ✅ Close modal immediately
  onClose();

  // Set manual update flag
  if (isManualFilterUpdateRef) {
    isManualFilterUpdateRef.current = true;
    sessionStorage.setItem('manualFilterUpdate', 'true');
  }

  // ✅ Clear all checked rows FIRST
  clearAll();

  setEditingFilterId(filter.id);
  setEditingFilterName(filter.filterName || 'بدون نام');
  setIsEditMode(true);
  
  const cookieValue = {
    searchType: 'category',
    filters: filter.filters || {},
    uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
    uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
    uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
  };

  // Update cookie
  Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
  // console.log('🍪 [Modal Category] Cookie updated with:', cookieValue);

  // Update state immediately
  setFilterCategoryStorage(filter.uniqueIDClickedCategories || []);
  setFilterCategorySubCategoryStorage(filter.uniqueIDClickedSubCategories || []);
  setFilterCategorySubCategoryBrandsStorage(filter.uniqueIDClickedSubCategoriesBrands || []);
  setLocalFilters(filter.filters || {});
  if (setFilters) setFilters(filter.filters || {});

  // Call onCookieUpdate to trigger reload
  // console.log('🔔 [Modal Category] Calling onCookieUpdate');
  if (onCookieUpdate) {
    onCookieUpdate();
  }

  // Clear flag after everything settles
  setTimeout(() => {
    if (isManualFilterUpdateRef) {
      isManualFilterUpdateRef.current = false;
      sessionStorage.removeItem('manualFilterUpdate');
    }
  }, 1000);

  notifications.show({
    title: 'حالت ویرایش',
    message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد. اکنون می‌توانید ذخیره یا لغو کنید.`,
    color: 'blue',
    autoClose: 4000,
  });
}, [COOKIE_NAME, onCookieUpdate, clearAll, isManualFilterUpdateRef, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, setFilters, onClose]);






const saveEditedFilter = useCallback(async () => {
    if (!editingFilterId || !editingFilterName.trim()) return;

    const slug = "category-fast-order";
    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    try {
      const result = await dispatch(
        updateFilterSettings({
          slug,
          id: editingFilterId,
          filterName: editingFilterName.trim(),
          ...fullCookieData,
        })
      );

      if (result?.type === 'category/updateFilterSettings/fulfilled') {
        if (result?.payload?.state === "error") {
          notifications.show({
            title: 'خطا در به‌روزرسانی',
            message: result.payload.message,
            color: 'red',
            autoClose: 4000,
            zIndex: 1100
          });
          return;
        }
        
        queryClient.invalidateQueries({ queryKey: ["save-filters", slug] });
        setIsEditMode(false);
        setEditingFilterId(null);
        setEditingFilterName('');
        
        notifications.show({
          title: 'ذخیره شد',
          message: `فیلتر "${editingFilterName.trim()}" با موفقیت به‌روزرسانی شد.`,
          color: 'green',
          autoClose: 3000,
          zIndex: 1100
        });
      } else if (result?.type === 'category/updateFilterSettings/rejected') {
        console.error("Update filter was rejected:", result.error);
      }
    } catch (error) {
      console.error("Update filter error:", error);
    }
  }, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch, queryClient]);

  // Cancel edit mode
  const cancelEditMode = useCallback(() => {
    setIsEditMode(false);
    setEditingFilterId(null);
    setEditingFilterName('');
    
    const initialData = getInitialFilters();
    setFilterCategoryStorage(initialData.uniqueIDClickedCategories);
    setFilterCategorySubCategoryStorage(initialData.uniqueIDClickedSubCategories);
    setFilterCategorySubCategoryBrandsStorage(initialData.uniqueIDClickedSubCategoriesBrands);
    setLocalFilters(initialData.filters);
    
    if (setFilters) {
      setFilters(initialData.filters);
    }
    
    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });
    setSelectedRow(null);

    const filterArray = buildInitialFilterArray();
    dispatch(fetchFastOrderCategoryModeTableData(filterArray));
    
    notifications.show({
      title: 'لغو ویرایش',
      message: 'تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.',
      color: 'gray',
      autoClose: 2000,
      zIndex: 1100
    });
  }, [getInitialFilters, setFilters, setSelectedRow, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters]);

  // Handle checkbox change
  const handleFilterCheckboxChange = useCallback((filterId, checked) => {
    // Set manual filter update flag to prevent URL sync from overriding our changes
    sessionStorage.setItem('manualFilterUpdate', 'true');
    if (isManualFilterUpdateRef) {
      isManualFilterUpdateRef.current = true;
    }
    
    if (checked) {
      if (typeof onCategorySavedFilterActiveChange === "function") {
        onCategorySavedFilterActiveChange(true);
      }
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }

      const selectedFilter = savedFilters?.find(f => f.id === filterId);
      if (selectedFilter) {
        // Clear all 1st/2nd/3rd row states; 1st row disabled, 2nd/3rd hidden when filter active
        const cookieValue = {
          searchType: 'category',
          filters: selectedFilter.filters || {},
          uniqueIDClickedCategories: [],
          uniqueIDClickedSubCategories: [],
          uniqueIDClickedSubCategoriesBrands: [],
        };
        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

        setFilterCategoryStorage([]);
        setFilterCategorySubCategoryStorage([]);
        setFilterCategorySubCategoryBrandsStorage([]);
        setLocalFilters(selectedFilter.filters || {});

        if (setFilters) setFilters(selectedFilter.filters || {});
        if (setSearchType) setSearchType('category');

        // Force cookie sync so SearchComponent's "Cookie reload" effect runs and all 3 slider rows clear
        if (onCookieUpdate) onCookieUpdate();

        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
          onClose();
          
          // Clear manual filter update flag after state has settled
          setTimeout(() => {
            sessionStorage.removeItem('manualFilterUpdate');
            if (isManualFilterUpdateRef) {
              isManualFilterUpdateRef.current = false;
            }
          }, 500);
        }, 0);
      }
    } else {
      const newCheckedRows = new Set(checkedRows);
      newCheckedRows.delete(filterId);

      // Clear sliders and write cookie SYNCHRONOUSLY before toggleCheck, so when
      // SearchComponentCategory's cookie reload runs (after checkedRows becomes 0)
      // it reads the empty cookie instead of the old one.
      const freshFilters = {
        color: "all",
        province: "all",
        stockStatus: "all",
        minStock: "",
        deliveryTime: "",
        paymentType: "",
        supplier: "",
        sort: "bestPrice",
        priceFormat: "hezar",
      };

      setFilterCategoryStorage([]);
      setFilterCategorySubCategoryStorage([]);
      setFilterCategorySubCategoryBrandsStorage([]);
      setLocalFilters(freshFilters);
      if (setFilters) setFilters(freshFilters);
      if (setSearchType) setSearchType('category');

      const freshCookieData = {
        searchType: 'category',
        uniqueIDClickedCategories: [],
        uniqueIDClickedSubCategories: [],
        uniqueIDClickedSubCategoriesBrands: [],
        filters: freshFilters,
      };
      Cookies.set(COOKIE_NAME, JSON.stringify(freshCookieData), { expires: 7 });
      if (onCookieUpdate) onCookieUpdate();

      if (isChecked(filterId)) {
        toggleCheck(filterId);
      }

      setTimeout(() => {
        if (newCheckedRows.size > 0) {
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
        } else {
          const filterArray = [{
            searchType: 'category',
            uniqueIDClickedCategories: [],
            uniqueIDClickedSubCategories: [],
            uniqueIDClickedSubCategoriesBrands: [],
            filters: freshFilters
          }];
          dispatch(fetchFastOrderCategoryModeTableData(filterArray));
        }
        onClose();
        setTimeout(() => {
          sessionStorage.removeItem('manualFilterUpdate');
          if (isManualFilterUpdateRef) {
            isManualFilterUpdateRef.current = false;
          }
        }, 500);
      }, 0);
    }
  }, [savedFilters, COOKIE_NAME, setFilters, setSearchType, getInitialFilters, dispatch, isChecked, toggleCheck, checkedRows, buildCheckedFiltersArray, buildInitialFilterArray, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, onClose, onCookieUpdate, isManualFilterUpdateRef, onCategorySavedFilterActiveChange]);

  // Clear selected filters
  const clearSelectedFilters = useCallback(() => {
    clearAll();
    
    // Reset to fresh empty state
    const freshFilters = {
      color: "all",
      province: "all",
      stockStatus: "all",
      minStock: "",
      deliveryTime: "",
      paymentType: "",
      supplier: "",
      sort: "bestPrice",
      priceFormat: "hezar",
    };
    
    setFilterCategoryStorage([]);
    setFilterCategorySubCategoryStorage([]);
    setFilterCategorySubCategoryBrandsStorage([]);
    setLocalFilters(freshFilters);

    if (setFilters) setFilters(freshFilters);
    if (setSearchType) setSearchType('category');

    const freshCookieData = {
      searchType: 'category',
      uniqueIDClickedCategories: [],
      uniqueIDClickedSubCategories: [],
      uniqueIDClickedSubCategoriesBrands: [],
      filters: freshFilters,
    };
    Cookies.set(COOKIE_NAME, JSON.stringify(freshCookieData), { expires: 7 });

    // Trigger cookie sync
    if (onCookieUpdate) onCookieUpdate();

    const filterArray = [{
      searchType: 'category',
      uniqueIDClickedCategories: [],
      uniqueIDClickedSubCategories: [],
      uniqueIDClickedSubCategoriesBrands: [],
      filters: freshFilters
    }];
    dispatch(fetchFastOrderCategoryModeTableData(filterArray));
  }, [clearAll, setFilters, setSearchType, COOKIE_NAME, dispatch, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, onCookieUpdate]);

  // Save filter settings
  const saveFiltersSettings = useCallback(async () => {
    if (!filterName.trim()) return;

    const slug = "category-fast-order";
    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[SavedFiltersCategory] saveFiltersSettings: start", {
        filterName: filterName.trim(),
        slug,
        hasCookieData: !!Object.keys(fullCookieData || {}).length,
        uniqueIDClickedSubCategoriesBrands: fullCookieData?.uniqueIDClickedSubCategoriesBrands?.length,
      });
    }

    try {
      const result = await dispatch(
        saveFilterSettings({
          slug,
          filters: fullCookieData,
          filterName: filterName.trim(),
        })
      );

      if (process.env.NODE_ENV === "development") {
        console.log("[SavedFiltersCategory] saveFiltersSettings: result", {
          type: result?.type,
          payloadState: result?.payload?.state,
          hasData: !!result?.payload?.data,
          searchesLength: result?.payload?.data?.searches?.length,
        });
      }

      if (result?.type === "category/saveFilterSettings/rejected") {
        const msg = result?.payload?.message || result?.error?.message || "";
        const isMaxFive = msg.includes("5") || msg.toLowerCase().includes("filter settings");
        setOpenedAddModal(false);
        setFilterName("");
        if (isMaxFive) {
          onClose();
          notifications.show({
            title: "حداکثر ۵ فیلتر",
            message: msg || "حداکثر ۵ فیلتر می‌توانید ذخیره کنید.",
            color: "orange",
            autoClose: 5000,
            zIndex: 1100,
          });
        } else {
          notifications.show({
            title: "خطا",
            message: msg || "خطا در ذخیره فیلتر",
            color: "red",
            zIndex: 1100,
          });
        }
        return;
      }

      if (result?.type === "category/saveFilterSettings/fulfilled") {
        if (result?.payload?.state === "error") {
          if (process.env.NODE_ENV === "development") {
            console.warn("[SavedFiltersCategory] saveFiltersSettings: API state=error", result?.payload);
          }
          return;
        }

        setOpenedAddModal(false);
        setFilterName("");
        const payloadData = result?.payload?.data;
        const newList = Array.isArray(payloadData?.searches)
          ? payloadData.searches
          : Array.isArray(payloadData)
            ? payloadData
            : [];
        if (newList.length > 0) {
          queryClient.setQueryData(["save-filters", slug], newList);
          if (process.env.NODE_ENV === "development") {
            console.log("[SavedFiltersCategory] saveFiltersSettings: cache updated with create response", { listLength: newList.length });
          }
        } else {
          await queryClient.refetchQueries({ queryKey: ["save-filters", slug] });
          if (process.env.NODE_ENV === "development") {
            console.log("[SavedFiltersCategory] saveFiltersSettings: refetched (no list in response)");
          }
        }
        notifications.show({
          title: "ذخیره شد",
          message: `فیلتر "${filterName.trim()}" با موفقیت ذخیره شد.`,
          color: "green",
          autoClose: 3000,
          zIndex: 1100,
        });
      } else if (result?.payload?.status === "error") {
        return;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[SavedFiltersCategory] saveFiltersSettings: catch", error);
      }
      const msg = error?.message || "خطا در ذخیره فیلتر";
      const isMaxFive = msg.includes("5") || msg.toLowerCase().includes("filter settings");
      setOpenedAddModal(false);
      setFilterName("");
      if (isMaxFive) {
        onClose();
        notifications.show({
          title: "حداکثر ۵ فیلتر",
          message: msg,
          color: "orange",
          autoClose: 5000,
          zIndex: 1100,
        });
      } else {
        notifications.show({
          title: "خطا",
          message: msg,
          color: "red",
          zIndex: 1100,
        });
      }
    }
  }, [filterName, COOKIE_NAME, dispatch, queryClient, onClose]);

  // Delete filter handler: update cache by removing deleted id so list doesn't go to 0 during refetch
  const handleDeleteSavedFilter = useCallback(async (id) => {
    const slug = "category-fast-order";

    if (process.env.NODE_ENV === "development") {
      console.log("[SavedFiltersCategory] handleDeleteSavedFilter: start", { id, slug });
    }

    try {
      const result = await dispatch(deleteFilterSettings({ slug, id }));

      if (process.env.NODE_ENV === "development") {
        console.log("[SavedFiltersCategory] handleDeleteSavedFilter: result", {
          type: result?.type,
          payloadId: result?.payload?.id,
          isFulfilled: result?.type === "category/deleteFilterSettings/fulfilled" || !!result?.payload?.id,
        });
      }

      if (result?.type === "category/deleteFilterSettings/fulfilled" || result?.payload?.id) {
        const currentList = queryClient.getQueryData(["save-filters", slug]);
        const nextList = Array.isArray(currentList) ? currentList.filter((f) => String(f?.id) !== String(id)) : [];
        queryClient.setQueryData(["save-filters", slug], nextList);
        if (process.env.NODE_ENV === "development") {
          console.log("[SavedFiltersCategory] handleDeleteSavedFilter: cache updated (remove id)", {
            previousLength: currentList?.length,
            nextLength: nextList.length,
          });
        }
        if (isChecked(id)) {
          toggleCheck(id);
        }
        if (editingFilterId === id) {
          cancelEditMode();
        }
        notifications.show({
          title: "حذف شد",
          message: "فیلتر با موفقیت حذف شد",
          color: "green",
          autoClose: 3000,
          zIndex: 1100,
        });
      } else if (result?.payload?.status === "error") {
        if (process.env.NODE_ENV === "development") {
          console.warn("[SavedFiltersCategory] handleDeleteSavedFilter: API error", result?.payload);
        }
        return;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[SavedFiltersCategory] handleDeleteSavedFilter: error", error);
      }
    }
  }, [dispatch, queryClient, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

const handleFilterClick = useCallback((filter) => {
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
    searchType: 'category',
    filters: filter.filters || {},
    uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
    uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
    uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
  };

  Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
  
  // ✅ Trigger cookie reload callback immediately
  if (onCookieUpdate) {
    onCookieUpdate();
  }
  
  setTimeout(() => {
    setFilterCategoryStorage(filter.uniqueIDClickedCategories || []);
    setFilterCategorySubCategoryStorage(filter.uniqueIDClickedSubCategories || []);
    setFilterCategorySubCategoryBrandsStorage(filter.uniqueIDClickedSubCategoriesBrands || []);
    setLocalFilters(filter.filters || {});
    
    if (setFilters) setFilters(filter.filters || {});
    if (setSearchType) setSearchType('category');

    setSelectedRow(filter.id);

    const filterArray = [{
      searchType: 'category',
      uniqueIDClickedCategories: filter.uniqueIDClickedCategories || [],
      uniqueIDClickedSubCategories: filter.uniqueIDClickedSubCategories || [],
      uniqueIDClickedSubCategoriesBrands: filter.uniqueIDClickedSubCategoriesBrands || [],
      filters: filter.filters || {}
    }];
    dispatch(fetchFastOrderCategoryModeTableData(filterArray));
    
    onClose();
  }, 50);
}, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch, onClose, isEditMode, editingFilterId, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, onCookieUpdate]);

  // If not authenticated, show login message in modal (same as brand mode)
  if (opened && (!user || !isVerified)) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="فیلترهای ذخیره شده - دسته‌بندی"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
        zIndex={1006}
      >
        <Alert icon={<IconAlertCircle size={16} />} title="لطفا ابتدا وارد حساب کاربری خود شوید" color="red" variant="light">
          <Text size="sm" mb="md">
            برای استفاده از فیلترهای ذخیره شده باید وارد حساب کاربری خود شوید
          </Text>
          <Button
            component={NavLink}
            to="/login"
            fullWidth
            styles={{
              root: {
                backgroundColor: '#093572',
                '&:hover': {
                  backgroundColor: '#0a4080',
                },
              },
            }}
          >
            ورود / ثبت‌نام
          </Button>
        </Alert>
      </Modal>
    );
  }

  return (
    <>
      {/* Add Filter Modal */}
      <Modal
        opened={openedAddModal}
        onClose={() => {
          setOpenedAddModal(false);
          setFilterName('');
        }}
        title="افزودن فیلتر جدید - دسته بندی"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
        zIndex={1006}
        lockScroll={false}
        removeScrollBar={false}
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
          disabled={!filterName.trim() || saveLoading}
          loading={saveLoading}
          size={isMobile ? "sm" : "md"}
          fullWidth={isMobile}
          styles={{
            root: {
              backgroundColor: '#093572',
              '&:hover': {
                backgroundColor: '#0a4080',
              },
            },
          }}
        >
          ذخیره
        </Button>
      </Modal>

      {/* Main Filters Modal */}
      <Modal
        opened={opened}
        onClose={onClose}
        title="فیلترهای ذخیره شده - دسته‌بندی"
        centered
        size={isMobile ? "sm" : "md"}
        zIndex={1006}
        lockScroll={false}
        removeScrollBar={false}
        styles={{
          root: {
            marginTop: '0 !important',
            paddingTop: '0 !important',
            paddingRight: '0 !important',
          },
          inner: {
            marginTop: '0 !important',
            paddingTop: '0 !important',
            paddingBottom: 0,
            top: '0 !important',
            alignItems: 'flex-start',
          },
          content: {
            marginTop: '0 !important',
            paddingTop: '0 !important',
            top: '0 !important',
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
          title: {
            fontSize: 18,
            fontWeight: 600,
            marginTop: '0 !important',
            marginBottom: '0 !important',
            paddingTop: '0 !important',
            paddingBottom: '0 !important',
            margin: '0 !important',
            padding: '0 !important',
          },
          header: {
            position: 'sticky',
            top: 0,
            marginTop: '0 !important',
            marginBottom: 0,
            paddingTop: '0 !important',
            paddingBottom: '1rem',
            paddingLeft: 'var(--mantine-spacing-md)',
            paddingRight: 'var(--mantine-spacing-md)',
            margin: '0 !important',
            zIndex: 101,
            backgroundColor: 'white',
            borderBottom: '1px solid #dee2e6',
          },
          body: {
            marginTop: 0,
            paddingTop: 0,
            paddingLeft: 'var(--mantine-spacing-md)',
            paddingRight: 'var(--mantine-spacing-md)',
            paddingBottom: 'var(--mantine-spacing-lg)',
            overflowY: 'auto',
            flex: 1,
          },
          close: {
            marginTop: 0,
            paddingTop: 0,
          },
        }}
      >
        <Stack spacing="md">
          {/* Edit Mode Badge and Actions */}
          {isEditMode && (
            <>
              <Group gap="xs" mt="xs">
                <Badge
                  color="#093572"
                  variant="light"
                  size="sm"
                  styles={{
                    root: {
                      backgroundColor: '#e3f2fd',
                      color: '#093572',
                    },
                  }}
                >
                  حالت ویرایش: {editingFilterName}
                </Badge>
                <Group gap="xs">
                  <ActionIcon
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={saveEditedFilter}
                    title="ذخیره تغییرات"
                    loading={updateLoading}
                    disabled={updateLoading}
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
              <Divider />
            </>
          )}

          {/* Add New Filter Button */}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              onClose();
              setOpenedAddModal(true);
            }}
            fullWidth
            disabled={isEditMode}
            styles={{
              root: {
                backgroundColor: '#093572',
                '&:hover': {
                  backgroundColor: '#0a4080',
                },
              },
            }}
          >
            افزودن فیلتر جدید
          </Button>

          {/* Clear Selection Button */}
          {checkedRows.size > 0 && (
            <>
              <Divider />
              <Button 
                size="sm" 
                variant="subtle" 
                color="gray"
                onClick={clearSelectedFilters}
                fullWidth
                disabled={isEditMode}
              >
                پاک کردن انتخاب ({checkedRows.size})
              </Button>
            </>
          )}

          <Divider />

          {/* Filters List */}
          {savedFilters && savedFilters.length > 0 ? (
            <Box style={{ 
              maxHeight: isMobile ? '300px' : '400px', 
              overflowY: 'auto',
              overflowX: 'hidden'
            }}>
              <Stack spacing="xs">
                {savedFilters.map((filter) => (
                  <Paper key={filter.id} p="sm" withBorder>
                    <Group justify="space-between" w="100%" wrap="nowrap">
                      <Group gap="xs" flex={1} maw="calc(100% - 60px)">
                        <Checkbox
                          checked={isChecked(filter.id)}
                          onChange={(event) => {
                            if (isEditMode) return;
                            const isCurrentlyChecked = event.currentTarget.checked;
                            handleFilterCheckboxChange(filter.id, isCurrentlyChecked);
                          }}
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
                            cursor: 'default',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            opacity: isEditMode && editingFilterId !== filter.id ? 0.5 : 1
                          }}
                          title={filter.filterName || 'بدون نام'}
                        >
                          {filter.filterName || 'بدون نام'}
                        </Text>
                      </Group>
                      
                      <Group gap="xs" style={{ flexShrink: 0 }}>
                        <ActionIcon
                          variant="subtle"
                          color="#093572"
                          size={isMobile ? "sm" : "md"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEditMode) return;
                            handleEditFilter(filter);
                          }}
                          title="ویرایش"
                          disabled={isEditMode}
                          style={{
                            opacity: isEditMode ? 0.5 : 1,
                            cursor: isEditMode ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <IconEdit size={isMobile ? 12 : 14} />
                        </ActionIcon>

                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size={isMobile ? "sm" : "md"}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isEditMode) return;
                            handleDeleteSavedFilter(filter.id);
                          }}
                          disabled={deleteLoadingId === filter.id || isEditMode}
                          loading={deleteLoading && deleteLoadingId === filter.id}
                          title="حذف"
                          style={{
                            opacity: isEditMode ? 0.5 : 1,
                            cursor: isEditMode ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <IconTrash size={isMobile ? 12 : 14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Box>
          ) : (
            <Text size={isMobile ? "xs" : "sm"} c="dimmed" ta="center">
              فیلتری ذخیره نشده است
            </Text>
          )}
        </Stack>
      </Modal>
    </>
  );
};

export default SavedFiltersModalCategoryMode;