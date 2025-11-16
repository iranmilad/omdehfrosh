import React, { useEffect, useState } from "react";
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
import { IconFilter, IconChevronDown, IconCheck } from "@tabler/icons-react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useFastOrder } from ".";
import { useFilterContext } from "./filterscontext";
import { useLocation } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import { IoSettingsSharp } from "react-icons/io5";

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
  
  // Display logic
  const effectiveValue = value || "all";
  const effectiveSelected = normalized.find((item) => item.value === effectiveValue);
  const displayText = effectiveValue === "all" ? allLabel : (effectiveSelected ? effectiveSelected.label : allLabel);

  const handleClick = (e) => {
    e.stopPropagation();
    if (disabled) return;
    
    // Close all other dropdowns first
    globalDropdownManager.closeAllDropdowns();
    
    // Then toggle this one
    setTimeout(() => {
      if (combobox.opened) {
        combobox.closeDropdown();
      } else {
        combobox.openDropdown();
      }
    }, 0);
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
            <Group position="apart" style={{ width: "100%" }}>
              <Flex flexDirection="row" alignItems="center" gap={8} style={{ flex: 1 }}>
                {String(effectiveValue) === String(item.value) && (
                  <IconCheck size={14} color={theme.colors.gray?.[6]} />
                )}
                <Text size="xs">{item.label}</Text>
              </Flex>
            </Group>
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
    
    // Close all other dropdowns first
    globalDropdownManager.closeAllDropdowns();
    
    // Then toggle this one
    setTimeout(() => {
      if (combobox.opened) {
        combobox.closeDropdown();
      } else {
        combobox.openDropdown();
      }
    }, 0);
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
            <Group gap={6} position="apart" style={{ width: "100%" }}>
              <Group>
                {color.value !== "all" && <ColorSwatch color={color.value} size={16} />}
                <Text size="xs">{color.label}</Text>
              </Group>
              {selectedColor === color.value && <IconCheck size={12} color={theme.colors.gray?.[6]} />}
            </Group>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
};

function FiltersBrandMode({ setFilters, nodes, filters, setNodes, setNodesSubCategories, searchType, setSearchType }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const supplierId = params.get("supplierid") || "";
  const supplierName = params.get("suppliername") || "";
  const isSupplierFixed = !!supplierId;

  const { filterValues } = useFastOrder();
  const { filtersContext, setFiltersContext, brandsContext = { parent: [] } } = useFilterContext();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

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
    globalDropdownManager.closeAllDropdowns();
    
    // Handle switch toggles
    if (slideType === 'province') {
      form.setFieldValue("province", form.values.province === "mylocation" ? "all" : "mylocation");
    } else if (slideType === 'stockStatus') {
      form.setFieldValue("stockStatus", !form.values.stockStatus);
    } else if (slideType === 'saleType') {
      form.setFieldValue("saleType", form.values.saleType === "cash" ? "credit" : "cash");
    }
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.swiper-slide') && !event.target.closest('[data-combobox-dropdown]')) {
        globalDropdownManager.closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!filterValues || !Array.isArray(filterValues.colors)) {
    return <LoadingOverlay />
  }

  // Unified slide styles - all elements have same height and spacing
  const baseSlideStyle = {
    width: 'fit-content', 
    minWidth: '30px', 
    height: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  };

  const selectSlideStyle = {
    ...baseSlideStyle,
  };

  const switchSlideStyle = {
    ...baseSlideStyle,
  };

  const buttonSlideStyle = {
    ...baseSlideStyle,
    minWidth: '50px',
  };

  // helper to normalize seller list (strings or objects)
  const sellersData = Array.isArray(filterValues.sellers)
    ? filterValues.sellers.map((s) => (typeof s === "string" ? { label: s, value: s } : s))
    : [];

  return (
    <Paper 
      mt={{ base: "xs", md: "xs" }} 
      id="fastorder-filters"
      p={isMobile ? "sm" : "md"}
      style={{ 
        overflow: 'hidden'
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Swiper
          modules={[FreeMode]}
          spaceBetween={8}
          slidesPerView="auto"
          freeMode={true}
          style={{ 
            height: '35px',
            overflow: 'visible'
          }}
        >
          {/* Apply Filter Button */}
          <SwiperSlide style={buttonSlideStyle}>
            <Button
              type="submit"
              size="xs"
              style={{
                height: "32px",
                minHeight: "32px",
                maxHeight: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 12px"
              }}
            >
              <IoSettingsSharp size={16} />
            </Button>
          </SwiperSlide>
          
          {/* Sort Filter */}
          {/* <SwiperSlide style={selectSlideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
                <ChevronSelect
                  placeholder="ترتیب"
                  allLabel="همه ترتیب‌ها"
                  data={[
                    { label: "بهترین قیمت", value: "bestPrice" },
                    { label: "بیشترین موجودی", value: "highestStock" },
                  ]}
                  value={form.values.sort}
                  onChange={(v) => form.setFieldValue("sort", v)}
                  dropdownId="sort"
                  style={{ minWidth: "120px" }}
                />
              </div>
            </div>
          </SwiperSlide> */}

          {/* Price Format Filter */}
          {/* <SwiperSlide style={selectSlideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
                <ChevronSelect
                  placeholder="واحد"
                  allLabel="همه واحدها"
                  data={[
                    { label: "هزار تومان", value: "hezar" },
                    { label: "میلیون تومان", value: "million" },
                  ]}
                  value={form.values.priceFormat}
                  onChange={(v) => form.setFieldValue("priceFormat", v)}
                  dropdownId="priceFormat"
                  style={{ minWidth: "120px" }}
                />
              </div>
            </div>
          </SwiperSlide> */}

          {/* Color Filter */}
          {/* <SwiperSlide style={selectSlideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
                <ColorCombobox 
                  placeholder="رنگ"
                  colors={filterValues.colors || []} 
                  value={form.values.color} 
                  onChange={(v) => form.setFieldValue("color", v)}
                  dropdownId="color"
                />
              </div>
            </div>
          </SwiperSlide> */}

          {/* Delivery Time Filter */}
          <SwiperSlide style={selectSlideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
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
                />
              </div>
            </div>
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
              style={{ minWidth: "100px" }}
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
              style={{ minWidth: "120px" }}
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
              width: "140px", // Fixed width
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between", // Space between label and switch
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
              width: "120px", // Fixed width
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
              width: "130px", // Fixed width
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
    </Paper>
  );
}

export default FiltersBrandMode;