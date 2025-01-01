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
} from "@mantine/core";
import "./style.css"
import { IconPoint } from "@tabler/icons-react";

const MegaMenuTabs = () => {
    const theme = useMantineTheme();
  const tabData = {
    موبایل: ["گوشی سامسونگ", "گوشی شیائومی", "گوشی اپل", "گوشی نوکیا"],
    "کالای دیجیتال": ["لپ‌تاپ", "تبلت", "دوربین عکاسی", "لوازم جانبی کامپیوتر"],
    "کنسول و گجت": [
      "کنسول بازی پلی‌استیشن",
      "کنسول بازی ایکس‌باکس",
      "هدست واقعیت مجازی",
      "ساعت هوشمند",
    ],
    "تجهیزات شبکه و ارتباطات": [
      "مودم و روتر",
      "کابل شبکه",
      "اکسس‌پوینت",
      "آنتن تقویتی",
    ],
  };

  const [activeTab, setActiveTab] = useState("1");

  const activeOnHover = useCallback((val) => {
    setActiveTab(val);
  },[]);

  return (
    <Tabs value={activeTab} defaultValue="1" orientation="vertical" variant="pills">
      {/* Tabs.List aria-label will be announced when tab is focused for the first time */}
      <Tabs.List aria-label="Chats" style={{height: "100%",width: "20%"}} bg={theme.colors.brand[1]} p="xl">
        <Tabs.Tab value="1" onMouseEnter={() => activeOnHover('1')}>
            <Flex align="center" gap="sm">
                <IconPoint size={13} />
                <Text>موبایل</Text>
            </Flex>
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel style={{padding: "30px"}} value="1">First tab content</Tabs.Panel>
    </Tabs>
  );
};

export default MegaMenuTabs;
