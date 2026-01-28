// src\views\public\fast-order\savedfilters\brandmode\SavedFiltersModalBrandModeFastOrder.jsx
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
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { NavLink } from "react-router";
import { saveFilterSettings } from "../../../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { fetchFastOrderBrandModeTableData } from "../../../../../redux/fastorder/fastordertabledata/fastordertablebrandmode/fastOrderTableBrandModeDataActions";
import { useBrandRowSelection } from "../../BrandRowSelectionContext";
import { useNavigate } from 'react-router-dom';



const SavedFiltersModalBrandModeFastOrder = ({
  opened,
  onClose,
  isMobile,
  COOKIE_NAME,
  getInitialFilters,
  setFilterBrandStorage,
  setFilterBrandsCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  setLocalFilters,
  setFilters,
  setSearchType,
  filters,
  localFilters,
  onCookieUpdate,
  tableData,
  onEditModeChange
}) => {
  const dispatch = useDispatch();
  
  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus, saveLoading } = useSelector((state) => state.saveFilterSettings || {});
  const { updateLoading } = useSelector((state) => state.updateFilterSettings || {});
  const { deleteLoading } = useSelector((state) => state.deleteFilterSettings || {});
  
  // ✅ Get auth state
  const { isVerified, user } = useSelector((state) => state.auth || {});

  const { 
    checkedRows, 
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
  const navigate = useNavigate();

  // ✅ Check authentication when modal opens (only when user clicks the icon)
  useEffect(() => {
    if (opened) {
      // Check if user is authenticated from Redux state
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

  // Helper functions to build filter arrays
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

  const buildInitialFilterArray = useCallback(() => {
    const initialData = getInitialFilters();
    return [{
      searchType: 'brand',
      uniqueIDClickedBrands: initialData.uniqueIDClickedBrands,
      uniqueIDClickedBrandsCategories: initialData.uniqueIDClickedBrandsCategories,
      filterBrandsCategorySubCategoryStorage: initialData.filterBrandsCategorySubCategoryStorage,
      filters: initialData.filters || filters || localFilters
    }];
  }, [getInitialFilters, filters, localFilters]);

const handleEditFilter = useCallback((filter) => {
  // console.log('🎬 [Modal] handleEditFilter called with filter:', filter);
  // console.log('📊 [Modal] tableData:', tableData);

  // ✅ Close modal immediately
  onClose();

  // ✅ NEW: Set flag in sessionStorage BEFORE everything else
  sessionStorage.setItem('manualFilterUpdate', 'true');

  // ✅ IMPORTANT: Clear all checked rows FIRST so sliders remain visible
  clearAll();

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

  // Step 1: Update cookie first
  Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
  // console.log('🍪 [Modal] Cookie updated with:', cookieValue);
  
  // Step 2: Update all state setters IMMEDIATELY
  // console.log('📝 [Modal] Setting filterBrandStorage to:', filter.uniqueIDClickedBrands || []);
  setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
  
  // console.log('📝 [Modal] Setting filterBrandsCategoryStorage to:', filter.uniqueIDClickedBrandsCategories || []);
  setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
  
  // console.log('📝 [Modal] Setting filterBrandsCategorySubCategoryStorage to:', filter.filterBrandsCategorySubCategoryStorage || []);
  setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
  
  setLocalFilters(filter.filters || {});
  
  if (setFilters) setFilters(filter.filters || {});
  if (setSearchType) setSearchType('brand');
  
  // Step 3: Dispatch data fetch immediately
  const filterArray = [{
    searchType: 'brand',
    uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
    uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
    filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
    filters: filter.filters || {}
  }];
  
  // console.log('🚀 [Modal] Dispatching fetchFastOrderBrandModeTableData with:', filterArray);
  dispatch(fetchFastOrderBrandModeTableData(filterArray));
  
  // Step 4: Trigger cookie update callback (this forces SlideCategory to re-render)
  if (onCookieUpdate) {
    // console.log('🔔 [Modal] Calling onCookieUpdate NOW');
    setTimeout(() => {
      onCookieUpdate();
      // ✅ Clear flag after a delay
      setTimeout(() => {
        sessionStorage.removeItem('manualFilterUpdate');
      }, 1000);
    }, 50);
  }
  
  // Step 5: Navigate and show notification after everything is set
  setTimeout(() => {
    if (filter.uniqueIDClickedBrands?.length === 1 && tableData?.brands) {
      const brandId = filter.uniqueIDClickedBrands[0];
      // console.log('🔍 [Modal] Looking for brand with ID:', brandId);
      // console.log('📋 [Modal] Available brands:', tableData.brands);

      const matchingBrand = tableData.brands.find(brand => brand.idBrand === brandId);
      // console.log('✅ [Modal] Found matching brand:', matchingBrand);

      if (matchingBrand?.name) {
        const newUrl = `/fastorder/brand/${matchingBrand.name}`;
        // console.log('🎯 [Modal] Navigating to:', newUrl);
        navigate(newUrl, { replace: true });
      } else {
        // console.log('❌ [Modal] No matching brand found, navigating to base URL');
        navigate('/fastorder/brand', { replace: true });
      }
    } else {
      // console.log('📝 [Modal] Multiple brands or no brands, navigating to base URL');
      navigate('/fastorder/brand', { replace: true });
    }

    notifications.show({
      title: 'حالت ویرایش',
      message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد. اکنون می‌توانید ذخیره یا لغو کنید.`,
      color: 'blue',
      autoClose: 4000,
    });
  }, 100);
}, [COOKIE_NAME, setFilters, setSearchType, dispatch,
    setFilterBrandStorage, setFilterBrandsCategoryStorage,
    setFilterBrandsCategorySubCategoryStorage, setLocalFilters, onCookieUpdate,
    navigate, tableData, clearAll, onClose]);
  // ✅ FIXED: handleFilterClick with proper cookie trigger
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
      searchType: 'brand',
      filters: filter.filters || {},
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
    };

    Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });
    
    // ✅ Trigger cookie reload callback immediately
    if (onCookieUpdate) {
      onCookieUpdate();
    }
    
    setTimeout(() => {
      setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
      setFilterBrandsCategoryStorage(filter.uniqueIDClickedBrandsCategories || []);
      setFilterBrandsCategorySubCategoryStorage(filter.filterBrandsCategorySubCategoryStorage || []);
      setLocalFilters(filter.filters || {});
      
      if (setFilters) setFilters(filter.filters || {});
      if (setSearchType) setSearchType('brand');

      setSelectedRow(filter.id);

      const filterArray = [{
        searchType: 'brand',
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
        filters: filter.filters || {}
      }];
      
      dispatch(fetchFastOrderBrandModeTableData(filterArray));
      onClose();
    }, 50);
  }, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch, onClose, 
      isEditMode, editingFilterId, setFilterBrandStorage, setFilterBrandsCategoryStorage, 
      setFilterBrandsCategorySubCategoryStorage, setLocalFilters, onCookieUpdate]);

  // Also add this useEffect to monitor prop changes in the modal
  // useEffect(() => {
  //   console.log('📥 [Modal] Props received:', {
  //     COOKIE_NAME,
  //     filtersFromProps: filters,
  //     localFiltersFromProps: localFilters,
  //     hasSetFilterBrandStorage: !!setFilterBrandStorage,
  //     hasSetFilterBrandsCategoryStorage: !!setFilterBrandsCategoryStorage,
  //     hasSetFilterBrandsCategorySubCategoryStorage: !!setFilterBrandsCategorySubCategoryStorage,
  //     hasSetLocalFilters: !!setLocalFilters,
  //     hasSetFilters: !!setFilters,
  //     hasSetSearchType: !!setSearchType,
  //     hasTableData: !!tableData,
  //   });
  // }, [COOKIE_NAME, filters, localFilters, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, setFilters, setSearchType, tableData]);

  // Save edited filter
  const saveEditedFilter = useCallback(async () => {
    if (!editingFilterId || !editingFilterName.trim()) return;

    const slug = "brand-fast-order";
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
          });
          return;
        }
        
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
      } else if (result?.type === 'category/updateFilterSettings/rejected') {
        console.error("Update filter was rejected:", result.error);
      }
    } catch (error) {
      console.error("Update filter error:", error);
    }
  }, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch]);

  // Cancel edit mode
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

    const filterArray = buildInitialFilterArray();
    dispatch(fetchFastOrderBrandModeTableData(filterArray));
    
    // ✅ Trigger cookie update to refresh sliders
    if (onCookieUpdate) {
      onCookieUpdate();
    }
    
    notifications.show({
      title: 'لغو ویرایش',
      message: 'تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.',
      color: 'gray',
      autoClose: 2000,
    });
  }, [getInitialFilters, setFilters, setSelectedRow, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, onCookieUpdate]);

  // Handle checkbox change
  const handleFilterCheckboxChange = useCallback((filterId, checked) => {
    if (checked) {
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
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

        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
          
          onClose();
        }, 0);
      }
    } else {
      if (isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      setTimeout(() => {
        const newCheckedRows = new Set(checkedRows);
        newCheckedRows.delete(filterId);
        
        if (newCheckedRows.size > 0) {
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
        } else {
          const initialData = getInitialFilters();
          setFilterBrandStorage(initialData.uniqueIDClickedBrands);
          setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
          setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
          setLocalFilters(initialData.filters);

          if (setFilters) setFilters(initialData.filters);
          if (setSearchType) setSearchType('brand');

          Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

          const filterArray = buildInitialFilterArray();
          dispatch(fetchFastOrderBrandModeTableData(filterArray));
        }
        
        onClose();
      }, 0);
    }
  }, [savedFilters, COOKIE_NAME, setFilters, setSearchType, getInitialFilters, dispatch, isChecked, toggleCheck, checkedRows, buildCheckedFiltersArray, buildInitialFilterArray, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, onClose]);

  // Clear selected filters
  const clearSelectedFilters = useCallback(() => {
    clearAll();
    
    const initialData = getInitialFilters();
    setFilterBrandStorage(initialData.uniqueIDClickedBrands);
    setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
    setFilterBrandsCategorySubCategoryStorage(initialData.filterBrandsCategorySubCategoryStorage);
    setLocalFilters(initialData.filters);

    if (setFilters) setFilters(initialData.filters);
    if (setSearchType) setSearchType('brand');

    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

    const filterArray = buildInitialFilterArray();
    dispatch(fetchFastOrderBrandModeTableData(filterArray));
    
    // ✅ Trigger cookie update
    if (onCookieUpdate) {
      onCookieUpdate();
    }
  }, [clearAll, getInitialFilters, setFilters, setSearchType, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, onCookieUpdate]);

  const saveFiltersSettings = useCallback(async () => {
    if (!filterName.trim()) return;

    const slug = "brand-fast-order";
    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData = {};

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch {}

    try {
      const payload = await dispatch(
        saveFilterSettings({
          slug,
          filters: fullCookieData,
          filterName: filterName.trim(),
        })
      ).unwrap();

      // اگر سرور state=error برگرداند
      if (payload?.state === "error") {
        notifications.show({
          title: 'خطا',
          message: payload.message || 'خطا در ذخیره فیلتر',
          color: 'red',
        });
        return;
      }

      // ✅ اینجا حتماً اجرا می‌شود
      setOpenedAddModal(false);
      setFilterName("");

      notifications.show({
        title: 'ذخیره شد',
        message: `فیلتر "${filterName.trim()}" با موفقیت ذخیره شد.`,
        color: 'green',
      });

      dispatch(getFilterSettings(slug));

    } catch (error) {
      notifications.show({
        title: 'خطا',
        message: error?.message || 'خطا در ذخیره فیلتر',
        color: 'red',
      });
    }
  }, [filterName, COOKIE_NAME, dispatch]);

  // Delete filter handler
  const handleDeleteSavedFilter = useCallback(async (id) => {
    const slug = "brand-fast-order";
    
    try {
      const result = await dispatch(deleteFilterSettings({ slug, id }));

      if (result?.type === 'category/deleteFilterSettings/fulfilled' || result?.payload?.id) {
        dispatch(getFilterSettings(slug));
        if (isChecked(id)) {
          toggleCheck(id);
        }
        if (editingFilterId === id) {
          cancelEditMode();
        }
        
        notifications.show({
          title: 'حذف شد',
          message: 'فیلتر با موفقیت حذف شد',
          color: 'green',
          autoClose: 3000,
        });
      } else if (result?.payload?.status === "error") {
        return;
      }
    } catch (error) {
      console.error("Delete filter error:", error);
    }
  }, [dispatch, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

  // ✅ If not authenticated, show login message in modal
  if (opened && (!user || !isVerified)) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="فیلترهای ذخیره شده"
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
        title="افزودن فیلتر جدید - برند"
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
        title="فیلترهای ذخیره شده - برند"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
        zIndex={1006}
        lockScroll={false}
        removeScrollBar={false}
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

export default SavedFiltersModalBrandModeFastOrder;