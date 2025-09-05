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
import { useSend } from "../../../Libs/api";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createNewUserTicket } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketActions";
import { NavLink, useNavigate } from "react-router-dom";
import { clearTicketCreationState } from "../../../redux/usermyaccounts/usermyaccounts/newuserticket/newUserTicketSlice";
import ErrorMessageModal from "../../../components/errormessagemodal";
import { notifications } from "@mantine/notifications";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

function Account_Newticket() {

  const navigate = useNavigate();

  const [status, setStatus] = useState("");
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState(null);

  const dispatch = useDispatch();

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

  // Fetch departments from API
  const fetchDepartments = async () => {
    const token = localStorage.getItem("user");

    try {
      setLoadingDepartments(true);
      setDepartmentError(null);

      const response = await fetch(getApiUrl("/user-myaccounts/tickets/getdepartmentsdata"), {
        method: "GET",
        headers: new Headers({
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        const error = {
          status: response.status,
          message: errorData?.message || getHttpCodeMessage(response.status),
        };
        
        throw error;
      }

      const data = await response.json();
      
      let departmentsData;
      // Transform API response to Select component format
      if (data && Array.isArray(data.departments)) {
        departmentsData = data.departments;
      } else if (data && Array.isArray(data.data)) {
        departmentsData = data.data;
      } else if (data && Array.isArray(data)) {
        departmentsData = data;
      } else {
        // Fallback to hardcoded data if API response is unexpected
        departmentsData = [
          { label: "پشتیبانی فنی", value: "technical_support" },
          { label: "مالی و حسابداری", value: "finance" },
          { label: "ارتباط با مشتریان", value: "customer_relations" },
        ];
      }
      
      setDepartments(departmentsData);
      
      // Set default department if form doesn't have one and departments are available
      if (departmentsData.length > 0 && !form.values.department) {
        form.setFieldValue("department", departmentsData[0].value);
      }
      
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartmentError(error.message || "خطا در بارگذاری بخش‌ها");
      
      // Fallback to hardcoded data on error
      const fallbackDepartments = [
        { label: "پشتیبانی فنی", value: "technical_support" },
        { label: "مالی و حسابداری", value: "finance" },
        { label: "ارتباط با مشتریان", value: "customer_relations" },
      ];
      
      setDepartments(fallbackDepartments);
      
      // Set default department with fallback data
      if (!form.values.department) {
        form.setFieldValue("department", fallbackDepartments[0].value);
      }
    } finally {
      setLoadingDepartments(false);
    }
  };

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if ( successNewUserTicket) {

      // Redirect after short delay
      setTimeout(() => {
        navigate("/account"); // You can use full URL if needed
      }, 1500);
    }
  }, [ticket, loadingNewUserTicket, errorNewUserTicket, successNewUserTicket, navigate]);

  useEffect(() => {
    if (ticket && ticket?.state === "ok" ) {
      notifications.show({
        title: ticket.message,
        color: "green",
        autoClose: true
      });
    }
    if (ticket && ticket?.state === "error" ) {
        notifications.show({
          title: ticket.message,
          color: "red",
          autoClose: true
        });
      }

  }, [ticket]);

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
    console.log(values);
    
    // Find the department label
    const selectedDepartment = departments.find(dept => dept.value === values.department);
    const departmentLabel = selectedDepartment ? selectedDepartment.label : values.department;
    
    // Dispatch with department label included
    dispatch(createNewUserTicket({ 
      ...values, 
      departmentLabel 
    }));
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
          style={{ alignItems: "center" }}
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