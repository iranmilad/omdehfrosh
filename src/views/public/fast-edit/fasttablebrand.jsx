import { useEffect, useState } from "react";
import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import {
  getTheme,
  DEFAULT_OPTIONS,
} from "@table-library/react-table-library/mantine";
import {
  IconChevronDown,
  IconChevronLeft,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  Button,
  Image,
  Group,
  Anchor,
  ThemeIcon,
  Box,
  useMantineTheme,
  TextInput,
  NumberInput,
  Select,
  Text,
} from "@mantine/core";
import { CellTree, useTree } from "@table-library/react-table-library/tree";
import { NavLink } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import usePrint from "../../../hooks/usePrint";
import { Attributes } from "../fast-edit/orderRow";
import CounterFastOrder from "../../../components/counter-fastorder";
import EditItemsFastOrder from "./edit-items";



const TableRow = ({ 
  item, 
  columns, 
  selectedNodes,
  visibleColumns, 
  formData, 
  setFormData, 
  availableLocations = [], 
  filterValues,
  filters_brand_mode 
}) => {


  const handleRowClick = () => {
  };


  const displayItem = selectedNodes?.[item.id] || item;

  const visibleCols = columns.filter(
    (col) => !visibleColumns.includes(col.key)
  );
  const firstVisibleColumn = visibleCols[0]?.key;

const handleInputChange = (id, key, value) => {
  setFormData((prev) => {
    const updatedItem = structuredClone(prev[id] || {}); // Deep copy safely
    const keys = key.split(".");

    let current = updatedItem;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];

      if (!current[k]) {
        current[k] = k === "ICPrice" ? [] : {};
      }

      current = current[k];
    }

    const lastKey = keys[keys.length - 1];

    if (keys[keys.length - 2] === "ICPrice") {
      const icLabel = lastKey; // Example: "usd" or "AED"
      const icIndex = current.findIndex((ic) => ic.label === icLabel);

      if (icIndex !== -1) {
        // ✅ Retrieve existing ICID & name before updating
        const existingIC = current[icIndex];
        current[icIndex] = { 
          ...existingIC, 
          amount: value 
        };
      } else {
        // ✅ Find ICID & name from existing form data to preserve it
        const existingICData = prev[id]?.price?.ICPrice?.find((ic) => ic.label === icLabel);
        current.push({ 
          ICID: existingICData?.ICID ?? "default_id", 
          label: icLabel, 
          name: existingICData?.name ?? "Unknown", 
          amount: value 
        });
      }
    } else {
      current[lastKey] = value;
    }

    return {
      ...prev,
      [id]: updatedItem,
    };
  });
};

  
  
  

  return (
    <Row item={item} 
      className="items-center justify-center" 
      style={{ width: '100%', tableLayout: 'auto' }}
    >

      {columns.map((column, index) => {
        if (visibleColumns.includes(column.key)) return null;

        let content;
        switch (column.key) {
          case "image":
            content = item.nodes ? (
                <Image src={item.image} w={50} h={50} />
            ) : (
              ""
            );
            break;
            case "name":
              content = (
                <NavLink
                  to={`/product/${item.id}`}
                  className="text-md md:text-sm text-blue-500 hover:text-red-700 transition-colors duration-200"
                >
                  <Text
                    style={{
                      fontSize: '10px', // Adjust the font size
                      minWidth: '80px', // Minimum width of 80px
                      display: 'inline-block', // Ensures it stays inline
                      whiteSpace: 'normal', // Allows text to wrap if necessary
                      wordWrap: 'break-word', // Break words if needed to prevent overflow
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis when text overflows
                    }}
                  >
                    {item.name}
                  </Text>
                </NavLink>
              );            
              break;
              case "shortName":
                content = (
                  <Text
                    style={{
                      fontSize: '10px', // Adjust the font size
                      minWidth: '80px', // Minimum width of 80px
                      display: 'inline-block', // Ensures it stays inline
                      whiteSpace: 'normal', // Allows text to wrap if necessary
                      wordWrap: 'break-word', // Break words if needed to prevent overflow
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis when text overflows
                    }}
                >
                      {item.shortName}
                    </Text>
                )
                break;
              case "psid":
                content = (
                  <Text
                    style={{
                      fontSize: '10px', // Adjust the font size
                      minWidth: '80px', // Minimum width of 80px
                      display: 'inline-block', // Ensures it stays inline
                      whiteSpace: 'normal', // Allows text to wrap if necessary
                      wordWrap: 'break-word', // Break words if needed to prevent overflow
                      overflow: 'hidden', // Hide overflow text
                      textOverflow: 'ellipsis', // Show ellipsis when text overflows
                    }}
                >
                      {item.psid}
                    </Text>
                )
                break;
                case "attributes":
                  content = <Attributes items={item.attributes} />;
                break;
          case "price":
            content = (
              <input
                type="number"
                value={typeof formData[item?.psid]?.price?.regularPrice === "number" ? formData[item?.psid]?.price?.regularPrice : 0}
                min="0"
                onChange={(e) => {
                  const newValue = Math.max(0, Number(e.target.value) || 0);
                  handleInputChange(item.psid, "price.regularPrice", newValue);
                }}                
                style={{
                  fontSize: "12px",
                  minWidth: "80px",
                  width: "100%",
                  padding: "6px 8px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />

            );
            break;
            case "ICPrice_usd":
              const usdIC = formData[item?.psid]?.price?.ICPrice?.find((ic) => ic.label === "usd") || { amount: 0 };
              content = (
                <input
                  type="number"
                  value={usdIC.amount}
                  min="0"
                  onChange={(e) => {
                    const newValue = Math.max(0, Number(e.target.value) || 0);
                    handleInputChange(item.psid, "price.ICPrice.usd", newValue);
                  }}
                  style={{
                    fontSize: "12px",
                    minWidth: "80px",
                    width: "100%",
                    padding: "6px 8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}                
                  />
              );
              break;
            
            case "ICPrice_AED":
              const aedIC = formData[item?.psid]?.price?.ICPrice?.find((ic) => ic.label === "AED") || { amount: 0 };
              content = (
                <input
                  type="number"
                  value={aedIC.amount}
                  min="0"
                  onChange={(e) => {
                    const newValue = Math.max(0, Number(e.target.value) || 0);
                    handleInputChange(item.psid, "price.ICPrice.AED", newValue);
                  }}
                  style={{
                    fontSize: "12px",
                    minWidth: "80px",
                    width: "100%",
                    padding: "6px 8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}                />
              );
              break;
            
            case "discount":
              content = (
                <input
                type="number"
                value={formData[item.psid]?.price.discountedPrice ?? 0}
                min="0"
                onChange={(e) => {
                  const newValue = Math.max(0, Number(e.target.value) || 0);
                  handleInputChange(item.psid, "price.discountedPrice", newValue);
                }}                
                style={{
                  fontSize: "12px",
                  minWidth: "80px",
                  width: "100%",
                  padding: "6px 8px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              />
  
              );
              break;
          case "stock":
            content = (
              <input
                type="number"
                value={formData[item.psid]?.stock ?? 0}
                min="0"
                onChange={(e) => {
                  const newValue = Math.max(0, Number(e.target.value) || 0);
                  handleInputChange(item.psid, "stock", newValue);
                }}                
                style={{
                  fontSize: "12px",
                  minWidth: "80px",
                  width: "100%",
                  padding: "6px 8px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              />
            );
            break;
          case "minOrder":
            content = (
              <input
                type="number"
                value={formData[item.psid]?.minOrder ?? 0}
                min="0"
                onChange={(e) => {
                  const newValue = Math.max(0, Number(e.target.value) || 0);
                  handleInputChange(item.psid, "minOrder", newValue);
                }}                
                style={{
                  fontSize: "12px",
                  minWidth: "80px",
                  width: "100%",
                  padding: "6px 8px",
                  textAlign: "center",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  backgroundColor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />
            );
            break;
            case "maxOrder":
              content = (
                <input
                  type="number"
                  value={formData[item.psid]?.maxOrder ?? 0}
                  min="0"
                  onChange={(e) => {
                    const newValue = Math.max(0, Number(e.target.value) || 0);
                    handleInputChange(item.psid, "maxOrder", newValue);
                  }}                
                  style={{
                    fontSize: "12px",
                    minWidth: "80px",
                    width: "100%",
                    padding: "6px 8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />
              );
              break;
          case "seller":
            content = (
              <Group gap={3} align="center">
                <Anchor
                  size="sm"
                  className="text-blue-500 hover:text-red-700 transition-colors duration-200"
                  component={NavLink}
                  to={`/seller/${item.seller.id}`}
                >
                  {item.seller.label}
                </Anchor>
                <ThemeIcon size={16} variant="transparent">
                  <IconUserCircle />
                </ThemeIcon>
              </Group>
            );
            break;
            case "deliveryTime":
              content = (
                <select
                value={formData[item?.psid]?.deliveryTime?.value || ""}
                label={formData[item?.psid]?.deliveryTime?.label || ""}

                onChange={(e) => {
                  const newValue = e.target.value;
                  // const newLabel = e.target.label
                  handleInputChange(item.psid, "deliveryTime", { ...formData[item?.psid]?.deliveryTime, value: newValue, label: e.target.options[e.target.selectedIndex].text });
                }}
                style={{
                    fontSize: "12px",
                    minWidth: "80px",
                    width: "100%",
                    padding: "6px 8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                >
                  {filterValues?.deliveryTime?.length > 0 ? (
                    filterValues.deliveryTime.map((option, index) => (
                      <option key={index} value={option.value}>
                        {option.label}
                      </option>
                    ))
                  ) : (
                    <option disabled>گزینه‌ای یافت نشد</option>
                  )}

                  {/* <option value="3Hours">کمتر از 3 ساعت</option>
                  <option value="1Day">کمتر از 1 روز</option>
                  <option value="3Days">کمتر از 3 روز</option>
                  <option value="1Week">کمتر از 1 هفته روز</option>
                  <option value="15Days">کمتر از 15 روز</option> */}

                </select>
              );
              break;
           
            case "payment_type":
              content = (
                <select
                  value={formData[item.psid]?.payment_type ?? "Cash"}
                  onChange={(e) => handleInputChange(item.psid, "payment_type", e.target.value)}
                  style={{
                    fontSize: "12px",
                    minWidth: "80px",
                    width: "100%",
                    padding: "6px 8px",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                >
                  <option value="Cash">نقدی</option>
                  <option value="Credit">غیر نقدی</option>
                </select>
              );
              break;
            
            case "delivery":
              content = (
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    padding: "6px 8px",
                    backgroundColor: "#fff",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  {availableLocations?.map((city) => (
                    <label key={city.locationId} style={{ display: "block", fontSize: "12px", padding: "4px 0" }}>
                      <input
                        type="checkbox"
                        checked={
                          Array.isArray(formData[item.psid]?.delivery)
                            ? formData[item.psid].delivery.some(val => val.locationName === city.locationName)
                            : Array.isArray(item.delivery)
                              ? item.delivery.some(val => val.locationName === city.locationName)
                              : false
                        }
                        onChange={(e) => {
                          const currentValues =
                            Array.isArray(formData[item.psid]?.delivery)
                              ? formData[item.psid].delivery
                              : Array.isArray(item.delivery)
                                ? item.delivery
                                : [];

                          const updatedValues = e.target.checked
                            ? [...currentValues, city]
                            : currentValues.filter(val => val.locationName !== city.locationName);

                          handleInputChange(item.psid, "delivery", updatedValues);
                        }}
                        style={{ marginRight: "6px" }}
                      />

                      {city.locationLabel}
                    </label>
                  )
                  )
                  }
                </div>
              );
              break;
            
            case "action":
              content = (
                  <EditItemsFastOrder
                    text="انتخاب"
                    withButton
                    style={{ minWidth: "50px"}}
                    key={item.psid}
                    item={item}
                    formData={formData}
                    onChange={() => handleReplaceNode(displayItem)}
                    onClick={handleRowClick}
                  />
              );
              break;
          default:
            content = "";
        }

        {column.key === firstVisibleColumn && item.nodes ? (
          <CellTree key={column.key} item={item}>
            {content}
          </CellTree>
        ) : (
          <Cell 
            key={index} 
            style={{
              minWidth: "50px", 
              textAlign: "center", 
              wordBreak: 'break-word', // Break long words if necessary
              whiteSpace: 'normal', // Allows text to wrap
              overflow: 'visible', // Ensures that text overflow is visible
              width: '100%', // Ensures that the cell takes full width
            }}
          >
            {content}
          </Cell>

        )}

        return <Cell 
        key={index} 
        style={{
          minWidth: "100px", // Ensure enough space
          maxWidth: "200px", // Prevent excessive width
          textAlign: "center",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {content}
      </Cell>
      })}
    </Row>
  );
};

const FastTableBrand = ({ 
  nodes, 
  setNodes, 
  COLUMNS, 
  filterValues, 
  availableLocations, 
  type, 
  setVisibleColumns, 
  visibleColumns,
  filters_brand_mode,
  icPriceKeys,
  isPortrait,
  isLandscape
 }) => {

  if (!nodes || nodes.length === 0) return null;

  // if (!availableLocations || availableLocations.length === 0) return null;


  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isPrinting = usePrint();
  const { primaryColor } = useMantineTheme();
  const [ formData, setFormData ] = useState({});




  useEffect(() => {
    let newVisibleColumns = [];

    // Mobile view columns
    if (isMobile) {
      newVisibleColumns = [
         "image", "minOrder", "deliveryTime", "discount", "attributes", "psid",
        "minOrder", "maxOrder", "seller", "deliveryTime", "payment_type", "delivery", "psid"
      ];
    } 
    // Tablet view columns
    else if (isTablet) {
      newVisibleColumns = ["image", "maxOrder", "deliveryTime", "stock", "minOrder"];
    } 
    // For non-mobile and non-tablet views (desktop)
    else {
      newVisibleColumns = [
         "image", "deliveryTime", "discount",
        "minOrder", "maxOrder", "seller", "delivery"
      ];
    }

    // Add columns for printing
    if (isPrinting) {
      newVisibleColumns = ["image", "stock", "minOrder", "deliveryTime"];
    }

    // Join the icPriceKeys with the other visible columns
    if (icPriceKeys && icPriceKeys.length > 0) {
      newVisibleColumns = [...newVisibleColumns, ...icPriceKeys];
    }

    // Update the state with the combined columns
    setVisibleColumns(newVisibleColumns);
  }, [isMobile, isTablet, isPortrait, isLandscape, isPrinting, icPriceKeys]); // Add icPriceKeys as a dependency




  useEffect(() => {
    const initializeData = (items, acc = {}) => {

      items.forEach((item) => {

        acc[item.psid] = {
          price: {
            regularPrice: item.price?.regularPrice ?? 0,
            discountedPrice: item.price?.discountedPrice ?? 0,
            discountPercent: item.price?.discountPercent ?? null,
            ICPrice: Array.isArray(item.price?.ICPrice)
              ? item.price.ICPrice.map((ic) => ({
                  ICID: ic.ICID ?? "default_id",
                  label: ic.label ?? "unknown",
                  name: ic.name ?? "Unknown",
                  amount: ic.amount ?? 0,
                }))
              : [],
          },
          stock: item.stock ?? 0,
          minOrder: item.minOrder ?? 0,
          maxOrder: item.maxOrder ?? 0,
          priceLabel: filters_brand_mode.priceFormat,
          deliveryTime: {
            label: item?.deliveryTime.label ?? "کمتر از یک روز",
            value: item?.deliveryTime.value ?? "in1day",
          },
          delivery: Array.isArray(item.delivery) ? item.delivery : [],

                    // item.deliveryTime?.value ??
            // (filterValues?.deliveryTime?.[0]?.value || "in1day"),
          // delivery: item.delivery ?? [],
          payment_type: item.payment_type || "",
        };
  
        // Recursively handle subrows (nodes)
        if (item.nodes && item.nodes.length > 0) {
          initializeData(item.nodes, acc);
        }
      });
  
      return acc;
    };
  
    setFormData(initializeData(nodes));
  }, [nodes]);
  
  

  
    // const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);
    // const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
    

  let tree = useTree(
    { nodes: nodes || [] },
    {},
    {
      treeIcon: {
        iconRight: isPrinting ? null : <IconChevronLeft />,
        iconDown: isPrinting ? null : <IconChevronDown />,
      },
    }
  );



        const mantineTheme = getTheme(DEFAULT_OPTIONS);
        const theme = useTheme(mantineTheme);

        return (
          <Box 
          style={{ 
            overflowX: "auto", 
            width: "100%", 
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
            whiteSpace: "nowrap",
          }}
        >
        <div style={{ 
          minWidth: `${
            isMobile && isLandscape 
              ? 500 
              : isMobile && isPortrait 
                ? 800 
                : COLUMNS.length * 120
          }px`, 
          overflowX: "auto" 
        }}>
      <Table
        data={{ nodes }}
        theme={theme}
        tree={tree}
        layout={{ isDiv: true, fixedHeader: true }}
        style={{ width: "100%", tableLayout: "auto" }} // Prevents shrinking
      >


        {(tableList) => (
          <>
            {type === "head" ? (
              <Header>
                {/* <HeaderRow>
                  {COLUMNS.map((column) => (
                    <HeaderCell
                      className="text-xs md:text-sm"
                      hide={visibleColumns.includes(column.key)}
                      key={column.key}
                    >
                      {column.label}
                    </HeaderCell>
                  ))}
                </HeaderRow> */}
              </Header>
            ) : (
              <Box className="hidden">
                <Header>
                  <HeaderRow>
                  {COLUMNS.map((column) => (
                    <HeaderCell
                      style={{
                        fontSize: isMobile ? '10px' : isTablet ? '12px' : '12px',
                        minWidth: "120px",
                        maxWidth: "200px",
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                      hide={visibleColumns.includes(column.key)}
                      key={column.key}
                    >
                      {column.label}
                      {column.key === 'price' && filters_brand_mode.priceFormat === 'million' && (
                        <Text size="sm" style={{ marginTop: '5px' }}>میلیون تومان</Text>
                      )}
                      {column.key === 'price' && filters_brand_mode.priceFormat === 'hezar' && (
                        <Text size="sm" style={{ marginTop: '5px' }}>هزار تومان</Text>
                      )}
                    </HeaderCell>
                  ))}
                  </HeaderRow>
                </Header>
              </Box>
            )}
            {type === "head" ? null : (
              <Body>
                <HeaderRow>
                  {COLUMNS.map((column) => (
                    <HeaderCell
                      style={{
                        fontSize: isMobile ? '10px' : isTablet ? '12px' : '12px', 
                        minWidth: "120px",
                        maxWidth: "200px",
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                      hide={visibleColumns.includes(column.key)}
                      key={column.key}
                    >
                      {column.label}
                      {column.key === 'price' && filters_brand_mode.priceFormat === 'million' && (
                        <Text style={{ marginTop: '5px', fontSize: '8px' }}>میلیون تومان</Text> 
                      )}
                      {column.key === 'price' && filters_brand_mode.priceFormat === 'hezar' && (
                        <Text style={{ marginTop: '5px', fontSize: '8px' }}>هزار تومان</Text>  
                      )}
                    </HeaderCell>
                  ))}
                  
                </HeaderRow>
                {tableList.map((item) => (
                  <TableRow
                    key={item.psid}
                    item={item}
                    columns={COLUMNS}
                    visibleColumns={visibleColumns}
                    filterValues={filterValues}
                    availableLocations={availableLocations}
                    formData={formData}
                    filters_brand_mode={filters_brand_mode}
                    setFormData={setFormData}
                  />
                ))}
              </Body>
            )}
          </>
        )}
      </Table>
    </div>
    </Box>

  );
  
};

export default FastTableBrand;
