import { Button, Center, Loader, LoadingOverlay, Portal } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { updateFastEditBrandMode } from "../../../../redux/fastedit/fasteditbrandmode/fastEditBrandModeUpdateActions";
import { fetchFastEditBrandModeTableData } from "../../../../redux/fastedit/fastedittabledata/fastedittablebrandmode/fastEditTableBrandModeDataActions";
import { fetchFastEditCategoryModeTableData } from "../../../../redux/fastedit/fastedittabledata/fastedittablecategorymode/fastEditTableCategoryModeDataActions";
import Cookies from "js-cookie";

const EditItemsFastOrder = (props) => {
  const {
    item,
    formData,
    mode = "brand"
  } = props;

  const { brandModeUpdate } = useSelector((state) => state.fastEditBrandMode);
  const dispatch = useDispatch();
  const [showLoader, setShowLoader] = useState(false);

  // ⭐ Refetch data when update succeeds
  useEffect(() => {
    if (brandModeUpdate && brandModeUpdate.state === "ok") {
      // console.log(`✅ Update successful, refetching ${mode} data...`);
      
      const COOKIE_NAME = mode === "brand" 
        ? "search_filters_brand_fast_edit" 
        : "search_filters_category_fast_edit";
      
      const cookieRaw = Cookies.get(COOKIE_NAME);
      
      if (cookieRaw) {
        try {
          const parsedFilters = JSON.parse(cookieRaw);
          
          if (mode === "brand") {
            const filterArray = [{
              searchType: parsedFilters.searchType || 'brand',
              uniqueIDClickedBrands: parsedFilters.uniqueIDClickedBrands || [],
              uniqueIDClickedBrandsCategories: parsedFilters.uniqueIDClickedBrandsCategories || [],
              filterBrandsCategorySubCategoryStorage: parsedFilters.filterBrandsCategorySubCategoryStorage || [],
              filters: parsedFilters.filters || {}
            }];
            dispatch(fetchFastEditBrandModeTableData(filterArray));
          } else {
            const filterArray = [{
              searchType: parsedFilters.searchType || 'category',
              uniqueIDClickedCategories: parsedFilters.uniqueIDClickedCategories || [],
              uniqueIDClickedSubCategories: parsedFilters.uniqueIDClickedSubCategories || [],
              uniqueIDClickedSubCategoriesBrands: parsedFilters.uniqueIDClickedSubCategoriesBrands || [],
              filters: parsedFilters.filters || {}
            }];
            dispatch(fetchFastEditCategoryModeTableData(filterArray));
          }
        } catch (error) {
          console.error('Error refetching data:', error);
        }
      }
      
      // ⭐ Hide loader after refetch is triggered
      setShowLoader(false);
    }
  }, [brandModeUpdate, dispatch, mode]);

  const handleEdit = () => {
    const matchingDataKey = Object.keys(formData).find(key => key === item.psid);
    const matchingData = matchingDataKey ? formData[matchingDataKey] : null;
   
    if (!matchingData) {
      console.error("❌ No matching data found for psid:", item.psid);
      return;
    }

    const sanitizedData = {
      ...matchingData,
      price: matchingData.price ? {
        regularPrice: matchingData.price.regularPrice,
        discountedPrice: matchingData.price.discountedPrice,
        discountPercent: matchingData.price.discountPercent,
        foreignCurrencyPrice: matchingData.price.foreignCurrencyPrice,
        secondaryCost: matchingData.price.secondaryCost,
        percentagePrice1: matchingData.price.percentagePrice1,
        percentagePrice2: matchingData.price.percentagePrice2,
        percentagePrice3: matchingData.price.percentagePrice3
      } : matchingData.price
    };

    setShowLoader(true);

    // console.log(`📤 Sending update for ${mode} mode:`, sanitizedData);

    dispatch(updateFastEditBrandMode({
      updateData: sanitizedData, 
      itemId: item.psid
    }));
  };

  return (
    <>
      {/* ⭐ Full-screen centered loading overlay */}
      {showLoader && (
        <Portal>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "40px 60px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <Loader size="lg" color="blue" />
              <div style={{ fontSize: "16px", fontWeight: 500, color: "#1890ff" }}>
                در حال بروزرسانی...
              </div>
            </div>
          </div>
        </Portal>
      )}

      <Button h={35} onClick={handleEdit} disabled={showLoader}>
        ادیت
      </Button>
    </>
  );
};

export default EditItemsFastOrder;