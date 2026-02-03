import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  GridCol,
  LoadingOverlay,
  Select,
  Textarea,
  Title,
  Autocomplete,
  TextInput,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { NavLink } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewUserTicket } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketActions";
import { NavLink, useNavigate } from "react-router-dom";
import { clearTicketCreationState } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { notifications } from "@mantine/notifications";
import { useSessionQuery, useQueryClient } from "../../../Libs/reactQuery";

function Account_Newticket() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const [status, setStatus] = useState("");
  const [departmentError, setDepartmentError] = useState(null);

  const { data: departmentsData, isLoading: loadingDepartments } = useSessionQuery({
    endpoint: "/user-myaccounts/tickets/getdepartmentsdata",
    queryKey: ["ticketDepartments"],
    enabled: !!token,
    queryOptions: { staleTime: 2 * 60 * 1000 },
    retry: (failureCount, error) => {
      const msg = typeof error === "string" ? error : error?.message || String(error);
      if (msg.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const rawDepartments = departmentsData?.departments ?? departmentsData?.data ?? departmentsData;
  const departments = Array.isArray(rawDepartments) ? rawDepartments : [];

  const { ticket, loadingNewUserTicket, errorNewUserTicket, successNewUserTicket } = useSelector((state) => state.newUserTicket)

  const form = useForm({
    initialValues: {
      title: "",
      department: "technical_support", // Set default department
      description: "",
      ticketShortDesc: "",
    },
    validate: {
      title: (value) => (value.trim() ? null : "عنوان الزامی است"),
      department: (value) => (value ? null : "بخش مربوطه الزامی است"),
      description: (value) => (value.trim() ? null : "توضیحات الزامی است"),
      ticketShortDesc: (value) =>
        value.trim() ? null : "خلاصه تیکت الزامی است",
    },
  });

  useEffect(() => {
    if (departments.length > 0 && !form.values.department) {
      form.setFieldValue("department", departments[0].value);
    }
  }, [departments]);

  useEffect(() => {
    if (successNewUserTicket) {
      // Remove ticket list from cache so when user opens list it fetches fresh data
      // (SESSION strategy has refetchOnMount: false, so invalidate alone wouldn't refetch)
      if (queryClient) {
        queryClient.removeQueries({ queryKey: ["userTickets"] });
        queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
      }
      // Redirect after short delay
      setTimeout(() => {
        navigate("/account");
      }, 1500);
    }
  }, [successNewUserTicket, queryClient, navigate]);

  useEffect(() => {
    if (ticket && ticket?.state === "ok" ) {
      notifications.show({
        title: ticket.message,
        color: "green",
        autoClose: true
      });
      if (queryClient) {
        queryClient.removeQueries({ queryKey: ["userTickets"] });
        queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
      }
    }
    if (ticket && ticket?.state === "error" ) {
        notifications.show({
          title: ticket.message,
          color: "red",
          autoClose: true
        });
      }

  }, [ticket, queryClient]);

  const shortDescDefaults = {
    technical_support: [
      "مشکل در ورود به سایت",
      "بارگذاری نشدن صفحه",
      "خطا در اپلیکیشن موبایل",
    ],
    finance: [
      "پرداخت انجام نشد",
      "مشکل در فاکتور",
      "درخواست برگشت وجه",
    ],
    customer_relations: [
      "درخواست تماس با پشتیبان",
      "نارضایتی از خدمات",
      "پیشنهاد بهبود تجربه کاربری",
    ],
  };

  const handleSubmit = (values) => {
    const selectedDepartment = departments.find(dept => dept.value === values.department);
    const departmentLabel = selectedDepartment ? selectedDepartment.label : values.department;
    dispatch(createNewUserTicket({ ...values, departmentLabel })).then((action) => {
      if (action.type?.endsWith("fulfilled") && queryClient) {
        queryClient.removeQueries({ queryKey: ["userTickets"] });
        queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
      }
    });
  };

  const [showAlert, setShowAlert] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (ticket && ticket.state) {
      setShowAlert(true);

      // Hide alert after 2 seconds
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 2000);

      // Cleanup timeout if component unmounts or the alert is hidden earlier
      return () => clearTimeout(timer);
    }
  }, [ticket]);

  useEffect(() => {
    if (
      errorNewUserTicket && 
        Number(errorNewUserTicket.status) !== 400 
        && Number(errorNewUserTicket.status) !== 401 
        && Number(errorNewUserTicket.status) !== 403
        && Number(errorNewUserTicket.status) !== 404
        && Number(errorNewUserTicket.status) !== 405
        && Number(errorNewUserTicket.status) !== 408
        && Number(errorNewUserTicket.status) !== 409
        && Number(errorNewUserTicket.status) !== 410
        && Number(errorNewUserTicket.status) !== 411
        && Number(errorNewUserTicket.status) !== 412
        && Number(errorNewUserTicket.status) !== 413
        && Number(errorNewUserTicket.status) !== 414
        && Number(errorNewUserTicket.status) !== 415
        && Number(errorNewUserTicket.status) !== 416
        && Number(errorNewUserTicket.status) !== 417
        && Number(errorNewUserTicket.status) !== 422   
        && Number(errorNewUserTicket.status) !== 429
) {
      notifications.show({
        title: errorNewUserTicket.message,
        color: "red",
        autoClose: true
      });
    }
  }, [errorNewUserTicket]);

  useEffect(() => {

    if (errorNewUserTicket?.status === 401) {
        setModalOpen(true);

      setTimeout(() => {
        setModalOpen(false);
        dispatch(clearTicketCreationState())

        navigate("/"); 
      }, 4000);
    }

    if (errorNewUserTicket?.status === 403) {
        setModalOpen(true);

      setTimeout(() => {
        dispatch(clearTicketCreationState())
        setModalOpen(false);

      }, 4000);

    }

  }, [errorNewUserTicket, dispatch, navigate]);

  const department = form.values.department;
  const suggestions = department ? shortDescDefaults[department] || [] : [];

  return (
    <>
        <ErrorMessageModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            // status={errorNewUserTicket?.status}
            message={errorNewUserTicket?.message}
        />    
      <LoadingOverlay visible={loadingNewUserTicket} />
      <Flex justify="space-between">
        <Title
          display="flex"
          style={{ alignItems: "center", textAlign: "right" }}
          component={NavLink}
          to={`/account/tickets`}
        >
          <IconArrowRight style={{ marginLeft: "10px" }} />
          ارسال تیکت
        </Title>
      </Flex>
      <Box mt="md">
        {status === "success" ? (
          <Alert variant="light" color="green" title="اطلاعیه سیستم">
            درخواست شما با موفقیت ثبت شد. کارشناسان ما در کوتاه‌ترین زمان ممکن
            پاسخ خواهند داد.
          </Alert>
        ) : (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Grid>
              <GridCol span={{ lg: 6 }}>
                <TextInput 
                label="عنوان" 
                {...form.getInputProps("title")} 
                error={
                  (ticket?.state === "error" && ticket?.error?.title) || form.errors.title ? (
                    <div>
                      {ticket?.state === "error" && ticket?.error?.title && (
                        <div>{ticket?.error?.title}</div>
                      )}
                      {form.errors.title && <div>{form.errors.title}</div>}
                    </div>
                  ) : null
                }
                />
              </GridCol>
              <GridCol span={{ lg: 6 }}>
                <Select
                  label="بخش مربوطه"
                  data={departments}
                  loading={loadingDepartments}
                  disabled={loadingDepartments}
                  placeholder={loadingDepartments ? "در حال بارگذاری..." : "انتخاب کنید"}
                  {...form.getInputProps("department")}
                  onChange={(value) => {
                    form.setFieldValue("department", value);
                    // Optional: reset ticketShortDesc on department change
                    form.setFieldValue("ticketShortDesc", "");
                  }}
                  error={
                    departmentError ? departmentError : 
                    (ticket?.state === "error" && ticket?.error?.department) || form.errors.department ? (
                      <div>
                        {ticket?.state === "error" && ticket?.error?.department && (
                          <div>{ticket?.error?.department}</div>
                        )}
                        {form.errors.department && <div>{form.errors.department}</div>}
                      </div>
                    ) : null
                  }
                />
              </GridCol>
              <GridCol span={{ lg: 12 }}>
                <Autocomplete
                  label="خلاصه تیکت"
                  placeholder="مثلاً: مشکل در پرداخت نهایی"
                  data={suggestions}
                  value={form.values.ticketShortDesc}
                  onChange={(value) =>
                    form.setFieldValue("ticketShortDesc", value)
                  }
                  error={
                    (ticket?.state === "error" && ticket?.error?.ticketShortDesc) || form.errors.ticketShortDesc ? (
                      <div>
                        {ticket?.state === "error" && ticket?.error?.ticketShortDesc && (
                          <div>{ticket?.error?.ticketShortDesc}</div>
                        )}
                        {form.errors.ticketShortDesc && <div>{form.errors.ticketShortDesc}</div>}
                      </div>
                    ) : null
                  }               
                   />
              </GridCol>
              <GridCol>
                <Textarea
                  rows={5}
                  label="توضیحات"
                  {...form.getInputProps("description")}
                  error={
                    (ticket?.state === "error" && ticket?.error?.description) || form.errors.description ? (
                      <div>
                        {ticket?.state === "error" && ticket?.error?.description && (
                          <div>{ticket?.error?.description}</div>
                        )}
                        {form.errors.description && <div>{form.errors.description}</div>}
                      </div>
                    ) : null
                  }
                />
              </GridCol>
              <GridCol>
                <Button type="submit">ارسال</Button>
              </GridCol>
            </Grid>
          </form>

          
        )}
      </Box>
    </>
  );
}

export default Account_Newticket;