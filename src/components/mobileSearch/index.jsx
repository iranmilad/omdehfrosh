import {
  Center,
  Drawer,
  Loader,
  Text,
  Box,
  Flex,
  SimpleGrid,
  Paper,
  Divider,
  Stack,
  ActionIcon,
  Group,
  ScrollArea,
  Badge
} from "@mantine/core";
import { NavLink, useNavigate } from "react-router";
import { TextInput } from "@mantine/core";
import { IconSearch,IconClock,IconTrash ,IconChevronLeft } from "@tabler/icons-react";
import { useData } from "../../Libs/api";
import { useState } from "react";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { IconExternalLink, IconLayoutGridAdd } from "@tabler/icons-react";
import InfoBox from "../InfoBox";

function MobileSearch({ opened, close }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 500);
  const [searchPage,setSearchPage] = useState(false);
  const [search, setSearch] = useLocalStorage({
    key: "search",
    defaultValue: [],
  });
  const { data, isLoading, isFetching } = useData({
    url: "/search",
    queryKey: ["search", debounced],
    params: {
      s: value,
    },
    queryOptions: {
      enabled: debounced.length > 2 && value.length > 2 && !searchPage
    },
  });
  const navgiateURL = (url) => {
    navigate(url);
    setValue("");
    close();
  };
  return (
    <Drawer title="جستجو" opened={opened} onClose={close}>
      <TextInput
        leftSection={<IconSearch />}
        placeholder="جستجو محصول مورد نظر"
        variant="filled"
        mb="md"
        styles={{ input: { height: 45 } }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {debounced.length > 2 ? (
        <>
          {isFetching ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <>
              {data.length > 0 ? (
                <Box mt="lg">
                  <Divider
                    labelPosition="left"
                    label={
                      <>
                        <IconLayoutGridAdd />
                        <Text mr="sm">دسته‌ها</Text>
                      </>
                    }
                  />
                  <SimpleGrid cols={3} mt="md">
                    {data?.category?.map((item, index) => (
                      <Paper
                        key={index}
                        shadow="none"
                        withBorder
                        style={{ cursor: "pointer" }}
                        onClick={() => navgiateURL(`/category/${item.slug}`)}
                      >
                        <Flex align="center" justify="space-between">
                          <Text>{item.title}</Text>
                          <ActionIcon component={NavLink} variant="white">
                            <IconExternalLink />
                          </ActionIcon>
                        </Flex>
                      </Paper>
                    ))}
                  </SimpleGrid>
                  <Divider
                    mt="xl"
                    labelPosition="left"
                    label={
                      <>
                        <IconLayoutGridAdd />
                        <Text mr="sm">محصولات</Text>
                      </>
                    }
                  />
                  <Stack mt="md">
                    {data?.products?.map((item, index) => (
                      <Paper
                        style={{ cursor: "pointer" }}
                        key={index}
                        shadow="none"
                        withBorder
                        onClick={() => navgiateURL(`/product/${item.slug}`)}
                      >
                        <Flex align="start" gap="sm">
                          <Flex justify="space-between" w="100%">
                            <Text>{item.title}</Text>
                            <ActionIcon variant="white">
                              <IconExternalLink />
                            </ActionIcon>
                          </Flex>
                        </Flex>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              ) : (
                <InfoBox shadow="0" back={false}>
                  چیزی یافت نشد
                </InfoBox>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Group justify="space-between">
            <Flex gap="sm" c="gray" fw="600" align="center">
              <IconClock size={18} />
              <Text size="sm">آخرین جستجو های شما</Text>
            </Flex>
            {search.length > 0 && (
              <ActionIcon
                size="sm"
                variant="light"
                color="gray"
                onClick={() => setSearch([])}
              >
                <IconTrash size={14} />
              </ActionIcon>
            )}
          </Group>
          <ScrollArea type="auto" mt="sm">
            <Group>
              {search.map((item, index) => (
                <Badge
                  style={{ cursor: "pointer" }}
                  key={index}
                  component={NavLink}
                  to={`/search?s=${item}`}
                  size="lg"
                  variant="outline"
                  color="gray"
                  rightSection={<IconChevronLeft size={14} />}
                >
                  {item}
                </Badge>
              ))}
            </Group>
          </ScrollArea>
        </>
      )}
    </Drawer>
  );
}

export default MobileSearch;
