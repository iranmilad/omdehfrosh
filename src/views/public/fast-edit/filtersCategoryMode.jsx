import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  SimpleGrid,
  Select,
  Button,
  Radio,
  Stack,
  Combobox,
  useCombobox,
  Text,
  Switch,
  ColorSwatch,
  Group,
  SwitchCssVariables,
  InputBase,
  Checkbox,
  Input,
  CheckIcon,
  useMantineTheme,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFilter } from "@tabler/icons-react";
import iranStates from "../../../Libs/iranStates";
import { shallowEqual } from "@mantine/hooks";
import { useFastOrder } from ".";
import { useFilterContext } from "./filterscontext";
import { useLocation, useParams } from "react-router";
import { useData } from "../../../Libs/api";
import qs from "qs";

const colors = [
  { label: "قرمز", value: "#FF0000" },
  { label: "سبر", value: "#00FF00" },
  { label: "آبی", value: "#0000FF" },
  { label: "زرد", value: "#FFFF00" },
  { label: "بنفش", value: "#800080" },
];

const ColorCombobox = ({ colors, ...props }) => {
  const extendedColors = [{ label: "همه", value: "all" }, ...colors];
  const mantine = useMantineTheme();
  const { value, onChange } = props;
  const [selectedColor, setSelectedColor] = useState(
    value || extendedColors[0]?.value
  );
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(val) => {
        setSelectedColor(val);
        onChange(val);
        combobox.closeDropdown();
      }}
    >
      <Combobox.Target>
        <InputBase
          label="انتخاب رنگ"
          component="button"
          type="button"
          onClick={() => combobox.toggleDropdown()}
        >
          {selectedColor ? (
            <Group>
              {selectedColor === "all" ? (
                <Text size="sm" component="span">
                  همه رنگ‌ها
                </Text>
              ) : (
                <>
                  <ColorSwatch size={20} color={selectedColor} />
                  <Text size="sm" component="span">
                    {
                      extendedColors.find(
                        (item) => item.value === selectedColor
                      )?.label
                    }
                  </Text>
                </>
              )}
            </Group>
          ) : (
            <Text size="sm">انتخاب رنگ</Text>
          )}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        {extendedColors.map((color) => (
          <Combobox.Option key={color.value} value={color.value}>
            <Group>
              {color.value === "all" ? (
                <>
                  <Text size="sm">همه رنگ‌ها</Text>
                  {selectedColor === "all" && <CheckIcon size={14} />}
                </>
              ) : (
                <>
                  {selectedColor === color.value && (
                    <CheckIcon size={12} color={mantine.colors.gray[5]} />
                  )}
                  <ColorSwatch color={color.value} size={20} />
                  <Text size="sm">{color.label}</Text>
                </>
              )}
            </Group>
          </Combobox.Option>
        ))}
      </Combobox.Dropdown>
    </Combobox>
  );
};

function FiltersCategoryMode({ setFilters, nodes, filters, setNodes, setNodesSubCategories, searchType, setSearchType }) {
  

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const supplierId = params.get("supplierid") || "";
  const supplierName = params.get("suppliername") || "";
  const isSupplierFixed = !!supplierId;

  
  const { filterValues } = useFastOrder();

  const { filtersContext, setFiltersContext, brandsContext = { parent: [] } } = useFilterContext(); // Default to an empty parent array if brandss is undefined or null

  const form = useForm({
    initialValues: {
      color: filters?.color || "#FFFFFF",
      province: filters?.province || "all",
      stockStatus: filters?.stockStatus || "all",
      minStock: filters?.minStock || "", 
      deliveryTime: filters?.deliveryTime || "",
      paymentType: filters?.paymentType || "", 
      supplier: filters?.supplier || "",
      sort: filters?.sort || "bestPrice",
      priceFormat: filters?.priceFormat || "hezar",
    },
  });
  

  useEffect(() => {

    if (filters) {
      form.setValues(filters); 
    }

  }, [filters]);
  

  

  const handleSubmit = (values) => {
    
    const updatedValues = {
      ...values,
    };

    setFilters(updatedValues);
    
    setFiltersContext(updatedValues);
  };
  
  useEffect(() => {
  }, [filters]);
  
  const { setBrandsContext, setCategoryContext } = useFilterContext(); // Access context here

  // const [searchType, setSearchType] = useState("brand"); // نوع جستجو: brand یا category
  const [brands, setBrands] = useState({ parent: [], categories: [] });
  const [category, setCategory] = useState({ parent: [], subCategory: [], brands: [] });
  const {setFilterValues} = useFastOrder();
  const url = "/fastorder";
  const {id} = useParams();


  // const changeFilters = useCallback(() => {
  //   let thisFilter = {};
  
  //   if (searchType === "brand") {
  //     thisFilter.searchType = searchType;
  //     thisFilter.parent = brands.parent;
  //     thisFilter.categories = brands.categories;
  
  //     // Extract and format brand IDs
  //     thisFilter.brands = brands.parent.map((brand) => brand.id).join(",");
  //   } else if (searchType === "category") {
  //     thisFilter.searchType = "category";
  //     thisFilter.parent = category.parent;
  //     thisFilter.subCategory = category.subCategory;
  
  //     // Extract and format brand IDs from categories
  //     thisFilter.brands = category.brands.map((brand) => brand.id).join(",");
  //   }
  
  //   thisFilter.filters = filters;
  //   if (id) thisFilter.userId = id;
  
  //   return {
  //     thisFilter,
  //     query: qs.stringify(thisFilter, {
  //       addQueryPrefix: true,
  //       arrayFormat: "comma",
  //     }),
  //   };
  // }, [brands, category, searchType, filters]);
  

  // const queryKey = changeFilters().query;

  // درخواست برای داده‌ها
  // const { data, isLoading, isFetching } = useData({
  //   url,
  //   method: "POST",
  //   bodyData: changeFilters().thisFilter,
  //   queryKey: [url, queryKey],
  //   queryOptions: { staleTime: 30 * 10000 },
  // });

  // useMemo(() => {
  //   if (data) {
  //     setNodes(data.products);
  //     setNodesSubCategories(data.subCategoriesData)
  //     setFilterValues(data.filters)
  //     setBrandsContext({ parent: data.brands, categories: data.categories });
  //     setCategoryContext({ parent: data.category, subCategory: data.subCategory, brands: data.brands });
  //     // setFiltersContext(data.filters)
  //   }
  // }, [data]); 
  
  // Toggle function for stock status
  const toggleStockStatus = () => {
    form.setFieldValue("stockStatus", form.values.stockStatus === "yes" ? "no" : "yes");
  };

  const handleBrandChange = (selectedBrands) => {
    if (!brandsContext || !Array.isArray(brandsContext.parent)) return;
  
    // If "all" is selected, select all brands
    if (selectedBrands.includes("all")) {
      form.setFieldValue("brands", brandsContext.parent.map(brand => brand.name));
    } else {
      form.setFieldValue("brands", selectedBrands);
    }
  };
  
  if (!filterValues || !Array.isArray(filterValues.colors)) {
    return <Loader />
  }
  
  


  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Accordion variant="default" defaultValue="">
        <Accordion.Item value="default" styles={{ item: { border: "none" } }}>
          <Accordion.Control className="hover:bg-transparent">
            فیلتر ها
          </Accordion.Control>
          <Accordion.Panel>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>

              {/* Brand filter using checkboxes dynamically */}
              {/* <div>
                <Text size="sm" mb="xs">برندها</Text>
                <Checkbox.Group
                value={form.values.brands} // Ensure this is an array, initialized to []
                onChange={handleBrandChange} // Custom handler to update form values
              >
                <Group direction="column" spacing={5}>
                  {Array.isArray(brandsContext?.parent) && brandsContext.parent.length > 0 ? (
                    brandsContext.parent.map((brand) => (
                      <Checkbox
                        key={brand.id}
                        value={brand.name} // The value is brand.name (the brand identifier)
                        label={brand.title} // The label is brand.title (the name displayed in the UI)
                      />
                    ))
                  ) : (
                    <Text size="sm">برندها در دسترس نیست.</Text>
                  )}
                </Group>
              </Checkbox.Group>

              </div> */}

              <Select
                label="ترتیب نمایش"
                data={[
                  { label: "بهترین قیمت", value: "bestPrice" },
                  { label: "بیشترین موجودی", value: "highestStock" },
                ]}
                {...form.getInputProps("sort")}
              />



              <Select
                label="واحد قیمت"
                data={[
                  { label: "هزار تومان", value: "hezar" },
                  { label: "میلیون تومان", value: "million" },
                ]}
                {...form.getInputProps("priceFormat")}
                onChange={(value) => {
                  if (!value) return; // Prevent empty selection
                  form.setFieldValue("priceFormat", value);
                }}
              />


              <ColorCombobox colors={filterValues.colors || []} {...form.getInputProps("color")} />
              
              <Select
                label="زمان ارسال"
                clearable
                data={filterValues.deliveryTime
                //   [
                //   { label: "همه", value: "all" },
                //   { label: "کمتر از 3 ساعت", value: "3hr" },
                //   { label: "کمتر از 1 روز", value: "1d" },
                //   { label: "تا 3 روز", value: "3d" },
                //   { label: "تا 1 هفته", value: "7d" },
                //   { label: "تا 15 روز", value: "15d" },
                // ]
              }
                {...form.getInputProps("deliveryTime")}
              />
              
              <Select
                label="حداقل موجودی"
                clearable
                data={[
                  { label: "5", value: "5" },
                  { label: "10", value: "10" },
                  { label: "20", value: "20" },
                  { label: "50", value: "50" },
                  { label: "100", value: "100" },
                ]}
                {...form.getInputProps("minStock")}
              />

              <Select
                label="تامین کننده"
                searchable
                clearable={!isSupplierFixed} 
                data={filterValues.sellers}
                {...form.getInputProps("supplier")}
                value={isSupplierFixed ? supplierId : form.values.supplier} 
                disabled={isSupplierFixed} 
    
              />

              <div className="flex flex-col gap-3">
                <span className=" text-sm">
                  استان ارسال
                </span>
              {/* ✅ Toggle Switch for Stock Status */}
              <Switch
                label={form.values.province === "mylocation" ? "استان من" : "همه استان ها"}
                checked={form.values.province === "mylocation"}
                onChange={(event) =>
                  form.setFieldValue("province", event.currentTarget.checked ? "mylocation" : "all")
                }
                size="md"
                styles={(theme) => ({
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

              <div className="flex flex-col gap-3">
                <span className=" text-sm">
                  وضعیت موجودی
                </span>
              {/* ✅ Toggle Switch for Stock Status */}
              <Switch
                label={form.values.stockStatus ? "موجود" : "ناموجود"}
                checked={form.values.stockStatus}
                onChange={(event) =>
                  form.setFieldValue("stockStatus", event.currentTarget.checked)
                }
                size="md"
                styles={(theme) => ({
                  track: {
                    backgroundColor: form.values.stockStatus
                      ? theme.colors.green[6]
                      : theme.colors.red[6], // Green for "موجود", Red for "ناموجود"
                  },
                  thumb: {
                    backgroundColor: form.values.stockStatus
                      ? theme.white
                      : theme.white, // White thumb for both states
                  },
                })}
              />
              </div>

              <div className="flex flex-col gap-3">
                <span className=" text-sm">نوع فروش</span>
                <Switch
                  label={form.values.saleType === "cash" ? "نقدی" : "پیش فروش"}
                  checked={form.values.saleType === "cash"}
                  onChange={() =>
                    form.setFieldValue(
                      "saleType",
                      form.values.saleType === "cash" ? "credit" : "cash"
                    )
                  }
                  size="md"
                  styles={(theme) => ({
                    track: {
                      backgroundColor: form.values.saleType === "cash" ? theme.colors.grape[6] : theme.colors.violet[6],
                    },
                    thumb: {
                      backgroundColor: form.values.saleType === "cash" ? theme.white : theme.white,
                    },
                  })}
                />
              </div>

            </SimpleGrid>

            <Button
              type="submit"
              mt="lg"
              size="sm"
              leftSection={<IconFilter size={18} />}
            >
              اعمال فیلتر
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </form>
  );
}

export default FiltersCategoryMode;
