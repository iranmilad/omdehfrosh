import { useState } from "react";
import {
  ActionIcon,
  Button,
  ButtonGroup,
  Flex,
  Input,
  Loader,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconChartArrowsVertical,
  IconMinus,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useSend } from "../../Libs/api";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router";

const Counter = (props) => {
  const { value, max, isPending, onChange, onRemove, withButton,text } = props;
  const [count, setCount] = useState(+value || 0); // مقدار پیش‌فرض ۰ در نظر گرفته شده
  const [cookies, setCookie] = useCookies(["user"]);
  const navigate = useNavigate();

  const increment = () => handleChange(count + 1);
  const decrement = () => handleChange(count > 0 ? count - 1 : 0);

  const handleChange = (value) => {
    if (!cookies.user && cookies?.user !== "") {
      return navigate(`/login?redirect=${window.location.pathname}`, { replace: true });
    }
    if (!isNaN(value) && +value >= 0) {
      setCount(value); // به‌روزرسانی وضعیت داخلی
      if (onChange) {
        onChange(value); // ارسال مقدار به بیرون
      } else if (withButton) {
        update(value); // ارسال درخواست به سرور
      }
    }
  };

  const updateQuery = useSend({ url: "/cart/update" });
  const removeQuery = useSend({ url: "/cart/remove" });

  const update = (value) => {
    updateQuery.mutateAsync(
      {
        productId: 1,
        combinationsID: 1,
        sellerId: 1,
        count: value,
      },
      {
        onSuccess: (data) => {
          if (data?.max) {
            setCount(data.max);
          } else if (!data?.error) {
            setCount(value);
          }
        },
      }
    );
  };

  const remove = () => {
    removeQuery.mutateAsync(
      {
        productId: 1,
        combinationsID: 1,
        sellerId: 1,
      },
      {
        onSuccess: (data) => {
          if (!data?.error) {
            setCount(0); // مقدار count را به ۰ تنظیم می‌کند
            if (onRemove) {
              onRemove(); // اطلاع به بیرون در صورت حذف
            }
          }
        },
      }
    );
  };

  return (
    <>
      {count > 0 ? (
        <Flex align="center" direction="column" gap="0">
          <Flex align="center" gap="4">
            <ActionIcon
              size="md"
              radius="999999"
              variant="light"
              color="green"
              onClick={increment}
            >
              <IconPlus size={15} />
            </ActionIcon>
            {isPending || updateQuery.isPending || removeQuery.isPending ? (
              <Loader size="md" w={35} />
            ) : null}
            {!isPending || !updateQuery.isPending || !removeQuery.isPending ? (
              <Input
                type="number"
                w={35}
                styles={{ input: { textAlign: "center" } }}
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
                onClick={remove}
              >
                <IconTrash size={15} />
              </ActionIcon>
            )}
          </Flex>
          {withButton && (
            <Button
              p={0}
              px={4}
              h={15}
              variant="transparent"
              size="10px"
              onClick={() => handleChange(max)}
            >
              حداکثر
            </Button>
          )}
        </Flex>
      ) : (
        <Button
          h={45}
          onClick={() => handleChange(1)} // با کلیک، مقدار count به ۱ افزایش می‌یابد
        >
          {text}
        </Button>
      )}
    </>
  );
};

export default Counter;
