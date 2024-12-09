import { Avatar, Flex, Paper, Rating, Text, Title } from "@mantine/core"
import React from "react"


const Comments = (props) => {
    const {rating,count,comments} = props
    return (
        <Paper mt="lg" px="xl">
            <Flex mt="lg" w="100%" justify="space-between" align="baseline" style={{borderBottom: "1px solid #cbd5e1"}} pb="30">
                <Title size="md">نقد و بررسی کاربران</Title>
                <Flex direction="column" align="end">
                    <Rating size="md" mb="xs" value={rating}  readOnly />
                    <Text c="gray" size="sm">بر اساس نظرات {count} کاربر</Text>
                </Flex>
            </Flex>
            {comments.map((item,index) => <MemoizedComment key={index} {...item} />)}
        </Paper>
    )
}

const SignleComment = (props) => {
    const {name,date,rating,comment} = props
    return (
        <Flex mt="md" align="start" justify="space-between">
            <Flex align="start">
                <Avatar size="lg" radius="xl" me="md" />
                <div>
                    <Text size="sm" fw="500">{name}</Text>
                    <Text size="sm" c="gray">{comment}</Text>
                </div>
            </Flex>
            <Flex align="end" direction="column">
                <Text size="xs" c="gray">{date}</Text>
                <Rating defaultValue={rating} readOnly />
            </Flex>
        </Flex>
    )
}

const MemoizedComment = React.memo(SignleComment,(prev,next) => {
    return prev.commet !== next.comment
})

export default Comments