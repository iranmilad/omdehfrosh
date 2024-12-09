import { useRef, useState, useEffect } from "react";
import {
  ActionIcon,
  Box,
  Center,
  Divider,
  Flex,
  Input,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Transition,
} from "@mantine/core";
import {
  IconExternalLink,
  IconLayoutGridAdd,
  IconSearch,
} from "@tabler/icons-react";
import { NavLink, useNavigate } from "react-router";
import { useSend } from "../../Libs/api";

const Search = () => {
  const [opened, setOpened] = useState(false); // مدیریت باز و بسته بودن باکس
  const [value, setValue] = useState("");
  const navigate = useNavigate();
  const ref = useRef(null); // مرجع برای باکس
  const inputRef = useRef(null); // مرجع برای اینپوت
  const { isPending, mutateAsync, data } = useSend({
    url: `/search/`,
    method: "post",
  });

  // مدیریت تغییر ورودی
  const handleChange = (event) => {
    const inputValue = event.target.value;
    setValue(inputValue);
    if (inputValue.length > 2) {
      setOpened(true);
      mutateAsync({ s: inputValue });
    } else {
      setOpened(false);
    }
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

  const navgiateURL = (url)=>{
    navigate(url);
    setValue("");
    setOpened(false)
  }

  return (
    <div className="relative w-[500px]">
      <Input
        ref={inputRef} // مرجع اینپوت
        onChange={handleChange}
        onClick={(e) => e.target.value.length > 2 && setOpened(true)}
        w="100%"
        size="md"
        variant="filled"
        leftSection={<IconSearch size={18} />}
        placeholder="جستجو کنید"
      />
      <Transition
        mounted={opened}
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
            {isPending ? <Center><Loader size="xs" /></Center> :  ( 
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
                              {data?.data[0]?.category?.map((item, index) => (
                                <Paper
                                  key={index}
                                  shadow="none"
                                  withBorder
                                  style={{cursor:"pointer"}}
                                  component={NavLink}
                                  onClick={() => navgiateURL(`/category/${item.slug}`)}>
                                  <Flex align="center" justify="space-between">
                                    <Text>{item.title}</Text>
                                    <ActionIcon
                                      component={NavLink}
                                      
                                      variant="white"
                                    >
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
                            {data?.data[0]?.products?.map((item, index) => (
                                <Paper style={{cursor:"pointer"}} key={index} shadow="none" withBorder onClick={() => navgiateURL(`/product/${item.slug}`)}>
                                <Flex align="start" gap="sm">
                                  <Flex justify="space-between" w="100%">
                                    <Text>
                                    {item.title}
                                    </Text>
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
          </Paper>
        )}
      </Transition>
    </div>
  );
};

export default Search;
