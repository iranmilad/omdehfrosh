import { ActionIcon, Button, Flex, Text } from "@mantine/core";
import { IconHome, IconMenu, IconMenu2, IconSearch, IconShoppingCart, IconUser } from "@tabler/icons-react";
import React from "react";
import { NavLink } from "react-router";

function BottomNavigation({category,search,basket}) {
  return (
    <Flex
    hiddenFrom="md"
      bg="white"
      w="100%"
      h="70"
      style={{
        zIndex: 40,
        boxShadow: "0 -15px 20px -15px rgba(0, 0, 0, 0.07)",
      }}
      pos="fixed"
      bottom={0}
      left={0}
      justify="space-between"
      align="center"
    >
        <Button p="0" variant="transparent" size="xs" w="calc(100% / 5)" h="45" fw="500" component={NavLink} to="/">
            <Flex direction="column" align="center" justify="center" gap="5">
                <IconHome stroke={1.5} size={22} />
                <Text c="#4c5360" size="10px">خانه</Text>
            </Flex>
        </Button>
        <Button p="0" variant="transparent" size="xs" w="calc(100% / 5)" h="45" fw="500" onClick={category}>
            <Flex direction="column" align="center" justify="center" gap="5">
                <IconMenu2 stroke={1.5} size={22} />
                <Text c="#4c5360" size="10px">دسته‌بندی</Text>
            </Flex>
        </Button>
        <Button p="0" variant="transparent" size="xs" w="calc(100% / 5)" h="45" fw="500" onClick={basket}>
            <Flex direction="column" align="center" justify="center" gap="5">
                <IconShoppingCart stroke={1.5} size={22} />
                <Text c="#4c5360" size="10px">سبد خرید</Text>
            </Flex>
        </Button>
        <Button p="0" variant="transparent" size="xs" w="calc(100% / 5)" h="45" fw="500" onClick={search}>
            <Flex direction="column" align="center" justify="center" gap="5">
                <IconSearch stroke={1.5} size={22} />
                <Text c="#4c5360" size="10px">جستجو</Text>
            </Flex>
        </Button>
        <Button p="0" variant="transparent" size="xs" w="calc(100% / 5)" h="45" fw="500">
            <Flex direction="column" align="center" justify="center" gap="5">
                <IconUser stroke={1.5} size={22} />
                <Text c="#4c5360" size="10px">حساب کاربری</Text>
            </Flex>
        </Button>
    </Flex>
  );
}

export default BottomNavigation;
