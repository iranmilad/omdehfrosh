import { ActionIcon, Flex, Tooltip, Modal, Text, Button, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHeart, IconHeartOff, IconShare, IconTimeline } from "@tabler/icons-react";
import React, { useState } from "react";
import CompareBtn from "../../../../components/compareBtn";
import ShareModal from "../../../../components/shareModal";
import PriceChart from "../priceChart";
import { verifyToken } from '../../../../redux/auth/authusers/auth'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import DelayedFullScreenLoader from "../../../../components/centerloading";
import { removeFromFavorites } from "../../../../redux/users/removeFromFavorites/removeFromFavoritesActions";
import { addToFavorites } from "../../../../redux/users/addtofavorites/addToFavoritesActions";
import ErrorMessageModal from "../../../../components/errormessagemodal";
import { handleKnownErrors } from "../../../../Libs/errorstatushandle/httpErrorStatus";
import { notifications } from "@mantine/notifications";
import { clearRemoveFavoriteStatus } from "../../../../redux/users/removeFromFavorites/removeFromFavoritesSlice";
import { clearAddFavoriteStatus } from "../../../../redux/users/addtofavorites/addToFavoritesSlice";
import { useNavigate } from "react-router";
import { MdCompare } from "react-icons/md";
import { useFavorites } from '../../../../Libs/hooks/useFavourites'

function IconBar({ favorite, data }) {

  console.log(data)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shareModal = useDisclosure(false);
  const priceChart = useDisclosure(false);
  const [loginModal, loginModalHandlers] = useDisclosure(false);

  const [modalOpen, setModalOpen] = useState(false);

  const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);

  // Use the favorites utility hook
  const { 
    isFavorite: checkIsFavorite, 
    addToFavoritesCache, 
    removeFromFavoritesCache 
  } = useFavorites();

  const { 
    addToFavoritesData, 
    loadingAddToFavorites, 
    errorAddToFavorites, 
  } = useSelector((state) => state.addToFavorites);

  const { 
    removeFromFavoritesData, 
    loadingRemoveFromFavorites, 
    errorRemoveFromFavorites, 
  } = useSelector((state) => state.removeFromFavorites);

  // Check if current product is favorite using cookies
  const isFavorite = checkIsFavorite(data.id);
  
  // Check if categoryName exists to show compare buttons
  const hasCategoryName = data?.general?.categoryName && data.general.categoryName.trim() !== '';

  // add to favorites
  useEffect(() => {
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
    const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;
  
    const hasValidStatus = errorAddToFavorites && typeof errorAddToFavorites.status !== "undefined" && !isNaN(Number(errorAddToFavorites.status));
  
    if (!isEmpty(errorAddToFavorites) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorAddToFavorites.status))) {
      notifications.show({
        title: errorAddToFavorites?.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [addToFavoritesData, errorAddToFavorites, dispatch]);
  
  useEffect(() => {
    if (errorAddToFavorites?.status) {
      handleKnownErrors(errorAddToFavorites?.status, setModalOpen, navigate);
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [errorAddToFavorites, dispatch, navigate]);
  
  useEffect(() => {
    if (addToFavoritesData && addToFavoritesData.state === "ok") {
      // API call succeeded - no need to update cache again as it was done optimistically
      notifications.show({
        title: addToFavoritesData?.message || "به علاقه‌مندی‌ها اضافه شد",
        color: "green",
        autoClose: true
      });
    }
    if (addToFavoritesData && addToFavoritesData?.state === "error") {
      // API returned error - need to rollback the optimistic update
      removeFromFavoritesCache(data.id);
      
      notifications.show({
        title: addToFavoritesData?.errors?.addToFavorites || "خطا در افزودن به علاقه‌مندی‌ها",
        color: "red",
        autoClose: true
      });
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [addToFavoritesData, data.id, removeFromFavoritesCache, dispatch]);

  // remove from favorites
  useEffect(() => {
    const nonNotifyStatuses = [
      400, 401, 403, 404, 405, 406, 408, 409,
      410, 411, 412, 413, 414, 415, 416, 417,
      422, 429
    ];
  
    const isEmpty = (obj) => !obj || Object.keys(obj).length === 0;
  
    const hasValidStatus = errorRemoveFromFavorites && typeof errorRemoveFromFavorites.status !== "undefined" && !isNaN(Number(errorRemoveFromFavorites.status));
  
    if (!isEmpty(errorRemoveFromFavorites) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorRemoveFromFavorites.status))) {
      notifications.show({
        title: errorRemoveFromFavorites?.message || "خطایی رخ داده است",
        color: "red",
        autoClose: true,
      });
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [errorRemoveFromFavorites, removeFromFavoritesData, dispatch]);

  useEffect(() => {
    if (errorRemoveFromFavorites?.status) {
      handleKnownErrors(errorRemoveFromFavorites?.status, setModalOpen, navigate);
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [errorRemoveFromFavorites, dispatch, navigate]);

  useEffect(() => {
    if (removeFromFavoritesData && removeFromFavoritesData.state === "ok") {
      // API call succeeded - no need to update cache again as it was done optimistically
      notifications.show({
        title: removeFromFavoritesData?.message || "از علاقه‌مندی‌ها حذف شد",
        color: "green",
        autoClose: true
      });
    }
    if (removeFromFavoritesData && removeFromFavoritesData?.state === "error") {
      // API returned error - need to rollback the optimistic update
      addToFavoritesCache(data.id);
      
      notifications.show({
        title: removeFromFavoritesData?.errors?.removeFromFavorites || "خطا در حذف از علاقه‌مندی‌ها",
        color: "red",
        autoClose: true
      });
    }

    dispatch(clearAddFavoriteStatus())
    dispatch(clearRemoveFavoriteStatus())
  }, [removeFromFavoritesData, data.id, addToFavoritesCache, dispatch]);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  const removeFavorite = () => {
    // Check if user is logged in
    if (!user) {
      loginModalHandlers.open();
      return;
    }
    
    
    // Optimistically update cache first (for better UX)
    removeFromFavoritesCache(data.id);
    
    // Then make API call
    dispatch(removeFromFavorites(data.id));
    dispatch(clearRemoveFavoriteStatus());
    dispatch(clearAddFavoriteStatus());
  }

  const addFavorite = () => {
    // Check if user is logged in
    if (!user) {
      loginModalHandlers.open();
      return;
    }
    
    
    // Optimistically update cache first (for better UX)
    addToFavoritesCache(data.id);
    
    // Then make API call
    dispatch(addToFavorites(data.id));
    dispatch(clearAddFavoriteStatus());
    dispatch(clearRemoveFavoriteStatus());
  }

  const handleNavigate = () => {
    navigate(`/compare/${data.general.categoryName}`);
  };

  const handleLoginRedirect = () => {
    loginModalHandlers.close();
    navigate('/login'); // Adjust this path to your login route
  };

  if (loadingAddToFavorites || loadingRemoveFromFavorites) {
    return (
      <DelayedFullScreenLoader showR={true} />
    );
  }

  return (
    <>
      <ErrorMessageModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        message={errorAddToFavorites?.message || errorRemoveFromFavorites?.message}
      />

      {/* Login Required Modal */}
      <Modal
        opened={loginModal}
        onClose={loginModalHandlers.close}
        title="ورود به حساب کاربری"
        centered
        size="sm"
      >
        <Stack spacing="lg">
          <Text align="center" size="md">
            لطفا ابتدا وارد حساب کاربری خود شوید
          </Text>
          <Button
            fullWidth
            onClick={handleLoginRedirect}
            color="blue"
          >
            ورود به حساب کاربری
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={loginModalHandlers.close}
          >
            انصراف
          </Button>
        </Stack>
      </Modal>

      <Flex
        direction={{ base: "row", lg: "column" }}
        justify={{ base: "space-between", lg: "normal" }}
        gap="lg"
      >
        {isFavorite ? (
          <Tooltip label="حذف از علاقه‌مندی" position="right">
            <ActionIcon
              size="md"
              variant="transparent"
              color="red"
              onClick={() => removeFavorite()}
              loading={loadingRemoveFromFavorites}
            >
              <IconHeart />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="افزودن به علاقه‌مندی" position="right">
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={() => addFavorite()}
              loading={loadingAddToFavorites}
            >
              <IconHeartOff />
            </ActionIcon>
          </Tooltip>
        )}

        {/* Only show compare button if categoryName exists */}
        {hasCategoryName && (
          <Tooltip
            label={"مقایسه"}
            position="right"
            zIndex={9999}
          >
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={handleNavigate}
              color={"green"}
            >
              <MdCompare size={25} />
            </ActionIcon>
          </Tooltip>
        )}

        {/* Only show CompareBtn component if categoryName exists */}
        {hasCategoryName && (
          <CompareBtn id={data.id} category={data.general.categoryName} variant="transparent" />
        )}

        <Tooltip label="اشتراک گذاری" position="right">
          <ActionIcon
            size="md"
            variant="transparent"
            onClick={shareModal[1].toggle}
          >
            <IconShare />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="نمودار قیمت" position="right">
          <ActionIcon size="md" variant="transparent" onClick={priceChart[1].open}>
            <IconTimeline />
          </ActionIcon>
        </Tooltip>
      </Flex>
      <PriceChart
        title={data.general.title}
        opened={priceChart[0]}
        close={priceChart[1].close}
        priceHistory={data.general.priceHistory}
      />
      <ShareModal
        link={`${window.location.origin}/product/${data.id}`}
        opened={shareModal[0]}
        close={shareModal[1].close}
      >
        این کالا را با دوستان خود به اشتراک بگذارید!{" "}
      </ShareModal>
    </>
  );
}

export default IconBar;