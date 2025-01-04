import { useRef, useState, useEffect, useLayoutEffect } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Center,
  Divider,
  Flex,
  Group,
  Input,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconClock,
  IconExternalLink,
  IconLayoutGridAdd,
  IconSearch,
  IconTimeDuration15,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useData, useSend } from "../../Libs/api";
import { useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import queryString from "query-string";

const Search = () => {
  const [opened, setOpened] = useState(false); // مدیریت باز و بسته بودن باکس
  const [value,setValue] = useState("");
  const [debounced] = useDebouncedValue(value, 500);
  const [searchPage,setSearchPage] = useState(false);
  const [countOpened,setCountOpened] = useState(0);
  const [search,setSearch] = useLocalStorage({
    key: "search",
    defaultValue: []
  })
  const navigate = useNavigate();
  const ref = useRef(null); // مرجع برای باکس
  const inputRef = useRef(null); // مرجع برای اینپوت
  const { data, isLoading, isFetching } = useData({
    url: "/search",
    queryKey: ["search", debounced],
    params: {
      s: value,
    },
    queryOptions: {
      enabled: debounced.length > 2 && !searchPage && countOpened === 0 && opened && value.length > 2, // فقط اگر transition باز باشد جستجو فعال شود
    },
  });
  

  // مدیریت تغییر ورودی
  const handleChange = (event) => {
    const inputValue = event.target.value;
    setValue(inputValue);
    setOpened(true);
    setCountOpened(0);
  };

  // مدیریت کلیک خارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      // بررسی اگر کلیک روی اینپوت یا باکس نبود، باکس را ببند
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setOpened(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navgiateURL = (url) => {
    navigate(url);
    setValue("");
    setOpened(false);
  };

  const submitFormSearch = (e) => {
    e.preventDefault();
    navigate(`/search?s=${value}`);
    setOpened();
    setSearch(val => [...val,value]);
  }

  useEffect(() => {
    if (!opened && value.length > 3) {
      // اگر باکس بسته باشد و مقدار بیشتر از ۳ باشد، عملیات نباید انجام شود
      return;
    }
    const searchParam = queryString.parse(location.search)?.s;
    if (searchParam) {
      setSearchPage(true);
      setValue(searchParam);
    }
    else{
      setValue("");
      setSearchPage(false);
      setOpened(false);
      setCountOpened(0);
    }
  }, [location.href]); // افزودن `opened` به وابستگی‌ها

  return (
    <div className="relative w-[500px]">
      <form onSubmit={(e) => submitFormSearch(e)}>
        <Input
          ref={inputRef} // مرجع اینپوت
          onChange={handleChange}
          onClick={(e) => {
            setOpened(true);
            setCountOpened(countOpened + 1);
          }}
          w="100%"
          size="md"
          variant="default"
          radius="99999"
          value={value}
          leftSection={<IconSearch size={18} />}
          placeholder="جستجو کنید"
        />
      </form>
      <Transition
        mounted={opened && !searchPage}
        transition="fade-up"
        duration={400}
        timingFunction="ease"
      >
        {(styles) => (
          <Paper
            ref={ref} // مرجع برای باکس
            className="absolute top-full w-full"
            style={styles}
          >
            {debounced.length > 2 ? (
              <>
                {isFetching ? (
                  <Center>
                    <Loader size="xs" />
                  </Center>
                ) : (
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
                          component={NavLink}
                          onClick={() => navgiateURL()}
                        >
                          <Flex align="center" justify="space-between">
                            <Text>{item.title}</Text>
                            <ActionIcon variant="white">
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
                )}
              </>
            ) : (
              <>
                <Group justify="space-between">
                  <Flex gap="sm" c='gray' fw="600" align="center">
                    <IconClock size={18} />
                    <Text size="sm">آخرین جستجو های شما</Text>
                  </Flex>
                  {search.length > 0 && (<ActionIcon size="sm" variant="light" color="gray" onClick={() => setSearch([])}>
                    <IconTrash size={14} />
                  </ActionIcon>)}
                </Group>
                <ScrollArea type="auto" mt="sm">
                  <Group>
                  {search.map((item,index) => <Badge style={{cursor:"pointer"}} key={index} component={NavLink} to={`/search?s=${item}`} size="lg" variant="outline" color="gray" rightSection={<IconChevronLeft size={14} />}>{item}</Badge>)}
                  </Group>
                </ScrollArea>
              </>
            )}
          </Paper>
        )}
      </Transition>
    </div>
  );
};

export default Search;
