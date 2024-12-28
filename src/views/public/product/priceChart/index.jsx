import { LineChart } from "@mantine/charts";
import {
  Flex,
  Modal,
  ScrollArea,
  Select,
  Paper,
  Text,
  NumberFormatter,
} from "@mantine/core";
import React from "react";

export const data = [
  {
    date: "22 مهر",
    دیجیکالا: 2890,
    ترب: 2338,
    ایمالز: 2452,
  },
  {
    date: "23 مهر",
    دیجیکالا: 2756,
    ترب: 2103,
    ایمالز: 2402,
  },
  {
    date: "24 آبان",
    دیجیکالا: 3322,
    ترب: 986,
    ایمالز: 1821,
  },
  {
    date: "30 آذر",
    دیجیکالا: 3470,
    ترب: 2108,
    ایمالز: 2809,
  },
  {
    date: "1 دی",
    دیجیکالا: 3129,
    ترب: 1726,
    ایمالز: 2290,
  },
];

function ChartTooltip({ label, payload }) {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      {payload.map((item) => (
        <Text dir="ltr" key={item.name} fz="sm" c={item.color}>
          {item.name}:{" "}
          <span style={{ marginRight: "5px" }}>
            <NumberFormatter value={item.value} thousandSeparator /> تومان
          </span>
        </Text>
      ))}
    </Paper>
  );
}

function PriceChart(props) {
  return (
    <Modal
      opened={props.opened}
      size="100%"
      title={`نمودار قیمت ${props.title}`}
      onClose={props.close}
    >
        <Flex wrap="wrap" gap="md">
          <Select
            label="رنگ"
            data={[{ value: "blue", label: "آبی" }]}
            w="150"
            allowDeselect={false}
          />
          <Select
            label="حافظه"
            data={[{ value: "256", label: "256" }]}
            w="150"
            allowDeselect={false}
          />
          <Select
            label="حافظه"
            data={[{ value: "256", label: "256" }]}
            w="150"
            allowDeselect={false}
          />
          <Select
            label="حافظه"
            data={[{ value: "256", label: "256" }]}
            w="150"
            allowDeselect={false}
          />
        </Flex>
      <LineChart
        h={300}
        data={data}
        dataKey="date"
        tooltipProps={{
          content: ({ label, payload }) => (
            <ChartTooltip label={label} payload={payload} />
          ),
        }}
        curveType="linear"
        series={[
          { name: "دیجیکالا", color: "indigo.6" },
          { name: "ترب", color: "blue.6" },
          { name: "ایمالز", color: "teal.6" },
        ]}
      />
    </Modal>
  );
}

export default PriceChart;
