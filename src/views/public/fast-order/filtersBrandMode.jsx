import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  Group,
  Text,
  ColorSwatch,
  InputBase,
  Combobox,
  Paper,
  useCombobox,
  Switch,
  useMantineTheme,
  Flex,
  LoadingOverlay,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter, IconChevronDown, IconCheck, IconColumns, IconCircleCheck } from "@tabler/icons-react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useFastOrder } from ".";
import { useFilterContext } from "./filterscontext";
import { useLocation } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import SavedFiltersModalBrandModeFastOrder from "./savedfilters/brandmode/SavedFiltersModalBrandModeFastOrder";
import 'swiper/css';
import 'swiper/css/free-mode';

// Global state for managing dropdowns
let globalDropdownManager = {
  activeDropdown: null,
  setActiveDropdown: () => {},
  closeAllDropdowns: () => {}
};

// === Reusable ChevronSelect with global dropdown management ===
function ChevronSelect({
  data = [],
  value,
  onChange,
  placeholder = "انتخاب کنید",
  allLabel = "همه",
  size = "xs",
  clearable = false,
  disabled = false,
  searchable = false,
  style = {},
  dropdownId,
  ...props
}) {
  const theme = useMantineTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  // normalize data to [{label, value}]
  const normalized = data.map((d) =>
    typeof d === "string" ? { label: d, value: d } : d
  );

  const combobox = useCombobox({
    onDropdownClose: () => {
      setIsOpen(false);
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      setIsOpen(true);
    }
  });

  // Register this dropdown with global manager
  useEffect(() => {
    const originalCloseAll = globalDropdownManager.closeAllDropdowns;
    globalDropdownManager.closeAllDropdowns = () => {
      if (isOpen) {
        combobox.closeDropdown();
        setIsOpen(false);
      }
      originalCloseAll();
    };
    
    return () => {
      globalDropdownManager.closeAllDropdowns = originalCloseAll;
    };
  }, [isOpen, combobox]);

  const selected = normalized.find((item) => item.value === value);
  
  // Display logic: if value is "all", show allLabel, if no value or empty, default to "all", otherwise show selected label
  const effectiveValue = value || "all";
  const effectiveSelected = normalized.find((item) => item.value === effectiveValue);
  const displayText = effectiveValue === "all" ? allLabel : (effectiveSelected ? effectiveSelected.label : allLabel);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    // Don't close all dropdowns first for the clicked element
    // Just toggle this one
    if (combobox.opened) {
      combobox.closeDropdown();
    } else {
      // Close others first, then open this one
      globalDropdownManager.closeAllDropdowns();
      setTimeout(() => {
        combobox.openDropdown();
      }, 0);
    }
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        onChange?.(val || "all");
        combobox.closeDropdown();
        setIsOpen(false);
      }}
      size={size}
      position="bottom-start"
      middlewares={{ flip: false, shift: true }}
      dropdownPadding={4}
      shadow="md"
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          onClick={handleClick}
          size={size}
          aria-expanded={isOpen}
          disabled={disabled}
          data-combobox-target
          {...props}
          styles={{
            input: {
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              height: "32px",
              minHeight: "32px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }
          }}
          style={{
            width: "100%",
            height: "32px",
            minHeight: "32px",
            background: "transparent",
            cursor: disabled ? "not-allowed" : "pointer",
            position: 'relative',
            zIndex: 1,
            ...style,
          }}
        >
          <Flex
            flex={1}
            align="center"
            justify="space-between"
            style={{ width: "100%" }}
          >
            <Text
              size="xs"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "center",
                flex: 1
              }}
            >
              {displayText}
            </Text>

            <IconChevronDown
              size={14}
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease"
              }}
            />
          </Flex>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown 
        data-combobox-dropdown
        style={{ 
          minWidth: '200px',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        {/* Default placeholder option (not selectable) */}
        <Combobox.Option value="" disabled style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <Text size="xs" color="dimmed">{placeholder}</Text>
        </Combobox.Option>

        {normalized.map((item) => (
          <Combobox.Option key={item.value} value={item.value}>
            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
              <Text size="xs">{item.label}</Text>
              <div style={{ width: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {String(effectiveValue) === String(item.value) && (
                  <IconCheck size={14} color={theme.colors.gray?.[6]} />
                )}
              </div>
            </Flex>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
}

// === ColorCombobox with global dropdown management ===
const ColorCombobox = ({ 
  colors = [], 
  value, 
  onChange, 
  placeholder = "انتخاب رنگ", 
  dropdownId
}) => {
  const theme = useMantineTheme();
  const extendedColors = [{ label: "همه", value: "all" }, ...colors];
  const [selectedColor, setSelectedColor] = useState(value || extendedColors[0]?.value);
  const [isOpen, setIsOpen] = useState(false);
  
  const combobox = useCombobox({
    onDropdownClose: () => {
      setIsOpen(false);
      combobox.resetSelectedOption();
    },
    onDropdownOpen: () => {
      setIsOpen(true);
    }
  });

  // Register this dropdown with global manager
  useEffect(() => {
    const originalCloseAll = globalDropdownManager.closeAllDropdowns;
    globalDropdownManager.closeAllDropdowns = () => {
      if (isOpen) {
        combobox.closeDropdown();
        setIsOpen(false);
      }
      originalCloseAll();
    };
    
    return () => {
      globalDropdownManager.closeAllDropdowns = originalCloseAll;
    };
  }, [isOpen, combobox]);

  useEffect(() => {
    setSelectedColor(value ?? extendedColors[0]?.value);
  }, [value, colors]);

  const selectedItem = extendedColors.find((item) => item.value === selectedColor);

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Don't close all dropdowns first for the clicked element
    // Just toggle this one
    if (combobox.opened) {
      combobox.closeDropdown();
    } else {
      // Close others first, then open this one
      globalDropdownManager.closeAllDropdowns();
      setTimeout(() => {
        combobox.openDropdown();
      }, 0);
    }
  };

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setSelectedColor(val);
        onChange?.(val);
        combobox.closeDropdown();
        setIsOpen(false);
      }}
      size="sm"
      position="bottom-start"
      middlewares={{ flip: false, shift: true }}
      dropdownPadding={4}
      shadow="md"
    >
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          onClick={handleClick}
          size="xs"
          data-combobox-target
          styles={{
            input: {
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              height: "32px",
              minHeight: "32px",
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }
          }}
          style={{
            width: "100%",
            height: "32px",
            minHeight: "32px",
            background: "transparent",
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Flex 
            align="center" 
            justify="center"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            {selectedColor && selectedItem ? (
              <Group gap={6} style={{ display: "flex", alignItems: "center" }}>
                {selectedColor === "all" ? (
                  <Text size="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    همه رنگ‌ها
                  </Text>
                ) : (
                  <>
                    <ColorSwatch size={14} color={selectedColor} />
                    <Text size="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedItem.label}
                    </Text>
                  </>
                )}
              </Group>
            ) : (
              <Text size="xs">{placeholder}</Text>
            )}
            <IconChevronDown 
              size={14}
              style={{ 
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0,
                position: "absolute",
                right: 0
              }}
            />
          </Flex>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown 
        data-combobox-dropdown
        style={{ 
          minWidth: '200px',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto',
        }}
      >
        {/* Default placeholder option (not selectable) */}
        <Combobox.Option value="" disabled style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <Text size="xs" color="dimmed">{placeholder}</Text>
        </Combobox.Option>

        {extendedColors.map((color) => (
          <Combobox.Option key={color.value} value={color.value}>
            <Flex align="center" justify="space-between" style={{ width: "100%" }}>
              <Group gap={6}>
                {color.value !== "all" && <ColorSwatch color={color.value} size={16} />}
                <Text size="xs">{color.label}</Text>
              </Group>
              <div style={{ width: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selectedColor === color.value && <IconCheck size={12} color={theme.colors.gray?.[6]} />}
              </div>
            </Flex>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
};

function FiltersBrandModeFastOrder({ 
  setFilters, 
  nodes, 
  filters, 
  setNodes, 
  setNodesSubCategories, 
  searchType, 
  tableData,
  setSearchType,
  onCookieUpdate,  
  COOKIE_NAME,
  getInitialFilters,
  setFilterBrandStorage,
  setFilterBrandsCategoryStorage,
  setFilterBrandsCategorySubCategoryStorage,
  setLocalFilters,
  localFilters,
  savedFilters: savedFiltersProp
}) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const supplierId = params.get("supplierid") || "";
  const supplierName = params.get("suppliername") || "";
  const isSupplierFixed = !!supplierId;

  const { filterValues, setOpened } = useFastOrder();
  const { filtersContext, setFiltersContext, brandsContext = { parent: [] } } = useFilterContext();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // State for saved filters modal
  const [savedFiltersModalOpened, setSavedFiltersModalOpened] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingFilterName, setEditingFilterName] = useState('');

  const handleEditModeChange = useCallback((editMode, filterName) => {
    setIsEditMode(editMode);
    setEditingFilterName(filterName || '');
  }, []);

  const form = useForm({
    initialValues: {
      color: filters?.color || "all",
      province: filters?.province || "all",
      stockStatus: filters?.stockStatus || false,
      minStock: filters?.minStock || "all",
      deliveryTime: filters?.deliveryTime || "all",
      paymentType: filters?.paymentType || "all",
      supplier: filters?.supplier || "all",
      sort: filters?.sort || "",
      priceFormat: filters?.priceFormat || "",
      saleType: filters?.saleType || "cash",
    },
  });

  useEffect(() => {
    if (filters) {
      form.setValues(filters);
    }
  }, [filters]);

  const handleSubmit = (values) => {
    setFilters(values);
    setFiltersContext(values);
    globalDropdownManager.closeAllDropdowns();
  };

  const handleSlideClick = (e, slideType) => {
    e.stopPropagation();
    
    // Only close dropdowns and handle toggles for switch elements
    if (slideType === 'province' || slideType === 'stockStatus' || slideType === 'saleType') {
      globalDropdownManager.closeAllDropdowns();
      
      if (slideType === 'province') {
        form.setFieldValue("province", form.values.province === "mylocation" ? "all" : "mylocation");
      } else if (slideType === 'stockStatus') {
        form.setFieldValue("stockStatus", !form.values.stockStatus);
      } else if (slideType === 'saleType') {
        form.setFieldValue("saleType", form.values.saleType === "cash" ? "credit" : "cash");
      }
    }
    // For select elements, don't close dropdowns - let the ChevronSelect handle it
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both swiper slides AND dropdown menus
      const isOutsideSwiper = !event.target.closest('.swiper-slide');
      const isOutsideDropdown = !event.target.closest('[data-combobox-dropdown]');
      const isOutsideInput = !event.target.closest('[data-combobox-target]');
      
      if (isOutsideSwiper && isOutsideDropdown && isOutsideInput) {
        globalDropdownManager.closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Show filters as soon as we have filterValues; default colors/sellers to [] so form displays on first open before API returns
  if (!filterValues) {
    return <LoadingOverlay />;
  }
  const colors = Array.isArray(filterValues.colors) ? filterValues.colors : [];
  const sellersSafe = Array.isArray(filterValues.sellers) ? filterValues.sellers : [];

  // Unified slide styles - all elements have same height and spacing
  const baseSlideStyle = {
    width: 'fit-content',
    minWidth: '30px',
    height: '32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const selectSlideStyle = {
    ...baseSlideStyle,
    maxWidth: '160px', // Add max width to prevent overflow
  };

  const switchSlideStyle = {
    ...baseSlideStyle,
  };

  const buttonSlideStyle = {
    ...baseSlideStyle,
    minWidth: '50px',
  };

  // helper to normalize seller list (strings or objects)
  const sellersData = sellersSafe.map((s) => (typeof s === "string" ? { label: s, value: s } : s));

  return (
    <>
      <Paper
        id="fastorder-filters"
        p={isMobile ? "sm" : "md"}
        style={{
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100vw',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0,
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Swiper
            modules={[FreeMode]}
            spaceBetween={8}
            slidesPerView="auto"
            freeMode={true}
            grabCursor={true}
            touchRatio={1}
            resistance={true}
            resistanceRatio={0.85}
            style={{
              height: '32px',
              overflow: 'visible',
              width: '100%', // Ensure Swiper takes full width
            }}
          >


            {/* Column Settings Button */}
            <SwiperSlide style={buttonSlideStyle}>
              <Button
                size="xs"
                variant="light"
                onClick={() => setOpened(true)}
                disabled={isEditMode}
                style={{
                  opacity: isEditMode ? 0.5 : 1,
                  cursor: isEditMode ? 'not-allowed' : 'pointer'
                }}
              >
                <IconColumns size={16} />
              </Button>
            </SwiperSlide>

            {/* Saved Filters Button */}
            <SwiperSlide style={buttonSlideStyle}>
              <Button
                size="xs"
                variant="light"
                onClick={() => setSavedFiltersModalOpened(true)}
                // disabled={isEditMode}
                color={isEditMode ? "red" : undefined}
                style={{
                  backgroundColor: isEditMode ? '#ffe0e0' : undefined,
                  borderColor: isEditMode ? '#ff6b6b' : undefined,
                }}
              >
                <IconFilter size={16} color={isEditMode ? "#ff6b6b" : undefined} />
              </Button>
            </SwiperSlide>

                        {/* Apply Filter Button */}
            <SwiperSlide style={buttonSlideStyle}>
              <Button
                type="submit"
                size="xs"
                disabled={isEditMode}
                style={{
                  opacity: isEditMode ? 0.5 : 1,
                  cursor: isEditMode ? 'not-allowed' : 'pointer'
                }}
              >
                <IconCircleCheck size={16} />
              </Button>
            </SwiperSlide>

            {/* Delivery Time Filter */}
            <SwiperSlide style={selectSlideStyle}>
              <ChevronSelect
                placeholder="ارسال"
                allLabel="همه بازه‌های ارسال"
                data={[
                  { label: "همه", value: "all" },
                  { label: "< 3 ساعت", value: "3hr" },
                  { label: "< 1 روز", value: "1d" },
                  { label: "تا 3 روز", value: "3d" },
                  { label: "تا 1 هفته", value: "7d" },
                  { label: "تا 15 روز", value: "15d" },
                  { label: "تا 30 روز", value: "30d" },
                  { label: "بیش از 30 روز", value: "30d+" },
                ]}
                value={form.values.deliveryTime}
                onChange={(v) => form.setFieldValue("deliveryTime", v)}
                dropdownId="deliveryTime"
                style={{ width: '100%', maxWidth: '100%' }}
              />
            </SwiperSlide>

            {/* Min Stock Filter */}
            <SwiperSlide style={selectSlideStyle}>
              <ChevronSelect
                placeholder="موجودی"
                allLabel="همه موجودی"
                data={[
                  { label: "همه", value: "all" },
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "50", value: "50" },
                  { label: "100", value: "100" },
                ]}
                value={form.values.minStock}
                onChange={(v) => form.setFieldValue("minStock", v)}
                dropdownId="minStock"
                style={{ width: '100%', maxWidth: '100%', minWidth: "100px" }}
              />
            </SwiperSlide>

            {/* Supplier Filter */}
            <SwiperSlide style={selectSlideStyle}>
              <ChevronSelect
                placeholder="تامین"
                allLabel="همه تامین‌کنندگان"
                data={[
                  { label: "همه", value: "all" },
                  ...sellersData
                ]}
                value={isSupplierFixed ? supplierId : form.values.supplier}
                onChange={(v) => {
                  if (!isSupplierFixed) form.setFieldValue("supplier", v);
                }}
                disabled={isSupplierFixed}
                searchable={true}
                dropdownId="supplier"
                style={{ width: '100%', maxWidth: '100%', minWidth: "120px" }}
              />
            </SwiperSlide>

            {/* Province Filter */}
            <SwiperSlide 
              style={switchSlideStyle}
              onClick={(e) => handleSlideClick(e, 'province')}
            >
              <div style={{
                height: "32px",
                minHeight: "32px",
                width: "140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "transparent"
              }}>
                <Text size="xs" style={{ flexShrink: 0 }}>
                  استان من
                </Text>
                <Switch
                  checked={form.values.province === "mylocation"}
                  readOnly
                  size="xs"
                  styles={(theme) => ({
                    root: {
                      pointerEvents: 'none',
                    },
                    track: {
                      backgroundColor: form.values.province === "mylocation"
                        ? theme.colors.blue[6]
                        : theme.colors.gray[4],
                      cursor: 'pointer',
                    },
                    thumb: {
                      backgroundColor: theme.white,
                    },
                  })}
                />
              </div>
            </SwiperSlide>

            {/* Stock Status Filter */}
            <SwiperSlide 
              style={switchSlideStyle}
              onClick={(e) => handleSlideClick(e, 'stockStatus')}
            >
              <div style={{
                height: "32px",
                minHeight: "32px",
                width: "120px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "transparent"
              }}>
                <Text size="xs" style={{ flexShrink: 0 }}>
                  ناموجود
                </Text>
                <Switch
                  checked={!form.values.stockStatus}
                  readOnly
                  size="xs"
                  styles={(theme) => ({
                    root: {
                      pointerEvents: 'none',
                    },
                    track: {
                      backgroundColor: !form.values.stockStatus
                        ? theme.colors.red[6]
                        : theme.colors.gray[4],
                      cursor: 'pointer',
                    },
                    thumb: {
                      backgroundColor: theme.white,
                    },
                  })}
                />
              </div>
            </SwiperSlide>

            {/* Sale Type Filter */}
            <SwiperSlide 
              style={switchSlideStyle}
              onClick={(e) => handleSlideClick(e, 'saleType')}
            >
              <div style={{
                height: "32px",
                minHeight: "32px",
                width: "130px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 12px",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                cursor: "pointer",
                backgroundColor: "transparent"
              }}>
                <Text size="xs" style={{ flexShrink: 0 }}>
                  پیش‌فروش
                </Text>
                <Switch
                  checked={form.values.saleType === "credit"}
                  readOnly
                  size="xs"
                  styles={(theme) => ({
                    root: {
                      pointerEvents: 'none',
                    },
                    track: {
                      backgroundColor: form.values.saleType === "credit" 
                        ? theme.colors.grape[6] 
                        : theme.colors.gray[4],
                      cursor: 'pointer',
                    },
                    thumb: {
                      backgroundColor: theme.white,
                    },
                  })}
                />
              </div>
            </SwiperSlide>
          </Swiper>
        </form>
              {/* Saved Filters Modal */}
      {COOKIE_NAME && getInitialFilters && (
<SavedFiltersModalBrandModeFastOrder
  opened={savedFiltersModalOpened}
  onClose={() => setSavedFiltersModalOpened(false)}
  isMobile={isMobile}
  tableData={tableData}
  COOKIE_NAME={COOKIE_NAME}
  getInitialFilters={getInitialFilters}
  setFilterBrandStorage={setFilterBrandStorage}
  setFilterBrandsCategoryStorage={setFilterBrandsCategoryStorage}
  setFilterBrandsCategorySubCategoryStorage={setFilterBrandsCategorySubCategoryStorage}
  setLocalFilters={setLocalFilters}
  setFilters={setFilters}
  setSearchType={setSearchType}
  filters={filters}
  localFilters={localFilters}
  onCookieUpdate={onCookieUpdate}
  onEditModeChange={handleEditModeChange}
  savedFiltersFromParent={savedFiltersProp}
/>
      )}
      </Paper>


    </>
  );
}

export default FiltersBrandModeFastOrder;