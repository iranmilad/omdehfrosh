
import { useEffect, useState } from "react";
import { Table, Image, Typography, Space, Tag, Avatar } from "antd";
import { DownOutlined, RightOutlined, UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { NavLink } from "react-router";
import usePrint from "../../../hooks/usePrint";
import { Attributes } from "../fast-edit/orderRow";
import EditItemsFastOrder from "./edit-items";

const { Text, Link } = Typography;

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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const isPrinting = usePrint();
  const [formData, setFormData] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let newVisibleColumns = [];

    if (isMobile) {
      newVisibleColumns = [
        "minOrder", "deliveryTime", "discount", "attributes", "psid",
        "minOrder", "maxOrder", "seller", "deliveryTime", "payment_type", "delivery", "psid"
      ];
    } else if (isTablet) {
      newVisibleColumns = [ "maxOrder", "deliveryTime", "stock", "minOrder"];
    } else {
      newVisibleColumns = [
        "deliveryTime", "discount",
        "minOrder", "maxOrder", "seller", "delivery"
      ];
    }

    if (isPrinting) {
      newVisibleColumns = ["stock", "minOrder", "deliveryTime"];
    }

    if (icPriceKeys && icPriceKeys.length > 0) {
      newVisibleColumns = [...newVisibleColumns, ...icPriceKeys];
    }

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
          foreignCurrencyPrice: item.price?.foreignCurrencyPrice ?? 0,
          secondaryCost: item.price?.secondaryCost ?? 0,
          percentagePrice1: item.price?.percentagePrice1 ?? 0, // ⭐ ADD
          percentagePrice2: item.price?.percentagePrice2 ?? 0, // ⭐ ADD
          percentagePrice3: item.price?.percentagePrice3 ?? 0, // ⭐ ADD
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
        priceLabel: filters_brand_mode?.priceFormat || 'hezar',
        deliveryTime: {
          label: item?.deliveryTime?.label ?? "کمتر از یک روز",
          value: item?.deliveryTime?.value ?? "in1day",
        },
        delivery: Array.isArray(item.delivery) ? item.delivery : [],
        payment_type: item.payment_type || "",
      };

      if (item.nodes && item.nodes.length > 0) {
        initializeData(item.nodes, acc);
      }
    });

    return acc;
  };

  setFormData(initializeData(nodes));
}, [nodes]);

  const handleInputChange = (id, key, value) => {
    setFormData((prev) => {
      const updatedItem = structuredClone(prev[id] || {});
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
        const icLabel = lastKey;
        const icIndex = current.findIndex((ic) => ic.label === icLabel);

        if (icIndex !== -1) {
          const existingIC = current[icIndex];
          current[icIndex] = { 
            ...existingIC, 
            amount: value 
          };
        } else {
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

  const handleRowClick = () => {};


const handleNumberInputChange = (e, record, key) => {
  const input = e.target;
  const rawValue = e.target.value;
  
  if (rawValue === '') {
    handleInputChange(record.psid, key, 0);
    return;
  }
  
  const numValue = parseInt(rawValue, 10);
  
  if (isNaN(numValue) || numValue < 0) {
    handleInputChange(record.psid, key, 0);
    return;
  }
  
  handleInputChange(record.psid, key, numValue);
  
  // Move cursor to end after state update
  requestAnimationFrame(() => {
    const length = input.value.length;
    input.setSelectionRange(length, length);
    input.scrollLeft = input.scrollWidth;
  });
};


const handleInputKeyDown = (e, record, key) => {
  // Allow: backspace, delete, tab, escape, enter
  if ([8, 9, 27, 13, 46].includes(e.keyCode) ||
      // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
    return;
  }
  
  // Ensure only numbers
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
};

const [clickedInputs, setClickedInputs] = useState(new Set());

const handleInputFocus = (e) => {
  e.target.style.borderColor = "#1890ff";
};

const handleInputClick = (e, recordId, fieldKey) => {
  const input = e.target;
  const inputIdentifier = `${recordId}-${fieldKey}`;
  
  // If this is the first click on this input, select all
  if (!clickedInputs.has(inputIdentifier)) {
    input.select();
    setClickedInputs(prev => new Set(prev).add(inputIdentifier));
  }
  // Otherwise, let the user edit normally (cursor positioning works naturally)
};

const handleInputBlur = (e, record, key, defaultValue = 0) => {
  e.target.style.borderColor = "#d9d9d9";
  const inputIdentifier = `${record.psid}-${key}`;
  
  // Reset the clicked state when input loses focus
  setClickedInputs(prev => {
    const newSet = new Set(prev);
    newSet.delete(inputIdentifier);
    return newSet;
  });
  
  if (e.target.value === '' || parseInt(e.target.value, 10) < 0) {
    handleInputChange(record.psid, key, defaultValue);
  }
};


  const renderCellContent = (column, record) => {
    const displayItem = record;
    
    switch (column.key) {
case "image":
  const hasValidImage = displayItem.images && 
    displayItem.images.length > 0 && 
    displayItem.images[0] && 
    displayItem.images[0].trim() !== "" &&
    !imageErrors[record.psid];

  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      {hasValidImage ? (
        <Image 
          src={displayItem.images[0]} 
          width={40} 
          height={40}
          preview={false}
          fallback="data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' fill='%23f8f9fa'/%3E%3C/svg%3E"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [record.psid]: true }));
          }}
          style={{ objectFit: 'cover', borderRadius: 4, display: 'block' }}
        />
      ) : (
        <div style={{ 
          width: 40, 
          height: 40, 
          backgroundColor: '#f8f9fa', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: 4,
          border: '1px solid #e9ecef'
        }}>
          <ShoppingOutlined style={{ fontSize: 18, color: '#868e96' }} />
        </div>
      )}
    </div>
  );
      case "name":
        return (
          <NavLink
            to={`/product/${record.id}`}
            style={{ color: '#1890ff', textDecoration: 'none' }}
          >
            <Text
              style={{
                fontSize: isMobile ? 11 : 12,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              ellipsis={{ tooltip: record.name, rows: 2 }}
            >
              {record.name}
            </Text>
          </NavLink>
        );
      case "shortName":
        const hasChildren = record.children && record.children.length > 0;
        const isExpanded = expandedRowKeys.includes(record.key);
        
        return (
          <div 
            style={{ 
              position: 'relative',
              cursor: hasChildren ? 'pointer' : 'default'
            }}
            onClick={hasChildren ? (e) => {
              e.stopPropagation();
              if (isExpanded) {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.key));
              } else {
                setExpandedRowKeys([...expandedRowKeys, record.key]);
              }
            } : undefined}
          >
            <Text
              style={{
                fontSize: isMobile ? 10 : 12,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
              ellipsis={{ tooltip: record.shortName, rows: 2 }}
            >
              {record.shortName}
            </Text>
            {hasChildren && !isPrinting && (
              <div style={{
                position: 'absolute',
                bottom: -10,
                right: -10,
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: isExpanded ? '#1890ff' : '#fff',
                border: '2px solid #1890ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: isExpanded ? '#fff' : '#1890ff',
                transition: 'all 0.3s ease',
              }}>
                {isExpanded ? <DownOutlined /> : <RightOutlined />}
              </div>
            )}
          </div>
        );
          
  
  case "psid":
        return (
          <Text style={{ fontSize: isMobile ? 10 : 12, whiteSpace: 'nowrap' }}>
            {record.psid}
          </Text>
        );

      case "attributes":
        return <Attributes items={record.attributes} />;
      case "viewPrice":
        return (
          <div
            style={{
              fontSize: isMobile ? 10 : 12,
              minWidth: "80px",
              width: "100%",
              padding: "6px 8px",
              textAlign: "left",
              direction: "ltr",
              border: "1px solid #e8e8e8",
              borderRadius: "6px",
              backgroundColor: "#f5f5f5",
              color: "#595959",
              fontWeight: 500,
            }}
          >
            {record?.price?.regularPrice ?? 0}
          </div>
        );

      case "price":
        return (
          <input
            type="text"
            inputMode="numeric"
            value={formData[record?.psid]?.price?.regularPrice ?? 0}
            onChange={(e) => handleNumberInputChange(e, record, "price.regularPrice")}
            onFocus={handleInputFocus}
            onClick={(e) => handleInputClick(e, record.psid, "price.regularPrice")}
            onKeyDown={(e) => handleInputKeyDown(e, record, "price.regularPrice")}
            onBlur={(e) => handleInputBlur(e, record, "price.regularPrice", 0)}
            style={{
              fontSize: isMobile ? 10 : 12,
              minWidth: "80px",
              width: "100%",
              padding: "6px 8px",
              textAlign: "left",
              direction: "ltr",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              backgroundColor: "#fff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
        );

      case "ICPrice_usd":
        const usdIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "usd") || { amount: 0 };
        return (
          <input
            type="text"
            inputMode="numeric"
            value={usdIC.amount}
            onChange={(e) => handleNumberInputChange(e, record, "price.ICPrice.usd")}
            onFocus={handleInputFocus}
            onClick={(e) => handleInputClick(e, record.psid, "price.ICPrice.usd")}
            onKeyDown={(e) => handleInputKeyDown(e, record, "price.ICPrice.usd")}
            onBlur={(e) => handleInputBlur(e, record, "price.ICPrice.usd", 0)}
            style={{
              fontSize: isMobile ? 10 : 12,
              minWidth: "80px",
              width: "100%",
              padding: "6px 8px",
              textAlign: "left",
              direction: "ltr",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              backgroundColor: "#fff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
        );

      case "secondaryCost": // ⭐ NEW CASE - هزینه فرعی
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record?.psid]?.price?.secondaryCost ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "price.secondaryCost")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "price.secondaryCost")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "price.secondaryCost")}
        onBlur={(e) => handleInputBlur(e, record, "price.secondaryCost", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

    case "foreignCurrencyPrice": // ⭐ NEW CASE - قیمت ارزی
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record?.psid]?.price?.foreignCurrencyPrice ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "price.foreignCurrencyPrice")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "price.foreignCurrencyPrice")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "price.foreignCurrencyPrice")}
        onBlur={(e) => handleInputBlur(e, record, "price.foreignCurrencyPrice", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

    case "percentagePrice1": // ⭐ قیمت درصدی 1 (قیمت عادی)
  return (
    <input
      type="text"
      inputMode="numeric"
      value={formData[record?.psid]?.price?.percentagePrice1 ?? 0}
      onChange={(e) => handleNumberInputChange(e, record, "price.percentagePrice1")}
      onFocus={handleInputFocus}
      onClick={(e) => handleInputClick(e, record.psid, "price.percentagePrice1")}
      onKeyDown={(e) => handleInputKeyDown(e, record, "price.percentagePrice1")}
      onBlur={(e) => handleInputBlur(e, record, "price.percentagePrice1", 0)}
      style={{
        fontSize: isMobile ? 10 : 12,
        minWidth: "80px",
        width: "100%",
        padding: "6px 8px",
        textAlign: "left",
        direction: "ltr",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        backgroundColor: "#fff",
        outline: "none",
        transition: "border-color 0.2s",
      }}
    />
  );

case "percentagePrice2": // ⭐ قیمت درصدی 2 (قیمت تخفیف خورده)
  return (
    <input
      type="text"
      inputMode="numeric"
      value={formData[record?.psid]?.price?.percentagePrice2 ?? 0}
      onChange={(e) => handleNumberInputChange(e, record, "price.percentagePrice2")}
      onFocus={handleInputFocus}
      onClick={(e) => handleInputClick(e, record.psid, "price.percentagePrice2")}
      onKeyDown={(e) => handleInputKeyDown(e, record, "price.percentagePrice2")}
      onBlur={(e) => handleInputBlur(e, record, "price.percentagePrice2", 0)}
      style={{
        fontSize: isMobile ? 10 : 12,
        minWidth: "80px",
        width: "100%",
        padding: "6px 8px",
        textAlign: "left",
        direction: "ltr",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        backgroundColor: "#fff",
        outline: "none",
        transition: "border-color 0.2s",
      }}
    />
  );

case "percentagePrice3": // ⭐ قیمت درصدی 3 (قیمت ویژه تولید کننده)
  return (
    <input
      type="text"
      inputMode="numeric"
      value={formData[record?.psid]?.price?.percentagePrice3 ?? 0}
      onChange={(e) => handleNumberInputChange(e, record, "price.percentagePrice3")}
      onFocus={handleInputFocus}
      onClick={(e) => handleInputClick(e, record.psid, "price.percentagePrice3")}
      onKeyDown={(e) => handleInputKeyDown(e, record, "price.percentagePrice3")}
      onBlur={(e) => handleInputBlur(e, record, "price.percentagePrice3", 0)}
      style={{
        fontSize: isMobile ? 10 : 12,
        minWidth: "80px",
        width: "100%",
        padding: "6px 8px",
        textAlign: "left",
        direction: "ltr",
        border: "1px solid #d9d9d9",
        borderRadius: "6px",
        backgroundColor: "#fff",
        outline: "none",
        transition: "border-color 0.2s",
      }}
    />
  );

  case "ICPrice_AED":
    const aedIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "AED") || { amount: 0 };
    return (
      <input
        type="text"
        inputMode="numeric"
        value={aedIC.amount}
        onChange={(e) => handleNumberInputChange(e, record, "price.ICPrice.AED")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "price.ICPrice.AED")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "price.ICPrice.AED")}
        onBlur={(e) => handleInputBlur(e, record, "price.ICPrice.AED", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

  case "discount":
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record.psid]?.price.discountedPrice ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "price.discountedPrice")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "price.discountedPrice")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "price.discountedPrice")}
        onBlur={(e) => handleInputBlur(e, record, "price.discountedPrice", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

  case "stock":
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record.psid]?.stock ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "stock")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "stock")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "stock")}
        onBlur={(e) => handleInputBlur(e, record, "stock", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

  case "minOrder":
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record.psid]?.minOrder ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "minOrder")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "minOrder")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "minOrder")}
        onBlur={(e) => handleInputBlur(e, record, "minOrder", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );

  case "maxOrder":
    return (
      <input
        type="text"
        inputMode="numeric"
        value={formData[record.psid]?.maxOrder ?? 0}
        onChange={(e) => handleNumberInputChange(e, record, "maxOrder")}
        onFocus={handleInputFocus}
        onClick={(e) => handleInputClick(e, record.psid, "maxOrder")}
        onKeyDown={(e) => handleInputKeyDown(e, record, "maxOrder")}
        onBlur={(e) => handleInputBlur(e, record, "maxOrder", 0)}
        style={{
          fontSize: isMobile ? 10 : 12,
          minWidth: "80px",
          width: "100%",
          padding: "6px 8px",
          textAlign: "left",
          direction: "ltr",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          backgroundColor: "#fff",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
    );
    
  case "seller":
        return (
          <Space size={4} align="center" wrap={false} style={{ whiteSpace: 'nowrap' }}>
            <Link
              style={{ fontSize: isMobile ? 10 : 12, whiteSpace: 'nowrap' }}
              href={`/seller/${displayItem.seller.id}`}
            >
              {displayItem.seller.label}
            </Link>
            <Avatar size={16} icon={<UserOutlined />} />
          </Space>
        );

      case "deliveryTime":
        return (
          <select
            value={formData[record?.psid]?.deliveryTime?.value || ""}
            onChange={(e) => {
              const newValue = e.target.value;
              handleInputChange(record.psid, "deliveryTime", { 
                ...formData[record?.psid]?.deliveryTime, 
                value: newValue, 
                label: e.target.options[e.target.selectedIndex].text 
              });
            }}
            style={{
              fontSize: isMobile ? 10 : 12,
              minWidth: "80px",
              width: "100%",
              padding: "6px 8px",
              textAlign: "center",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              backgroundColor: "#fff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1890ff")}
            onBlur={(e) => (e.target.style.borderColor = "#d9d9d9")}
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
          </select>
        );

      case "payment_type":
        return (
          <select
            value={formData[record.psid]?.payment_type ?? "Cash"}
            onChange={(e) => handleInputChange(record.psid, "payment_type", e.target.value)}
            style={{
              fontSize: isMobile ? 10 : 12,
              minWidth: "80px",
              width: "100%",
              padding: "6px 8px",
              textAlign: "center",
              border: "1px solid #d9d9d9",
              borderRadius: "6px",
              backgroundColor: "#fff",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1890ff")}
            onBlur={(e) => (e.target.style.borderColor = "#d9d9d9")}
          >
            <option value="Cash">نقدی</option>
            <option value="Credit">غیر نقدی</option>
          </select>
        );

        case "delivery":
          return (
            <div
              style={{
                minWidth: "150px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                padding: "8px",
                backgroundColor: "#fff",
                fontSize: isMobile ? 10 : 12,
              }}
            >
              <div
                style={{
                  maxHeight: "80px",
                  overflowY: "auto",
                }}
              >
                {availableLocations?.slice(0, 1000).map((city) => (
                  <label
                    key={city.locationId}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "4px 0",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        Array.isArray(formData[record.psid]?.delivery)
                          ? formData[record.psid].delivery.some(
                              (val) => val.locationName === city.locationName
                            )
                          : Array.isArray(record.delivery)
                          ? record.delivery.some(
                              (val) => val.locationName === city.locationName
                            )
                          : false
                      }
                      onChange={(e) => {
                        const currentValues =
                          Array.isArray(formData[record.psid]?.delivery)
                            ? formData[record.psid].delivery
                            : Array.isArray(record.delivery)
                            ? record.delivery
                            : [];

                        const updatedValues = e.target.checked
                          ? [...currentValues, city]
                          : currentValues.filter(
                              (val) => val.locationName !== city.locationName
                            );

                        handleInputChange(record.psid, "delivery", updatedValues);
                      }}
                      style={{ marginLeft: "6px", flexShrink: 0 }}
                    />
                    <span style={{ whiteSpace: "nowrap" }}>{city.locationLabel}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        
case "action":
  return (
    <EditItemsFastOrder
      text="انتخاب"
      withButton
      style={{ minWidth: "50px" }}
      key={record.psid}
      item={record}
      formData={formData}
      setNodes={setNodes}  
      mode="brand"
      onChange={() => {}}
      onClick={handleRowClick}
    />
  );
      default:
        return null;
    }
  };

  const getColumnWidth = (columnKey) => {
    const widthMap = {
      image: isMobile ? 60 : 70,
      name: isMobile ? 150 : 200,
      shortName: isMobile ? 120 : 150,
      psid: isMobile ? 100 : 120,
      attributes: isMobile ? 100 : 120,
      viewPrice: isMobile ? 100 : 130,
      price: isMobile ? 100 : 130,
      secondaryCost: isMobile ? 100 : 130,
      foreignCurrencyPrice: isMobile ? 100 : 130,
      percentagePrice1: isMobile ? 100 : 130,
      percentagePrice2: isMobile ? 100 : 130,
      percentagePrice3: isMobile ? 100 : 130,
      discount: isMobile ? 100 : 130,
      stock: isMobile ? 100 : 120,
      minOrder: isMobile ? 100 : 120,
      maxOrder: isMobile ? 100 : 120,
      ICPrice_usd: isMobile ? 100 : 130,
      ICPrice_AED: isMobile ? 100 : 130,
      seller: isMobile ? 140 : 180,
      deliveryTime: isMobile ? 120 : 150,
      payment_type: isMobile ? 100 : 120,
      delivery: isMobile ? 170 : 220,
      action: isMobile ? 80 : 100,
    };
    return widthMap[columnKey] || (isMobile ? 100 : 120);
  };

  const columns = COLUMNS.filter(col => !visibleColumns.includes(col.key)).map(column => ({
    title: (
      <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 600 }}>{column.label}</div>
        {column.key === 'price' && filters_brand_mode?.priceFormat === 'million' && (
          <Text style={{ fontSize: isMobile ? 7 : 9, color: '#8c8c8c' }}>میلیون تومان</Text>
        )}
        {column.key === 'price' && filters_brand_mode?.priceFormat === 'hezar' && (
          <Text style={{ fontSize: isMobile ? 7 : 9, color: '#8c8c8c' }}>هزار تومان</Text>
        )}
      </div>
    ),
    dataIndex: column.key,
    key: column.key,
    align: 'center',
    width: getColumnWidth(column.key),
    ellipsis: false,
    render: (_, record) => renderCellContent(column, record),
  }));

  const transformData = (items) => {
    return items.map(item => ({
      ...item,
      key: item.psid || item.id,
      children: item.nodes && item.nodes.length > 0 ? transformData(item.nodes) : undefined,
    }));
  };

  const dataSource = transformData(nodes);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      {type === "head" ? null : (
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ 
            x: 'max-content',
            y: undefined 
          }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
            expandIcon: () => null,
            indentSize: 20,
            expandedRowClassName: (record) => 'expanded-row',
          }}
          bordered
          tableLayout="fixed"
          style={{
            fontSize: isMobile ? 10 : 12,
          }}
          className="fast-table-brand"
        />
      )}
      <style jsx>{`
        .fast-table-brand,
        .fast-table-brand .ant-table,
        .fast-table-brand .ant-table-container,
        .fast-table-brand .ant-table-content,
        .fast-table-brand table {
          background: #ffffff !important;
          background-color: #ffffff !important;
          backdrop-filter: none !important;
          box-shadow: none !important;
        }
        .fast-table-brand::before,
        .fast-table-brand::after,
        .fast-table-brand .ant-table::before,
        .fast-table-brand .ant-table::after,
        .fast-table-brand .ant-table-container::before,
        .fast-table-brand .ant-table-container::after,
        .fast-table-brand .ant-table-content::before,
        .fast-table-brand .ant-table-content::after,
        .fast-table-brand table::before,
        .fast-table-brand table::after {
          display: none !important;
          content: none !important;
        }
        .fast-table-brand .ant-table-cell {
          padding: ${isMobile ? '8px' : '12px'} !important;
          font-size: ${isMobile ? '10px' : '12px'} !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          backdrop-filter: none !important;
          white-space: normal !important;
          word-break: break-word !important;
        }
        .fast-table-brand .ant-table-cell::before,
        .fast-table-brand .ant-table-cell::after {
          display: none !important;
          content: none !important;
        }
        .fast-table-brand .ant-table-thead > tr > th {
          background: #f8f9fa !important;
          background-color: #f8f9fa !important;
          font-weight: 600;
          padding: ${isMobile ? '8px' : '12px'} !important;
          backdrop-filter: none !important;
          white-space: nowrap !important;
        }
        .fast-table-brand .ant-table-thead > tr > th::before,
        .fast-table-brand .ant-table-thead > tr > th::after {
          display: none !important;
          content: none !important;
        }
        .fast-table-brand .ant-table-tbody > tr > td {
          background: #ffffff !important;
          background-color: #ffffff !important;
          backdrop-filter: none !important;
        }
        .fast-table-brand .ant-table-tbody > tr > td::before,
        .fast-table-brand .ant-table-tbody > tr > td::after {
          display: none !important;
          content: none !important;
        }
        .fast-table-brand .ant-table-tbody > tr:hover > td {
          background: #f8f9fa !important;
          background-color: #f8f9fa !important;
        }
        .fast-table-brand .ant-table-tbody > tr.expanded-row > td {
          background: #e6f7ff !important;
          background-color: #e6f7ff !important;
        }
        .fast-table-brand .ant-table-tbody > tr.expanded-row:hover > td {
          background: #bae7ff !important;
          background-color: #bae7ff !important;
        }
      `}</style>
    </div>
  );
};

export default FastTableBrand;