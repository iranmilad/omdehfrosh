import { useState } from "react";
import { CompactTable } from "@table-library/react-table-library/compact";
import { useTheme } from "@table-library/react-table-library/theme";
import {
  DEFAULT_OPTIONS,
  getTheme,
} from "@table-library/react-table-library/mantine";
import "./style.css";
import {
  IconChevronDown,
  IconChevronLeft,
  IconFilter,
  IconSettings,
} from "@tabler/icons-react";
import {
  ActionIcon,
  Button,
  Image,
  Modal,
  Checkbox,
  Group,
  Stack,
  Card,
  Avatar,
  Text,
  Badge,
  Indicator,
  Box,
  Flex,
  Paper,
  Tabs,
  Collapse,
  Accordion,
  SimpleGrid,
  Select,
} from "@mantine/core";
import { useTree } from "@table-library/react-table-library/tree";
import XTitle from "../../../components/title";
import OrderRow from "./orderRow";
import { useData } from "../../../Libs/api";
import { useDisclosure } from "@mantine/hooks";
import iranStates from "../../../Libs/iranStates";
import Filters from "./filters";
import Table from "./table";
import SearchComponent from "./searchComponent";

function FastOrder() {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes,setNodes] = useState(null);
  const [filters,setFilters] = useState(
    {
      province: '',
      stockStatus: '',
      minStock: '',
      deliveryTime: '',
      paymentType: '',
      supplier: '',
    }
  );

  const [opened, setOpened] = useState(false);

  const COLUMNS = [
    {
      key: "image",
      label: "تصویر",
      renderCell: (item) => {
        if (item.nodes) {
          return <Image src={item.image} w={50} h={50} />;
        }
        return "";
      },
      tree: true,
      hide: visibleColumns.includes("image"),
    },
    {
      key: "name",
      label: "نام کالا",
      renderCell: (item) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          {visibleColumns.includes("image") && item.nodes && (
            <span style={{ marginRight: "8px" }}>
              {tree.state.ids.includes(item.id) ? (
                <IconChevronDown size={16} />
              ) : (
                <IconChevronLeft size={16} />
              )}
            </span>
          )}
          {item.nodes ? (
            <span className="text-sm font-bold">{item.name}</span>
          ) : (
            <span className="text-[13px]">{item.name}</span>
          )}
        </div>
      ),
      hide: visibleColumns.includes("name"),
    },
    {
      key: "price",
      label: "قیمت",
      renderCell: (item) => item.price,
      hide: visibleColumns.includes("price"),
    },
    {
      key: "stock",
      label: "موجودی",
      renderCell: (item) => `${item.stock} عدد`,
      hide: visibleColumns.includes("stock"),
    },
    {
      key: "minOrder",
      label: "حداقل سفارش",
      renderCell: (item) => `${item.minOrder} عدد`,
      hide: visibleColumns.includes("minOrder"),
    },
    {
      key: "seller",
      label: "تامین کننده",
      renderCell: (item) => item.seller,
      hide: visibleColumns.includes("seller"),
    },
    {
      key: "deliveryTime",
      label: "زمان تحویل",
      renderCell: (item) => item.deliveryTime,
      hide: visibleColumns.includes("deliveryTime"),
    },
    {
      key: "action",
      label: "عملیات",
      renderCell: (item) => <OrderRow sku={item.action} />,
      hide: visibleColumns.includes("action"),
    },
  ];

  
  const handleSave = () => {
    setOpened(false);
  };

  return (
    <>
      <XTitle>سفارش سریع</XTitle>
      <Paper my="xl">
        <SearchComponent filters={filters} setNodes={setNodes} />
      </Paper>
      <Paper>
        <Filters setFilters={setFilters} />
      </Paper>
      <Button
        mt="lg"
        leftSection={<IconSettings size={16} />}
        onClick={() => setOpened(true)}
        p={0}
        variant="transparent"
      >
        پنهان کردن ستون‌ها
      </Button>

      {nodes ? <Table nodes={nodes.products} visibleColumns={visibleColumns} columns={COLUMNS} /> : null}

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
                setVisibleColumns(
                  (val) =>
                    val.includes(column.key)
                      ? val.filter((v) => v !== column.key) // Remove if already exists
                      : [...val, column.key] // Add if not exists
                )
              }
            />
          ))}
        </Stack>
        <Group position="right" mt="md">
          <Button onClick={handleSave}>ذخیره</Button>
        </Group>
      </Modal>
    </>
  );
}

export default FastOrder;
