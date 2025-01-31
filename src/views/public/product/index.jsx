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
  Loader,
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
import { useData, useSend } from "../../../Libs/api";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { NavLink, useNavigate, useParams } from "react-router";
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
import InfoBox from "../../../components/InfoBox"
import PurchasePanel from "./purchasePanel";
import IconBar from "./iconBar";
import { useForm } from "@mantine/form";

const Product = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {slug} = useParams();
  const [options, setOptions] = useState({});
  const {isLoading,data} = useData({url: `/product/${slug}`,queryKey:['product',options],method:"POST",bodyData:{attributes: options}});
  const [opened, { toggle, close }] = useDisclosure(false);
  const [favorite, setFavorite] = useState(true);
  const stockAlert = useDisclosure(false);
  const shareModal = useDisclosure(false);
  const updateCart = useSend({url: "/cart/update"});
  const [compare, setCompare] = useLocalStorage({
    key: "compare",
    defaultValue: [],
  });
  const favoriteReq = useSend({
    url: "/favorites",
    method: favorite ? "DELETE" : "POST",
  });


  const title = "لپ تاپ 13.3 اینچی ایسوس مدل Zenbook S 13 OLED UX5304VA";

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

  useEffect(() => {
    if(data){
      data.options.map((item) => {
        setOptions((prev) => {
          return {
            ...prev,
            [item.slug]: item.children[0].value,
          };
        });
      });
    }
  },[data]);

  if(isLoading) return <Center><Loader /></Center>

  if(!isLoading && !data) return <InfoBox>چنین محصولی یافت نشد</InfoBox>

  return (
    <>
      <div className="my-8 lg:my-10">
        <Paper pt="xl" px="xl">
          <div className="flex flex-col lg:flex-row gap-24">
            <div className="lg:w-4/12">
              <Flex gap="md" direction={{base:"column",lg:"row"}}>
                <IconBar favorite={data.addedToFavorite} shareModal={shareModal} toggle={toggle} />
                <Slider
                  slides={data.images}
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
                {data.title}
              </div>
              <div className="text-zinc-400 text-xs mt-4">
                {data.english_title}
              </div>
              <SimpleGrid cols={{ md: 2 }} mt="lg">
                {data.options.map((item,index) => (
                  <Select
                    key={index}
                    label={item.label}
                    data={item.children}
                    name={item.slug}
                    defaultValue={item.children[0].value}
                    onChange={(val) => {
                      setOptions((prev) => {
                        return {
                          ...prev,
                          [item.slug]: val,
                        };
                      });
                    }}
                  />
                ))}
              </SimpleGrid>
            </div>
            <div className="lg:w-3/12">
              <div className="lg:mt-8 lg:mb-8"></div>
              <div className="p-3 border rounded-xl mx-auto divide-y lg:block">
                <PurchasePanel {...data.sellers[0]} updateCart={updateCart} />
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
        <Sellers items={data.sellers} />
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
            <Paper p="xl" >
              <div className='prose-sm leading-8' dangerouslySetInnerHTML={{__html: data.description}} />
            </Paper>
          </Tabs.Panel>
          <Tabs.Panel value="feat">
            <Features
              items={data.specifications}
            />
          </Tabs.Panel>
          <Tabs.Panel value="comm">
            <AddComment />
            <Comments slug={slug} />
          </Tabs.Panel>
        </Tabs>
        <RelatedProducts slug={slug} />
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
