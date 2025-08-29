import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPriceLists } from "../../../redux/pricelists/priceListsActions";

import {
  Card,
  Table,
  Text,
  ScrollArea,
  Loader,
  Center,
  Alert,
  Title,
  Divider,
  Container,
  Group,
  ThemeIcon,
} from "@mantine/core";
import { createStyles, rem } from "@mantine/styles";
import { IconListDetails, IconAlertCircle } from "@tabler/icons-react";
import { Helmet } from "react-helmet";

const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: rem(24),
    paddingTop: rem(24),
    paddingBottom: rem(40),
  },

  card: {
    backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
    boxShadow: theme.shadows.md,
    transition: "transform 0.2s ease",
    '&:hover': {
      transform: "translateY(-4px)",
    },
  },

  table: {
    borderCollapse: "collapse",
    width: "100%",
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

  listTitle: {
    color: theme.colors.indigo[7],
    marginBottom: rem(8),
    fontWeight: 700,
    fontSize: rem(16),
    textAlign: "center",
  },

  pageTitle: {
    fontSize: rem(28),
    fontWeight: 800,
    textAlign: "center",
    marginBottom: rem(8),
  },
}));

function PriceLists() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector((state) => state.priceLists);

  const { classes } = useStyles();

  useEffect(() => {
    dispatch(fetchPriceLists());
  }, [dispatch]);

  return (
    <Container size="lg">
      <Helmet>
        <title>لیست قیمت محصولات | پنل مدیریت</title>
      </Helmet>

      <div className={classes.wrapper}>
        <Group position="center" spacing="xs">
          <ThemeIcon variant="light" size="lg" radius="xl" color="indigo">
            <IconListDetails size="1.5rem" />
          </ThemeIcon>
          <Title order={2} className={classes.pageTitle}>
            لیست قیمت محصولات
          </Title>
        </Group>

        <Divider my="sm" variant="dashed" />

        {loading && (
          <Center mt="xl">
            <Loader size="lg" color="indigo" />
          </Center>
        )}

        {error && (
          <Alert
            icon={<IconAlertCircle size={20} />}
            title="خطا"
            color="red"
            radius="md"
            withCloseButton
          >
            دریافت لیست قیمت‌ها با خطا مواجه شد: {error}
          </Alert>
        )}

        {!loading && !error && data.length === 0 && (
          <Text align="center" color="dimmed">
            هیچ لیست قیمتی یافت نشد.
          </Text>
        )}

        {!loading &&
          !error &&
          data.map((list) => (
            <Card key={list._id} padding="md" radius="md" withBorder className={classes.card}>
              <Text mb="md" className={classes.listTitle}>{list.title}</Text>
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
    </Container>
  );
}

export default PriceLists;
