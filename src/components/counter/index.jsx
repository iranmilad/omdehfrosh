import { useState } from "react";
import { ActionIcon, Flex, Input, Loader, Text } from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

const Counter = (props) => {
  const { value, max, isPending } = props;
  const [count, setCount] = useState(value || 1);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

  const handleChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && value.trim() !== "" && +value >= 1) {
      setCount(+value);
    }
  };

  return (
    <>
      <Flex align="center" gap="sm">
        <ActionIcon
          size="md"
          radius="999999"
          variant="light"
          color="green"
          onClick={increment}
        >
          <IconPlus size={15} />
        </ActionIcon>
        <Flex justify="center" align="center" direction="column" miw={30}>
          {isPending && <Loader size="xs" />}
          {!isPending ? (
            <Input
              type="number"
              w={30}
              styles={{ input: { textAlign: "center" } }}
              variant="unstyled"
              value={count}
              onChange={handleChange}
            />
          ) : null}
          {!isPending && max ? (
            <Text size="xs" c="gray">
              حداکثر
            </Text>
          ) : null}
        </Flex>
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
          <ActionIcon radius="999999" size="md" variant="light" color="red" onClick={() => props.removeProduct()}>
            <IconTrash size={15} />
          </ActionIcon>
        )}
      </Flex>
    </>
  );
};

export default Counter;
