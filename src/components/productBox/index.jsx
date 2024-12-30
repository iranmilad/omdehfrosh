import { Badge, Box, Button, Flex, Image, LoadingOverlay, NumberFormatter, Paper, Skeleton, Text, useMantineTheme } from '@mantine/core'
import { IconHeart, IconHeartOff, IconPercentage, IconSwitch3 } from '@tabler/icons-react'
import PriceText from "../../components/priceText";
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import {useSend} from "../../Libs/api";
import { notifications } from '@mantine/notifications';
import { NavLink } from 'react-router';

function ProductBox({id,favoriteAdded,skeleton,title,slug,image,regularPrice,discountedPrice,discountPercent,refetchParent}) {
    const {colors} = useMantineTheme();
    

  return (
    <Paper shadow='sm' px="25" pb="lg" pt="40" pos="relative" display="flex" style={{flexDirection:"column"}}>
        {!skeleton ?
            <>
                <Box component={NavLink} to={`/product/${slug}`}>
                    <Image className='hover:scale-105 transition-transform duration-300' w="100%" h="150px" fit="contain" src={image}/>
                </Box>
                <Box my="lg">
                    <Text fw="600" size='sm'  component={NavLink} to={`/product/${slug}`}>{title}</Text>
                </Box>
                <Flex justify="space-between" align="end" mt="auto">
                    <Button component={NavLink} to={`/product/${slug}`}>مشاهده محصول</Button>
                    <Flex direction="column" align="end" gap={6}>
                        <Flex gap="5">
                            <Text size='xs' td="line-through" c="gray.6"><NumberFormatter thousandSeparator value={regularPrice}/></Text>
                            <Badge display="flex" style={{flexDirection: "row"}} styles={{label:{display:"flex"},root:{paddingInline: 5,borderBottomLeftRadius:0}}}>
                                {discountPercent}
                                <IconPercentage size={16} style={{marginRight: 5}} />
                            </Badge>
                        </Flex>
                        <PriceText>{discountedPrice}</PriceText>
                    </Flex>
                </Flex>
            </>
        : (
            <>
                <Flex justify="space-between" align="center" mb="lg">
                    <Skeleton h={40} w={40} circle />
                    <Skeleton h={40} w={40} circle />
                </Flex>
                <Skeleton w="100%" h="150px" />
                <Skeleton h="20" my="lg" />
                <Flex justify="space-between" align="end">
                    <Skeleton w="100" h={50} />
                    <Flex direction="column" align="end" gap={6}>
                        <Flex gap={5}>
                            <Skeleton w={40} h={20} />
                            <Skeleton w={40} h={20} />
                        </Flex>
                    <Skeleton h={20} w={60} />
                    </Flex>
                </Flex>
            </>
        )}

    </Paper>
  )
}

export default ProductBox