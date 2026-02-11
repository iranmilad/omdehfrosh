import { Button, Center, Loader, LoadingOverlay, Portal } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { updateFastEditBrandMode } from "../../../../redux/fastedit/fasteditbrandmode/fastEditBrandModeUpdateActions";
import { clearFastEditBrandModeState } from "../../../../redux/fastedit/fasteditbrandmode/fastEditBrandModeUpdateSlice";
import Cookies from "js-cookie";

const EditItemsFastOrder = (props) => {
  const {
    item,
    formData,
    mode = "brand",
    setNodes  // Add this to update local state
  } = props;

  const { brandModeUpdate } = useSelector((state) => state.fastEditBrandMode);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [showLoader, setShowLoader] = useState(false);
  const [previousData, setPreviousData] = useState(null);

  // ⭐ Handle update success/error – only the row that clicked (showLoader) invalidates once; clear Redux to avoid repeat refetches
  useEffect(() => {
    if (brandModeUpdate && brandModeUpdate.state === "ok") {
      // ✅ Success: invalidate only from the row that initiated the update (showLoader was true) so we get a single refetch
      if (showLoader) {
        queryClient.invalidateQueries({ queryKey: ["fast-edit-brand-mode"] });
        queryClient.invalidateQueries({ queryKey: ["fast-edit-category-mode"] });
      }
      setShowLoader(false);
      setPreviousData(null);
      dispatch(clearFastEditBrandModeState()); // clear so effect doesn’t re-run after refetch and cause extra API calls
    } else if (brandModeUpdate && brandModeUpdate.state === "error") {

      if (previousData && setNodes) {
        // Revert the local state to previous values
        setNodes(prevNodes => {
          return prevNodes.map(group => ({
            ...group,
            items: group.items.map(currentItem => {
              if (currentItem.psid === item.psid) {
                return previousData; // Restore previous data
              }
              return currentItem;
            })
          }));
        });
      }

      setShowLoader(false);
      setPreviousData(null); // Clear backup
    }
  }, [brandModeUpdate, item.psid, previousData, setNodes, queryClient, dispatch, showLoader]);

  const handleEdit = () => {
    const matchingDataKey = Object.keys(formData).find(key => key === item.psid);
    const matchingData = matchingDataKey ? formData[matchingDataKey] : null;

    if (!matchingData) {
      console.error("❌ No matching data found for psid:", item.psid);
      return;
    }

    // ⭐ Save current item data as backup before updating
    setPreviousData({...item});

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
        تغییر
      </Button>
    </>
  );
};

export default EditItemsFastOrder;