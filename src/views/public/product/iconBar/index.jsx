import { ActionIcon, Flex, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconHeart, IconHeartOff, IconShare, IconTimeline } from "@tabler/icons-react";
import React from "react";
import CompareBtn from "../../../../components/compareBtn";
import ShareModal from "../../../../components/shareModal";
import PriceChart from "../priceChart";

function IconBar({ favorite,data }) {
  const shareModal = useDisclosure(false);
  const priceChart = useDisclosure(false);
  return (
    <>
      <Flex
        direction={{ base: "row", lg: "column" }}
        justify={{ base: "space-between", lg: "normal" }}
        gap="lg"
      >
        {favorite ? (
          <Tooltip label="حذف از علاقه‌مندی" position="right">
            <ActionIcon
              size="md"
              variant="transparent"
              color="red"
              onClick={() => removeFavorite()}
            >
              <IconHeartOff />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip label="افزودن به علاقه‌مندی" position="right">
            <ActionIcon
              size="md"
              variant="transparent"
              onClick={() => addFavorite()}
            >
              <IconHeart />
            </ActionIcon>
          </Tooltip>
        )}

        <CompareBtn id="123" variant="transparent" />

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
