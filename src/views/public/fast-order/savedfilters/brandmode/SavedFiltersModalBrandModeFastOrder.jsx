// src\views\public\fast-order\savedfilters\brandmode\SavedFiltersModalBrandModeFastOrder.jsx
import React, { useCallback, useState, useEffect, useRef } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { NavLink } from "react-router";
import { saveFilterSettings } from "../../../../../redux/savefiltersettings/saveFilterSettingsActions";
import { deleteFilterSettings } from "../../../../../redux/savefiltersettings/deleteFilterSettings/deleteFilterSettingsActions";
import { updateFilterSettings } from "../../../../../redux/savefiltersettings/updatefiltersettings/updateFilterSettingsActions";
import { fetchFastOrderBrandModeTableData } from "../../../../../redux/fastorder/fastordertabledata/fastordertablebrandmode/fastOrderTableBrandModeDataActions";
import { useApiQuery } from "../../../../../Libs/reactQuery";
import { useBrandRowSelection } from "../../BrandRowSelectionContext";
import { useNavigate } from 'react-router-dom';

// Stable empty objects for useSelector fallbacks (avoids "selector returned different result" warning)
const EMPTY_GET_FILTER = {};
const EMPTY_SAVE_FILTER = {};
const EMPTY_UPDATE_FILTER = {};
const EMPTY_DELETE_FILTER = {};
const EMPTY_AUTH = {};

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
  onEditModeChange,
  savedFiltersFromParent,
}) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const SAVE_FILTERS_SLUG = "brand-fast-order";
  const { isVerified, user } = useSelector((state) => state.auth ?? EMPTY_AUTH);
  const { data: savedFiltersFromQuery, refetch: refetchSavedFilters } = useApiQuery({
    endpoint: `/save-filters/${SAVE_FILTERS_SLUG}`,
    queryKey: ["save-filters", SAVE_FILTERS_SLUG],
    strategy: "USER_DATA",
    transformer: (r) => (Array.isArray(r?.data?.data) ? r.data.data : r?.data ?? []),
    enabled: !!(user || (typeof window !== 'undefined' && window.localStorage?.getItem?.('user'))),
  });
  // Prefer modal's own query when it has data (avoids showing empty when index got [] e.g. before token)
  const fromQuery = Array.isArray(savedFiltersFromQuery) ? savedFiltersFromQuery : [];
  const fromParent = Array.isArray(savedFiltersFromParent) ? savedFiltersFromParent : [];
  const savedFilters = fromQuery.length > 0 ? fromQuery : fromParent;

  const { deleteLoadingId } = useSelector(
    (state) => state.getFilterSettings ?? EMPTY_GET_FILTER
  );
  const { saveStatus, saveLoading } = useSelector(
    (state) => state.saveFilterSettings ?? EMPTY_SAVE_FILTER
  );
  const { updateLoading } = useSelector(
    (state) => state.updateFilterSettings ?? EMPTY_UPDATE_FILTER
  );
  const { deleteLoading } = useSelector(
    (state) => state.deleteFilterSettings ?? EMPTY_DELETE_FILTER
  );

  const { checkedRows, setSelectedRow, toggleCheck, isChecked, clearAll } =
    useBrandRowSelection();

  // Modal states
  const [openedAddModal, setOpenedAddModal] = useState(false);
  const [filterName, setFilterName] = useState("");

  // Edit mode states
  const [editingFilterId, setEditingFilterId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilterName, setEditingFilterName] = useState("");

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

  const prevOpenedRef = useRef(false);
  // ✅ Check authentication when modal opens; refetch list only once when modal just opened
  useEffect(() => {
    const justOpened = opened && !prevOpenedRef.current;
    prevOpenedRef.current = opened;

    if (opened) {
      if (!user || !isVerified) {
        notifications.show({
          title: "لطفا ابتدا وارد حساب کاربری خود شوید",
          message: "برای استفاده از فیلترهای ذخیره شده باید وارد شوید",
          color: "red",
          autoClose: 4000,
        });
        onClose();
      } else if (justOpened && refetchSavedFilters) {
        refetchSavedFilters();
      }
    }
  }, [opened, user, isVerified, onClose, refetchSavedFilters]);

  // Helper functions to build filter arrays
  const buildCheckedFiltersArray = useCallback(
    (checkedRowIds = checkedRows) => {
      return Array.from(checkedRowIds)
        .map((id) => savedFilters?.find((f) => f.id === id))
        .filter(Boolean)
        .map((filter) => ({
          searchType: "brand",
          uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories:
            filter.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage:
            filter.filterBrandsCategorySubCategoryStorage || [],
          filters: filter.filters || filters || localFilters,
        }));
    },
    [savedFilters, checkedRows, filters, localFilters]
  );

  const buildInitialFilterArray = useCallback(() => {
    const initialData = getInitialFilters();
    return [
      {
        searchType: "brand",
        uniqueIDClickedBrands: initialData.uniqueIDClickedBrands,
        uniqueIDClickedBrandsCategories:
          initialData.uniqueIDClickedBrandsCategories,
        filterBrandsCategorySubCategoryStorage:
          initialData.filterBrandsCategorySubCategoryStorage,
        filters: initialData.filters || filters || localFilters,
      },
    ];
  }, [getInitialFilters, filters, localFilters]);

  const handleEditFilter = useCallback(
    (filter) => {
      // ✅ Close modal immediately
      onClose();

      // ✅ NEW: Set flag in sessionStorage BEFORE everything else
      sessionStorage.setItem("manualFilterUpdate", "true");

      // ✅ IMPORTANT: Clear all checked rows FIRST so sliders remain visible
      clearAll();

      setEditingFilterId(filter.id);
      setEditingFilterName(filter.filterName || "بدون نام");
      setIsEditMode(true);

      const cookieValue = {
        searchType: "brand",
        filters: filter.filters || {},
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories:
          filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage:
          filter.filterBrandsCategorySubCategoryStorage || [],
      };

      // Step 1: Update cookie first
      Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

      // Step 2: Update all state setters IMMEDIATELY
      setFilterBrandStorage(filter.uniqueIDClickedBrands || []);

      setFilterBrandsCategoryStorage(
        filter.uniqueIDClickedBrandsCategories || []
      );

      setFilterBrandsCategorySubCategoryStorage(
        filter.filterBrandsCategorySubCategoryStorage || []
      );

      setLocalFilters(filter.filters || {});

      if (setFilters) setFilters(filter.filters || {});
      if (setSearchType) setSearchType("brand");

      // Step 3: Dispatch data fetch immediately
      const filterArray = [
        {
          searchType: "brand",
          uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
          uniqueIDClickedBrandsCategories:
            filter.uniqueIDClickedBrandsCategories || [],
          filterBrandsCategorySubCategoryStorage:
            filter.filterBrandsCategorySubCategoryStorage || [],
          filters: filter.filters || {},
        },
      ];

      dispatch(fetchFastOrderBrandModeTableData(filterArray));

      // Step 4: Trigger cookie update callback (this forces SlideCategory to re-render)
      if (onCookieUpdate) {
        setTimeout(() => {
          onCookieUpdate();
          // ✅ Clear flag after a delay
          setTimeout(() => {
            sessionStorage.removeItem("manualFilterUpdate");
          }, 1000);
        }, 50);
      }

      // Step 5: Navigate and show notification after everything is set
      setTimeout(() => {
        if (filter.uniqueIDClickedBrands?.length === 1 && tableData?.brands) {
          const brandId = filter.uniqueIDClickedBrands[0];

          const matchingBrand = tableData.brands.find(
            (brand) => brand.idBrand === brandId
          );

          if (matchingBrand?.name) {
            const newUrl = `/fastorder/brand/${matchingBrand.name}`;
            navigate(newUrl, { replace: true });
          } else {
            navigate("/fastorder/brand", { replace: true });
          }
        } else {
          navigate("/fastorder/brand", { replace: true });
        }

        notifications.show({
          title: "حالت ویرایش",
          message: `فیلتر "${
            filter.filterName || "بدون نام"
          }" بارگذاری شد. اکنون می‌توانید ذخیره یا لغو کنید.`,
          color: "blue",
          autoClose: 4000,
        });
      }, 100);
    },
    [
      COOKIE_NAME,
      setFilters,
      setSearchType,
      dispatch,
      setFilterBrandStorage,
      setFilterBrandsCategoryStorage,
      setFilterBrandsCategorySubCategoryStorage,
      setLocalFilters,
      onCookieUpdate,
      navigate,
      tableData,
      clearAll,
      onClose,
    ]
  );
  // ✅ FIXED: handleFilterClick with proper cookie trigger
  const handleFilterClick = useCallback(
    (filter) => {
      if (isEditMode && editingFilterId !== filter.id) {
        notifications.show({
          title: "در حال ویرایش",
          message: "ابتدا ویرایش فعلی را تمام کنید یا لغو کنید.",
          color: "orange",
          autoClose: 3000,
        });
        return;
      }

      const cookieValue = {
        searchType: "brand",
        filters: filter.filters || {},
        uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
        uniqueIDClickedBrandsCategories:
          filter.uniqueIDClickedBrandsCategories || [],
        filterBrandsCategorySubCategoryStorage:
          filter.filterBrandsCategorySubCategoryStorage || [],
      };

      Cookies.set(COOKIE_NAME, JSON.stringify(cookieValue), { expires: 7 });

      // ✅ Trigger cookie reload callback immediately
      if (onCookieUpdate) {
        onCookieUpdate();
      }

      setTimeout(() => {
        setFilterBrandStorage(filter.uniqueIDClickedBrands || []);
        setFilterBrandsCategoryStorage(
          filter.uniqueIDClickedBrandsCategories || []
        );
        setFilterBrandsCategorySubCategoryStorage(
          filter.filterBrandsCategorySubCategoryStorage || []
        );
        setLocalFilters(filter.filters || {});

        if (setFilters) setFilters(filter.filters || {});
        if (setSearchType) setSearchType("brand");

        setSelectedRow(filter.id);

        const filterArray = [
          {
            searchType: "brand",
            uniqueIDClickedBrands: filter.uniqueIDClickedBrands || [],
            uniqueIDClickedBrandsCategories:
              filter.uniqueIDClickedBrandsCategories || [],
            filterBrandsCategorySubCategoryStorage:
              filter.filterBrandsCategorySubCategoryStorage || [],
            filters: filter.filters || {},
          },
        ];

        dispatch(fetchFastOrderBrandModeTableData(filterArray));
        onClose();
      }, 50);
    },
    [
      COOKIE_NAME,
      setFilters,
      setSearchType,
      setSelectedRow,
      dispatch,
      onClose,
      isEditMode,
      editingFilterId,
      setFilterBrandStorage,
      setFilterBrandsCategoryStorage,
      setFilterBrandsCategorySubCategoryStorage,
      setLocalFilters,
      onCookieUpdate,
    ]
  );

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

      if (result?.type === "category/updateFilterSettings/fulfilled") {
        if (result?.payload?.state === "error") {
          notifications.show({
            title: "خطا در به‌روزرسانی",
            message: result.payload.message,
            color: "red",
            autoClose: 4000,
          });
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["save-filters", slug] });
        setIsEditMode(false);
        setEditingFilterId(null);
        setEditingFilterName("");

        notifications.show({
          title: "ذخیره شد",
          message: `فیلتر "${editingFilterName.trim()}" با موفقیت به‌روزرسانی شد.`,
          color: "green",
          autoClose: 3000,
        });
      } else if (result?.type === "category/updateFilterSettings/rejected") {
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
    setEditingFilterName("");

    const initialData = getInitialFilters();
    setFilterBrandStorage(initialData.uniqueIDClickedBrands);
    setFilterBrandsCategoryStorage(initialData.uniqueIDClickedBrandsCategories);
    setFilterBrandsCategorySubCategoryStorage(
      initialData.filterBrandsCategorySubCategoryStorage
    );
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
      title: "لغو ویرایش",
      message: "تغییرات لغو شد و فیلترها به حالت اولیه بازگشتند.",
      color: "gray",
      autoClose: 2000,
    });
  }, [
    getInitialFilters,
    setFilters,
    setSelectedRow,
    COOKIE_NAME,
    dispatch,
    buildInitialFilterArray,
    setFilterBrandStorage,
    setFilterBrandsCategoryStorage,
    setFilterBrandsCategorySubCategoryStorage,
    setLocalFilters,
    onCookieUpdate,
  ]);

  // Handle checkbox change
  const handleFilterCheckboxChange = useCallback(
    (filterId, checked) => {
      // Set manual filter update flag to prevent URL sync from overriding our changes
      sessionStorage.setItem("manualFilterUpdate", "true");

      if (checked) {
        if (!isChecked(filterId)) {
          toggleCheck(filterId);
        }

        const selectedFilter = savedFilters?.find((f) => f.id === filterId);
        if (selectedFilter) {
          // Clear all 1st/2nd/3rd row states; 1st row disabled, 2nd/3rd hidden when filter active
          const cookieValue = {
            searchType: "brand",
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
          if (setSearchType) setSearchType("brand");

          // Force cookie sync so SearchComponent's "Cookie reload" effect runs and all 3 slider rows clear
          if (onCookieUpdate) onCookieUpdate();

          setTimeout(() => {
            const newCheckedRows = new Set(checkedRows);
            newCheckedRows.add(filterId);

            const checkedFiltersArray =
              buildCheckedFiltersArray(newCheckedRows);
            dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
            onClose();

            // Clear manual filter update flag after state has settled
            setTimeout(() => {
              sessionStorage.removeItem("manualFilterUpdate");
            }, 500);
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
            const checkedFiltersArray =
              buildCheckedFiltersArray(newCheckedRows);
            dispatch(fetchFastOrderBrandModeTableData(checkedFiltersArray));
          } else {
            // Reset to fresh empty state (not from cookie which may have old data)
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

            // Clear all slider states to empty
            setFilterBrandStorage([]);
            setFilterBrandsCategoryStorage([]);
            setFilterBrandsCategorySubCategoryStorage([]);
            setLocalFilters(freshFilters);

            if (setFilters) setFilters(freshFilters);
            if (setSearchType) setSearchType("brand");

            // Write fresh empty state to cookie
            const freshCookieData = {
              searchType: "brand",
              uniqueIDClickedBrands: [],
              uniqueIDClickedBrandsCategories: [],
              filterBrandsCategorySubCategoryStorage: [],
              filters: freshFilters,
            };
            Cookies.set(COOKIE_NAME, JSON.stringify(freshCookieData), {
              expires: 7,
            });

            // Trigger cookie sync so index.jsx updates its state
            if (onCookieUpdate) onCookieUpdate();

            // Fetch root brand data with empty filters
            const filterArray = [
              {
                searchType: "brand",
                uniqueIDClickedBrands: [],
                uniqueIDClickedBrandsCategories: [],
                filterBrandsCategorySubCategoryStorage: [],
                filters: freshFilters,
              },
            ];
            dispatch(fetchFastOrderBrandModeTableData(filterArray));
          }

          onClose();

          // Clear manual filter update flag after state has settled
          setTimeout(() => {
            sessionStorage.removeItem("manualFilterUpdate");
          }, 500);
        }, 0);
      }
    },
    [
      savedFilters,
      COOKIE_NAME,
      setFilters,
      setSearchType,
      dispatch,
      isChecked,
      toggleCheck,
      checkedRows,
      buildCheckedFiltersArray,
      setFilterBrandStorage,
      setFilterBrandsCategoryStorage,
      setFilterBrandsCategorySubCategoryStorage,
      setLocalFilters,
      onClose,
      onCookieUpdate,
    ]
  );

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

    setFilterBrandStorage([]);
    setFilterBrandsCategoryStorage([]);
    setFilterBrandsCategorySubCategoryStorage([]);
    setLocalFilters(freshFilters);

    if (setFilters) setFilters(freshFilters);
    if (setSearchType) setSearchType("brand");

    const freshCookieData = {
      searchType: "brand",
      uniqueIDClickedBrands: [],
      uniqueIDClickedBrandsCategories: [],
      filterBrandsCategorySubCategoryStorage: [],
      filters: freshFilters,
    };
    Cookies.set(COOKIE_NAME, JSON.stringify(freshCookieData), { expires: 7 });

    const filterArray = [
      {
        searchType: "brand",
        uniqueIDClickedBrands: [],
        uniqueIDClickedBrandsCategories: [],
        filterBrandsCategorySubCategoryStorage: [],
        filters: freshFilters,
      },
    ];
    dispatch(fetchFastOrderBrandModeTableData(filterArray));

    // Trigger cookie sync
    if (onCookieUpdate) {
      onCookieUpdate();
    }
  }, [
    clearAll,
    setFilters,
    setSearchType,
    COOKIE_NAME,
    dispatch,
    setFilterBrandStorage,
    setFilterBrandsCategoryStorage,
    setFilterBrandsCategorySubCategoryStorage,
    setLocalFilters,
    onCookieUpdate,
  ]);

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

      if (payload?.state === "error") {
        notifications.show({
          title: "خطا",
          message: payload.message || "خطا در ذخیره فیلتر",
          color: "red",
        });
        return;
      }

      setOpenedAddModal(false);
      setFilterName("");

      const newList = payload?.data?.searches ?? [];
      if (Array.isArray(newList) && newList.length > 0) {
        queryClient.setQueryData(["save-filters", slug], newList);
      } else {
        await queryClient.refetchQueries({ queryKey: ["save-filters", slug] });
      }

      notifications.show({
        title: "ذخیره شد",
        message: `فیلتر "${filterName.trim()}" با موفقیت ذخیره شد.`,
        color: "green",
      });
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SavedFiltersBrand] saveFiltersSettings: error", {
          message: error?.message,
          status: error?.status,
          payload: error?.payload,
        });
      }
      const msg =
        error?.message || error?.payload?.message || "خطا در ذخیره فیلتر";
      const isMaxFive =
        msg.includes("5") || msg.toLowerCase().includes("filter settings");
      setOpenedAddModal(false);
      setFilterName("");
      if (isMaxFive) {
        onClose();
        notifications.show({
          title: "حداکثر ۵ فیلتر",
          message: msg,
          color: "orange",
          autoClose: 5000,
        });
      } else {
        notifications.show({
          title: "خطا",
          message: msg,
          color: "red",
        });
      }
    }
  }, [filterName, COOKIE_NAME, dispatch, queryClient, onClose]);

  // Delete filter handler: update cache by removing deleted id so list doesn't go to 0 during refetch
  const handleDeleteSavedFilter = useCallback(
    async (id) => {
      const slug = "brand-fast-order";

      try {
        const result = await dispatch(deleteFilterSettings({ slug, id }));

        if (
          result?.type === "category/deleteFilterSettings/fulfilled" ||
          result?.payload?.id
        ) {
          const currentList = queryClient.getQueryData(["save-filters", slug]);
          const nextList = Array.isArray(currentList)
            ? currentList.filter((f) => String(f?.id) !== String(id))
            : [];
          queryClient.setQueryData(["save-filters", slug], nextList);

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
          });
        } else if (result?.payload?.status === "error") {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[SavedFiltersBrand] handleDeleteSavedFilter: API error",
              result?.payload
            );
          }
          return;
        }
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "[SavedFiltersBrand] handleDeleteSavedFilter: error",
            error
          );
        }
      }
    },
    [
      dispatch,
      queryClient,
      isChecked,
      toggleCheck,
      editingFilterId,
      cancelEditMode,
    ]
  );

  // ✅ If not authenticated, show login message in modal
  if (opened && (!user || !isVerified)) {
    return (
      <Modal
        opened={opened}
        onClose={onClose}
        title="فیلترهای ذخیره شده"
        removeScrollProps={{ removeScrollBar: false }}
        centered
        size={isMobile ? "sm" : "md"}
        padding={isMobile ? "sm" : "md"}
        zIndex={1006}
      >
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="لطفا ابتدا وارد حساب کاربری خود شوید"
          color="red"
          variant="light"
        >
          <Text size="sm" mb="md">
            برای استفاده از فیلترهای ذخیره شده باید وارد حساب کاربری خود شوید
          </Text>
          <Button
            component={NavLink}
            to="/login"
            fullWidth
            styles={{
              root: {
                backgroundColor: "#093572",
                "&:hover": {
                  backgroundColor: "#0a4080",
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
              removeScrollProps={{ removeScrollBar: false }}

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
        zIndex={1006}
        lockScroll={false}
        removeScrollBar={false}
                removeScrollProps={{ removeScrollBar: false }}

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

export default SavedFiltersModalBrandModeFastOrder;