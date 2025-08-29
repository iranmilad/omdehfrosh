import { ActionIcon, Box, Text, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowRight, IconSwitch2, IconSwitch3 } from "@tabler/icons-react";
import React from "react";
import { useNavigate } from "react-router";
import { shallowEqual, useSelector, useDispatch } from "react-redux";
import { addToCompare, removeFromCompare } from '../../../src/redux/compare/compare'
import { MdCompare } from "react-icons/md";



function CompareButton(props) {


  const { id, category, ...other } = props;



  const navigate = useNavigate();

  const dispatch = useDispatch();

  const compareItems = useSelector((state) => state.compare.items);

  const compare = compareItems.find((c) => c.category === category)?.items || [];
  
  const isInCompare = compare.includes(id);



  const handleClick = () => {

    const isInCompare = compare.includes(id);
  
    if (isInCompare) {
      dispatch(removeFromCompare({ category, id }));
      notifications.show({
        color: "red",
        message: "محصول از مقایسه حذف شد",
        position: "bottom-left",
      });
    } else {
      if (compare.length >= 4) {
        notifications.show({
          color: "yellow",
          message: "حداکثر ۴ محصول را می‌توانید مقایسه کنید",
          position: "bottom-left",
        });
        return;
      }
  
      dispatch(addToCompare({ category, id }));
  
      // Show notification
      notifications.show({
        message: "محصول به مقایسه اضافه شد",
        position: "bottom-left",
      });
  
      // Navigate right after
      navigate(`/compare/${category}`);


    }
  };


  const handleNavigate = () => {
    navigate(`/compare/${category}`);
  };


  return (
    <Box
      pos="relative"
      onMouseEnter={(e) =>
        e.currentTarget.querySelector(".navigate-icon").style.opacity = "1"
      }
      onMouseLeave={(e) =>
        e.currentTarget.querySelector(".navigate-icon").style.opacity = "0"
      }
    >
      <Tooltip
        label={isInCompare ? "حذف از مقایسه" : "افزودن به مقایسه"}
        position="right"
        zIndex={9999}
      >
        <ActionIcon
          size="md"
          variant="transparent"
          onClick={handleClick}
          color={isInCompare ? "red" : ""}
          {...other}
        >
          <IconSwitch3 />
        </ActionIcon>
      </Tooltip>

      {/* Hover icon to navigate */}
      {/* <Tooltip
        label={"مقایسه"}
        position="right"
        zIndex={9999}
      >
        <ActionIcon
          size="md"
          variant="transparent"
          onClick={handleNavigate}
          color={"green"}
          {...other}
        >
        <MdCompare size={25} />
      </ActionIcon>
      </Tooltip> */}
    </Box>
  );
}

const MemoizedCompare = React.memo(CompareButton, (prev, next) =>
  shallowEqual(prev, next)
);

export default MemoizedCompare;
