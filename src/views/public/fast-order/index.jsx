import { useState, useEffect, useCallback, useId, createContext } from "react";
import XTitle from "../../../components/title";
import OrderRow, { Attributes } from "./orderRow";
import Filters from "./filters";
import SearchComponent from "./searchComponent";
import React from "react";
import "./style.css";
import ShareModal from "./shareModal";
import {
  Group,
  Paper,
  Button,
  Box,
  Flex,
  Modal,
  Stack,
  Checkbox,
  Text,
} from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import FastTable from "./table";

const FastOrderContext = createContext();

function FastOrder() {
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [nodes, setNodes] = useState(null);
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    color: "all",
    province: "all",
    stockStatus: "all",
    minStock: "",
    deliveryTime: "",
    paymentType: "",
    supplier: "",
    sort: "bestPrice",
    priceFormat: "tooman"
  });
  const [opened, setOpened] = useState(false);

  // Table columns
  const COLUMNS = [
    { key: "image", label: "تصویر" },
    { key: "name", label: "نام کالا" },
    { key: "price", label: "قیمت" },
    { key: "attributes", label: "ویژگی ها" },
    { key: "stock", label: "موجودی" },
    { key: "minOrder", label: "حداقل سفارش" },
    { key: "seller", label: "تامین کننده" },
    { key: "deliveryTime", label: "زمان تحویل" },
    { key: "action", label: "عملیات" },
  ];

  // Handle saving column visibility settings
  const handleSave = () => setOpened(false);

  return (
    <FastOrderContext.Provider value={{visibleColumns,setVisibleColumns}}>
      <Group justify="space-between" align="center" id="fastorder-top">
        <XTitle>سفارش سریع</XTitle>
        <ShareModal />
      </Group>
      <Paper mt={{ base: "xs", md: "xl" }} mb="xl" id="fastorder-search">
        <SearchComponent filters={filters} setNodes={setNodes} />
      </Paper>
      <Paper id="fastorder-filters">
        <Filters setFilters={setFilters} />
      </Paper>
      <Group
        id="fastorder-tablesettings"
        mt="lg"
        mb="sm"
        justify="space-between"
        align="center"
      >
        <Button
          leftSection={<IconSettings size={16} />}
          onClick={() => setOpened(true)}
          py={0}
        >
          پنهان کردن ستون‌ها
        </Button>
      </Group>
      {nodes !== null ? (
        <Paper p={0} className="overflow-hidden" bg="white" id="tables">
          <FastTable type="head" COLUMNS={COLUMNS} nodes={nodes[0].items.slice(0,1)} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
          {nodes.map((item, index) => (
            <>
              <Flex h={40} align="center" justify="center" bg="#e5e7eb">
                <Text size="18px" c="dark">
                  {item.label}
                </Text>
              </Flex>
              <FastTable type="data" COLUMNS={COLUMNS} nodes={item.items} setVisibleColumns={setVisibleColumns} visibleColumns={visibleColumns} />
            </>
          ))}
        </Paper>
      ) : null}

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
    </FastOrderContext.Provider>
  );
}

export default FastOrder;
