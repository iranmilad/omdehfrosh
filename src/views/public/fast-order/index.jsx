import { useState, useEffect,useCallback } from "react";
import { Table, Header, HeaderRow, Body, Row, HeaderCell, Cell } from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import { getTheme, DEFAULT_OPTIONS } from "@table-library/react-table-library/mantine";
import { IconChevronDown, IconChevronLeft, IconOctahedronOff, IconSettings, IconUserCircle } from "@tabler/icons-react";
import { Button, Image, Modal, Checkbox, Group, Paper, Stack, Select, Text, Pagination, Anchor, ThemeIcon } from "@mantine/core";
import { CellTree, useTree } from "@table-library/react-table-library/tree";
import { Virtualized } from "@table-library/react-table-library/virtualized";
import XTitle from "../../../components/title";
import OrderRow from "./orderRow";
import Filters from "./filters";
import SearchComponent from "./searchComponent";
import React from "react";
import "./style.css"
import { shallowEqual, useForceUpdate } from "@mantine/hooks";
import { NavLink } from "react-router";
import { useMediaQuery } from '@mantine/hooks';


function FastOrder() {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState({});
  const [pageSize, setPageSize] = useState('10');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    province: "",
    stockStatus: "",
    minStock: "",
    deliveryTime: "",
    paymentType: "",
    supplier: "",
    sort: 'newest',
  });
  const [opened, setOpened] = useState(false);

  // Responsive breakpoints
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Define visible columns based on screen size
  useEffect(() => {
    if (isMobile) {
      setVisibleColumns(['image', 'stock', 'minOrder', 'deliveryTime','price']); // Hide these columns on mobile
    } else if (isTablet) {
      setVisibleColumns(['image', 'stock', 'minOrder']); // Hide these columns on tablet
    } else {
      setVisibleColumns([]); // Show all columns on larger screens
    }
  }, [isMobile, isTablet]);

  // Handle replacing a node in the tree
  const handleReplaceNode = useCallback(
    (subNode) => {
      let originalSub = {};
      const newNodes = nodes.map((node) => {
        if (node.id === subNode.parentNode.id) {
          const newParent = { ...node, nodes: null };
          const index = node.nodes.findIndex((item) => item.id === subNode.id);
          originalSub = node.nodes[index];
          node.nodes[index] = newParent;
          originalSub.nodes = node.nodes;
          return originalSub;
        }
        return node;
      });
      setNodes(newNodes);
    },
    [nodes]
  );

  // Initialize tree
  const tree = useTree(
    { nodes: nodes || [] },
    {},
    {
      treeIcon: {
        iconRight: <IconChevronLeft />,
        iconDown: <IconChevronDown />,
      },
    }
  );

  // Theme setup
  const mantineTheme = getTheme(DEFAULT_OPTIONS);
  const theme = useTheme(mantineTheme);

  // Table columns
  const COLUMNS = [
    { key: "image", label: "تصویر" },
    { key: "name", label: "نام کالا" },
    { key: "price", label: "قیمت" },
    { key: "stock", label: "موجودی" },
    { key: "minOrder", label: "حداقل سفارش" },
    { key: "seller", label: "تامین کننده" },
    { key: "deliveryTime", label: "زمان تحویل" },
    { key: "action", label: "عملیات" },
  ];

  // Handle saving column visibility settings
  const handleSave = () => setOpened(false);

  return (
    <>
      <XTitle>سفارش سریع</XTitle>
      <Paper my="xl">
        <SearchComponent
          filters={filters}
          setNodes={setNodes}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          setTotalItems={setTotalItems}
        />
      </Paper>
      <Paper>
        <Filters setFilters={setFilters} />
      </Paper>
      <Group mt="lg" mb="sm" justify="space-between" align="center">
        <Button
          leftSection={<IconSettings size={16} />}
          onClick={() => setOpened(true)}
          py={0}
        >
          پنهان کردن ستون‌ها
        </Button>
        <Select
          p={0}
          value={pageSize}
          w="100"
          data={[
            { label: "10", value: "10" },
            { label: "25", value: "25" },
            { label: "50", value: "50" },
            { label: "همه", value: "all" },
          ]}
          onChange={setPageSize}
        />
      </Group>
      {nodes ? (
        <Table
          data={{ nodes }}
          theme={theme}
          tree={tree}
          layout={{ isDiv: true, fixedHeader: true }}
        >
          {(tableList) => (
            <>
              <Header>
                <HeaderRow>
                  {COLUMNS.map((column) => (
                    <HeaderCell
                      hide={visibleColumns.includes(column.key)}
                      key={column.key}
                    >
                      {column.label}
                    </HeaderCell>
                  ))}
                </HeaderRow>
              </Header>
              <Body>
                {tableList.map((item) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    columns={COLUMNS}
                    visibleColumns={visibleColumns}
                    selectedNodes={selectedNodes}
                    handleReplaceNode={handleReplaceNode}
                  />
                ))}
              </Body>
            </>
          )}
        </Table>
      ) : null}
      {/* نمایش صفحه‌بندی در صورتی که pageSize مقدار "all" نباشد */}
      {pageSize !== "all" && (
        <Pagination
          total={Math.ceil(totalItems / pageSize)}
          value={currentPage}
          onChange={setCurrentPage}
          mt="md"
          position="center"
        />
      )}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="پنهان کردن ستون‌ها"
      >
        <Stack>
          {COLUMNS.map((column) => (
            <Checkbox
              key={column.key}
              label={column.label}
              checked={visibleColumns.includes(column.key)}
              onChange={(event) =>
                setVisibleColumns((val) =>
                  val.includes(column.key)
                    ? val.filter((v) => v !== column.key)
                    : [...val, column.key]
                )
              }
            />
          ))}
        </Stack>
      </Modal>
    </>
  );
}

const TableRow = ({ item, columns, visibleColumns, selectedNodes, handleReplaceNode, ...other }) => {
  const displayItem = selectedNodes?.[item.id] || item;
  const visibleCols = columns.filter((col) => !visibleColumns.includes(col.key));
  const firstVisibleColumn = visibleCols[0]?.key; // Determine the first visible column

  return (
    <Row key={item.id} item={displayItem} className={item.parentId ? "bg-gray-200" : ""}>
      {columns.map((column, index) => {
        const isHidden = visibleColumns.includes(column.key);
        if (isHidden) return null;

        let content;
        switch (column.key) {
          case "image":
            content = displayItem.nodes ? <Image src={displayItem.image} w={50} h={50} /> : "";
            break;
          case "name":
            content = displayItem.name;
            break;
          case "price":
            content = displayItem.price;
            break;
          case "stock":
            content = `${displayItem.stock} عدد`;
            break;
          case "minOrder":
            content = `${displayItem.minOrder} عدد`;
            break;
          case "seller":
            content = (
              <Group gap={3} align="center">
                <Anchor size="sm" component={NavLink} to={`/seller/${displayItem.seller.id}`}>
                  {displayItem.seller.label}
                </Anchor>
                <ThemeIcon size={16} variant="transparent">
                  <IconUserCircle />
                </ThemeIcon>
              </Group>
            );
            break;
          case "deliveryTime":
            content = displayItem.deliveryTime;
            break;
          case "action":
            content = <OrderRow sku={item.action} onReplace={() => handleReplaceNode(displayItem)} />;
            break;
          default:
            content = "";
        }

        if (column.key === firstVisibleColumn && displayItem.nodes) {
          return (
            <CellTree key={column.key} item={displayItem} hide={isHidden}>
              {content}
            </CellTree>
          );
        }

        return <Cell key={column.key} hide={isHidden}>{content}</Cell>;
      })}
    </Row>
  );
};


export default FastOrder;
