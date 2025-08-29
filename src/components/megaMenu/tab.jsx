import React, { useCallback, useState } from "react";
import {
  Tabs,
  Grid,
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
import "./style.css";
import { IconPoint } from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router-dom";

const MegaMenuTabs = ({ menuItems }) => {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(String(menuItems[0].id));

  const activeOnHover = useCallback((val) => {
    setActiveTab(val);
  }, []);

  return (
    <Tabs
      value={activeTab}
      defaultValue={String(menuItems[0].id)}
      orientation="vertical"
      variant="pills"
    >
      <Tabs.List
        aria-label="Chats"
        style={{ height: "100%", width: "20%" }}
        bg={theme.colors.gray[1]}
        p="xl"
      >
        {menuItems.map((item) => (
          <Tabs.Tab
            key={item.id}
            value={String(item.id)}
            onMouseEnter={() => activeOnHover(String(item.id))}
            onClick={() => navigate(item.url)}
            style={{ height: 45 }}
          >
            <Flex align="center" gap="sm">
              <Box fz="20px" dangerouslySetInnerHTML={{__html:item.icon}} />
              <Text size="sm" component={NavLink} to={item.url}>
                {item.label}
              </Text>
            </Flex>
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {menuItems.map((item) => (
        <Tabs.Panel key={item.id} style={{ padding: "30px" }} value={String(item.id)}>
          <Grid>
            {item.links.map((link, index) => (
              <Grid.Col key={link.id} span={4}> {/* Adjust the span as needed */}
                <Stack>
                  <Title size="sm" component={NavLink} to={link.url} display="flex" style={{gap:"5px",alignItems:"center"}}>
                    <Box fz="20px" dangerouslySetInnerHTML={{__html:item.icon}} />
                    {link.label}
                  </Title>
                  {link.links.map((child) => (
                    <Text key={child.id} size="sm" c="gray.7" component={NavLink} to={child.url} display="flex" style={{gap:"5px",alignItems:"center"}}>
                      <Box fz="20px" dangerouslySetInnerHTML={{__html:child.icon}} />
                      {child.label}
                    </Text>
                  ))}
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default MegaMenuTabs;