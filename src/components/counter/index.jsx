import { useState } from "react";
import { ActionIcon, Flex, Input, Loader, Text } from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons-react";

const Counter = (props) => {
  const {value,max,isPending} = props;
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
          size="sm"
          radius="999999"
          variant="light"
          color="green"
          onClick={increment}
        >
          <IconPlus />
        </ActionIcon>
        <Flex justify="center" align="center" direction="column" miw={80}>
        {isPending && <Loader size="xs" />}
        {!isPending ? (<Input
            type="number"
          w={80}
          styles={{ input: { textAlign: "center" } }}
          variant="unstyled"
          value={count}
          onChange={handleChange}
        />) : null}
        {!isPending && max ? <Text size="xs" c="gray">حداکثر</Text> : null}
        </Flex>
        <ActionIcon
          size="sm"
          radius="999999"
          variant="light"
          color="red"
          onClick={decrement}
        >
          <IconMinus />
        </ActionIcon>
      </Flex>
    </>
  );
};

export default Counter;
