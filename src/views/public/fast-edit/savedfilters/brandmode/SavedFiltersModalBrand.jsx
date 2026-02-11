// src\views\public\fast-edit\savedfilters\brandmode\SavedFiltersModalBrand.jsx
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
} from "@mantine/core";
import { IconPlus, IconTrash, IconEdit, IconDeviceFloppy } from '@tabler/icons-react';
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { saveFilterSettings } from "../../../../../redux/savefiltersettings/saveFilterSettingsActions";
import { deleteFilterSettings } from "../../../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { fetchFastEditBrandModeTableData } from "../../../../../redux/fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataActions";
import { useBrandRowSelection } from "../../BrandRowSelectionContext";

const SavedFiltersModalBrandModeFastEdit = ({
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
  onEditModeChange,
  savedFilters: savedFiltersProp,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const SAVE_FILTERS_SLUG = "brand-fast-edit";
  const savedFilters = savedFiltersProp ?? [];
  
  const { deleteLoadingId } = useSelector((state) => state.getFilterSettings || {});
  const { saveStatus } = useSelector((state) => state.saveFilterSettings || {});

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

  // Edit filter handler
  const handleEditFilter = useCallback((filter) => {
    // ✅ Close modal immediately
    onClose();

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

    const filterArray = [{
      searchType: 'brand',
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
      filters: filter.filters || {}
    }];

    dispatch(fetchFastEditBrandModeTableData(filterArray));

    notifications.show({
      title: 'حالت ویرایش',
      message: `فیلتر "${filter.filterName || 'بدون نام'}" بارگذاری شد. اکنون می‌توانید ذخیره یا لغو کنید.`,
      color: 'blue',
      autoClose: 4000,
    });
  }, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch, onClose, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters, clearAll]);

  // Save edited filter
  const saveEditedFilter = useCallback(() => {
    if (!editingFilterId || !editingFilterName.trim()) return;

    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    dispatch(
      updateFilterSettings({
        slug: SAVE_FILTERS_SLUG,
        id: editingFilterId,
        filterName: editingFilterName.trim(),
        ...fullCookieData,
      })
    ).then(() => {
      queryClient.invalidateQueries({ queryKey: ["save-filters", SAVE_FILTERS_SLUG] });
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
  }, [editingFilterId, editingFilterName, COOKIE_NAME, dispatch, queryClient]);

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
    dispatch(fetchFastEditBrandModeTableData(filterArray));
    
    notifications.show({
      title: 'لغو ویرایش',
      message: 'تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.',
      color: 'gray',
      autoClose: 2000,
    });
  }, [getInitialFilters, setFilters, setSelectedRow, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters]);

  // Handle checkbox change
  const handleFilterCheckboxChange = useCallback((filterId, checked) => {
    if (checked) {
      if (!isChecked(filterId)) {
        toggleCheck(filterId);
      }
      
      const selectedFilter = savedFilters?.find(f => f.id === filterId);
      if (selectedFilter) {
        // Clear all 1st/2nd/3rd row states; 1st row disabled, 2nd/3rd hidden when filter active
        const cookieValue = {
          searchType: 'brand',
          filters: selectedFilter.filters || {},
          uniqueIDClickedBrands: [],
          uniqueIDClickedBrandsCategories: [],
          filterBrandsCategorySubCategoryStorage: [],
        };

        Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

        setFilterBrandStorage([]);
        setFilterBrandsCategoryStorage([]);
        setFilterBrandsCategorySubCategoryStorage([]);
        setLocalFilters(selectedFilter.filters || {});

        if (setFilters) setFilters(selectedFilter.filters || {});
        if (setSearchType) setSearchType('brand');

        setTimeout(() => {
          const newCheckedRows = new Set(checkedRows);
          newCheckedRows.add(filterId);
          
          const checkedFiltersArray = buildCheckedFiltersArray(newCheckedRows);
          dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
          
          // ✅ Close modal after checking filter
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
          dispatch(fetchFastEditBrandModeTableData(checkedFiltersArray));
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
          dispatch(fetchFastEditBrandModeTableData(filterArray));
        }
        
        // ✅ Close modal after unchecking filter
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
    dispatch(fetchFastEditBrandModeTableData(filterArray));
  }, [clearAll, getInitialFilters, setFilters, setSearchType, COOKIE_NAME, dispatch, buildInitialFilterArray, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters]);

  // Save filter settings
  const saveFiltersSettings = useCallback(() => {
    if (!filterName.trim()) return;

    const cookieRaw = Cookies.get(COOKIE_NAME);
    let fullCookieData;

    try {
      fullCookieData = cookieRaw ? JSON.parse(cookieRaw) : {};
    } catch (error) {
      fullCookieData = {};
    }

    dispatch(
      saveFilterSettings({
        slug: SAVE_FILTERS_SLUG,
        filters: fullCookieData,
        filterName: filterName.trim(),
      })
    ).then((result) => {
      // Rejected – Redux saveError is set; search component shows ErrorMessageModal with backend message
      if (result?.type === "category/saveFilterSettings/rejected") {
        const msg =
          result?.payload?.message ||
          (typeof result?.payload === "string" ? result.payload : null) ||
          result?.error?.message ||
          "";
        const isMaxFive = msg.includes("5") || msg.toLowerCase().includes("filter settings");
        setOpenedAddModal(false);
        setFilterName("");
        if (isMaxFive) {
          onClose();
        }
        return;
      }
      // Success
      queryClient.invalidateQueries({ queryKey: ["save-filters", SAVE_FILTERS_SLUG] });
      if (result?.payload?.state === "ok" || result?.type?.includes("fulfilled")) {
        setOpenedAddModal(false);
        setFilterName("");
        notifications.show({
          title: "ذخیره شد",
          message: `فیلتر "${filterName.trim()}" با موفقیت ذخیره شد.`,
          color: "green",
          autoClose: 3000,
        });
      }
    }).catch(() => {
      // Unexpected rejection – close add modal only; Redux may have saveError for modal
      setOpenedAddModal(false);
      setFilterName("");
    });
  }, [filterName, COOKIE_NAME, dispatch, queryClient, onClose]);

  // Delete filter handler
  const handleDeleteSavedFilter = useCallback((id) => {
    dispatch(deleteFilterSettings({ slug: SAVE_FILTERS_SLUG, id }))
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["save-filters", SAVE_FILTERS_SLUG] });
        if (isChecked(id)) {
          toggleCheck(id);
        }
        if (editingFilterId === id) {
          cancelEditMode();
        }
      });
  }, [dispatch, queryClient, isChecked, toggleCheck, editingFilterId, cancelEditMode]);

  // Handle filter click (load without editing)
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

    const filterArray = [{
      searchType: 'brand',
      uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
      uniqueIDClickedBrandsCategories: filter.uniqueIDClickedBrandsCategories || [],
      filterBrandsCategorySubCategoryStorage: filter.filterBrandsCategorySubCategoryStorage || [],
      filters: filter.filters || {}
    }];
    dispatch(fetchFastEditBrandModeTableData(filterArray));
    
    // ✅ Close modal after loading filter
    onClose();
  }, [COOKIE_NAME, setFilters, setSearchType, setSelectedRow, dispatch, onClose, isEditMode, editingFilterId, setFilterBrandStorage, setFilterBrandsCategoryStorage, setFilterBrandsCategorySubCategoryStorage, setLocalFilters]);

  return (
    <>
      {/* Add Filter Modal */}
      <Modal
        opened={openedAddModal}
        removeScrollProps={{ removeScrollBar: false }}
        onClose={() => {
          setOpenedAddModal(false);
          setFilterName("");
        }}
        title="افزودن فیلتر جدید - ویرایش سریع"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
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
            (saveStatus?.state === "error" && saveStatus?.error?.inputBox) ||
            form.errors.inputBox ? (
              <div>
                {saveStatus?.state === "error" &&
                  saveStatus?.error?.inputBox && (
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
          styles={{
            root: {
              backgroundColor: "#093572",
              "&:hover": {
                backgroundColor: "#0a4080",
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
        removeScrollProps={{ removeScrollBar: false }}
        title="فیلترهای ذخیره شده"
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
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
                      backgroundColor: "#e3f2fd",
                      color: "#093572",
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
                backgroundColor: "#093572",
                "&:hover": {
                  backgroundColor: "#0a4080",
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
            <Box
              style={{
                maxHeight: isMobile ? "300px" : "400px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Stack spacing="xs">
                {savedFilters.map((filter) => (
                  <Paper key={filter.id} p="sm" withBorder>
                    <Group justify="space-between" w="100%" wrap="nowrap">
                      <Group gap="xs" flex={1} maw="calc(100% - 60px)">
                        <Checkbox
                          checked={isChecked(filter.id)}
                          onChange={(event) => {
                            if (isEditMode) return;
                            const isCurrentlyChecked =
                              event.currentTarget.checked;
                            handleFilterCheckboxChange(
                              filter.id,
                              isCurrentlyChecked
                            );
                          }}
                          size={isMobile ? "sm" : "md"}
                          disabled={isEditMode}
                          style={{
                            opacity: isEditMode ? 0.5 : 1,
                            cursor: isEditMode ? "not-allowed" : "pointer",
                          }}
                        />
                        <Text
                          size={isMobile ? "xs" : "sm"}
                          fw={editingFilterId === filter.id ? 600 : 500}
                          c={editingFilterId === filter.id ? "blue" : undefined}
                          style={{
                            cursor: "default",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            flex: 1,
                            opacity:
                              isEditMode && editingFilterId !== filter.id
                                ? 0.5
                                : 1,
                          }}
                          title={filter.filterName || "بدون نام"}
                        >
                          {filter.filterName || "بدون نام"}
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
                            cursor: isEditMode ? "not-allowed" : "pointer",
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
                          title="حذف"
                          style={{
                            opacity: isEditMode ? 0.5 : 1,
                            cursor: isEditMode ? "not-allowed" : "pointer",
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

export default SavedFiltersModalBrandModeFastEdit;