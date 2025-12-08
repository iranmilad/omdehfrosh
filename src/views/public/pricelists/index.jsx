import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPriceLists } from "../../../redux/pricelists/priceListsActions";
import {
  Card,
  Table,
  Spin,
  Alert,
  Typography,
  Space,
  Empty,
  Tag,
  Row,
  Col,
  Statistic,
  Badge,
} from "antd";
import {
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
  TagsOutlined,
  TrophyOutlined,
  RocketOutlined,
  CrownOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { Helmet } from "react-helmet";

const { Title, Text } = Typography;

function PriceLists() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.priceLists);

  useEffect(() => {
    dispatch(fetchPriceLists());
  }, [dispatch]);

  // Hot color themes for different cards
  const colorThemes = [
    {
      gradient: "linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)",
      light: "#fff1f0",
      lighter: "#ffccc7",
      border: "#ff4d4f",
      accent: "#ff7875",
      shadow: "rgba(255, 77, 79, 0.4)",
      tag: "red",
    },
    {
      gradient: "linear-gradient(135deg, #fa541c 0%, #d4380d 100%)",
      light: "#fff2e8",
      lighter: "#ffd8bf",
      border: "#fa541c",
      accent: "#ff7a45",
      shadow: "rgba(250, 84, 28, 0.4)",
      tag: "volcano",
    },
    {
      gradient: "linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)",
      light: "#fff7e6",
      lighter: "#ffd591",
      border: "#fa8c16",
      accent: "#ffa940",
      shadow: "rgba(250, 140, 22, 0.4)",
      tag: "orange",
    },
    {
      gradient: "linear-gradient(135deg, #faad14 0%, #d48806 100%)",
      light: "#fffbe6",
      lighter: "#ffe58f",
      border: "#faad14",
      accent: "#ffc53d",
      shadow: "rgba(250, 173, 20, 0.4)",
      tag: "gold",
    },
    {
      gradient: "linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)",
      light: "#fff0f6",
      lighter: "#ffadd2",
      border: "#eb2f96",
      accent: "#f759ab",
      shadow: "rgba(235, 47, 150, 0.4)",
      tag: "magenta",
    },
    {
      gradient: "linear-gradient(135deg, #f5222d 0%, #a8071a 100%)",
      light: "#fff1f0",
      lighter: "#ffa39e",
      border: "#f5222d",
      accent: "#ff4d4f",
      shadow: "rgba(245, 34, 45, 0.4)",
      tag: "red",
    },
  ];

  const columns = (theme) => [
    {
      title: (
        <Space size="small">
          <ShoppingCartOutlined style={{ fontSize: 16 }} />
          <span>محصول</span>
        </Space>
      ),
      dataIndex: "product",
      key: "product",
      render: (text) => (
        <Space>
          <TagsOutlined style={{ color: theme.border }} />
          <Text strong style={{ color: "#262626" }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: (
        <Space size="small">
          <DollarCircleOutlined style={{ fontSize: 16 }} />
          <span>قیمت</span>
        </Space>
      ),
      dataIndex: "price",
      key: "price",
      align: "center",
      width: 200,
      render: (price) => (
        <Tag
          color={theme.tag}
          icon={<DollarCircleOutlined />}
          style={{
            fontSize: "14px",
            padding: "4px 14px",
            borderRadius: 20,
            fontWeight: 600,
          }}
        >
          {price}
        </Tag>
      ),
    },
  ];

  const cardIcons = [
    <RocketOutlined />,
    <TrophyOutlined />,
    <CrownOutlined />,
    <StarOutlined />,
    <TagsOutlined />,
    <ShoppingCartOutlined />,
  ];

  return (
    <div style={{ padding: "32px 24px", maxWidth: "1400px", margin: "0 auto", background: "linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)", minHeight: "100vh" }}>
      <Helmet>
        <title>لیست قیمت محصولات | پنل مدیریت</title>
      </Helmet>

      {/* Header Section */}
      <Card
        style={{
          marginBottom: 32,
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
          border: "none",
          borderRadius: 16,
          boxShadow: "0 8px 24px rgba(255, 107, 107, 0.35)",
        }}
      >
        <Row align="middle" justify="space-between" gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small">
              <Space size="middle" align="center">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <FileTextOutlined style={{ fontSize: 28, color: "#ffffff" }} />
                </div>
                <div>
                  <Title
                    level={2}
                    style={{
                      color: "#ffffff",
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 32,
                    }}
                  >
                    لیست قیمت محصولات
                  </Title>
                  <Text style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 16 }}>
                    مشاهده و مدیریت قیمت‌های تمام محصولات
                  </Text>
                </div>
              </Space>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "center" }}>
            <Card
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: 12,
              }}
            >
              <Statistic
                title={
                  <Text style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 14 }}>
                    تعداد لیست‌ها
                  </Text>
                }
                value={data.length}
                prefix={<FileTextOutlined style={{ color: "#ffffff" }} />}
                valueStyle={{ color: "#ffffff", fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card
          style={{
            textAlign: "center",
            padding: "80px 20px",
            borderRadius: 16,
            border: "2px dashed #ff7875",
          }}
        >
          <Space direction="vertical" size="large">
            <Spin size="large" />
            <Text style={{ fontSize: 16, color: "#8c8c8c" }}>
              در حال بارگذاری لیست قیمت‌ها...
            </Text>
          </Space>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert
          message="خطا در دریافت اطلاعات"
          description={`دریافت لیست قیمت‌ها با خطا مواجه شد: ${error}`}
          type="error"
          showIcon
          closable
          style={{
            marginBottom: 24,
            borderRadius: 12,
            border: "1px solid #ff4d4f",
          }}
        />
      )}

      {/* Empty State */}
      {!loading && !error && data.length === 0 && (
        <Card
          style={{
            textAlign: "center",
            padding: "80px 20px",
            borderRadius: 16,
            border: "2px dashed #ff7875",
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size="small">
                <Text style={{ fontSize: 18, color: "#595959", fontWeight: 600 }}>
                  هیچ لیست قیمتی یافت نشد
                </Text>
                <Text style={{ fontSize: 14, color: "#8c8c8c" }}>
                  لیست قیمت‌های شما در اینجا نمایش داده خواهد شد
                </Text>
              </Space>
            }
          />
        </Card>
      )}

      {/* Price Lists */}
      {!loading && !error && data.length > 0 && (
        <Row gutter={[24, 24]}>
          {data.map((list, index) => {
            const theme = colorThemes[index % colorThemes.length];
            return (
              <Col xs={24} xl={12} key={list.id}>
                <Badge.Ribbon
                  text={`لیست ${index + 1}`}
                  color={theme.tag}
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      border: `1px solid ${theme.lighter}`,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ padding: 0 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = `0 12px 32px ${theme.shadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    {/* Card Header */}
                    <div
                      style={{
                        padding: "20px 24px",
                        background: `linear-gradient(135deg, ${theme.light} 0%, ${theme.lighter} 100%)`,
                        marginBottom: 12
                      }}
                    >
                      <Space align="center" size="middle">
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 48,
                            height: 48,
                            borderRadius: 12,
                            background: theme.gradient,
                            boxShadow: `0 4px 12px ${theme.shadow}`,
                          }}
                        >
                          {React.cloneElement(cardIcons[index % cardIcons.length], {
                            style: { fontSize: 24, color: "#ffffff" },
                          })}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Title
                            level={4}
                            style={{
                              margin: 0,
                              marginBottom: 4,
                              color: theme.border,
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            {list.title}
                          </Title>
                          <Text style={{ color: theme.accent, fontSize: 13 }}>
                            {list.tablelist.length} محصول
                          </Text>
                        </div>
                      </Space>
                    </div>

                    {/* Table */}
                    <div style={{ padding: 0 }}>
                      <Table
                        columns={columns(theme)}
                        dataSource={list.tablelist.map((item) => ({
                          ...item,
                          key: item.id,
                        }))}
                        pagination={false}
                        scroll={{ x: "100%" }}
                        size="small"
                        style={{
                          borderRadius: 0,
                        }}
                        rowClassName={(record, idx) =>
                          idx % 2 === 0 ? "" : `striped-row-${index % colorThemes.length}`
                        }
                      />
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            );
          })}
        </Row>
      )}

      <style>{`
        .striped-row-0 { background-color: #fff1f0; }
        .striped-row-1 { background-color: #fff2e8; }
        .striped-row-2 { background-color: #fff7e6; }
        .striped-row-3 { background-color: #fffbe6; }
        .striped-row-4 { background-color: #fff0f6; }
        .striped-row-5 { background-color: #fff1f0; }
        
        .ant-table-thead > tr > th {
          color: #ffffff !important;
          font-weight: 700;
          border: none !important;
          padding: 12px 16px !important;
          font-size: 14px;
        }
        .ant-table-tbody > tr > td {
          padding: 10px 16px;
        }
        .ant-table {
          border-radius: 0 0 16px 16px;
          overflow: hidden;
        }
        
        /* Dynamic header colors based on card */
        ${data.map((_, index) => {
          const theme = colorThemes[index % colorThemes.length];
          return `
            .ant-table:nth-of-type(${index + 1}) .ant-table-thead > tr > th {
              background: ${theme.gradient} !important;
            }
            .ant-table:nth-of-type(${index + 1}) .ant-table-tbody > tr > td {
              border-color: ${theme.light};
            }
            .ant-table:nth-of-type(${index + 1}) .ant-table-tbody > tr:hover > td {
              background-color: ${theme.light} !important;
            }
          `;
          
        }).join('\n')}
      `}</style>
    </div>
  );
}

export default PriceLists;