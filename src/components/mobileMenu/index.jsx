import React from "react";
import { NavLink as RRNavLink, useNavigate } from "react-router-dom";
import { Box, Flex, NavLink, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import "./style.css";
import { useCallback } from "react";
import { IconPointFilled } from "@tabler/icons-react";

function MobileMenu({ toggle, menu }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e, url) => {
      e.preventDefault();
      if (url) {
        navigate(url);
        toggle();
      }
    },
    [navigate, toggle]
  );

  // Recursive function to render nested links
  const renderNestedLinks = (links, depth = 0) => {
    if (!links || links.length === 0) return null;

    return (
      <Box
        style={{
          paddingLeft: "0px",
          borderRadius: "10px",
          padding: "5px",
          marginRight: 3, // Add 3px marginRight for all levels
        }}
      >
        {links.map((child) => (
          <React.Fragment key={child.id}>
            <NavLink
            bg="gray.1"
              fw="600"
              label={child.label}
              c="gray.8"
              onClick={(e) => handleClick(e, child.url)}
              style={{ borderRadius: "8px" }}
              leftSection={<ThemeIcon variant="transparent" p={0} c="inherit" dangerouslySetInnerHTML={{ __html: child.icon }} />}
            />
            {/* Recursively render nested links with increased depth */}
            {renderNestedLinks(child.links, depth + 1)}
          </React.Fragment>
        ))}
      </Box>
    );
  };

  return (
    <>
      {menu?.map((item) => (
        <NavLink
          key={item.id}
          mb="sm"
          styles={{ label: { fontSize: 16 } }}
          label={item.label}
          leftSection={<ThemeIcon variant="transparent" p={0} c="inherit" dangerouslySetInnerHTML={{ __html: item.icon }} />}
          onClick={(e) => handleClick(e, item.url)}
        >
          {item.links?.map((link) => (
            <NavLink
              key={link.id}
              onClick={(e) => handleClick(e, link.url)}
              mb="sm"
              c="gray.7"
              leftSection={<ThemeIcon variant="transparent" p={0} c="inherit" dangerouslySetInnerHTML={{ __html: link.icon }} />}
              label={
                <Flex align="center" gap="xs">
                  <Text size="md" c="gray.7" component="span">
                    {link.label}
                  </Text>
                </Flex>
              }
            >
              {/* Render nested links recursively */}
              {renderNestedLinks(link.links)}
            </NavLink>
          ))}
        </NavLink>
      ))}
    </>
  );
}

export default MobileMenu;