import React, { useCallback, useState } from "react";
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
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { saveFilterSettings } from "../../../../../redux/savefiltersettings/saveFilterSettingsActions";
import { getFilterSettings } from "../../../../../redux/savefiltersettings/getFilterSettings/getFilterSettingsActions";
import { deleteFilterSettings } from "../../../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { fetchFastOrderCategoryModeTableData } from "../../../../../redux/fastorder/fastordertabledata/fastordertablecategorymode/fastOrderTableCategoryModeDataActions";
import { useCategoryRowSelection } from "../../CategoryRowSelectionContext";



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
  onCookieUpdate 
}) => {
  const dispatch = useDispatch();
  
  const { savedFilters, deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus, saveLoading } = useSelector((state) => state.saveFilterSettings || {});
  const { updateLoading } = useSelector((state) => state.updateFilterSettings || {});
  const { deleteLoading } = useSelector((state) => state.deleteFilterSettings || {});

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

  // Close modal
  onClose();

  // Clear flag after everything settles
  setTimeout(() => {
    if (isManualFilterUpdateRef) {
      isManualFilterUpdateRef.current = false;
      sessionStorage.removeItem('manualFilterUpdate');
    }
  }, 1000);

  notifications.show({
    title: 'حالت ویرایش',
    message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد.`,
    color: 'blue',
    autoClose: 4000,
  });
}, [COOKIE_NAME, onClose, onCookieUpdate, clearAll, isManualFilterUpdateRef, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, setFilters]);






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
        
        dispatch(getFilterSettings(slug));
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
  }, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch]);

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
    if (checked) {
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      const selectedFilter = savedFilters?.find(f => f.id === filterId);
      if (selectedFilter) {
        const cookieValue = {
          searchType: 'category',
          filters: selectedFilter.filters || {},
          uniqueIDClickedCategories: selectedFilter.uniqueIDClickedCategories || [],
          uniqueIDClickedSubCategories: selectedFilter.uniqueIDClickedSubCategories || [],
          uniqueIDClickedSubCategoriesBrands: selectedFilter.uniqueIDClickedSubCategoriesBrands || [],
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

        setFilterCategoryStorage(selectedFilter.uniqueIDClickedCategories || []);
        setFilterCategorySubCategoryStorage(selectedFilter.uniqueIDClickedSubCategories || []);
        setFilterCategorySubCategoryBrandsStorage(selectedFilter.uniqueIDClickedSubCategoriesBrands || []);
        setLocalFilters(selectedFilter.filters || {});

        if (setFilters) setFilters(selectedFilter.filters || {});
        if (setSearchType) setSearchType('category');

        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
          
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
          dispatch(fetchFastOrderCategoryModeTableData(checkedFiltersArray));
        } else {
          const initialData = getInitialFilters();
          setFilterCategoryStorage(initialData.uniqueIDClickedCategories);
          setFilterCategorySubCategoryStorage(initialData.uniqueIDClickedSubCategories);
          setFilterCategorySubCategoryBrandsStorage(initialData.uniqueIDClickedSubCategoriesBrands);
          setLocalFilters(initialData.filters);

          if (setFilters) setFilters(initialData.filters);
          if (setSearchType) setSearchType('category');

          Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

          const filterArray = buildInitialFilterArray();
          dispatch(fetchFastOrderCategoryModeTableData(filterArray));
        }
        
        onClose();
      }, 0);
    }
  }, [savedFilters, COOKIE_NAME, setFilters, setSearchType, getInitialFilters, dispatch, isChecked, toggleCheck, checkedRows, buildCheckedFiltersArray, buildInitialFilterArray, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters, onClose]);

  // Clear selected filters
  const clearSelectedFilters = useCallback(() => {
    clearAll();
    
    const initialData = getInitialFilters();
    setFilterCategoryStorage(initialData.uniqueIDClickedCategories);
    setFilterCategorySubCategoryStorage(initialData.uniqueIDClickedSubCategories);
    setFilterCategorySubCategoryBrandsStorage(initialData.uniqueIDClickedSubCategoriesBrands);
    setLocalFilters(initialData.filters);

    if (setFilters) setFilters(initialData.filters);
    if (setSearchType) setSearchType('category');

    Cookies.set(COOKIE_NAME, JSON.stringify(initialData), { expires: 7 });

    const filterArray = buildInitialFilterArray();
    dispatch(fetchFastOrderCategoryModeTableData(filterArray));
  }, [clearAll, getInitialFilters, setFilters, setSearchType, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterCategoryStorage, setFilterCategorySubCategoryStorage, setFilterCategorySubCategoryBrandsStorage, setLocalFilters]);

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

    try {
      const result = await dispatch(
        saveFilterSettings({
          slug,
          filters: fullCookieData,
          filterName: filterName.trim(),
        })
      );

      if (result?.type === 'category/saveFilterSettings/fulfilled') {
        if (result?.payload?.state === "error") {
          // console.log("Server validation error:", result.payload);
          return;
        }
        
        // console.log("Save successful, closing modal");
        setOpenedAddModal(false);
        setFilterName("");
        
        setTimeout(() => {
          dispatch(getFilterSettings(slug));
        }, 500);
        
        notifications.show({
          title: 'ذخیره شد',
          message: `فیلتر "${filterName.trim()}" با موفقیت ذخیره شد.`,
          color: 'green',
          autoClose: 3000,
          zIndex: 1100
        });
      } else if (result?.payload?.status === "error") {
        return;
      }
      
    } catch (error) {
      console.error("Save filter error:", error);
    }
  }, [filterName, COOKIE_NAME, dispatch]);

  // Delete filter handler
  const handleDeleteSavedFilter = useCallback(async (id) => {
    const slug = "category-fast-order";
    
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
          zIndex: 1100
        });
      } else if (result?.payload?.status === "error") {
        return;
      }
    } catch (error) {
      console.error("Delete filter error:", error);
    }
  }, [dispatch, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

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
        padding={isMobile ? "sm" : "md"}
        zIndex={1006}
      >
        <Stack spacing="md">
          {/* Add New Filter Button */}
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              onClose();
              setOpenedAddModal(true);
            }}
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
                            cursor: 'pointer',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flex: 1,
                            opacity: isEditMode && editingFilterId !== filter.id ? 0.6 : 1
                          }}
                          onClick={() => handleFilterClick(filter)}
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
                                zIndex: 1100
                              });
                              return;
                            }
                            handleDeleteSavedFilter(filter.id);
                          }}
                          disabled={deleteLoadingId === filter.id || (isEditMode && editingFilterId !== filter.id)}
                          loading={deleteLoading && deleteLoadingId === filter.id}
                          title="حذف"
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

      {/* Edit Mode Badge and Actions - Render outside modals */}
      {isEditMode && (
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
      )}
    </>
  );
};

export default SavedFiltersModalCategoryMode;