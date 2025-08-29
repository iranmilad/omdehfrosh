import { useState } from "react";
import {
  Card,
  Table,
  ScrollArea,
  Text,
  Group,
  Button,
  Collapse
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { createStyles, rem } from "@mantine/styles";
import { useNavigate } from "react-router-dom"; // ✅ Import this



const useStyles = createStyles((theme) => ({
  table: {
    borderCollapse: "collapse",
    minWidth: rem(300),
    fontSize: rem(14),
  },

  th: {
    backgroundColor: theme.colors.indigo[1],
    color: theme.colors.indigo[7],
    fontWeight: 700,
    padding: rem(10),
    border: `1px solid ${theme.colors.indigo[3]}`,
    textAlign: "center",
  },

  td: {
    padding: rem(10),
    border: `1px solid ${theme.colors.indigo[2]}`,
    textAlign: "center",
    color: theme.colors.gray[8],
  },

  stripedRow: {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.colors.gray[0],
    },
  },

  title: {
    color: theme.colors.indigo[7],
    marginBottom: rem(8),
    fontWeight: 700,
    fontSize: rem(16),
  },
}));







function PriceList({ items }) {


if (!items || items.length === 0) return null;


  const [expanded, setExpanded] = useState(false);


  const { classes } = useStyles();



  const navigate = useNavigate(); // ✅ Hook for routing

  const displayAll = () => {
    navigate("/pricelists");
  };



  const toggleExpanded = () => setExpanded((prev) => !prev);

  const renderTables = () => (
    <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
      {items.map((list) => (
        <Card key={list._id} padding="sm" shadow="xs" radius="md" withBorder style={{ minWidth: 340 }}>
            <Text mb="md" className={classes.title}>
                {list.title}
            </Text>
          <ScrollArea type="auto" offsetScrollbars>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th className={classes.th}>محصول</th>
                  <th className={classes.th}>قیمت</th>
                </tr>
              </thead>
              <tbody>
                {list.tablelist.map((entry) => (
                  <tr key={entry._id} className={classes.stripedRow}>
                    <td className={classes.td}>{entry.product}</td>
                    <td className={classes.td}>{entry.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      ))}
    </div>
  );

  return (
    <Card shadow="md" padding="md" radius="md" withBorder>
      <Group position="right" mb="xs" justify="space-between">
        <Button
          size="xs"
          variant="light"
          onClick={toggleExpanded}
          leftIcon={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        >
          {expanded ? "نمایش کمتر" : "نمایش بیشتر"}
        </Button>

        <Button
          size="xs"
          variant="light"
          onClick={() => displayAll()}
          leftIcon={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        >
          نمایش همه
        </Button>
      </Group>

      <Collapse in={expanded} transitionDuration={300}>
        {renderTables()}
      </Collapse>

      {!expanded && (
        <div
          style={{
            maxHeight: 300,
            overflowY: "hidden",
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}
        >
          {renderTables()}
        </div>
      )}
    </Card>
  );
}

export default PriceList;
