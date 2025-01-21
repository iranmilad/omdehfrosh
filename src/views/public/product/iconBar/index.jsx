import { ActionIcon, Flex,Tooltip } from "@mantine/core";
import { IconHeart, IconHeartOff, IconShare, IconTimeline } from "@tabler/icons-react";
import React from "react";
import CompareBtn from "../../../../components/compareBtn"

function IconBar({favorite,shareModal,toggle}) {
  return (
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
        <ActionIcon size="md" variant="transparent" onClick={toggle}>
          <IconTimeline />
        </ActionIcon>
      </Tooltip>
    </Flex>
  );
}

export default IconBar;
