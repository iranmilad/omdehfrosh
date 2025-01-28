import { Button, Grid, GridCol, LoadingOverlay, TextInput, Title } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import React, { useEffect } from 'react'
import DatePicker from '../../../components/datePicker';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import {useSend,useData} from "../../../Libs/api"


const validationSchema = yup.object().shape({
    name: yup.string().required("نام الزامی است"),
    family: yup.string().required("نام خانوادگی الزامی است"),
    mobile: yup
        .string()
        .matches(/^09[0-9]{9}$/, "فرمت شماره موبایل صحیح نیست")
        .required("شماره موبایل الزامی است"),
    email: yup
        .string()
        .email("فرمت ایمیل صحیح نیست")
        .required("ایمیل الزامی است"),
    nationalCode: yup
        .string()
        .matches(/^[0-9]{10}$/, "کد ملی باید 10 رقم باشد")
        .required("کد ملی الزامی است"),
    birthday: yup
        .string()
        .matches(/^\d{4}\/\d{1,2}\/\d{1,2}$/, "فرمت تاریخ تولد صحیح نیست")
        .required("تاریخ تولد الزامی است"),
});




function Account_EditAccount() {
    const {data,isLoading} = useData({url: '/edit-account',queryKey:['edit-account']});
    const {isPending,mutateAsync} = useSend({url: '/edit-account'})
    const form = useForm({
        initialValues: {
            name: "",
            family: "",
            mobile: "",
            email: "",
            nationalCode: "",
            birthday: "",
        },
        validate: yupResolver(validationSchema)
    });

    const submitForm = (values) => {
        mutateAsync({
            data: values
        },{})
    }
    useEffect(() => {
        form.setValues(data)
    } , [data])
  return (
    <>
    <LoadingOverlay visible={isLoading} zIndex={1000} />
        <Title mb="lg">جزئیات حساب</Title>
        <form onSubmit={form.onSubmit((values) => submitForm(values))}>
            <Grid>
                <GridCol span={{lg: 6}}>
                    <TextInput placeholder='نام خود را وارد کنید' label="نام" {...form.getInputProps("name")} />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput placeholder='نام خانوادگی خود را کنید' label="نام خانوادگی" {...form.getInputProps("family")} />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput  placeholder='شماره تلفن خود را کنید' label="شماره تلفن" {...form.getInputProps("mobile")} />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput placeholder='ایمیل خود را کنید'  label="ایمیل" {...form.getInputProps("email")} />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput  placeholder='کدملی خود را کنید' label="کدملی" {...form.getInputProps("nationalCode")} />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <DatePicker placeholder='تاریخ تولد خود را کنید' label="تاریخ تولد" {...form.getInputProps('birthday')} styles={{ input: { textAlign: "left" } }} dir='ltr' />
                </GridCol>
            </Grid>
            <Button mt="40" type='submit' loading={isPending}>ذخیره</Button>
        </form>
    </>
  )
}

export default Account_EditAccount