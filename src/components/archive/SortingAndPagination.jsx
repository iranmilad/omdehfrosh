import React from "react";
import { Paper,Flex,SegmentedControl,Select,Pagination,Center,Text } from "@mantine/core";
import { IconSortDescending } from "@tabler/icons-react";

const sortFilter = [
    { label: "جدیدترین", value: "newest" },
    { label: "ارزان‌ترین", value: "lowest_price" },
    { label: "گران‌ترین", value: "highest_price" },
    { label: "پرفروش‌ترین", value: "best_selling" },
  ];

const SortingAndPagination = React.memo(({ sortValue, onSortChange, page, onPageChange, totalPages }) => {
    return (
      <>
        <Paper py="md">
          <Flex w="100%" gap="lg" align="center">
            <Flex align="center" gap="xs" c="gray.7">
              <IconSortDescending size={16} />
              <Text size="sm">مرتب سازی بر اساس:</Text>
            </Flex>
            <SegmentedControl
              visibleFrom="md"
              withItemsBorders={false}
              styles={{
                root: { padding: "10px 0" },
                control: { margin: "0 10px" },
              }}
              data={sortFilter}
              value={sortValue}
              onChange={onSortChange}
            />
            <Select
              w="150"
              hiddenFrom="md"
              data={sortFilter}
              value={sortValue}
              onChange={onSortChange}
            />
          </Flex>
        </Paper>
        <Center>
          <Pagination page={page} onChange={onPageChange} total={totalPages || 1} />
        </Center>
      </>
    );
  });

export default SortingAndPagination