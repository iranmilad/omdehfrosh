import {
  Box,
  Button,
  Flex,
  Grid,
  GridCol,
  Paper,
  Select,
  SimpleGrid,
  Tabs,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import Slider from "./slider";
import PriceText from "../../../components/priceText";
import { IconBasket, IconBasketCog, IconMessage2 } from "@tabler/icons-react";
import AddComment from "./comments/add";
import Comments from "./comments";
import Features from "../features";

const OPTIONS = { direction: "rtl" };
const SLIDE_COUNT = 10;

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
  const comments = {
    rating: "3",
    count: 20,
    comments: [
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: "محصول خوبی بود"
      },
      {
        name: "فرهاد باقری",
        date: "15 آبان 1403",
        rating: "4",
        comment: "محصول خوبی بود"
      },
    ]
  }
  return (
    <>
      <div className="my-8 lg:my-10">
        <Paper pt="xl" px="xl">
        <div className="flex flex-col lg:flex-row gap-24">
          <div className="lg:w-4/12">
            <Slider
              options={{
                Carousel: {
                  infinite: false,
                },
              }}
            />
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
            <div className="p-3 border rounded-xl mx-auto divide-y hidden lg:block">
              <div className="flex gap-x-1 items-center text-zinc-600 text-sm pb-5 pt-3">
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
              <div className="flex gap-x-1 items-center text-zinc-600 text-sm py-5">
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
              <div className="flex flex-col justify-center py-5">
                <PriceText>1200000</PriceText>
                <div className="text-xs text-red-400">
                  تنها 2 عدد در انبار باقی مانده
                </div>
              </div>
              <Button fullWidth leftSection={<IconBasket />}>
                افزودن به سبد خرید
              </Button>
            </div>
          </div>
        </div>
        </Paper>
        <Tabs
          mt={70}
          variant="pills"
          defaultValue="desc"
          styles={{
            list: {
              background: theme.colors.gray[1],
              padding: "0.8rem",
              borderRadius: "0.5rem",
            },
            panel:{
              paddingTop: 20
            }
          }}
        >
          <Tabs.List >
            <Tabs.Tab value="desc">توضیحات</Tabs.Tab>
            <Tabs.Tab value="feat">مشخصات</Tabs.Tab>
            <Tabs.Tab value="comm">نظرات</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="desc">توضیحات محصول</Tabs.Panel>
          <Tabs.Panel value="feat">
            <Features items={[{title: "رنگ بندی",value:" آبی ، قرمز ، سبز"}]} />
          </Tabs.Panel>
          <Tabs.Panel value="comm">
            <AddComment />
            <Comments {...comments} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </>
  );
};

export default Product;
