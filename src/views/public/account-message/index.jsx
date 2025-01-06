import {Title,Divider, Notification, Alert, Text, Box, Flex, useMantineTheme, Stack, ActionIcon, Modal, Grid, Badge, SimpleGrid, LoadingOverlay, Skeleton} from "@mantine/core"
import {IconArrowRight, IconInfoCircle, IconUser} from "@tabler/icons-react"
import { NavLink, useParams } from "react-router";
import { useData } from "../../../Libs/api";
import LabelValue from "../../../components/labelValue";
import { useDisclosure } from "@mantine/hooks";
import MessageItem from "./messageItem";

function Account_Message() {
    const {id} = useParams();
    const {shadows} = useMantineTheme();
    const {data,isLoading} = useData({url: `/tickets/id`,queryKey: ['ticket',id]});
    const [opened,{open,close}] = useDisclosure(false);
  return (
    <>
    {!isLoading ? (
        <>
                {data.info.status === "closed" && (
        <Alert variant="light" color="yellow"  mb="md">
        <Text c="yellow" size="sm">این تیکت بسته شده است. در صورتی که نیاز به پشتیبانی دارید، تیکت جدیدی باز کنید.</Text>
    </Alert>
    )}
        <Flex justify="space-between">
            <Title display="flex" style={{ alignItems: "center" }} component={NavLink} to={`/account/tickets`}>
                <IconArrowRight style={{ marginLeft: "10px" }} />
                {data.id+"#"} {data.info.title}
            </Title>
            <ActionIcon variant="transparent" onClick={open}><IconInfoCircle /></ActionIcon>
        </Flex>
        <Divider my="lg" />
        <Stack>
        {data.messages.map((item,index) => <MessageItem key={index} {...item} />)}
        </Stack>
        <Modal opened={opened} title="اطلاعات تیکت" onClose={close}>
            {data && data.info ? (
                <SimpleGrid mt="md">
                    <LabelValue label="درخواست کننده : " value={data.info.requester} />
                    <LabelValue label="بخش : " value={data.info.department} />
                    <LabelValue label="ارسال شده : " value={data.info.sentDate} />
                    <LabelValue label="آخرین به روز رسانی : " value={data.info.lastUpdate} />
                    <LabelValue label="وضعیت/اولویت : " value={<><Badge color={data.info.status === "closed" ? "gray" : ""}>{data.info.status === "closed" ? "بسته شده" : "باز"}</Badge> متوسط</>} />
                </SimpleGrid>
            ) : null}

        </Modal>
        </>
    ) : <>
        <Flex justify="space-between">
            <Title display="flex" style={{ alignItems: "center" }} component={NavLink} to={`/account/tickets`}>
                <IconArrowRight style={{ marginLeft: "10px" }} />
                <Skeleton height={20} width="300px" />
            </Title>
        </Flex>
        <Divider my="lg" />
        <Box style={{borderRadius: "10px",boxShadow: shadows.xs}} className="bg-white" p="md">
            <Flex justify="space-between">
                <Flex align="center">
                    <IconUser size={16} />
                    <Text size="sm"><Skeleton height={20} width="100px" /></Text>
                </Flex>
                <Text size="sm" c="gray"><Skeleton height={20} width="60px" /></Text>
            </Flex>
            <Divider my="lg" />
            <Skeleton height={20} width="100%"mt={6} />
            <Skeleton height={20} width="100%"mt={6} />
            <Skeleton height={20} width="70%"mt={6} />
        </Box>
    </>}
    

    </>
  )
}

export default Account_Message