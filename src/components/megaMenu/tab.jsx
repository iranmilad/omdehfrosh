import React, { useCallback, useState } from "react";
import {
  Tabs,
  Grid,
  GridCol,
  Text,
  Menu,
  Container,
  Box,
  Button,
  useMantineTheme,
  Flex,
  Stack,
  Title,
} from "@mantine/core";
import "./style.css"
import { IconPoint } from "@tabler/icons-react";
import { NavLink } from "react-router";

const menuItems = [
  {
    id: "1",
    label: "موبایل",
    links: [
      { title: "تجهیزات شبکه", path: "/category/network", children: [{ title: "کابل", path: "/category/network/cable" }, { title: "مودم", path: "/category/network/modem" }] },
    ],
  },
  {
    id: "2",
    label: "لپ‌تاپ",
    links: [
      { title: "لوازم جانبی", path: "/category/laptop/accessories", children: [{ title: "کیبورد", path: "/category/laptop/accessories/keyboard" }, { title: "ماوس", path: "/category/laptop/accessories/mouse" }] },
      { title: "برندها", path: "/category/laptop/brands", children: [{ title: "ایسر", path: "/category/laptop/brands/acer" }, { title: "دل", path: "/category/laptop/brands/dell" }] },
    ],
  },
  {
    id: "3",
    label: "تلویزیون",
    links: [
      { title: "تلویزیون‌های هوشمند", path: "/category/tv/smart", children: [{ title: "سامسونگ", path: "/category/tv/smart/samsung" }, { title: "ال‌جی", path: "/category/tv/smart/lg" }] },
      { title: "لوازم جانبی", path: "/category/tv/accessories", children: [{ title: "ریموت کنترل", path: "/category/tv/accessories/remote" }, { title: "براکت", path: "/category/tv/accessories/bracket" }] },
    ],
  },
  {
    id: "4",
    label: "لوازم خانگی",
    links: [
      { title: "یخچال", path: "/category/home/fridge", children: [{ title: "دو قلو", path: "/category/home/fridge/twin" }, { title: "فریزر", path: "/category/home/fridge/freezer" }] },
      { title: "لباسشویی", path: "/category/home/washer", children: [{ title: "اتوماتیک", path: "/category/home/washer/automatic" }, { title: "نیمه اتوماتیک", path: "/category/home/washer/semi-automatic" }] },
    ],
  },
  {
    id: "5",
    label: "دوربین",
    links: [
      { title: "دوربین عکاسی", path: "/category/camera/photo", children: [{ title: "حرفه‌ای", path: "/category/camera/photo/professional" }, { title: "خانگی", path: "/category/camera/photo/home" }] },
      { title: "دوربین مداربسته", path: "/category/camera/security", children: [{ title: "آنالوگ", path: "/category/camera/security/analog" }, { title: "دیجیتال", path: "/category/camera/security/digital" }] },
    ],
  }
];


const MegaMenuTabs = () => {
    const theme = useMantineTheme();
  const [activeTab, setActiveTab] = useState("1");

  const activeOnHover = useCallback((val) => {
    setActiveTab(val);
  },[]);

  return (
<Tabs value={activeTab} defaultValue="1" orientation="vertical" variant="pills">
  <Tabs.List aria-label="Chats" style={{ height: "100%", width: "20%" }} bg={theme.colors.brand[1]} p="xl">
    {menuItems.map((item) => (
      <Tabs.Tab key={item.id} value={item.id} onMouseEnter={() => activeOnHover(item.id)}>
        <Flex align="center" gap="sm">
          <IconPoint size={13} />
          <Text size="sm" component={NavLink} to={`/category/${item.label}`}>{item.label}</Text>
        </Flex>
      </Tabs.Tab>
    ))}
  </Tabs.List>
  {menuItems.map((item) => (
    <Tabs.Panel key={item.id} style={{ padding: "30px" }} value={item.id}>
      <Grid>
        {item.links.map((link, index) => (
          <GridCol key={index} span={2}>
            <Stack>
              <Title size="sm" component={NavLink} to={link.path}>{link.title}</Title>
              {link.children.map((child, idx) => (
                <Text key={idx} size="sm" c="gray.7" component={NavLink} to={child.path}>
                  {child.title}
                </Text>
              ))}
            </Stack>
          </GridCol>
        ))}
      </Grid>
    </Tabs.Panel>
  ))}
</Tabs>
  );
};

export default MegaMenuTabs;
