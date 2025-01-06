import {
  LoadingOverlay,
  Title,
  Button,
  Flex,
  Stack,
  ThemeIcon,
  Skeleton,
  Center,
} from "@mantine/core";
import { useData } from "../../../Libs/api";
import NotificationItem from "./notificationItem";
import InfoBox from '../../../components/InfoBox';

function Account_Notifications() {
  const { data, isLoading } = useData({ url: "/notifications",queryKey:['notifications'] });
  console.log(data)
  return (
    <>
      {!isLoading ? (
        <>
          <Flex justify="space-between" align="center" mb="xl">
            <Title>پیام ها</Title>
          </Flex>
          {data ? (
            <Stack>
            {data.map((item, index) => (
              <NotificationItem key={index} {...item} />
            ))}
          </Stack>
          ) : (
            <Center><InfoBox>پیامی برای نمایش وجود ندارد</InfoBox></Center>
          )}
        </>
      ) : (
          <>
          <Skeleton h={20} w="100px" mb="xl" />
        <Stack>
          {Array(3)
            .fill(0)
            .map((item, index) => (
              <Flex key={index} justify="space-between">
                <Flex align="center" gap={10}>
                  <Skeleton height={50} circle />
                  <Flex direction="column" gap={3}>
                    <Skeleton h={20} w="150px" />
                    <Skeleton h={20} w="100px" />
                  </Flex>
                </Flex>
                <Skeleton h={40} w="70px" />
              </Flex>
            ))}
        </Stack>
          </>
      )}
    </>
  );
}

export default Account_Notifications;
