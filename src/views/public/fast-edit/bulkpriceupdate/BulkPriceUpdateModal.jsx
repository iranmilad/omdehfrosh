import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  Button,
  Stack,
  Group,
  NumberInput,
  Select,
  Badge,
  Divider,
  Alert,
  Loader,
  Flex,
} from "@mantine/core";
import { IconPercentage, IconAlertCircle, IconCheck, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import { clearBulkPriceUpdateState } from '../../../../redux/fastedit/bulkprice/bulkPriceUpdateActions'
import { notifications } from "@mantine/notifications";
import Cookies from "js-cookie";
import { bulkUpdatePrices } from '../../../../redux/fastedit/bulkprice/bulkPriceUpdateActions'



const BulkPriceUpdateModal = ({ 
  opened, 
  onClose, 
  searchType,
  productCount = 0,
  onSuccess,
  COOKIE_NAME_BRAND = "search_filters_brand_fast_edit",
  COOKIE_NAME_CATEGORY = "search_filters_category_fast_edit"
}) => {
  const dispatch = useDispatch();
  const { loading, success, error, updatedCount } = useSelector(
    (state) => state.bulkPriceUpdate || {}
  );

  const [percentage, setPercentage] = useState(5);
  const [operation, setOperation] = useState("increase"); // "increase" or "decrease"

  // Get stored filters based on search type
  const getStoredFilters = () => {
    const cookieName =
      searchType === "brand" ? COOKIE_NAME_BRAND : COOKIE_NAME_CATEGORY;
    const storedFilters = Cookies.get(cookieName);

    if (storedFilters) {
      try {
        return JSON.parse(storedFilters);
      } catch (error) {
        console.error("❌ Error parsing stored filters:", error);
        return null;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    const filters = getStoredFilters();

    if (!filters) {
      notifications.show({
        title: "خطا",
        message: "فیلتری برای بروزرسانی یافت نشد",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    // Convert to negative if decreasing
    const effectivePercentage =
      operation === "decrease" ? -Math.abs(percentage) : Math.abs(percentage);

    dispatch(
      bulkUpdatePrices({
        searchType,
        filters,
        percentage: effectivePercentage,
      })
    );
  };

  // Handle success/error notifications
  useEffect(() => {
    if (success) {
      notifications.show({
        title: "موفق",
        message: `قیمت ${updatedCount} محصول با موفقیت ${
          operation === "decrease" ? "کاهش" : "افزایش"
        } یافت`,
        color: "green",
        icon: <IconCheck size={16} />,
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
      dispatch(clearBulkPriceUpdateState());
    }
  }, [success, updatedCount, onClose, dispatch, onSuccess, operation]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: "خطا",
        message: error.message || "خطایی در بروزرسانی قیمت رخ داد",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
      dispatch(clearBulkPriceUpdateState());
    }
  }, [error, dispatch]);

  // Reset state when modal closes
  useEffect(() => {
    if (!opened) {
      setPercentage(5);
      setOperation("increase");
    }
  }, [opened]);

  const filters = getStoredFilters();
  const hasValidFilters =
    filters &&
    ((searchType === "brand" && filters.uniqueIDClickedBrands?.length > 0) ||
      (searchType === "category" &&
        filters.uniqueIDClickedCategories?.length > 0));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      removeScrollProps={{ removeScrollBar: false }}
      zIndex={1006}
      title={
        <Group gap="xs">
          <IconPercentage size={24} color="#228be6" />
          <Text fw={600} size="lg">
            بروزرسانی دسته‌جمعی قیمت
          </Text>
        </Group>
      }
      centered
      size="md"
      styles={{
        header: {
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "var(--mantine-color-body)",
          borderBottom: "1px solid #e9ecef",
          paddingBottom: "var(--mantine-spacing-md)",
          margin: 0,
          marginTop: 0,
          paddingTop: 0,
        },
        title: {
          margin: 0,
          marginTop: 0,
          paddingTop: 0,
        },
        body: {
          paddingTop: "var(--mantine-spacing-md)",
          paddingBottom: "var(--mantine-spacing-lg)",
          maxHeight: "calc(100vh - 140px)",
          overflowY: "auto",
          overflowX: "hidden",
          marginBottom: 0,
        },
        content: {
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        },
        inner: {
          padding: 0,
        },
      }}
      lockScroll={false}
      removeScrollBar={false}
    >
      <Stack gap="lg" pb="xs">
        {/* Product Count Info */}
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="blue"
          variant="light"
        >
          <Flex justify="space-between" align="center">
            <Text size="sm">تعداد محصولات انتخاب شده:</Text>
            <Badge size="lg" color="blue" variant="filled">
              {productCount} محصول
            </Badge>
          </Flex>
        </Alert>

        {/* Search Type Info */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            حالت جستجو:
          </Text>
          <Badge color={searchType === "brand" ? "violet" : "teal"}>
            {searchType === "brand" ? "برند" : "دسته‌بندی"}
          </Badge>
        </Group>

        <Divider />

        {/* Operation Type */}
        <Select
          label="نوع عملیات"
          placeholder="انتخاب کنید"
          value={operation}
          onChange={(value) => {
            setOperation(value);
          }}
          data={[
            { value: "increase", label: "افزایش قیمت" },
            { value: "decrease", label: "کاهش قیمت" },
          ]}
          leftSection={
            operation === "increase" ? (
              <IconTrendingUp size={16} color="#40c057" />
            ) : (
              <IconTrendingDown size={16} color="#fa5252" />
            )
          }
          styles={{
            input: {
              textAlign: "right",
            },
          }}
          withinPortal
          comboboxProps={{ zIndex: 10000 }}
        />

        {/* Percentage Input */}
        <NumberInput
          label="درصد تغییر قیمت"
          placeholder="درصد را وارد کنید"
          value={percentage}
          onChange={(value) => {
            setPercentage(value);
          }}
          min={1}
          max={100}
          step={1}
          suffix="%"
          styles={{
            input: {
              textAlign: "right",
              direction: "rtl",
            },
          }}
        />

        {/* Quick Select Buttons */}
        <div>
          <Text size="sm" c="dimmed" mb="xs">
            انتخاب سریع:
          </Text>
          <Group gap="xs">
            {[5, 10, 15, 20, 25, 30].map((value) => (
              <Button
                key={value}
                variant={percentage === value ? "filled" : "light"}
                size="xs"
                onClick={() => {
                  setPercentage(value);
                }}
              >
                {value}%
              </Button>
            ))}
          </Group>
        </div>

        <Divider />

        {/* Preview */}
        <Alert
          color={operation === "increase" ? "green" : "red"}
          variant="light"
          title="پیش‌نمایش تغییرات"
        >
          <Text size="sm">
            قیمت محصولات {operation === "increase" ? "افزایش" : "کاهش"} خواهد
            یافت به میزان{" "}
            <Text
              component="span"
              fw={700}
              c={operation === "increase" ? "green" : "red"}
            >
              {percentage}%
            </Text>
          </Text>
        </Alert>

        {/* Warning if no valid filters */}
        {!hasValidFilters && (
          <Alert
            color="yellow"
            variant="light"
            icon={<IconAlertCircle size={16} />}
          >
            <Text size="sm">
              لطفاً ابتدا برند یا دسته‌بندی مورد نظر را انتخاب کنید
            </Text>
          </Alert>
        )}

        {/* Debug Info (Remove in production) */}
        {/* <Alert color="gray" variant="light" title="Debug Info">
          <Stack gap="xs">
            <Text size="xs">Operation: {operation}</Text>
            <Text size="xs">Percentage: {percentage}</Text>
            <Text size="xs">Has Valid Filters: {hasValidFilters ? "Yes" : "No"}</Text>
            <Text size="xs">Loading: {loading ? "Yes" : "No"}</Text>
          </Stack>
        </Alert> */}

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button
            variant="light"
            color="gray"
            onClick={() => {
              onClose();
            }}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            color={operation === "increase" ? "green" : "red"}
            onClick={() => {
              handleSubmit();
            }}
            loading={loading}
            disabled={!hasValidFilters || loading}
            leftSection={
              loading ? (
                <Loader size={16} color="white" />
              ) : (
                <IconPercentage size={16} />
              )
            }
          >
            {loading ? "در حال بروزرسانی..." : "اعمال تغییرات"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default BulkPriceUpdateModal;