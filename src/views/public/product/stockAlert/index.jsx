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
  em,
  Notification
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

const alertTypes = [
  { label: "رسیدن به قیمت خاص", value: "price_reach" },
  { label: "موجود شدن کالای فروشنده", value: "stock_available" },
  { label: "موجودی", value: "inventory" },
  { label: "بهترین قیمت کالا", value: "best_price" },
  { label: "انتخاب نشده", value: "not_selected"}

];

const alertTypeTranslations = {
  stock_available: "موجود شدن کالای فروشنده",
  price_reach: "رسیدن به قیمت خاص",
  inventory: "موجودی",
  best_price: "بهترین قیمت کالا"
};


const supplierSelectionOptions = [
  { label: "تمامی تامین کننده ها", value: "all" },
  { label: "انتخاب تامین کننده ها", value: "select" }
];

function StockAlert(props) {
  const { combinations, product, slug } = useProduct() || { combinations: [] };
  const mobile = useMediaQuery(`(max-width: ${em(750)})`);
  const [showPreviousSettings, setShowPreviousSettings] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const userAlertInfo = useSelector((state) => state.userAlertInfo);
  const stockAlert = useSelector((state) => state.stockAlert);

  const dispatch = useDispatch();
  
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
    initialValues: {
      alertType: "price_reach",
      price: 100000, 
      inventory: "",
      supplierSelection: "all",
      selectedSuppliers: ["all"], // Changed from "all" to ["all"]
      sms: true,
      email: false
    }
  });
  const filteredAlertTypes = alertTypes.filter(alert => alert.value !== "not_selected");


  const handleSupplierToggle = (id) => {
    form.setFieldValue("selectedSuppliers", (prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSupplierSelectionChange = (value) => {
    // Ensure value is always valid
    const validValue = value && (value === "all" || value === "select") ? value : "all";
    
    form.setFieldValue("supplierSelection", validValue);
    if (validValue === "all") {
      form.setFieldValue("selectedSuppliers", ["all"]); // Changed from "all" to ["all"]
    } else {
      form.setFieldValue("selectedSuppliers", uniqueSuppliers.map(supplier => supplier.id)); // Default all suppliers selected
    }
  };
  

  const submitStockAlertSettings = async ({ value }) => {
    if (!slug) {
      return;
    }
    
    // Ensure supplierSelection is always a valid enum value
    const validSupplierSelection = form.values.supplierSelection || "all";
    
    const alertData = {
      alertType: form.values.alertType || "not_selected",
      price: form.values.price,
      product_id: slug,
      inventory: form.values.inventory,
      supplierSelection: validSupplierSelection, // Always "all" or "select"
      selectedSuppliers: validSupplierSelection === "all" ? [] : form.values.selectedSuppliers,
      sms: form.values.sms,
      email: form.values.email,
    };

    try {
      const response = await dispatch(setUserStockAlertInfo(alertData)).unwrap();
      
      if (response && response.data) {
        const alertResponseData = response.data;
        
        // Dispatch the user alert info to the Redux store
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
        
        // Show success modal
        setSuccessMessage("تنظیمات با موفقیت ثبت شد");
        setShowSuccessModal(true);
      } else {
      }
    } catch (error) {
    }
  };

  const handleRemoveStockAlert = async () => {
    if (!slug) {
      return;
    }

    try {
      const response = await dispatch(removeUserStockAlertInfo(slug)).unwrap();
      
      // Based on your backend response structure, the data is in response.userStockAlert
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
        
        // Also update the form with the default values
        form.setValues({
          alertType: response.userStockAlert.alertType,
          price: response.userStockAlert.price || 100000,
          inventory: response.userStockAlert.inventory,
          supplierSelection: response.userStockAlert.supplierSelection,
          selectedSuppliers: response.userStockAlert.selectedSuppliers,
          sms: response.userStockAlert.sms,
          email: response.userStockAlert.email,
        });
        
        // Show success modal
        setSuccessMessage("اطلاع رسانی با موفقیت حذف شد");
        setShowSuccessModal(true);
        
      } else {
      }
    } catch (error) {
    }
  };
  

  // Function to handle the button click
  const handleShowPreviousSettings = async () => {
    if (!slug) {
      return;
    }

    // Open the modal first, then fetch data
    setShowPreviousSettings(true);
  
    try {
      const response = await dispatch(getUserStockAlertInfo(slug)).unwrap();
      
      if (response && response.data) {
        const alertData = response.data;
        
        // Dispatch the user alert info to the Redux store
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

        // Also update the form with the values from Redux state  
        form.setValues({
          alertType: alertData.alertType || "not_selected",
          price: alertData.price || 100000,
          inventory: alertData.inventory || "",
          supplierSelection: alertData.supplierSelection || "all", // Ensure valid value
          selectedSuppliers: alertData.selectedSuppliers || ["all"],
          sms: alertData.sms || false,
          email: alertData.email || false,
        });
      } else {
      }
    } catch (error) {
    }
  };
  
  const readAlertDataForFirst = async () => {
    if (!slug) {
      return;
    }
      
    try {
      const response = await dispatch(getUserStockAlertInfo(slug)).unwrap();
      
      if (response && response.data) {
        const alertData = response.data;
        
        // Dispatch the user alert info to the Redux store
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
 
      } else {
      }
    } catch (error) {
    }
  }

useEffect(() => {
  if (props.opened && slug) {
    readAlertDataForFirst();
  }
}, [props.opened, slug]); 



  // Don't render if slug is not available
  if (!slug) {
    return null;
  }

  return (
    <>
      <Modal
        size="lg"
        fullScreen={mobile}
        title="اطلاع رسانی قیمت و موجودی"
        onClose={props.close}
        opened={props.opened}
      >
        <Title>چطور به شما اطلاع دهیم؟</Title>
        <Stack mt="md">
          <Checkbox
            label={`ارسال پیامک به ${"09374039436"}`}
            checked={form.values.sms}
            onChange={() => form.setFieldValue("sms", !form.values.sms)}
          />
          <Checkbox
            label={`ارسال ایمیل به ${"coding.farhad@gmail.com"}`}
            checked={form.values.email}
            onChange={() => form.setFieldValue("email", !form.values.email)}
          />
        </Stack>

        <Title mt="xl">نحوه گزارش</Title>
        <Select
          mt="xs"
          data={filteredAlertTypes}
          w="max-content"
          mb="lg"
          {...form.getInputProps("alertType")}
        />

        {form.values.alertType === "price_reach" && (
          <Flex>
            <NumberInput
              label="قیمت مد نظر شما(تومان)"
              value={form.values.price}
              onChange={(value) => form.setFieldValue("price", value)}
              thousandSeparator
              min={0}
              w="100%"
              mb="lg"
            />
          </Flex>
        )}

        {form.values.alertType && (
          <>
            <Title mt="xl">انتخاب تامین کننده</Title>
            <Select
              mt="xs"
              data={supplierSelectionOptions}
              value={form.values.supplierSelection}
              onChange={handleSupplierSelectionChange}
              w="max-content"
              mb="lg"
            />

            {form.values.supplierSelection === "select" && uniqueSuppliers.length > 0 && (
              <Stack>
                {uniqueSuppliers.map((supplier) => (
                  <Checkbox
                    key={supplier.id}
                    label={`(ID: ${supplier.id}) ${supplier.name}`} // Display name and ID
                    checked={
                      Array.isArray(form.values.selectedSuppliers) && 
                      (form.values.selectedSuppliers.includes("all") || form.values.selectedSuppliers.includes(supplier.id))
                    }
                    onChange={() => handleSupplierToggle(supplier.id)}
                  />
                ))}
              </Stack>
            )}


          </>
        )}

        <Divider my="lg" />

        <Flex gap="sm">
        <Button 
          onClick={submitStockAlertSettings} 
          disabled={!form.values.sms && !form.values.email} // Disable button if neither is selected
          loading={stockAlert.setLoading}
        >
          ذخیره
        </Button>
          <Button 
            variant="light" 
            color="red" 
            onClick={handleRemoveStockAlert}
            loading={stockAlert.removeLoading}
          >
            حذف اطلاع رسانی
          </Button>
          <Button 
            onClick={handleShowPreviousSettings}
            loading={stockAlert.getLoading}
          >
            تنظیمات قبلی
          </Button>
        </Flex>
      </Modal>

      {/* Previous Settings Notification Box */}
      <Modal
        opened={showPreviousSettings}
        onClose={() => setShowPreviousSettings(false)}
        title="تنظیمات قبلی"
        centered
        size="md"
        styles={{ modal: { backgroundColor: "white", padding: "20px" } }}
      >
        <Stack>
          <Title order={4}>تنظیمات ذخیره‌شده</Title>
          <Divider />
          <p><strong>نوع هشدار:</strong> {alertTypeTranslations[userAlertInfo.alertType] || "مشخص نشده"}</p>
          {userAlertInfo.alertType === "price_reach" && (
            <p><strong>قیمت مد نظر:</strong> {userAlertInfo.price} تومان</p>
          )}
          <p><strong>روش اطلاع‌رسانی:</strong> {userAlertInfo.sms ? "پیامک" : ""} {userAlertInfo.email ? "ایمیل" : ""}</p>
          <p>
            <strong>تامین‌کننده‌ها:</strong>{" "}
            {userAlertInfo.supplierSelection === "all"
              ? "تمامی تامین‌کننده‌ها"
              : Array.isArray(userAlertInfo.selectedSuppliers) && userAlertInfo.selectedSuppliers.length > 0
              ? userAlertInfo.selectedSuppliers.join(", ")
              : "هیچ تامین‌کننده‌ای انتخاب نشده"}
          </p>
          <Divider />
          <Button onClick={() => setShowPreviousSettings(false)}>بستن</Button>
        </Stack>
      </Modal>

      {/* Success Modal */}
      <Modal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="پیام موفقیت"
        centered
        size="sm"
        styles={{ 
          modal: { 
            backgroundColor: "white", 
            padding: "20px",
            borderRadius: "10px"
          } 
        }}
      >
        <Stack align="center" spacing="md">
          <div style={{ 
            fontSize: "48px", 
            color: "#28a745",
            marginBottom: "10px"
          }}>
            ✅
          </div>
          <Title order={4} ta="center" c="green">
            {successMessage}
          </Title>
          <Button 
            onClick={() => setShowSuccessModal(false)}
            variant="filled"
            color="green"
            size="sm"
          >
            تایید
          </Button>
        </Stack>
      </Modal>



    </>
  );
}

export default StockAlert;