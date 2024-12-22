import {
  Box,
  Button,
  Flex,
  Grid,
  GridCol,
  Image,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { IconBasket, IconCreditCard, IconMessage2 } from "@tabler/icons-react";
import React from "react";
import { NavLink } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { FreeMode, Navigation, Thumbs } from "swiper/modules";

function Account_Index() {
  const { primaryColor } = useMantineTheme();
  const rows = [
    {
      id: "1234",
      date: "1403/12/12",
      status: "درحال بررسی",
      total: "12,000,000",
    },
    {
      id: "1234",
      date: "1403/12/12",
      status: "درحال بررسی",
      total: "12,000,000",
    },
  ];
  return (
    <>
      <Grid grow>
        <GridCol span={{ lg: 4 }}>
          <div className="flex gap-x-2 items-center bg-red-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
            <div className=" bg-red-600 rounded-xl p-2">
              <IconCreditCard className="text-zinc-100" />
            </div>
            <div className="text-zinc-50 space-y-1">
              <div>موجودی حساب</div>
              <div>75,000 تومان</div>
            </div>
          </div>
        </GridCol>
        <GridCol span={{ lg: 4 }}>
          <div className="flex gap-x-2 items-center bg-green-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
            <div className=" bg-green-600 rounded-xl p-2">
              <IconBasket className="text-zinc-100" />
            </div>
            <div className="text-zinc-100 space-y-1">
              <div>سفارشات کل</div>
              <div>16</div>
            </div>
          </div>
        </GridCol>
        <GridCol span={{ lg: 4 }}>
          <div className="flex gap-x-2 items-center bg-blue-500 rounded-2xl px-3 py-2 text-xs sm:text-base">
            <div className=" bg-blue-600 rounded-xl p-2">
              <IconMessage2 className="text-zinc-100" />
            </div>
            <div className="text-zinc-100 space-y-1">
              <div>پیام ها</div>
              <div>16</div>
            </div>
          </div>
        </GridCol>
      </Grid>
      <Title my="lg">آخرین سفارشات</Title>
      <ScrollArea type="auto">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th miw={100} c={primaryColor}>
                سفارش#
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                تاریخ
              </Table.Th>
              <Table.Th miw={100} c={primaryColor}>
                وضعیت
              </Table.Th>
              <Table.Th miw={130} c={primaryColor}>
                مجموع سفارش
              </Table.Th>
              <Table.Th miw={100} c={primaryColor} ta="end">
                عملیات
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.map((item, index) => (
              <ItemRow key={index} {...item} />
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
      <Title my="lg">محصولات علاقه مندی شما</Title>
      <Swiper spaceBetween={10} navigation={false} slidesPerView={"auto"} style={{paddingBottom: "40px",paddingInlineStart: "10px"}}>
        <SwiperSlide style={{width: "280px"}}>
          <Paper shadow="xs" component={NavLink} to="/product/123">
            <Image
              src="https://placehold.co/100"
              w="100%"
              fit="contain"
              h={250}
              radius="lg"
            />
            <Title size="sm" my="md">گوشی موبایل آیفون 16 پرومکس</Title>
            <Button size="xs" variant="light" radius="9999">مشاهده محصول</Button>
          </Paper>
        </SwiperSlide>
      </Swiper>
    </>
  );
}

function ItemRow(props) {
  return (
    <Table.Tr>
      <Table.Td>{props.id}</Table.Td>
      <Table.Td>{props.date}</Table.Td>
      <Table.Td>{props.status}</Table.Td>
      <Table.Td>{props.total}</Table.Td>
      <Table.Td ta="end">
        <Button
          radius="9999"
          component={NavLink}
          to={`/account/orders/${props.id}`}
          size="sm"
        >
          مشاهده
        </Button>
      </Table.Td>
    </Table.Tr>
  );
}

export default Account_Index;
