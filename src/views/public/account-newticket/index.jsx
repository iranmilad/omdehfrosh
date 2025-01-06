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
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";
import { NavLink } from "react-router";

import { useForm } from "@mantine/form";
import {
  TextInput,
  Select,
  Textarea,
  Button,
  Flex,
  Box,
  Grid,
  GridCol,
  Title,
  Alert,
} from "@mantine/core";
import { NavLink } from "react-router-dom";
import { IconArrowRight } from "@tabler/icons-react";
import { useSend } from "../../../Libs/api";
import { useState } from "react";

function Account_Newticket() {
  const [status, setStatus] = useState("");
  const { mutateAsync, isPending } = useSend({ url: "/tickets/send" });
  const form = useForm({
    initialValues: {
      title: "",
      department: "",
      description: "",
    },

    validate: {
      title: (value) => (value.trim() ? null : "عنوان الزامی است"),
      department: (value) => (value ? null : "بخش مربوطه الزامی است"),
      description: (value) => (value.trim() ? null : "توضیحات الزامی است"),
    },
  });

  const handleSubmit = (values) => {
    console.log("Form Values:", values);
    mutateAsync(
      { ...values },
      {
        onSuccess: (data) => {
          if (data?.errors) {
            form.setErrors(data.errors);
          }
          setStatus("success");
        },
      }
    );
  };

  return (
    <>
      <LoadingOverlay visible={isPending} />
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
                <TextInput label="عنوان" {...form.getInputProps("title")} />
              </GridCol>
              <GridCol span={{ lg: 6 }}>
                <Select
                  label="بخش مربوطه"
                  data={[
                    { label: "پشتیبانی فنی", value: "technical-support" },
                    { label: "مالی و حسابداری", value: "finance" },
                    { label: "ارتباط با مشتریان", value: "customer-relations" },
                  ]}
                  {...form.getInputProps("department")}
                />
              </GridCol>
              <GridCol>
                <Textarea
                  rows={5}
                  label="توضیحات"
                  {...form.getInputProps("description")}
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
