import {
  ActionIcon,
  Anchor,
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
  IconCash,
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
import {
  useDisclosure,
  useLocalStorage,
  useSessionStorage,
} from "@mantine/hooks";
import { useSend } from "../../../Libs/api";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { NavLink, useNavigate } from "react-router";
import Sellers from "./sellers";
import StockAlert from "./stockAlert";
import XTitle from "../../../components/title";
import CryptoJS, { AES } from "crypto-js";
import Counter from "../../../components/counter";
import ShareModal from "../../../components/shareModal";
import PriceChart from "./priceChart";
import RelatedProducts from "./relatedProducts";
import { notifications } from "@mantine/notifications";
import CompareBtn from "../../../components/compareBtn"

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [favorite, setFavorite] = useState(true);
  const stockAlert = useDisclosure(false);
  const shareModal = useDisclosure(false);
  const [compare, setCompare] = useLocalStorage({
    key: "compare",
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
        seller: "دیجیکالا",
      },
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: "محصول خوبی بود",
        status: "agreed",
        seller: "دیجیکالا",
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
      if (!prev.includes("123")) {
        return [...prev, "123"];
      }
      return prev; // در صورتی که وجود داشته باشد، بدون تغییر بازگردانده شود
    });
    notifications.show({
      message: (
        <div>
          <Text size="sm">محصول به مقایسه اضافه شد</Text>
          <Text size="xs" >مشاهده</Text>
        </div>
      ),
      style:{
        cursor: "pointer"
      },
      position:"bottom-left",
      onClick:()=> {
        navigate('/compare')
      }
    });
  };

  const removeCompare = () => {
    setCompare((prev) => prev.filter((item) => item !== "123"));
    notifications.show({
      color:"red",
      message: "محصول از مقایسه حذف شد",
      position:"bottom-left"
    })
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

                  <CompareBtn id="123" variant="transparent" />

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
                  <IconCash size={20}
                      stroke={1.3}
                      className="text-zinc-700" />
                  <div>پرداخت نقدی | اقساط</div>
                </div>
                <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-4">
                  <IconTruckDelivery size={20}
                      stroke={1.3}
                      className="text-zinc-700" />
                  <div>تحویل آنی | پیشفروش</div>
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
                <Flex
                  direction="column"
                  align="start"
                  gap="xs"
                  className="py-4"
                >
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
                <Text c="red" size="xs">امکان ثبت سفارش وجود ندارد</Text>
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
            panel: {
              paddingTop: 20,
            },
          }}
        >
          <Paper>
            <Tabs.List>
              <Tabs.Tab value="desc">توضیحات</Tabs.Tab>
              <Tabs.Tab value="feat">مشخصات</Tabs.Tab>
              <Tabs.Tab value="comm">نظرات</Tabs.Tab>
            </Tabs.List>
          </Paper>
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
        <RelatedProducts />
      </div>
      <PriceChart title={title} opened={opened} close={close} />
      <ShareModal
        link="http://localhost:3000/product/123"
        opened={shareModal[0]}
        close={shareModal[1].close}
      >
        این کالا را با دوستان خود به اشتراک بگذارید!{" "}
      </ShareModal>
      <StockAlert opened={stockAlert[0]} close={stockAlert[1].close} />
    </>
  );
};

export default Product;
