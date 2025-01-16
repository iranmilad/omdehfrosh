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
import { NavLink, useNavigate } from "react-router";




const MegaMenuTabs = ({menuItems}) => {
    const theme = useMantineTheme();
    const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");

  const activeOnHover = useCallback((val) => {
    setActiveTab(val);
  },[]);

  return (
<Tabs value={activeTab} defaultValue="1" orientation="vertical" variant="pills">
  <Tabs.List aria-label="Chats" style={{ height: "100%", width: "20%" }} bg={theme.colors.gray[1]} p="xl">
    {menuItems.map((item) => (
      <Tabs.Tab key={item.id} value={item.id} onMouseEnter={() => activeOnHover(item.id)} onClick={() => navigate(item.url)} style={{height: 45}}>
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
