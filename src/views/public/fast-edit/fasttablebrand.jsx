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

  const renderCellContent = (column, record) => {
    const displayItem = record;
    
    switch (column.key) {
      case "image":
        const hasValidImage = displayItem.images && 
          displayItem.images.length > 0 && 
          displayItem.images[0] && 
          displayItem.images[0].trim() !== "" &&
          !imageErrors[record.psid];

        const hasChildren = record.children && record.children.length > 0;
        const isExpanded = expandedRowKeys.includes(record.key);

        return (
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              width: '100%', 
              height: '100%',
              cursor: hasChildren ? 'pointer' : 'default',
              position: 'relative'
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
            {hasValidImage ? (
              <div style={{ position: 'relative' }}>
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
                {hasChildren && !isPrinting && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
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
            ) : (
              <div style={{ position: 'relative' }}>
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
                {hasChildren && !isPrinting && (
                  <div style={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
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
        return (
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
        );

      case "psid":
        return (
          <Text style={{ fontSize: isMobile ? 10 : 12, whiteSpace: 'nowrap' }}>
            {record.psid}
          </Text>
        );

      case "attributes":
        return <Attributes items={record.attributes} />;

      case "price":
        return (
          <input
            type="number"
            value={typeof formData[record?.psid]?.price?.regularPrice === "number" ? formData[record?.psid]?.price?.regularPrice : 0}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "price.regularPrice", newValue);
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
          />
        );

      case "ICPrice_usd":
        const usdIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "usd") || { amount: 0 };
        return (
          <input
            type="number"
            value={usdIC.amount}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "price.ICPrice.usd", newValue);
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
          />
        );

      case "ICPrice_AED":
        const aedIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "AED") || { amount: 0 };
        return (
          <input
            type="number"
            value={aedIC.amount}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "price.ICPrice.AED", newValue);
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
          />
        );

      case "discount":
        return (
          <input
            type="number"
            value={formData[record.psid]?.price.discountedPrice ?? 0}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "price.discountedPrice", newValue);
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
          />
        );

      case "stock":
        return (
          <input
            type="number"
            value={formData[record.psid]?.stock ?? 0}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "stock", newValue);
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
          />
        );

      case "minOrder":
        return (
          <input
            type="number"
            value={formData[record.psid]?.minOrder ?? 0}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "minOrder", newValue);
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
          />
        );

      case "maxOrder":
        return (
          <input
            type="number"
            value={formData[record.psid]?.maxOrder ?? 0}
            min="0"
            onChange={(e) => {
              const newValue = Math.max(0, Number(e.target.value) || 0);
              handleInputChange(record.psid, "maxOrder", newValue);
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
                  maxHeight: "80px", // height ≈ 5 items
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
      price: isMobile ? 100 : 130,
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
        {column.key === 'price' && filters_brand_mode.priceFormat === 'million' && (
          <Text style={{ fontSize: isMobile ? 7 : 9, color: '#8c8c8c' }}>میلیون تومان</Text>
        )}
        {column.key === 'price' && filters_brand_mode.priceFormat === 'hezar' && (
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