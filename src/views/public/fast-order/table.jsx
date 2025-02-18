import { useEffect, useCallback, useState } from "react";
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
  IconOctahedronOff,
  IconSettings,
  IconShare,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  Button,
  Image,
  Modal,
  Checkbox,
  Group,
  Paper,
  Stack,
  Select,
  Text,
  Pagination,
  Anchor,
  ThemeIcon,
  NumberFormatter,
  Divider,
  Box,
  useMantineTheme,
  Flex,
} from "@mantine/core";
import { CellTree, useTree } from "@table-library/react-table-library/tree";
import { NavLink } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import usePrint from "../../../hooks/usePrint";
import PriceText from "../../../components/priceText";
import React from "react";
import OrderRow, { Attributes } from "./orderRow";
import { useFastOrder } from ".";
import Counter from "../../../components/counter";

const TableRow = ({
  item,
  columns,
  visibleColumns,
  selectedNodes,
  handleReplaceNode,
  ...other
}) => {
  const displayItem = selectedNodes?.[item.id] || item;
  const visibleCols = columns.filter(
    (col) => !visibleColumns.includes(col.key)
  );
  const firstVisibleColumn = visibleCols[0]?.key; // Determine the first visible column

  console.log(item)

  return (
    <Row item={displayItem} className={`${item.parentId ? "bg-gray-200" : ""} max-w-16`}>
      {columns.map((column, index) => {
        const isHidden = visibleColumns.includes(column.key);
        if (isHidden) return null;

        let content;
        switch (column.key) {
          case "image":
            content = displayItem.nodes ? (
              <Image src={displayItem.image} w={50} h={50} />
            ) : (
              ""
            );
            break;
          case "name":
            content = <Text className="text-xs md:text-sm" component="span" dangerouslySetInnerHTML={{__html:displayItem.name}} />;
            break;
          case "attributes":
            content = <Attributes items={item.attributes} />;
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
                <Anchor
                  size="sm"
                  component={NavLink}
                  to={`/seller/${displayItem.seller.id}`}
                >
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
            content = (<Counter text="انتخاب" withButton onChange={() => handleReplaceNode(displayItem)} />);
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

        return <Cell key={index} hide={isHidden}>{content}</Cell>;
      })}
    </Row>
  );
};

const FastTable = ({
  nodes,
  setNodes,
  COLUMNS,
  type,
  setVisibleColumns,
  visibleColumns,
  keyIndex
}) => {
  // Responsive breakpoints
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isPrinting = usePrint();
  const { primaryColor } = useMantineTheme();
  const [selectedNodes, setSelectedNodes] = useState({});

  // Define visible columns based on screen size
  useEffect(() => {
    if (isMobile) {
      setVisibleColumns([
        "image",
        "stock",
        "minOrder",
        "deliveryTime",
        "seller",
      ]); // Hide these columns on mobile
    } else if (isTablet) {
      setVisibleColumns(["image", "stock", "minOrder"]); // Hide these columns on tablet
    } else {
      setVisibleColumns([]); // Show all columns on larger screens
    }

    if (isPrinting) {
      setVisibleColumns(["image", "stock", "minOrder", "deliveryTime"]);
    }
  }, [isMobile, isTablet, isPrinting]);

  // Handle replacing a node in the tree
  const handleReplaceNode = (subNode) => {
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
    setNodes(val => {
      const newState = [...val]; // Create a shallow copy
      newState[keyIndex] = { ...newState[keyIndex], items: newNodes }; // Copy and update the specific index
      return newState;
    });    
  };
    

  // Initialize tree

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

  // Theme setup
  const mantineTheme = getTheme(DEFAULT_OPTIONS);
  const theme = useTheme(mantineTheme);

  return (
    <Table
      data={{ nodes }}
      theme={theme}
      tree={tree}
      layout={{ isDiv: true, fixedHeader: true }}
    >
      {(tableList) => (
        <>
          {type === "head" ? (
            <Header>
              <HeaderRow>
                {COLUMNS.map((column) => (
                  <HeaderCell
                    className={`${column.key === "price" ? "max-w-max" : ""} text-xs md:text-sm`}
                    hide={visibleColumns.includes(column.key)}
                    key={column.key}
                  >
                    {column.label}
                  </HeaderCell>
                ))}
              </HeaderRow>
            </Header>
          ) : (
            <Box className="hidden">
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
            </Box>
          )}
          {type === "head" ? null : (
            <Body>
              {tableList.map((item, index) => (
                <TableRow
                  key={index}
                  item={item}
                  columns={COLUMNS}
                  visibleColumns={visibleColumns}
                  selectedNodes={selectedNodes}
                  handleReplaceNode={handleReplaceNode}
                />
              ))}
            </Body>
          )}
        </>
      )}
    </Table>
  );
};

export default FastTable;
