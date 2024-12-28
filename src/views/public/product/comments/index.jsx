import { Avatar, Flex, Pagination, Paper, Rating, ScrollArea, Stack, Text, Title } from "@mantine/core"
import React from "react"
import XTitle from "../../../../components/title"


const Comments = (props) => {
    const {rating,count,comments} = props
    return (
        <Paper mt="lg" px="lg">
            <Flex mt="lg" w="100%" justify="space-between" align="baseline" style={{borderBottom: "1px solid #cbd5e1"}} pb="30">
                <XTitle size="md">نقد و بررسی کاربران</XTitle>
                <Flex direction="column" align="end">
                    <Rating size="md" mb="xs" value={rating}  readOnly />
                    <Text c="gray" size="sm">بر اساس نظرات {count} کاربر</Text>
                </Flex>
            </Flex>
            <Stack gap="lg" mt="xl">
                {comments.map((item,index) => <MemoizedComment key={index} {...item} />)}
            </Stack>
            <Pagination total={10} mt="xl" boundaries={0} />
        </Paper>
    )
}

const SignleComment = (props) => {
    const {name,date,rating,comment,status,seller} = props
    return (
        <Flex justify="start">
            <Avatar size="lg" radius="xl" me="md" />
            <div className="w-full">
                <Flex justify="space-between" align="center" w="100%" mb="xs">
                    <Flex align="start" direction="column">
                        <Text size="sm" fw="500">{name}</Text>
                        <Text size="xs" c="gray" fw="600">{seller}</Text>
                    </Flex>
                    <Flex align="end" direction="column">
                        <Text size="xs" c="gray">{date}</Text>
                        <Rating defaultValue={rating} readOnly />
                    </Flex>
                </Flex>
                {status === "agreed" && <Text size="sm" c="gray">{comment}</Text>}
                {status === "pending" && <Text size="sm" c="gray">دیدگاه شما ارسال شده است و پس از بررسی نمایش داده خواهد شد.</Text>}
            </div>
        </Flex>
    )
}

const MemoizedComment = React.memo(SignleComment,(prev,next) => {
    return prev.commet !== next.comment
})

export default Comments