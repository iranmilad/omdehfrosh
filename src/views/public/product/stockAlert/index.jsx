import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Modal,
  NumberInput,
  Select,
  Stack,
  Title,
  Text,
  em,
  Notification,
  Box
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import React, { useEffect, useMemo, useState } from "react";
import { useProduct } from "..";
import { useDispatch, useSelector } from "react-redux";
import { setAlertInfo } from "../../../../redux/useralertinfo";
import { fetchFinalReceipt } from "../../../../redux/cartfinalreceipt/cartfinalreceipt";
import { 
  getUserStockAlertInfo, 
  setUserStockAlertInfo, 
  removeUserStockAlertInfo 
} from "../../../../redux/users/userstockaler/userStockAlertInfoActions";
import { verifyToken } from "../../../../redux/auth/authusers/auth";

const alertTypes = [
  { label: "رسیدن به قیمت خاص", value: "price_reach" },
  { label: "موجود شدن کالای فروشنده", value: "inventory_reach" },
  // { label: "موجودی", value: "inventory" },
  // { label: "بهترین قیمت کالا", value: "best_price" },
  { label: "انتخاب نشده", value: "not_selected"}
];

const alertTypeTranslations = {
  inventory_reach: "موجود شدن کالای فروشنده",
  price_reach: "رسیدن به قیمت خاص",
  // inventory: "موجودی",
  // best_price: "بهترین قیمت کالا"
};

const supplierSelectionOptions = [
  { label: "تمامی تامین کننده ها", value: "all" },
  { label: "انتخاب تامین کننده ها", value: "select" }
];

// Default form values
const getDefaultValues = () => ({
  alertType: "price_reach",
  price: 100000, 
  inventory: 1,
  supplierSelection: "all",
  selectedSuppliers: [],
  sms: true,
  email: false
});

function StockAlert(props) {
  const { combinations, product, slug } = useProduct() || { combinations: [] };
  const mobile = useMediaQuery(`(max-width: ${em(750)})`);
  const tablet = useMediaQuery(`(max-width: ${em(1024)})`);
  const [showPreviousSettings, setShowPreviousSettings] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  
  const userAlertInfo = useSelector((state) => state.userAlertInfo);
  const stockAlert = useSelector((state) => state.stockAlert);

  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  // Extract unique suppliers
  const uniqueSuppliers = useMemo(() => {
    if (!combinations || combinations.length === 0) return [];

    const supplierMap = new Map();
    combinations.forEach((item) => {
      item.suppliers.forEach((supplier) => {
        if (!supplierMap.has(supplier.id)) {
          supplierMap.set(supplier.id, supplier);
        }
      });
    });
    return Array.from(supplierMap.values());
  }, [combinations]);

  const form = useForm({
    initialValues: getDefaultValues()
  });
  
  const filteredAlertTypes = alertTypes.filter(alert => alert.value !== "not_selected");

  // Helper function to get current form state for API calls
  const getCurrentFormState = () => ({
    alertType: form.values.alertType || "price_reach",
    price: form.values.price || 100000,
    inventory: form.values.inventory || 1,
    supplierSelection: form.values.supplierSelection || "all",
    selectedSuppliers: form.values.selectedSuppliers || [],
    sms: form.values.sms ?? true,
    email: form.values.email ?? false,
  });

  // Function to reset form fields except email and sms
  const resetFormFieldsExceptNotifications = (preserveSms, preserveEmail) => {
    const defaultValues = getDefaultValues();
    form.setValues({
      ...defaultValues,
      sms: preserveSms,
      email: preserveEmail
    });
  };

  // Handle SMS checkbox change
  const handleSmsChange = (event) => {
    const isChecked = event.currentTarget.checked;
    const currentEmail = form.values.email;
    
    // Reset all fields to default except notifications
    resetFormFieldsExceptNotifications(isChecked, currentEmail);
  };

  // Handle Email checkbox change
  const handleEmailChange = (event) => {
    const isChecked = event.currentTarget.checked;
    const currentSms = form.values.sms;
    
    // Reset all fields to default except notifications
    resetFormFieldsExceptNotifications(currentSms, isChecked);
  };

  const handleSupplierToggle = (id) => {
    const currentState = getCurrentFormState();
    const newSelectedSuppliers = currentState.selectedSuppliers.includes(id) 
      ? currentState.selectedSuppliers.filter((sId) => sId !== id) 
      : [...currentState.selectedSuppliers, id];
    
    form.setFieldValue("selectedSuppliers", newSelectedSuppliers);
  };

  const handleSupplierSelectionChange = (value) => {
    const validValue = value && (value === "all" || value === "select") ? value : "all";
    const currentState = getCurrentFormState();
    
    form.setFieldValue("supplierSelection", validValue);
    if (validValue === "all") {
      // When "all" is selected, selectedSuppliers should be empty array
      form.setFieldValue("selectedSuppliers", []);
    } else {
      // When "select" is chosen, populate with all supplier IDs
      form.setFieldValue("selectedSuppliers", uniqueSuppliers.map(supplier => supplier.id));
    }
  };

  const submitStockAlertSettings = async ({ value }) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!slug) return;
    
    // Get current form state to ensure all values are preserved
    const currentState = getCurrentFormState();
    const validSupplierSelection = currentState.supplierSelection || "all";
    
    // Transform "select" to "selected" before sending to server
    const transformedSupplierSelection = validSupplierSelection === "select" ? "selected" : validSupplierSelection;
    
    const alertData = {
      alertType: currentState.alertType,
      price: currentState.price,
      product_id: slug,
      inventory: currentState.inventory,
      supplierSelection: transformedSupplierSelection,
      selectedSuppliers: validSupplierSelection === "all" ? [] : currentState.selectedSuppliers,
      sms: currentState.sms,
      email: currentState.email,
    };

    try {
      const response = await dispatch(setUserStockAlertInfo(alertData)).unwrap();
      
      
      if (response && response.data) {
        const alertResponseData = response.data;
        
        dispatch(setAlertInfo({
          alertType: alertResponseData.alertType,
          price: alertResponseData.price,
          inventory: alertResponseData.inventory,
          supplierSelection: alertResponseData.supplierSelection,
          selectedSuppliers: alertResponseData.selectedSuppliers,
          sms: alertResponseData.sms,
          email: alertResponseData.email,
          product_id: slug,
        }));
        
        setSuccessMessage("تنظیمات با موفقیت ثبت شد");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error saving alert:", error);
      console.error("Data sent:", alertData); // Debug what was sent
    }
  };

  const handleRemoveStockAlert = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!slug) return;

    try {
      const response = await dispatch(removeUserStockAlertInfo(slug)).unwrap();
      
      if (response && response.userStockAlert) {
        dispatch(setAlertInfo({
          alertType: response.userStockAlert.alertType,
          price: response.userStockAlert.price,
          inventory: response.userStockAlert.inventory,
          supplierSelection: response.userStockAlert.supplierSelection,
          selectedSuppliers: response.userStockAlert.selectedSuppliers,
          sms: response.userStockAlert.sms,
          email: response.userStockAlert.email,
          product_id: slug,
        }));
        
        // Reset to default values after removal
        form.setValues(getDefaultValues());
        
        setSuccessMessage("اطلاع رسانی با موفقیت حذف شد");
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error removing alert:", error);
    }
  };

  const handleShowPreviousSettings = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!slug) return;

    try {
      const response = await dispatch(getUserStockAlertInfo(slug)).unwrap();

      
      if (response && response.data) {
        const alertData = response.data;
        
        // Update Redux state
        dispatch(setAlertInfo({
          alertType: alertData.alertType,
          price: alertData.price,
          inventory: alertData.inventory,
          supplierSelection: alertData.supplierSelection,
          selectedSuppliers: alertData.selectedSuppliers,
          sms: alertData.sms,
          email: alertData.email,
          product_id: slug,
        }));

        // Update form values - ensure we handle all cases properly
        const formValues = {
          alertType: alertData.alertType || "price_reach",
          price: alertData.price || 100000,
          inventory: alertData.inventory || 1,
          supplierSelection: alertData.supplierSelection || "all",
          selectedSuppliers: Array.isArray(alertData.selectedSuppliers) ? alertData.selectedSuppliers : [],
          sms: alertData.sms ?? true,
          email: alertData.email ?? false,
        };
        
        form.setValues(formValues);
        
        // Show the modal after data is loaded
        setShowPreviousSettings(true);
      } else {
        // No existing alert data - show default values
        setShowPreviousSettings(true);
      }
    } catch (error) {
      console.error("Error fetching previous settings:", error);
      // Still show the modal even if there's an error
      setShowPreviousSettings(true);
    }
  };
  
  const readAlertDataForFirst = async () => {
    if (!slug || !user || isInitialized) return;
      
    try {
      const response = await dispatch(getUserStockAlertInfo(slug)).unwrap();
      
      if (response && response.data) {
        const alertData = response.data;
        
        // Update Redux state
        dispatch(setAlertInfo({
          alertType: alertData.alertType,
          price: alertData.price,
          inventory: alertData.inventory,
          supplierSelection: alertData.supplierSelection,
          selectedSuppliers: alertData.selectedSuppliers,
          sms: alertData.sms,
          email: alertData.email,
          product_id: slug,
        }));

        // Update form with existing data
        const formValues = {
          alertType: alertData.alertType || "price_reach",
          price: alertData.price || 100000,
          inventory: alertData.inventory || 1,
          supplierSelection: alertData.supplierSelection || "all",
          selectedSuppliers: Array.isArray(alertData.selectedSuppliers) ? alertData.selectedSuppliers : [],
          sms: alertData.sms ?? true,
          email: alertData.email ?? false,
        };
        
        form.setValues(formValues);
      } else {
        // No existing data, set default values
        form.setValues(getDefaultValues());
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error("Error reading initial alert data:", error);
      // Set default values on error
      form.setValues(getDefaultValues());
      setIsInitialized(true);
    }
  }

  useEffect(() => {
    if (props.opened && slug && user) {
      readAlertDataForFirst();
    } else if (props.opened && !user) {
      // Set default values when modal opens for non-authenticated users
      form.setValues(getDefaultValues());
      setIsInitialized(true);
    }
  }, [props.opened, slug, user]); 

  // Reset initialization when modal closes
  useEffect(() => {
    if (!props.opened) {
      setIsInitialized(false);
      // Reset form to defaults when modal closes
      form.setValues(getDefaultValues());
    }
  }, [props.opened]);

  if (!slug) return null;

  return (
    <>
      <Modal
        size={mobile ? "100%" : tablet ? "lg" : "md"}
        fullScreen={mobile}
        title={
          <Text size={mobile ? "lg" : "xl"} fw={600}>
            اطلاع رسانی قیمت و موجودی
          </Text>
        }
        onClose={props.close}
        opened={props.opened}
        zIndex={1010}
        centered={!mobile}
        padding={mobile ? "md" : tablet ? "lg" : "xl"}
        styles={{
          body: {
            maxHeight: mobile ? "calc(100vh - 60px)" : tablet ? "70vh" : "65vh",
            overflowY: "auto",
            padding: mobile ? "12px" : tablet ? "16px" : "20px",
          },
          header: {
            padding: mobile ? "12px" : tablet ? "16px" : "20px",
          },
          content: {
            maxWidth: "100%",
          }
        }}
      >
        <Stack spacing={mobile ? "md" : "sm"}>
          {/* Notification Methods */}
          <Box>
            <Title order={mobile ? 6 : 5} mb="xs">چطور به شما اطلاع دهیم؟</Title>
            <Stack spacing="xs">
              <Checkbox
                size={mobile ? "md" : "sm"}
                label={`پیامک به ${"09374039436"}`}
                checked={form.values.sms ?? true}
                onChange={handleSmsChange}
                disabled={!user}
                styles={{
                  label: { fontSize: mobile ? "14px" : "13px" }
                }}
              />
              <Checkbox
                size={mobile ? "md" : "sm"}
                label={`ایمیل به ${"coding.farhad@gmail.com"}`}
                checked={form.values.email ?? false}
                onChange={handleEmailChange}
                disabled={!user}
                styles={{
                  label: { fontSize: mobile ? "14px" : "13px" }
                }}
              />
            </Stack>
          </Box>

          <Divider size="xs" />

          {/* Alert Type */}
          <Box>
            <Title order={mobile ? 6 : 5} mb="xs">نحوه گزارش</Title>
            <Select
              size={mobile ? "md" : "sm"}
              data={filteredAlertTypes}
              w={mobile ? "100%" : tablet ? "250px" : "200px"}
              disabled={!user}
              {...form.getInputProps("alertType")}
            />
          </Box>

          {/* Price Input */}
          {form.values.alertType === "price_reach" && (
            <NumberInput
              size={mobile ? "md" : "sm"}
              label="قیمت مد نظر (تومان)"
              value={form.values.price}
              onChange={(value) => form.setFieldValue("price", value || 100000)}
              thousandSeparator
              min={0}
              w={mobile ? "100%" : tablet ? "250px" : "200px"}
              disabled={!user}
            />
          )}

          {/* Inventory Input */}
          {form.values.alertType === "inventory_reach" && (
            <NumberInput
              size={mobile ? "md" : "sm"}
              label="تعداد موجودی مد نظر"
              value={form.values.inventory}
              onChange={(value) => form.setFieldValue("inventory", value || 1)}
              min={1}
              w={mobile ? "100%" : tablet ? "250px" : "200px"}
              disabled={!user}
            />
          )}

          {/* Supplier Selection */}
          {form.values.alertType && (
            <>
              <Divider size="xs" />
              <Box>
                <Title order={mobile ? 6 : 5} mb="xs">انتخاب تامین کننده</Title>
                <Select
                  size={mobile ? "md" : "sm"}
                  data={supplierSelectionOptions}
                  value={form.values.supplierSelection || "all"}
                  onChange={handleSupplierSelectionChange}
                  w={mobile ? "100%" : tablet ? "250px" : "200px"}
                  mb="xs"
                  disabled={!user}
                />

                {form.values.supplierSelection === "select" && uniqueSuppliers.length > 0 && (
                  <Stack spacing="xs">
                    {uniqueSuppliers.map((supplier) => (
                      <Checkbox
                        key={supplier.id}
                        size={mobile ? "md" : "sm"}
                        label={
                          <Text size={mobile ? "sm" : "xs"}>
                            {supplier.name} <Text component="span" size="xs" c="dimmed">(ID: {supplier.id})</Text>
                          </Text>
                        }
                        checked={
                          Array.isArray(form.values.selectedSuppliers) && 
                          form.values.selectedSuppliers.includes(supplier.id)
                        }
                        onChange={() => handleSupplierToggle(supplier.id)}
                        disabled={!user}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            </>
          )}

          <Divider />

          {/* Action Buttons */}
          <Flex 
            gap="xs" 
            wrap="wrap"
            direction={mobile ? "column" : "row"}
          >
            <Button 
              size={mobile ? "md" : "sm"}
              fullWidth={mobile}
              onClick={submitStockAlertSettings} 
              disabled={
                !user || 
                (!form.values.sms && !form.values.email) ||
                !form.values.alertType ||
                form.values.alertType === "not_selected" ||
                form.values.alertType === "" ||
                (form.values.alertType === "price_reach" && (!form.values.price || form.values.price === "")) ||
                (form.values.alertType === "inventory_reach" && (!form.values.inventory || form.values.inventory === ""))
              }
              loading={stockAlert.setLoading}
            >
              ذخیره
            </Button>
            <Button 
              size={mobile ? "md" : "sm"}
              fullWidth={mobile}
              variant="light" 
              color="red" 
              onClick={handleRemoveStockAlert}
              loading={stockAlert.removeLoading}
              disabled={!user}
            >
              حذف
            </Button>
            <Button 
              size={mobile ? "md" : "sm"}
              fullWidth={mobile}
              variant="outline"
              onClick={handleShowPreviousSettings}
              loading={stockAlert.getLoading}
              disabled={!user}
            >
              تنظیمات قبلی
            </Button>
          </Flex>

          {/* Authentication Warning */}
          {!user && (
            <Text size={mobile ? "sm" : "xs"} c="orange" ta="center" mt="xs">
              برای استفاده از اطلاع‌رسانی ابتدا وارد حساب کاربری خود شوید
            </Text>
          )}
        </Stack>
      </Modal>

      {/* Previous Settings Modal - Compact */}
      <Modal
        opened={showPreviousSettings}
        onClose={() => setShowPreviousSettings(false)}
        title={
          <Text size={mobile ? "md" : "lg"} fw={600}>
            تنظیمات قبلی
          </Text>
        }
        centered
        size={mobile ? "100%" : "sm"}
        fullScreen={mobile}
        zIndex={1010}
        padding={mobile ? "md" : "lg"}
        styles={{
          body: {
            padding: mobile ? "12px" : "16px",
          },
          header: {
            padding: mobile ? "12px" : "16px",
          }
        }}
      >
        <Stack spacing={mobile ? "md" : "xs"}>
          <Text size={mobile ? "sm" : "xs"}>
            <strong>نوع هشدار:</strong> {alertTypeTranslations[userAlertInfo.alertType] || "مشخص نشده"}
          </Text>
          {userAlertInfo.alertType === "price_reach" && (
            <Text size={mobile ? "sm" : "xs"}>
              <strong>قیمت مد نظر:</strong> {userAlertInfo.price?.toLocaleString()} تومان
            </Text>
          )}
          {userAlertInfo.alertType === "inventory_reach" && (
            <Text size={mobile ? "sm" : "xs"}>
              <strong>تعداد موجودی مد نظر:</strong> {userAlertInfo.inventory}
            </Text>
          )}
          <Text size={mobile ? "sm" : "xs"}>
            <strong>روش اطلاع‌رسانی:</strong>{" "}
            {userAlertInfo.sms && userAlertInfo.email ? "پیامک و ایمیل" : 
             userAlertInfo.sms ? "پیامک" : 
             userAlertInfo.email ? "ایمیل" : "انتخاب نشده"}
          </Text>
          <Text size={mobile ? "sm" : "xs"}>
            <strong>تامین‌کننده‌ها:</strong>{" "}
            {userAlertInfo.supplierSelection === "all"
              ? "تمامی تامین‌کننده‌ها"
              : Array.isArray(userAlertInfo.selectedSuppliers) && userAlertInfo.selectedSuppliers.length > 0
              ? userAlertInfo.selectedSuppliers.join(", ")
              : "هیچ تامین‌کننده‌ای انتخاب نشده"}
          </Text>
          <Button 
            size={mobile ? "md" : "sm"} 
            fullWidth={mobile}
            onClick={() => setShowPreviousSettings(false)}
          >
            بستن
          </Button>
        </Stack>
      </Modal>

      {/* Login Required Modal */}
      <Modal
        opened={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={
          <Text size={mobile ? "md" : "lg"} fw={600}>
            ورود به سایت
          </Text>
        }
        centered
        size="xs"
        zIndex={1010}
        padding={mobile ? "md" : "lg"}
        styles={{
          body: {
            padding: mobile ? "16px" : "20px",
          },
          header: {
            padding: mobile ? "12px" : "16px",
          }
        }}
      >
        <Stack align="center" spacing={mobile ? "md" : "sm"}>
          <Text size={mobile ? "3xl" : "xl"} c="blue">🔐</Text>
          <Text size={mobile ? "md" : "sm"} ta="center" fw={500}>
            ابتدا وارد سایت شوید
          </Text>
          <Button 
            size={mobile ? "md" : "sm"}
            fullWidth={mobile}
            onClick={() => setShowLoginModal(false)}
            variant="filled"
            color="blue"
          >
            تایید
          </Button>
        </Stack>
      </Modal>

      {/* Success Modal - Compact */}
      <Modal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={
          <Text size={mobile ? "md" : "lg"} fw={600}>
            پیام موفقیت
          </Text>
        }
        centered
        size="xs"
        zIndex={1010}
        padding={mobile ? "md" : "lg"}
        styles={{
          body: {
            padding: mobile ? "16px" : "20px",
          },
          header: {
            padding: mobile ? "12px" : "16px",
          }
        }}
      >
        <Stack align="center" spacing={mobile ? "md" : "sm"}>
          <Text size={mobile ? "3xl" : "xl"} c="green">✅</Text>
          <Text size={mobile ? "md" : "sm"} ta="center" c="green" fw={500}>
            {successMessage}
          </Text>
          <Button 
            size={mobile ? "md" : "sm"}
            fullWidth={mobile}
            onClick={() => setShowSuccessModal(false)}
            variant="filled"
            color="green"
          >
            تایید
          </Button>
        </Stack>
      </Modal>
    </>
  );
}

export default StockAlert;