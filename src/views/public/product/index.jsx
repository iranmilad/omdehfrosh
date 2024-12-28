import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridCol,
  Paper,
  Select,
  SimpleGrid,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import Slider from "./slider";
import PriceText from "../../../components/priceText";
import {
  IconArrowLeft,
  IconBasket,
  IconBasketCog,
  IconBell,
  IconBuildingStore,
  IconHeart,
  IconHeartOff,
  IconMessage2,
  IconShare,
  IconShield,
  IconSwitch,
  IconSwitch3,
  IconTimeline,
  IconTruckDelivery,
  IconUserPin,
} from "@tabler/icons-react";
import AddComment from "./comments/add";
import Comments from "./comments";
import Features from "../features";
import { useDisclosure, useLocalStorage, useSessionStorage } from "@mantine/hooks";
import PriceChart from "./priceChart";
import ShareModal from "./shareModal";
import { useSend } from "../../../Libs/api";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { NavLink } from "react-router";
import Sellers from "./sellers";
import StockAlert from "./stockAlert";
import XTitle from "../../../components/title";
import CryptoJS,{AES}  from "crypto-js";
import Counter from "../../../components/counter";

const SLIDES = [
  {
    src: "https://placehold.co/600x400?text=1",
  },
  {
    src: "https://placehold.co/600x400?text=2",
  },
  {
    src: "https://placehold.co/600x400?text=3",
  },
  {
    src: "https://placehold.co/600x400?text=4",
  },
  {
    src: "https://placehold.co/600x400?text=5",
  },
];

const Product = () => {
  const theme = useMantineTheme();
  const dispatch = useDispatch();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [favorite, setFavorite] = useState(true);
  const stockAlert = useDisclosure(false);
  const shareModal = useDisclosure(false);
  const [compare,setCompare] = useLocalStorage({
    key:"compare",
    defaultValue: [],
  });
  const favoriteReq = useSend({
    url: "/favorites",
    method: favorite ? "DELETE" : "POST",
  });
  const title = "لپ تاپ 13.3 اینچی ایسوس مدل Zenbook S 13 OLED UX5304VA";
  const comments = {
    rating: "3",
    count: 20,
    comments: [
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: "محصول خوبی بود",
        status: "pending",
        seller: "دیجیکالا"
      },
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: "محصول خوبی بود",
        status: "agreed",
        seller: "دیجیکالا"
      },
    ],
  };
  const addFavorite = () => {
    dispatch(toggleLoading());
    favoriteReq.mutateAsync(
      { id: 123 },
      {
        onSuccess: () => {
          setFavorite((val) => !val);
          dispatch(toggleLoading());
        },
      }
    );
  };

  const removeFavorite = () => {
    dispatch(toggleLoading());
    favoriteReq.mutateAsync(
      { id: 123 },
      {
        onSuccess: () => {
          setFavorite((val) => !val);
          dispatch(toggleLoading());
        },
      }
    );
  };

  const addCompare = () => {
    setCompare((prev) => {
      if (!prev.includes('123')) {
        return [...prev, '123'];
      }
      return prev; // در صورتی که وجود داشته باشد، بدون تغییر بازگردانده شود
    });
  };
  
  const removeCompare = () => {
    setCompare((prev) => prev.filter((item) => item !== '123'));
  };


  return (
    <>
      <div className="my-8 lg:my-10">
        <Paper pt="xl" px="xl">
          <div className="flex flex-col lg:flex-row gap-24">
            <div className="lg:w-4/12">
              <Flex gap="md">
                <Flex direction="column" gap="lg">
                  {favorite ? (
                    <Tooltip label="حذف از علاقه‌مندی" position="right">
                      <ActionIcon
                        size="md"
                        variant="transparent"
                        color="red"
                        onClick={() => removeFavorite()}
                      >
                        <IconHeartOff />
                      </ActionIcon>
                    </Tooltip>
                  ) : (
                    <Tooltip label="افزودن به علاقه‌مندی" position="right">
                      <ActionIcon
                        size="md"
                        variant="transparent"
                        onClick={() => addFavorite()}
                      >
                        <IconHeart />
                      </ActionIcon>
                    </Tooltip>
                  )}

                <Tooltip label={compare.includes('123') ? "حذف از مقایسه" : "افزودن به مقایسه"} position="right">
                  <ActionIcon
                    size="md"
                    variant="transparent"
                    onClick={compare.includes('123') ? removeCompare : addCompare}
                    color={compare.includes('123') ? "red" : "default"}
                  >
                    <IconSwitch3 />
                  </ActionIcon>
                </Tooltip>

                  <Tooltip label="اشتراک گذاری" position="right">
                    <ActionIcon
                      size="md"
                      variant="transparent"
                      onClick={shareModal[1].toggle}
                    >
                      <IconShare />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="نمودار قیمت" position="right">
                    <ActionIcon
                      size="md"
                      variant="transparent"
                      onClick={toggle}
                    >
                      <IconTimeline />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
                <Slider
                  slides={SLIDES}
                  options={{
                    Carousel: {
                      infinite: false,
                    },
                  }}
                />
              </Flex>
            </div>
            <div className="lg:w-5/12">
              <div className="text-zinc-700 text-lg md:text-xl">
                لپ تاپ 13.3 اینچی ایسوس مدل Zenbook S 13 OLED UX5304VA
              </div>
              <div className="text-zinc-400 text-xs mt-4">
                Asus Zenbook S 13 OLED UX5304VA-NQ003 13.3 Inch Laptop
              </div>
              <SimpleGrid cols={{ md: 2 }} mt="lg">
                <Select
                  label="رنگ"
                  data={[{ value: "blue", label: "آبی" }]}
                  defaultValue="blue"
                />
                <Select
                  label="گارانتی"
                  data={[{ value: "first", label: "گارانتی 3 ماهه" }]}
                  defaultValue="first"
                />
              </SimpleGrid>
            </div>
            <div className="lg:w-3/12">
              <div className="lg:mt-8 lg:mb-8"></div>
              <div className="p-3 border rounded-xl mx-auto divide-y lg:block">
                <div className="flex gap-x-1 items-center text-zinc-600 text-sm pt-3 mb-4">
                  <svg
                    className="fill-zinc-700"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill=""
                    viewBox="0 0 256 256"
                  >
                    <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"></path>
                  </svg>
                  <div>تظمین سلامت کالا</div>
                </div>
                <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-4">
                  <svg
                    className="fill-zinc-700"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill=""
                    viewBox="0 0 256 256"
                  >
                    <path d="M247.42,117l-14-35A15.93,15.93,0,0,0,218.58,72H184V64a8,8,0,0,0-8-8H24A16,16,0,0,0,8,72V184a16,16,0,0,0,16,16H41a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,247.42,117ZM184,88h34.58l9.6,24H184ZM24,72H168v64H24ZM72,208a16,16,0,1,1,16-16A16,16,0,0,1,72,208Zm81-24H103a32,32,0,0,0-62,0H24V152H168v12.31A32.11,32.11,0,0,0,153,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,184,208Zm48-24H215a32.06,32.06,0,0,0-31-24V128h48Z"></path>
                  </svg>
                  <div>ارسال سریع و مطمعن</div>
                </div>
                <div className="flex flex-col justify-center py-4">
                  <Flex align="start" gap="4px">
                    <IconBuildingStore
                      size={20}
                      stroke={1.3}
                      className="text-zinc-700"
                    />
                    <Flex direction="column">
                      <Text
                        size="sm"
                        className="text-zinc-700"
                        component={NavLink}
                        to={`/seller/${123}`}
                      >
                        دیجیکالا
                      </Text>
                      <Text size="xs" c="gray">
                        رضایت : <Badge color="green">عالی</Badge>
                      </Text>
                    </Flex>
                  </Flex>
                  <PriceText>1200000</PriceText>
                  <div className="text-xs text-red-400">
                    موجودی انبار 2 عدد میباشد
                  </div>
                </div>
                <Flex direction="column" align="start" gap="xs" className="py-4">
                  <Flex gap="sm">
                    <Text size="13px" c="gray">
                      حداقل سفارش
                    </Text>
                    <Text size="13px">1 عدد</Text>
                  </Flex>
                  <Flex gap="sm">
                    <Text size="13px" c="gray">
                      حداکثر سفارش
                    </Text>
                    <Text size="13px">100 عدد</Text>
                  </Flex>
                </Flex>
                <Button fullWidth leftSection={<IconBasket />} h={45}>
                  افزودن به سبد خرید
                </Button>
                <Counter />
              </div>
              <Paper shadow="0" withBorder p="xs" mt="lg">
                <Button
                  fz="13px"
                  px="0"
                  rightSection={<IconArrowLeft stroke={1.4} />}
                  justify="space-between"
                  fullWidth
                  variant="transparent"
                  h="30"
                  onClick={() => stockAlert[1].open()}
                >
                  <IconBell stroke={1.4} style={{ marginLeft: "5px" }} />
                  <span>اطلاع رسانی قیمت و موجودی</span>
                </Button>
              </Paper>
            </div>
          </div>
        </Paper>
        <Sellers />
        <Tabs
          variant="pills"
          defaultValue="desc"
          styles={{
            list: {
              background: theme.colors.gray[1],
              padding: "0.8rem",
              borderRadius: "0.5rem",
            },
            panel: {
              paddingTop: 20,
            },
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="desc">توضیحات</Tabs.Tab>
            <Tabs.Tab value="feat">مشخصات</Tabs.Tab>
            <Tabs.Tab value="comm">نظرات</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="desc">
            <Paper>توضیحات محصول</Paper>
          </Tabs.Panel>
          <Tabs.Panel value="feat">
            <Features
              items={[{ title: "رنگ بندی", value: " آبی ، قرمز ، سبز" }]}
            />
          </Tabs.Panel>
          <Tabs.Panel value="comm">
            <AddComment />
            <Comments {...comments} />
          </Tabs.Panel>
        </Tabs>
      </div>
      <PriceChart title={title} opened={opened} close={close} />
      <ShareModal
        link="http://localhost:3000/product/123"
        opened={shareModal[0]}
        close={shareModal[1].close}
      />
      <StockAlert opened={stockAlert[0]} close={stockAlert[1].close} />
    </>
  );
};

export default Product;
