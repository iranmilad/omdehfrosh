import { useState, useRef } from "react";
import {
  Box,
  Card,
  Table,
  ScrollArea,
  Text,
  Flex,
  Button,
  Collapse,
  Paper,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router-dom";

function PriceList({ items, title }) {
  if (!items || items.length === 0) return null;

  const [expanded, setExpanded] = useState(false);
  const scrollPositionRef = useRef(0);
  const navigate = useNavigate();

  const displayAll = () => {
    navigate("/pricelists");
  };

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const handleScroll = (e) => {
    scrollPositionRef.current = e.target.scrollLeft;
  };

  const renderTables = (isExpanded) => (
    <Box 
      onScroll={handleScroll}
      style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}
      ref={(el) => {
        if (el) {
          el.scrollLeft = scrollPositionRef.current;
        }
      }}
    >
      {items.map((list, i) => (
        <Paper
          key={i}
          shadow="sm"
          p="md"
          radius="md"
          style={{
            minWidth: 340,
            border: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Flex 
            justify="space-between" 
            align="center" 
            mb="md"
            onClick={toggleExpanded}
            style={{
              cursor: "pointer",
              borderRadius: "6px",
              padding: "8px",
              transition: "background-color 0.2s ease",
            }}
            className="hover:bg-gray-100"
          >
            <Text
              fw="600"
              size="md"
              style={{ color: 'rgb(9, 54, 114)' }}
            >
              {list.title}
            </Text>
            
            {/* Chevron button inside each table */}
            <Flex
              align="center"
              gap="xs"
              px="md"
              py="xs"
              h={36}
              style={{
                borderRadius: "6px",
                transition: "background-color 0.2s ease",
                backgroundColor: "transparent",
                color: "inherit",
              }}
            >
              {expanded ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )}
            </Flex>
          </Flex>
          
          <ScrollArea type="auto" offsetScrollbars>
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              style={{
                minWidth: 300,
                fontSize: 14,
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th
                    style={{
                      backgroundColor: '#e7f5ff',
                      color: 'rgb(9, 54, 114)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    محصول
                  </Table.Th>
                  <Table.Th
                    style={{
                      backgroundColor: '#e7f5ff',
                      color: 'rgb(9, 54, 114)',
                      fontWeight: 700,
                      textAlign: 'center',
                    }}
                  >
                    قیمت
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {list.tablelist.map((entry, idx) => (
                  <Table.Tr key={entry.id || idx}>
                    <Table.Td style={{ textAlign: 'center', color: '#495057' }}>
                      {entry.product}
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center', color: '#495057' }}>
                      {entry.price}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Box px={{ base: "md", md: 0 }}>
      {/* Header with title and button */}
      <Flex
        justify="space-between"
        align="center"
        w="100%"
        mb={title?.trim() ? "md" : "sm"}
        wrap="nowrap"
      >
        {title?.trim() ? (
          <Text
            size="md"
            fw="600"
            style={{ color: 'rgb(9, 54, 114)' }}
          >
            {title}
          </Text>
        ) : (
          <Box />
        )}

        {/* نمایش همه button */}
        <Box
          component={NavLink}
          to="/pricelists"
          style={{
            textDecoration: 'none',
          }}
        >
          <Flex
            align="center"
            gap="xs"
            px="md"
            py="xs"
            h={36}
            style={{
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
              backgroundColor: "transparent",
              color: "inherit",
            }}
            className="hover:bg-gray-100"
          >
            <Text size="sm" fw="500">
              مشاهده همه
            </Text>
            <svg
              style={{ width: '16px', height: '16px', fill: 'currentColor' }}
              viewBox="0 0 24 24"
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </Flex>
        </Box>
      </Flex>

      {/* Content area */}
      <Collapse in={expanded} transitionDuration={300}>
        {renderTables(true)}
      </Collapse>

      {!expanded && (
        <Box
          style={{
            maxHeight: 300,
            overflowY: "hidden",
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}
        >
          {renderTables(false)}
        </Box>
      )}
    </Box>
  );
}

export default PriceList;