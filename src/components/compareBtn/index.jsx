import { ActionIcon, Tooltip,Text } from "@mantine/core";
import { shallowEqual, useLocalStorage } from "@mantine/hooks";
import { IconSwitch3 } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import React from "react";
import { useNavigate } from "react-router";

function CompareButton(props) {
  const { id, ...other } = props;
  const [compare, setCompare] = useLocalStorage({
    key: "compare",
    defaultValue: [],
  });
  const navigate = useNavigate();
  const addCompare = () => {
    setCompare((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev; // در صورتی که وجود داشته باشد، بدون تغییر بازگردانده شود
    });
    notifications.show({
      message: (
        <div>
          <Text size="sm">محصول به مقایسه اضافه شد</Text>
          <Text size="xs">مشاهده</Text>
        </div>
      ),
      style: {
        cursor: "pointer",
      },
      position: "bottom-left",
      onClick: () => {
        navigate("/compare");
      },
    });
  };

  const removeCompare = () => {
    setCompare((prev) => prev.filter((item) => item !== id));
    notifications.show({
      color: "red",
      message: "محصول از مقایسه حذف شد",
      position: "bottom-left",
    });
  };

  return (
    <Tooltip
      label={compare.includes(id) ? "حذف از مقایسه" : "افزودن به مقایسه"}
      position="right"
      zIndex={9999}
    >
      <ActionIcon
        size="md"
        variant="transparent"
        onClick={compare.includes(id) ? removeCompare : addCompare}
        color={compare.includes(id) ? "red" : ""}
        {...other}
      >
        <IconSwitch3 />
      </ActionIcon>
    </Tooltip>
  );
}

const MemoizedCompare = React.memo(CompareButton,(prev,next) => {
    return shallowEqual(prev,next)
})

export default MemoizedCompare;
