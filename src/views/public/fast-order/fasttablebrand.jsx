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

  const [imageErrors, setImageErrors] = useState({});

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
            const hasValidImage = displayItem.images && 
                                displayItem.images.length > 0 && 
                                displayItem.images[0] && 
                                displayItem.images[0].trim() !== "" &&
                                !imageErrors[item.psid]; // Check if this specific image failed to load

            content = hasValidImage ? (
              <Image 
                src={displayItem.images[0]} 
                w={40} 
                h={40}
                onError={() => {
                  // When image fails to load, mark it as error and trigger re-render
                  setImageErrors(prev => ({ ...prev, [item.psid]: true }));
                }}
              />
            ) : (
              <div style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: '#f8f9fa', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                borderRadius: '4px',
                border: '1px solid #e9ecef'
              }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#868e96" strokeWidth="1.5">
                            {/* Shopping bag/product icon */}
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="m16 10a4 4 0 0 1-8 0"/>
                          </svg>
              </div>
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
                      fontSize: '9px',
                      minWidth: '60px',
                      display: 'inline-block',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.name}
                  </Text>
                </NavLink>
              );            
              break;
          case "attributes":
            content = <Attributes items={item.attributes} />;
            break;
          case "price":
            content = displayItem.price.regularPrice;
            break;
          case "discount":
             content = displayItem.price.discountedPrice;
             break;
          // case "psid":
          //   content = displayItem.psid;
            break;
          case "stock":
            content = `${displayItem.stock} عدد`;
            break;
          case "minOrder":
            content = `${displayItem.minOrder} عدد`;
            break;
            case "maxOrder":
              content = `${displayItem.maxOrder} عدد`;
              break;
              case "ICPrice_usd":
                const usdIC = formData[item?.psid]?.price?.ICPrice?.find((ic) => ic.label === "usd") || { amount: 0 };
                content = usdIC.amount
                break;
                case "ICPrice_AED":
                  const aedIC = formData[item?.psid]?.price?.ICPrice?.find((ic) => ic.label === "AED") || { amount: 0 };
                  content = aedIC.amount
                  break;
          case "seller":
            content = (
              <Group gap={2} align="center">
                <Anchor
                  size="xs"
                  className="text-blue-500 hover:text-red-700 transition-colors duration-200"
                  component={NavLink}
                  to={`/seller/${displayItem.seller.id}`}
                >
                  {displayItem.seller.label}
                </Anchor>
                <ThemeIcon size={12} variant="transparent">
                  <IconUserCircle />
                </ThemeIcon>
              </Group>
            );
            break;
          case "deliveryTime":
            content = displayItem.deliveryTime.label;
            break;
            case "action":
              content = (
                  <CounterFastOrder
                    text="انتخاب"
                    withButton
                    style={{ minWidth: "40px"}}
                    key={displayItem.id}
                    item={displayItem}
                    priceFormat={filters_brand_mode.priceFormat}
                    onChange={() => handleReplaceNode(displayItem)}
                    onClick={handleRowClick}
                    visibleColumns={visibleColumns}
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
              minWidth: "40px", 
              padding: "2px 4px", // Minimal padding
              margin: "0", // Remove margin
              textAlign: "center", 
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflow: 'visible',
              fontSize: '10px', // Smaller font
              lineHeight: '1.2', // Tighter line height
            }}
          >
            {content}
          </Cell>
        )}

        return <Cell 
        key={index} 
        style={{
          minWidth: "50px", // Reduced minimum width
          maxWidth: "120px", // Reduced maximum width
          padding: "2px 4px", // Minimal padding
          margin: "0", // Remove margin
          textAlign: "center",
          wordBreak: "break-word",
          whiteSpace: "normal",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontSize: '10px', // Smaller font
          lineHeight: '1.2', // Tighter line height
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
  }, [isMobile, isTablet, isPortrait, isLandscape, isPrinting, icPriceKeys]);

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
          deliveryTime:
            item.deliveryTime?.value ??
            (filterValues?.deliveryTime?.[0]?.value || "Cash"),
          delivery: item.delivery ?? [],
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

  // Create custom compact theme
  const mantineTheme = getTheme({
    ...DEFAULT_OPTIONS,
    // Override theme for minimal spacing
    Table: `
      border-collapse: collapse;
      border-spacing: 0;
      width: 100%;
      table-layout: auto;
    `,
    Header: `
      background-color: #f8f9fa;
    `,
    HeaderRow: `
      border-bottom: 1px solid #dee2e6;
    `,
    HeaderCell: `
      padding: 4px 6px !important;
      margin: 0 !important;
      border-right: 1px solid #dee2e6;
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      white-space: normal;
      word-break: break-word;
      line-height: 1.2;
    `,
    Row: `
      border-bottom: 1px solid #f1f3f4;
      &:hover {
        background-color: #f8f9fa;
      }
    `,
    Cell: `
      padding: 2px 4px !important;
      margin: 0 !important;
      border-right: 1px solid #f1f3f4;
      font-size: 10px;
      text-align: center;
      vertical-align: middle;
      line-height: 1.2;
    `,
  });
  
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
            ? 350 // Reduced from 500
            : isMobile && isPortrait 
              ? 400 // Reduced from 800
              : COLUMNS.length  // Reduced from 120
        }px`, 
        overflowX: "auto" 
      }}>
        <Table
          data={{ nodes }}
          theme={theme}
          tree={tree}
          layout={{ isDiv: true, fixedHeader: true }}
          style={{ 
            width: "100%", 
            tableLayout: "auto",
            borderCollapse: "collapse",
            borderSpacing: "0"
          }}
        >
          {(tableList) => (
            <>
              {type === "head" ? (
                <Header>
                  {/* Header content */}
                </Header>
              ) : (
                <Box className="hidden">
                  <Header>
                    <HeaderRow>
                    {COLUMNS.map((column) => (
                      <HeaderCell
                        style={{
                          fontSize: '9px', // Reduced font size
                          minWidth: "50px", // Reduced min width
                          maxWidth: "120px", // Reduced max width
                          padding: "4px 6px", // Minimal padding
                          margin: "0", // Remove margin
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: "1.2", // Tighter line height
                        }}
                        hide={visibleColumns.includes(column.key)}
                        key={column.key}
                      >
                        {column.label}
                        {column.key === 'price' && filters_brand_mode.priceFormat === 'million' && (
                          <Text size="xs" style={{ marginTop: '2px', fontSize: '7px' }}>میلیون تومان</Text>
                        )}
                        {column.key === 'price' && filters_brand_mode.priceFormat === 'hezar' && (
                          <Text size="xs" style={{ marginTop: '2px', fontSize: '7px' }}>هزار تومان</Text>
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
                          fontSize: '9px', // Reduced font size
                          minWidth: "50px", // Reduced min width
                          maxWidth: "120px", // Reduced max width
                          padding: "4px 6px", // Minimal padding
                          margin: "0", // Remove margin
                          textAlign: "center",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          lineHeight: "1.2", // Tighter line height
                        }}
                        hide={visibleColumns.includes(column.key)}
                        key={column.key}
                      >
                        {column.label}
                        {column.key === 'price' && filters_brand_mode.priceFormat === 'million' && (
                          <Text style={{ marginTop: '2px', fontSize: '7px' }}>میلیون تومان</Text> 
                        )}
                        {column.key === 'price' && filters_brand_mode.priceFormat === 'hezar' && (
                          <Text style={{ marginTop: '2px', fontSize: '7px' }}>هزار تومان</Text>  
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