import {
    Title,
    Divider,
    Alert,
    Text,
    Box,
    Flex,
    Stack,
    ActionIcon,
    Modal,
    SimpleGrid,
    Badge,
    Skeleton,
    useMantineTheme,
    Overlay,
    Loader,
  } from "@mantine/core";
  import { IconArrowRight, IconInfoCircle, IconUser } from "@tabler/icons-react";
  import { NavLink, useNavigate, useParams } from "react-router";
  import LabelValue from "../../../components/labelValue";
  import MessageItem from "./messageItem";
  import { useDisclosure } from "@mantine/hooks";
  import { useDispatch, useSelector } from "react-redux";
  import { useEffect, useState } from "react";
  import { getUserTicketById } from "../../../redux/usermyaccounts/usermyaccounts/getusertickets/getUserTicketById/getUserTicketByIdActions";
  import { sendTicketMessage } from "../../../redux/usermyaccounts/usermyaccounts/newmessagetickets/newMessageTicketsActions";
  import { notifications } from "@mantine/notifications";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { clearSendMessageStatus } from "../../../redux/usermyaccounts/usermyaccounts/newmessagetickets/newMessageTicketsSlice";
import { handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";
import { Button } from "@mantine/core";
import { IconSend } from "@tabler/icons-react";

function Account_Message() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [messageText, setMessageText] = useState("");
    const [file, setFile] = useState(null);
    const [errors, setErrors] = useState({});
    const { shadows } = useMantineTheme();
    const navigate = useNavigate();
    const [modalErrorMessage, setModalErrorMessage] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
  
    const { userTicketById, loadingUserTicketById } = useSelector(
      (state) => state.userTicketsById
    );
  
    const { ticketData, sending, success, error } = useSelector(
      (state) => state.ticketSendMessage
    );

    useEffect(() => {
        if (ticketData?.state === "ok") {
          notifications.show({
            title: ticketData.message,
            color: "green",
            autoClose: true,
          });
          setTimeout(() => {
            dispatch(clearSendMessageStatus());
          }, 2000); 
        }
      
        if (ticketData?.state === "error") {
          notifications.show({
            title: ticketData.message,
            color: "red",
            autoClose: true,
          });
        }
      }, [ticketData]);

      useEffect(() => {
        if (!error?.status) return;
      
        const status = Number(error.status);
        const clientErrors = [
          400, 401, 403, 404, 405, 406, 408,
          409, 410, 411, 412, 413, 414, 415,
          416, 417, 422, 429,
        ];
      
        if (clientErrors.includes(status)) {
          // Show modal and call handler
          setModalErrorMessage(error.message);
          setModalOpen(true);
          handleKnownErrors(status, setModalOpen, navigate);
        } else {
          // Show single red notification for 5xx or unknown errors
          notifications.show({
            title: error.message || "خطا",
            color: "red",
            autoClose: true,
          });
        }
      
        // Clear error state
        setTimeout(() => {
          dispatch(clearSendMessageStatus());
        }, 100);
      }, [error]);

    useEffect(() => {
      if (id) dispatch(getUserTicketById({ id }));
    }, [dispatch, id]);
  
    const [opened, { open, close }] = useDisclosure(false);
  
    const priorityMap = {
      high: { label: "اولویت فوری", color: "red" },
      medium: { label: "اولویت متوسط", color: "yellow" },
      low: { label: "اولویت پایین", color: "gray" },
    };
  
    const priorityInfo = priorityMap[userTicketById?.priority] || {
      label: "اولویت نامشخص",
      color: "gray",
    };
  
    const validateForm = () => {
      const newErrors = {};
      if (!messageText.trim()) {
        newErrors.messageText = "لطفاً پیام خود را وارد کنید.";
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSendMessage = () => {
      if (!validateForm()) return;
  
      dispatch(
        sendTicketMessage({
          ticketId: id,
          messageText: messageText.trim(),
          messageFile: file,
        })
      ).then((action) => {
        if (action.type.endsWith("fulfilled")) {
          setMessageText("");
          setFile(null);
          setErrors({});
          dispatch(getUserTicketById({ id }));
        }
      });
    };
  
    return (
      <>
        {/* Full Screen Loading Overlay */}
        {sending && (
          <Overlay
            color="#000"
            backgroundOpacity={0.6}
            blur={2}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                textAlign: 'center',
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Loader size="lg" color="blue" />
              <Text size="md" mt="lg" c="dimmed" weight={500}>
                در حال ارسال پیام...
              </Text>
            </Box>
          </Overlay>
        )}

        <ErrorMessageModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            message={modalErrorMessage}
        />
        {!loadingUserTicketById ? (
          <>
            {userTicketById?.ticketStatus === "closed" && (
              <Alert variant="light" color="yellow" mb="md">
                <Text c="yellow" size="sm">
                  این تیکت بسته شده است. در صورتی که نیاز به پشتیبانی دارید، تیکت
                  جدیدی باز کنید.
                </Text>
              </Alert>
            )}
            <Flex justify="space-between">
              <Title
                display="flex"
                style={{ alignItems: "center" }}
                component={NavLink}
                to={`/account/tickets`}
              >
                <IconArrowRight style={{ marginLeft: "10px" }} />
                {userTicketById?.ticketId + "#"} {userTicketById?.ticketTitle}
              </Title>
              <ActionIcon variant="transparent" onClick={open}>
                <IconInfoCircle />
              </ActionIcon>
            </Flex>
            <Divider my="lg" />
            <Stack>
              {userTicketById?.messages?.map((item, index) => (
                <Box key={index}>
                  <MessageItem
                    sender={item.sender.name}
                    date={userTicketById.updatedAt || userTicketById.createdAt}
                    body={item.message}
                    you={item.sender.role === "user"}
                    item={item}
                  />
                </Box>
              ))}
            </Stack>
  
            <Modal opened={opened} title="اطلاعات تیکت" onClose={close}>
              {userTicketById?.messages && (
                <SimpleGrid mt="md">
                  <LabelValue
                    label="درخواست کننده : "
                    value={userTicketById.requesterName}
                  />
                  <LabelValue label="بخش : " value={userTicketById.teamName} />
                  <LabelValue
                    label="ارسال شده : "
                    value={userTicketById.createdAt}
                  />
                  <LabelValue
                    label="آخرین به روز رسانی : "
                    value={userTicketById.updatedAt}
                  />
                  <LabelValue
                    label="وضعیت/اولویت : "
                    value={
                      <>
                        <Badge
                          color={
                            userTicketById.ticketStatus === "closed" ? "gray" : ""
                          }
                        >
                          {userTicketById.ticketStatus === "closed"
                            ? "بسته شده"
                            : "باز"}
                        </Badge>
                        <Badge color={priorityInfo.color}>
                          {priorityInfo.label}
                        </Badge>
                      </>
                    }
                  />
                </SimpleGrid>
              )}
            </Modal>
            <Divider my="md" />
  
            {userTicketById?.ticketStatus !== "closed" && (
              <Box
                p="md"
                mt="md"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text size="sm" mb="xs">
                  ارسال
                </Text>
                <Stack spacing="xs">
                  <div style={{ position: "relative" }}>
                    <textarea
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        borderRadius: "6px",
                        padding: "10px",
                        border: errors.messageText
                          ? "1px solid red"
                          : "1px solid #ced4da",
                      }}
                      placeholder="پیام خود را بنویسید..."
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        if (errors.messageText)
                          setErrors((prev) => ({ ...prev, messageText: null }));
                      }}  
                    />
                    {(ticketData?.state === "error" && (ticketData?.errors?.message || ticketData?.errors?.file)) || errors.messageText ? (
                        <div>
                            {ticketData?.state === "error" && ticketData?.errors?.message && (
                            <Text color="red" size="xs" mt={4}>
                                {ticketData.errors.message}
                            </Text>
                            )}
                            {ticketData?.state === "error" && ticketData?.errors?.file && (
                            <Text color="red" size="xs" mt={4}>
                                {ticketData.errors.file}
                            </Text>
                            )}
                            {errors.messageText && (
                            <Text color="red" size="xs" mt={4}>
                                {errors.messageText}
                            </Text>
                            )}
                        </div>
                        ) : null}
                  </div>
                <Flex justify="space-between" align="center">
                  <div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFile(file);
                          setErrors((prev) => ({ ...prev, file: null }));
                        }
                      }}
                    />
                    {errors.file && (
                      <Text color="red" size="xs" mt={2}>
                        {errors.file}
                      </Text>
                    )}
                  </div>

                  {/* Send Button */}
                  <Button
                    color="blue"
                    variant="filled"
                    disabled={sending}
                    onClick={handleSendMessage}
                    leftSection={<IconSend size={16} />}
                    size="sm"
                    radius="md"
                    style={{
                      minWidth: '80px',
                      fontWeight: 500
                    }}
                  >
                    ارسال
                  </Button>
                </Flex>
                </Stack>
                {error && (
                  <Text color="red" size="xs" mt="sm">
                    {typeof error === "string" ? error : error.message}
                  </Text>
                )}
              </Box>
            )}
          </>
        ) : (
          <>
            <Flex justify="space-between">
              <Title
                display="flex"
                style={{ alignItems: "center" }}
                component={NavLink}
                to={`/account/tickets`}
              >
                <IconArrowRight style={{ marginLeft: "10px" }} />
                <Skeleton height={20} width="300px" />
              </Title>
            </Flex>
            <Divider my="lg" />
            <Box
              style={{ borderRadius: "10px", boxShadow: shadows.xs }}
              className="bg-white"
              p="md"
            >
              <Flex justify="space-between">
                <Flex align="center">
                  <IconUser size={16} />
                  <Text size="sm">
                    <Skeleton height={20} width="100px" />
                  </Text>
                </Flex>
                <Text size="sm" c="gray">
                  <Skeleton height={20} width="60px" />
                </Text>
              </Flex>
              <Divider my="lg" />
              <Skeleton height={20} width="100%" mt={6} />
              <Skeleton height={20} width="100%" mt={6} />
              <Skeleton height={20} width="70%" mt={6} />
            </Box>
          </>
        )}
      </>
    );
  }
  
  export default Account_Message;