import { Avatar, Flex, Pagination, Paper, Rating, ScrollArea, Stack, Text, Title } from "@mantine/core"
import React from "react"
import XTitle from "../../../../components/title"
import SignleComment from "../../../../components/singleComment"


const Comments = (props) => {
    const {rating,count,comments} = props
    return (
        <Paper mt="lg" px="lg">
            <Flex mt="lg" w="100%" justify="space-between" align="baseline" style={{borderBottom: "1px solid #cbd5e1"}} pb="30">
                <XTitle size="md">نقد و بررسی کاربران</XTitle>
                <Flex align="align">
                    <Flex direction="column" align="end">
                        <Rating size="md" mb="xs" value={rating}  readOnly />
                        <Text c="gray" size="sm">بر اساس نظرات {count} کاربر</Text>
                    </Flex>
                    <Title size="35" c="gray.7" ms="sm">4.6</Title>
                </Flex>
            </Flex>
            <Stack gap="lg" mt="xl">
                {comments.map((item,index) => <MemoizedComment key={index} {...item} />)}
            </Stack>
            <Pagination total={10} mt="xl" boundaries={0} />
        </Paper>
    )
}



const MemoizedComment = React.memo(SignleComment,(prev,next) => {
    return prev.commet !== next.comment
})

export default Comments