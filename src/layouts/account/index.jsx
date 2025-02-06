import { Anchor, Avatar, Badge, Center, Flex, Grid, GridCol, Paper, Skeleton, Stack, Text } from "@mantine/core";
import { IconBasket, IconBell, IconHeart, IconInfoCircle, IconLayout, IconLogout, IconMessage2, IconPencil, IconSwitch3, IconUser } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useLocation, Outlet, NavLink } from "react-router";
import NavItem from "./navitem";
import { useData } from "../../Libs/api";

const navigations = [
    {
        label: "پیشخوان",
        url: '/account',
        icon: <IconLayout size={16} />,
        links: '/'
    },
    {
        label: "سفارش ها",
        url: '/account/orders',
        icon: <IconBasket size={16} />,
        links: 'orders'
    },
    {
        label: "جزئیات حساب",
        url: '/account/edit-account',
        icon: <IconUser size={16} />,
        links: 'edit-account'
    },
    {
        label: "پیام ها",
        url: '/account/notifications',
        icon: <IconBell size={16} />,
        links: 'notifications'
    },
    {
        label: "تیکت ها",
        url: '/account/tickets',
        icon: <IconMessage2 size={16} />,
        links: 'tickets'    
    },
    {
        label: "علاقه‌مندی ها",
        url: '/account/favorites',
        icon: <IconHeart size={16} />,
        links: 'favorites'
    },
    {
        label: "مقایسه ها",
        url: '/compare',
        icon: <IconSwitch3 size={16} />,
        links: 'compares'
    },
    {
        label: "خروج",
        url: '/logout',
        icon: <IconLogout size={16} />,
        links: 'logout'
    },
];

const Account = () => {
    const [route, setRoute] = useState('/');
    const location = useLocation();
    const {data,isLoading} = useData({url: '/edit-account',queryKey:['edit-account']});

    useEffect(() => {
        // حذف /account از مسیر
        let currentRoute = location.pathname.replace('/account', '').split('/')[1] || '/';
        setRoute(currentRoute);
    }, [location.pathname]);

    return (
        <Grid>
            <GridCol span={{ lg: 3 }}>
                <Stack>
                    <Paper>
                        <Center>
                            <Avatar size="lg" />
                        </Center>
                        {!isLoading ? (
                            <Flex justify="space-between" align="center" mt="xl" mb="sm">
                                <Anchor size="sm" display="flex" style={{ alignItems: "center" }} underline="never" component={NavLink} to="/account/edit-account">
                                    <IconPencil style={{ marginLeft: 10 }} size={14} /> {data.name} {data.family}
                                </Anchor>
                                <Badge>{data.userTypeLabel}</Badge>
                            </Flex>
                        ) : (
                            <Flex align="center" justify="space-between" mt="xl" mb="sm">
                                <Skeleton h={25} w={170} />
                                <Skeleton h={25} w={100} />
                            </Flex>
                        )}

                    </Paper>
                    <Paper>
                        <Stack gap="xs">
                            {navigations.map((item, index) => {
                                // بررسی اینکه آیا مسیر فعلی در آرایه links وجود دارد
                                const isActive = item.links === route;
                                return (
                                    <NavItem
                                        key={index}
                                        activeItem={isActive}
                                        {...item}
                                    />
                                );
                            })}
                        </Stack>
                    </Paper>
                </Stack>
            </GridCol>
            <GridCol span={{ lg: 9 }}>
                <Paper pos="relative" p="25">
                    <Outlet />
                </Paper>
            </GridCol>
        </Grid>
    );
};

export default Account;
