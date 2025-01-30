import { Box, Button, Center, Grid, GridCol, Group, Loader, Paper, Stack, Text, ThemeIcon, Title, useMantineTheme } from '@mantine/core'
import { IconCircleCheck, IconCircleCheckFilled } from '@tabler/icons-react';
import React from 'react'
import XTitle from '../../../components/title';
import { useData } from '../../../Libs/api';

function Subscription() {
    const theme = useMantineTheme();
    const {data,isLoading} = useData({url: '/subscription',queryKey:['subscription']})
    if(isLoading) return <Center><Loader /></Center>
  return (
    <>
        <Center><XTitle>اشتراک ویژه</XTitle></Center>
        <Grid mt="xl">
        <GridCol span={{lg:"auto"}}>
            <Paper display="flex" style={{justifyContent:"center"}} radius="lg" withBorder shadow='0' py="30px" pb="35px" px="xl">
                <Box w={300}>
                    <Center style={{flexDirection:"column"}}>
                        <Stack align="center">
                            <Title c="dark" size="25px">یک ماهه</Title>
                            <Text style={{display:"flex",alignItems:"end",gap:"5px"}} c={theme.primaryColor} size='14px' fw="600" component="span"><Text size='20px' fw={900}>25</Text> هزار تومان</Text>
                        </Stack>
                    </Center>
                    <Stack mt="xl">
                        <Group justify="space-between" align="center">
                            <Text component='span' size='sm' fw="700" c="dark">آیتم 1</Text>
                            <ThemeIcon size='sm' variant='transparent'><IconCircleCheckFilled /></ThemeIcon>
                        </Group>
                    </Stack>
                    <Center mt="xl">
                        <Button h={30}>پرداخت</Button>
                    </Center>
                </Box>
            </Paper>
        </GridCol>
        <GridCol span={{lg:"auto"}}>
            <Paper display="flex" style={{justifyContent:"center"}} radius="lg" withBorder shadow='0' py="30px" pb="35px" px="xl">
                <Box w={300}>
                    <Center style={{flexDirection:"column"}}>
                        <Stack align="center">
                            <Title c="dark" size="25px">یک ماهه</Title>
                            <Text style={{display:"flex",alignItems:"end",gap:"5px"}} c={theme.primaryColor} size='14px' fw="600" component="span"><Text size='20px' fw={900}>25</Text> هزار تومان</Text>
                        </Stack>
                    </Center>
                    <Stack mt="xl">
                        <Group justify="space-between" align="center">
                            <Text component='span' size='sm' fw="700" c="dark">آیتم 1</Text>
                            <ThemeIcon size='sm' variant='transparent'><IconCircleCheckFilled /></ThemeIcon>
                        </Group>
                    </Stack>
                    <Center mt="xl">
                        <Button h={30}>پرداخت</Button>
                    </Center>
                </Box>
            </Paper>
        </GridCol>
        <GridCol span={{lg:"auto"}}>
            <Paper display="flex" style={{justifyContent:"center"}} radius="lg" withBorder shadow='0' py="30px" pb="35px" px="xl">
                <Box w={300}>
                    <Center style={{flexDirection:"column"}}>
                        <Stack align="center">
                            <Title c="dark" size="25px">یک ماهه</Title>
                            <Text style={{display:"flex",alignItems:"end",gap:"5px"}} c={theme.primaryColor} size='14px' fw="600" component="span"><Text size='20px' fw={900}>25</Text> هزار تومان</Text>
                        </Stack>
                    </Center>
                    <Stack mt="xl">
                        <Group justify="space-between" align="center">
                            <Text component='span' size='sm' fw="700" c="dark">آیتم 1</Text>
                            <ThemeIcon size='sm' variant='transparent'><IconCircleCheckFilled /></ThemeIcon>
                        </Group>
                    </Stack>
                    <Center mt="xl">
                        <Button h={30}>پرداخت</Button>
                    </Center>
                </Box>
            </Paper>
        </GridCol>
    </Grid>
    </>
  )
}

export default Subscription