import { LineChart } from "@mantine/charts";
import { Flex, Modal, Paper, Text, NumberFormatter, Center, Box } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";
import React from "react";
import moment from "moment-jalaali";

function ChartTooltip({ label, payload }) {
  if (!payload) return null;

  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      {payload.map((item) => (
        <Text dir="ltr" key={item.name} fz="sm" c={item.color}>
          {item.name}: {" "}
          <span style={{ marginRight: "5px" }}>
            <NumberFormatter value={item.value} thousandSeparator /> تومان
          </span>
        </Text>
      ))}
    </Paper>
  );
}

function PriceChart({ opened, close, title, priceHistory }) {

  const formattedData = priceHistory?.map((entry) => ({
    date: moment(entry.date, "YYYY-MM-DD").format("jYYYY/jMM/jDD"),
    "کمترین قیمت": entry.minPrice,
    "بیشترین قیمت": entry.maxPrice,
  })) || [];

  return (
    <Modal
      opened={opened}
      size="80%"
      title={`نمودار قیمت ${title}`}
      onClose={close}
      zIndex={1100}
      styles={{
        root: { zIndex: 1100 },
        inner: { zIndex: 1100, paddingTop: 0 },
        overlay: { zIndex: 1099 },
        header: { paddingTop: 0 },
        content: { paddingTop: 0 },
      }}
    >
      {!priceHistory || priceHistory.length === 0 ? (
        <Center h={300}>
          <Flex direction="column" align="center" gap="md">
            <IconChartLine size={48} color="gray" />
            <Text size="lg" c="gray" ta="center">
              اطلاعاتی در این بخش برای محصول وجود ندارد
            </Text>
          </Flex>
        </Center>
      ) : (
        <LineChart
          h={300}
          data={formattedData}
          dataKey="date"
          tooltipProps={{
            content: ({ label, payload }) => (
              <ChartTooltip label={label} payload={payload} />
            ),
          }}
          curveType="linear"
          series={[
            { name: "کمترین قیمت", color: "green.6" },
            { name: "بیشترین قیمت", color: "red.6" },
          ]}
        />
      )}
    </Modal>
  );
}

export default PriceChart;