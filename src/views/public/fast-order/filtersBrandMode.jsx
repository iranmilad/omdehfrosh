import React, { useEffect, useState, useRef } from "react";
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
import { IconFilter, IconChevronDown, IconCheck, IconSettings } from "@tabler/icons-react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useFastOrder } from ".";
import { useFilterContext } from "./filterscontext";
import { useLocation } from "react-router";
import { useMediaQuery } from "@mantine/hooks";

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
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            // padding: "6px 8px",
            textAlign: "left",
            background: "transparent",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Flex flexDirection="row" alignItems="center" gap={8} style={{ flex: 1 }}>
            <Text size="xs" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {displayText}
            </Text>
            <IconChevronDown 
              size={14} 
              style={{ 
                // marginLeft: 8,
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }} 
            />
          </Flex>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown 
        style={{ 
          minWidth: '200px',
          width: 'auto',
          zIndex: 1000,
          maxHeight: '250px', // Increased max height for better scrolling
          overflowY: 'auto',
          overflowX: 'hidden', // Prevent horizontal scrolling
          border: '1px solid #ccc',
          borderRadius: '6px',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Better shadow
        }}
      >
        <Combobox.Option value="" disabled style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <Text size="xs" color="dimmed">{placeholder}</Text>
        </Combobox.Option>

        {normalized.map((item) => (
          <Combobox.Option 
            key={item.value} 
            value={item.value}
            style={{
              // padding: '8px 12px', // Better padding for touch targets
              cursor: 'pointer',
              borderRadius: '4px',
              // margin: '2px',
            }}
          >
            <Group position="apart" style={{ width: "100%" }}>
              <Flex flexDirection="row" alignItems="center" gap={8} style={{ flex: 1 }}>
                {String(effectiveValue) === String(item.value) && (
                  <IconCheck size={14} color={theme.colors.gray?.[6]} />
                )}  
                <Text size="xs" style={{ whiteSpace: 'nowrap' }}>{item.label}</Text>
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
  placeholder = "رنگ", 
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
      // size="xs"
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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 8,
            width: "100%",
            // padding: "6px 8px",
            background: "transparent",
            border: "none",
            textAlign: "left",
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Flex flexDirection="row" alignItems="center" gap={8} style={{ flex: 1 }}> 
            {selectedColor && selectedItem ? (
              <Group gap={6} style={{ flex: 1 }}>
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
                transition: 'transform 0.2s ease'
              }}
            />
          </Flex>
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown 
        style={{ 
          minWidth: '200px',
          width: 'auto',
          zIndex: 1000,
          maxHeight: '250px', // Increased max height for better scrolling
          overflowY: 'auto',
          overflowX: 'hidden', // Prevent horizontal scrolling
          border: '1px solid #ccc',
          borderRadius: '6px',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Better shadow
        }}
      >
        <Combobox.Option value="" disabled style={{ opacity: 0.7, pointerEvents: 'none' }}>
          <Text size="xs" color="dimmed">{placeholder}</Text>
        </Combobox.Option>

        {extendedColors.map((color) => (
          <Combobox.Option 
            key={color.value} 
            value={color.value}
            style={{
              // padding: '8px 12px', // Better padding for touch targets
              cursor: 'pointer',
              borderRadius: '4px',
              // margin: '2px',
            }}
          >
            <Group gap={6} position="apart" style={{ width: "100%" }}>
              <Group>
                {color.value !== "all" && <ColorSwatch color={color.value} size={12} />}
                <Text size="xs" style={{ whiteSpace: 'nowrap' }}>{color.label}</Text>
              </Group>
              {selectedColor === color.value && <IconCheck size={12} color={theme.colors.gray?.[6]} />}
            </Group>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
};

function FiltersBrandMode({ setFilters, nodes, filters, setNodes, setNodesSubCategories, searchType, setSearchType, setOpened }) {
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

  const slideStyle = {
    width: 'fit-content', 
    minWidth: '30px', 
    // border: '1.5px solid #ccc', 
    // borderRadius: '8px', 
    padding: '2px',
    // marginLeft: '8px',
    height: '35px', // Set fixed height
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // position: 'relative', // Add relative positioning for dropdown context
  };

  const buttonSlideStyle = {
    ...slideStyle,
    minWidth: '60px',
    justifyContent: 'flex-end'
  };
  // helper to normalize seller list (strings or objects)
  const sellersData = Array.isArray(filterValues.sellers)
    ? filterValues.sellers.map((s) => (typeof s === "string" ? { label: s, value: s } : s))
    : [];


  
    return (
      <Paper 
        mt={{ base: "xs", md: "xs" }} 
        // mb="xl" 
        id="fastorder-search"
        p={isMobile ? "sm" : "md"}
        style={{ 
          overflow: 'hidden' // Prevent horizontal scroll
        }}
      >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Swiper
          modules={[FreeMode]}
          spaceBetween={0}
          slidesPerView="auto"
          freeMode={true}
          style={{ 
            // padding: "8px 0", 
            height: "35px",
            overflow: 'visible' // Allow dropdown to overflow the swiper container
          }}
        >
          {/* Column Settings Button */}
          <SwiperSlide style={buttonSlideStyle}>
            <div className="flex flex-col justify-center h-full">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpened && setOpened(true)}
                px="xs"
              >
                <IconSettings size={18} />
              </Button>
            </div>
          </SwiperSlide>

        {/* Apply Filter Button */}
          <SwiperSlide style={buttonSlideStyle}>
            <div className="flex flex-col justify-center h-full">
              <Button
                type="submit"
                size="sm"
                leftSection={<IconFilter size={18} />}
              >
                اعمال
              </Button>
            </div>
          </SwiperSlide>
          
          {/* Sort Filter */}
          <SwiperSlide style={slideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1, minWidth: "0" }}>
                <ChevronSelect
                  placeholder="ترتیب"
                  allLabel="همه ترتیب‌ها"
                  data={[
                    { label: "بهترین قیمت", value: "bestPrice" },
                    { label: "بیشترین موجودی", value: "highestStock" },
                  ]}
                  value={form.values.sort}
                  onChange={(v) => form.setFieldValue("sort", v)}
                  // size="xs"
                  dropdownId="sort"
                />
              </div>
            </div>
          </SwiperSlide>

          {/* Price Format Filter */}
          <SwiperSlide style={slideStyle}>
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
                  // size="xs"
                  dropdownId="priceFormat"
                />
              </div>
            </div>
          </SwiperSlide>

          {/* Color Filter */}
          <SwiperSlide style={slideStyle}>
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
          </SwiperSlide>

          {/* Delivery Time Filter */}
          <SwiperSlide style={slideStyle}>
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
                  // size="xs"
                  dropdownId="deliveryTime"
                />
              </div>
            </div>
          </SwiperSlide>

          {/* Min Stock Filter */}
          <SwiperSlide style={slideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
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
                  // size="xs"
                  dropdownId="minStock"
                />
              </div>
            </div>
          </SwiperSlide>

          {/* Supplier Filter */}
          <SwiperSlide style={slideStyle}>
            <div className="flex items-center h-full">
              <div style={{ flex: 1 }}>
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
                  // size="xs"
                  disabled={isSupplierFixed}
                  dropdownId="supplier"
                />
              </div>
            </div>
          </SwiperSlide>

          {/* Province Filter (Switch) */}
          <SwiperSlide 
            style={{...slideStyle, cursor: 'pointer', overflow: "hidden"}}
            onClick={(e) => handleSlideClick(e, 'province')}
          >
            <div className="flex flex-col items-center justify-center h-full gap-1">
              {/* <span className="text-xs text-center" style={{ fontSize: "10px", lineHeight: "1.2" }}>استان ارسال</span> */}
              <Switch
                label={form.values.province === "mylocation" ? "استان من" : "همه استان ها"}
                checked={form.values.province === "mylocation"}
                readOnly
                size="xs"
                labelPosition="right"
                styles={(theme) => ({
                  root: {
                    pointerEvents: 'none',
                  },
                  track: {
                    backgroundColor: form.values.province === "mylocation"
                      ? theme.colors.blue[8]  // Blue for "استان من"
                      : theme.colors.yellow[5], // Orange for "همه استان ها"
                  },
                  thumb: {
                    backgroundColor: theme.white, // White thumb for visibility
                  },
                })}
              />
            </div>
          </SwiperSlide>

          {/* Stock Status Filter (Switch) */}
          <SwiperSlide 
            style={{...slideStyle, cursor: 'pointer', overflow: "hidden"}}
            onClick={(e) => handleSlideClick(e, 'stockStatus')}
          >
            <div className="flex flex-col items-center justify-center h-full gap-1">
              {/* <span className="text-xs text-center" style={{ fontSize: "10px", lineHeight: "1.2" }}>وضعیت موجودی</span> */}
              <Switch
                label={form.values.stockStatus ? "موجود" : "ناموجود"}
                checked={!!form.values.stockStatus}
                readOnly
                size="xs"
                labelPosition="right"
                styles={(theme) => ({
                  root: {
                    pointerEvents: 'none',
                  },
                  track: {
                    backgroundColor: form.values.stockStatus
                      ? theme.colors.green[6]
                      : theme.colors.red[6], // Green for "موجود", Red for "ناموجود"
                  },
                  thumb: {
                    backgroundColor: theme.white,
                  },
                })}
              />
            </div>
          </SwiperSlide>

          {/* Sale Type Filter (Switch) */}
          <SwiperSlide 
            style={{...slideStyle, cursor: 'pointer', overflow: "hidden"}}
            onClick={(e) => handleSlideClick(e, 'saleType')}
          >
            <div className="flex flex-col items-center justify-center h-full gap-1">
              {/* <span className="text-xs text-center" style={{ fontSize: "10px", lineHeight: "1.2" }}>نوع فروش</span> */}
              <Switch
                label={form.values.saleType === "cash" ? "نقدی" : "پیش فروش"}
                checked={form.values.saleType === "cash"}
                readOnly
                size="xs"
                labelPosition="right"
                styles={(theme) => ({
                  root: {
                    pointerEvents: 'none',
                  },
                  track: {
                    backgroundColor: form.values.saleType === "cash" ? theme.colors.grape[6] : theme.colors.violet[6],
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