import { Flex,Avatar,Text,Rating, Box, Paper } from "@mantine/core"

const SignleComment = (props) => {
    const {name,date,rating,comment,status,seller,product,paper=false} = props
    const PaperType = ({children}) => paper ? <Paper>{children}</Paper> : <Box>{children}</Box> 
    return (
        <PaperType>
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
        </PaperType>
    )
}

export default SignleComment