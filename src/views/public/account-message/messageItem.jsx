import { Box,Text,Flex,Divider, useMantineTheme } from "@mantine/core"
import { IconUser } from "@tabler/icons-react"


function MessageItem({sender, item, date, body, you}) {


    const {shadows} = useMantineTheme()


  return (
    <>
        <Box style={{borderRadius: "10px",boxShadow: shadows.xs}} className={`${you ? "bg-white" : "bg-gray-100"}`} p="md">
            <Flex justify="space-between">
                <Flex align="center">
                    <IconUser size={16} />
                    <Text size="sm">{sender}</Text>
                </Flex>
                <Text size="sm" c="gray">{date}</Text>
                
            </Flex>
            <Divider my="lg" />
            <Box c="gray.7" fz="sm" lh="2" dangerouslySetInnerHTML={{__html: body}}></Box>
                {item.file && (
                    <Text
                        component="a"
                        href={item.file}
                        mb="lg"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue"
                        size="sm"
                        mt="md"
                        ml={item.sender.role === "user" ? "auto" : "0"}
                        >
                        📎 مشاهده فایل پیوست
                     </Text>
                )}
        </Box> 
    </>
  )
}

export default MessageItem