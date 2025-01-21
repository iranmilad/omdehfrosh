import { NavLink as RRNavlink, useNavigate } from "react-router";
import { Box, Flex, NavLink, Text, useMantineTheme } from "@mantine/core";
import "./style.css";
import { useCallback } from "react";
import { IconPointFilled } from "@tabler/icons-react";

function MobileMenu({ toggle, menu }) {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const click = useCallback(
    (e, url) => {
      if (e.target.nodeName === "SPAN") {
        navigate(url);
        toggle();
      }
    },
    [navigate, toggle]
  );

  return (
    <>
      {menu?.category.map((item) => (
        <NavLink
          mb="sm"
          key={item.id}
          styles={{ label: { fontSize: 16 } }}
          label={item.label}
          onClick={(e) => click(e, item.url)}
        >
          {item?.children.map((link) => (
            <NavLink
              key={link.url}
              onClick={(e) => click(e, link.url)}
              mb="sm"
              label={
                <Flex align="center" gap="xs">
                  <IconPointFilled size={12} color={theme.colors.brand[5]} />
                  <Text size="md" c="gray.7" component="span">
                    {link.label}
                  </Text>
                </Flex>
              }
            >
              {link.children && (
                <Box
                  bg="gray.1"
                  w="95%"
                  style={{ borderRadius: "10px" }}
                  p="5px"
                >
                  {link.children.map((child) => (
                    <NavLink
                      key={child.url}
                      fw="600"
                      label={child.label}
                      c="gray.8"
                      onClick={(e) => click(e, child.url)}
                      style={{borderRadius:"8px"}}
                    />
                  ))}
                </Box>
              )}
            </NavLink>
          ))}
        </NavLink>
      ))}
      {menu?.other.map((item, index) => (
        <NavLink label={item.label} key={index} mb="sm" styles={{ label: { fontSize: 16 } }} onClick={(e) => click(e, item.url)}>
          {item.children && (
            <Box bg="gray.1" w="95%" style={{ borderRadius: "10px" }} p="5px">
              {item.children.map((child,index) => (
                <NavLink
                  key={index}
                  fw="600"
                  label={child.label}
                  c="gray.8"
                  onClick={(e) => click(e, child.url)}
                />
              ))}
            </Box>
          )}
        </NavLink>
      ))}
    </>
  );
}

export default MobileMenu;
