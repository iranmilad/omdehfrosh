import { useState } from "react";
import { ActionIcon, Button, ButtonGroup, Flex, Input, Loader, Text, Tooltip } from "@mantine/core";
import { IconChartArrowsVertical, IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

const Counter = (props) => {
  const { value, max, isPending,count,onChange,removeCart } = props;

  const increment = () => handleChange(`${+count+1}`);
  const decrement = () => handleChange(`${+count > 1 ? +count - 1 : 1}`);

  const handleChange = (value,) => {
    if (!isNaN(value) && value.trim() !== "" && +value >= 1) {
      onChange(value);
    }
  };

  return (
    <>
      <Flex align="center" gap="4">
        <Button p={0} px={4} h={15} variant="transparent" size="10px" onClick={() => onChange(`${count}`,true)}>حداکثر</Button>
        <ActionIcon
          size="md"
          radius="999999"
          variant="light"
          color="green"
          onClick={increment}
        >
          <IconPlus size={15} />
        </ActionIcon>
        {isPending && <Loader size="md" w={35} />}
          {!isPending ? (
            <Input
              type="number"
              w={35}
              styles={{ input: { textAlign: "center" }, }}
              variant="unstyled"
              value={count}
              readOnly
              px={0}
            />
          ) : null}
        {count > 1 ? (
          <ActionIcon
            size="md"
            radius="999999"
            variant="light"
            color="red"
            onClick={decrement}
          >
            <IconMinus size={15} />
          </ActionIcon>
        ) : (
          <ActionIcon
            radius="999999"
            size="md"
            variant="light"
            color="red"
            onClick={() => removeCart()}
          >
            <IconTrash size={15} />
          </ActionIcon>
        )}
      </Flex>
    </>
  );
};

export default Counter;
