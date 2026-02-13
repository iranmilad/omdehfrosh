import { useEffect, useRef, useState } from "react";
import { Table, Typography, Space, Button, Tag, Avatar } from "antd";
import { DownOutlined, RightOutlined, UserOutlined, ShoppingOutlined } from "@ant-design/icons";
import { NavLink } from "react-router";
import usePrint from "../../../hooks/usePrint";
import { Attributes } from "../fast-edit/orderRow";
import CounterFastOrder from "../../../components/counter-fastorder";
import EditItemsFastOrder from "./edit-items";

const { Text, Link } = Typography;

const FastTableBrandFastOrder = ({ 
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
  isLandscape,
  loading = false,
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

  const hasAppliedResponsiveColumnsRef = useRef(false);
  useEffect(() => {
    if (!hasAppliedResponsiveColumnsRef.current) {
      hasAppliedResponsiveColumnsRef.current = true;
      return;
    }
    let newVisibleColumns = [];

    if (isMobile) {
      newVisibleColumns = [
        "minOrder", "image", "deliveryTime", "discount", "attributes", "psid",
        "minOrder", "maxOrder", "seller", "deliveryTime", "payment_type", "delivery", "psid"
      ];
    } else if (isTablet) {
      newVisibleColumns = ["maxOrder", "image", "deliveryTime", "stock", "minOrder"];
    } else {
      newVisibleColumns = [
        "deliveryTime", "discount", "image",
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
          deliveryTime:
            item.deliveryTime?.value ??
            (filterValues?.deliveryTime?.[0]?.value || "Cash"),
          delivery: item.delivery ?? [],
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

  const renderCellContent = (column, record, onExpand) => {
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
        <img
          src={displayItem.images[0]}
          alt=""
          width={40}
          height={40}
          loading="lazy"
          onError={() => {
            setImageErrors(prev => ({ ...prev, [record.psid]: true }));
          }}
          style={{
            objectFit: 'cover',
            borderRadius: 4,
            display: 'block',
            margin: 0,
            padding: 0,
            verticalAlign: 'middle',
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
          borderRadius: 4,
            border: '1px solid #e9ecef',
            margin: 0,   // ← Remove margin
            padding: 0   // ← Remove padding
        }}>
          <ShoppingOutlined style={{ fontSize: 18, color: '#868e96' }} />
        </div>
      )}
    </div>
  );
case "name":
  const hasChildren = record.children && record.children.length > 0;
  const isExpanded = expandedRowKeys.includes(record.key);
  
  return (
    <div 
      style={{ 
        position: 'relative',
        cursor: hasChildren ? 'pointer' : 'default',
        textAlign: 'right',
        paddingRight: '28px',  // space for expand icon + gap between text and icon
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
      <NavLink
        to={`/product/${record.id}`}
        style={{ color: '#1890ff', textAlign: 'right' }}
        onClick={(e) => hasChildren && e.stopPropagation()}
      >
        <Text
          style={{
            fontSize: isMobile ? 11 : 12,
            display: 'block',
            textAlign: 'right',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
          title={record.name}
        >
          {record.name}
        </Text>
      </NavLink>
      {hasChildren && !isPrinting && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          transform: 'translateY(-50%)',
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

      case "attributes":
        return (
          <div className="attributes-container">
            <Attributes items={record.attributes} />
          </div>
        );
      case "price":
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{displayItem.price.regularPrice}</Text>;

      case "discount":
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{displayItem.price.discountedPrice}</Text>;

      case "stock":
        return <Tag color="blue" style={{ fontSize: isMobile ? 9 : 11 }}>{`${displayItem.stock} عدد`}</Tag>;

      case "minOrder":
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{`${displayItem.minOrder} عدد`}</Text>;

      case "maxOrder":
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{`${displayItem.maxOrder} عدد`}</Text>;

      case "ICPrice_usd":
        const usdIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "usd") || { amount: 0 };
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{usdIC.amount}</Text>;

      case "ICPrice_AED":
        const aedIC = formData[record?.psid]?.price?.ICPrice?.find((ic) => ic.label === "AED") || { amount: 0 };
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{aedIC.amount}</Text>;

      case "seller":
        return (
          <Space size={4} align="center">
            <Link
              style={{ fontSize: isMobile ? 10 : 12 }}
              href={`/seller/${displayItem.seller.id}`}
            >
              {displayItem.seller.label}
            </Link>
            <Avatar size={16} icon={<UserOutlined />} />
          </Space>
        );

      case "deliveryTime":
        return <Text style={{ fontSize: isMobile ? 10 : 12 }}>{displayItem.deliveryTime.label}</Text>;

      case "action":
        return (
          <CounterFastOrder
            text="انتخاب"
            withButton
            style={{ minWidth: "40px" }}
            key={displayItem.id}
            item={displayItem}
            priceFormat={filters_brand_mode.priceFormat}
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
    attributes: isMobile ? 50 : 60,
    price: isMobile ? 100 : 120,
    discount: isMobile ? 100 : 120,
    stock: isMobile ? 90 : 100,
    minOrder: isMobile ? 90 : 100,
    maxOrder: isMobile ? 90 : 100,
    ICPrice_usd: isMobile ? 100 : 120,
    ICPrice_AED: isMobile ? 100 : 120,
    seller: isMobile ? 120 : 150,
    deliveryTime: isMobile ? 100 : 130,
    action: isMobile ? 70 : 90,
  };
  return widthMap[columnKey] || (isMobile ? 80 : 120);
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
  align: column.key === 'name' ? 'right' : 'center',
  width: getColumnWidth(column.key),
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
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          // size={isMobile ? "small" : "middle"}
          scroll={{ 
            x: isMobile && isLandscape ? 350 : isMobile && isPortrait ? 400 : 'max-content',
            y: undefined 
          }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: setExpandedRowKeys,
            expandIcon: () => null, // Remove the default expand icon
            indentSize: 20,
            expandedRowClassName: (record) => 'expanded-row',
          }}
          bordered

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
  
  .fast-table-brand .ant-table-cell:first-child {
    padding: 4px !important;
  }
  
  .fast-table-brand .ant-image,
  .fast-table-brand .ant-image-img {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: 0 !important;
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

    .fast-table-brand .ant-table-tbody > tr > td:has(.attributes-container) {
    min-width: 100px !important;
    max-width: 120px !important;
  }
`}</style>
    </div>
  );
};

export default FastTableBrandFastOrder;