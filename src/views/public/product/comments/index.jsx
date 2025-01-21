import { Avatar, Center, Flex, Loader, LoadingOverlay, Overlay, Pagination, Paper, Rating, ScrollArea, Stack, Text, Title } from "@mantine/core"
import React, { useState } from "react"
import XTitle from "../../../../components/title"
import SignleComment from "../../../../components/singleComment"
import { useData } from "../../../../Libs/api"
import { shallowEqual } from "@mantine/hooks"
import InfoBox from "../../../../components/InfoBox"
import React from "react"


const Comments = ({slug}) => {
    const limit = 15
    const [activePage, setPage] = useState(1);
    const {isLoading,data,isFetching}  = useData({
        method: "POST",
        url:`product/${slug}/comments`,
        queryKey: ['product-commnets',activePage],
        queryOptions: {
            staleTime: 300000
        },
        bodyData: {
            limit,
            page: activePage
        }
    });
    if(isLoading) return <Center><Loader /></Center>
    if(!isLoading && !data) return <InfoBox >نظری برای این محصولا ثبت نشده است</InfoBox>
    
    return (
        <Paper mt="lg" px="lg" pos="relative">
            <LoadingOverlay visible={isFetching} zIndex={1000} />
            <Flex mt="lg" w="100%" justify="space-between" align="baseline" style={{borderBottom: "1px solid #cbd5e1"}} pb="30">
                <XTitle size="md">نظرات کاربران</XTitle>
                <Flex align="align">
                    <Flex direction="column" align="end">
                        <Rating size="md" mb="xs" value={data?.rating}  readOnly />
                        <Text c="gray" size="sm">بر اساس نظرات {data?.count} کاربر</Text>
                    </Flex>
                    <Title size="35" c="gray.7" ms="sm">{data?.rating}</Title>
                </Flex>
            </Flex>
            <Stack gap="lg" mt="xl">
                {data?.comments.map((item,index) => <MemoizedComment key={index} {...item} />)}
            </Stack>
            <Pagination                   
                total={data.total / limit}
                mt="xl"
                value={activePage}
                onChange={setPage} />
        </Paper>
    )
}



const MemoizedComment = React.memo(SignleComment,(prev,next) => {
    return ! shallowEqual(prev,next)
})

export default Comments