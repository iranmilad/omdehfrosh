import { Alert, Button, Center, Flex, Grid, GridCol, Loader, LoadingOverlay, TextInput, Title } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import React, { useEffect, useState } from 'react'
import DatePicker from '../../../components/datePicker';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import { fetchUserInfo } from '../../../redux/users/userinfo/userInfo';
import { updateUserInfo } from '../../../redux/users/updateuserinfo/updateUserInforActions';
import moment from "moment-jalaali";
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';
import { clearUserInfo } from '../../../redux/users/updateuserinfo/updateUserInfoSlice';
import ErrorMessageModal from '../../../components/errormessagemodal';


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

    const dispatch = useDispatch();

    const [showAlert, setShowAlert] = useState(false);



    const { isVerified, loading: authLoading, error: authError, user } = useSelector((state) => state.auth);
    
    const { userInfo, errorUserInfo, loadingUserInfo } = useSelector((state) => state.user)


    const navigate = useNavigate();

    const { updateuser, loadingUpdateUser, errorUpdateUser } = useSelector((state) => state.updateUserInfo)
    
    const [modalOpen, setModalOpen] = useState(false);

    
    useEffect(() => {
        if (updateuser && updateuser.state) {
          setShowAlert(true);
    
          // Hide alert after 2 seconds
          const timer = setTimeout(() => {
            setShowAlert(false);
          }, 2000);
    
          // Cleanup timeout if component unmounts or the alert is hidden earlier
          return () => clearTimeout(timer);
        }
      }, [updateuser]);


      useEffect(() => {
        if (
            errorUpdateUser && 
            Number(errorUpdateUser.status) !== 400 
            && Number(errorUpdateUser.status) !== 401 
            && Number(errorUpdateUser.status) !== 403
            && Number(errorUpdateUser.status) !== 404
            && Number(errorUpdateUser.status) !== 405
            && Number(errorUpdateUser.status) !== 406
            && Number(errorUpdateUser.status) !== 408
            && Number(errorUpdateUser.status) !== 409
            && Number(errorUpdateUser.status) !== 410
            && Number(errorUpdateUser.status) !== 411
            && Number(errorUpdateUser.status) !== 412
            && Number(errorUpdateUser.status) !== 413
            && Number(errorUpdateUser.status) !== 414
            && Number(errorUpdateUser.status) !== 415
            && Number(errorUpdateUser.status) !== 416
            && Number(errorUpdateUser.status) !== 417
            && Number(errorUpdateUser.status) !== 422   
            && Number(errorUpdateUser.status) !== 429
    ) {
          notifications.show({
            title: errorUpdateUser.message,
            color: "red",
            autoClose: true
          });
        }
      }, [errorUpdateUser]);


      useEffect(() => {
        if (updateuser && updateuser?.state === "ok" ) {
          notifications.show({
            title: updateuser.message,
            color: "green",
            autoClose: true
          });
        }
        if (updateuser && updateuser?.state === "error" ) {
            notifications.show({
              title: updateuser.message,
              color: "red",
              autoClose: true
            });
          }

      }, [errorUpdateUser, updateuser]);
      


    useEffect(() => {


        if (errorUpdateUser?.status === 401) {
            setModalOpen(true);

          setTimeout(() => {
            setModalOpen(false);
            dispatch(clearUserInfo())

            navigate("/"); 
          }, 4000);
        }



        if (errorUpdateUser?.status === 403) {
            setModalOpen(true);

          setTimeout(() => {
            dispatch(clearUserInfo())
            setModalOpen(false);

          }, 4000);


        }

    }, [errorUpdateUser, dispatch, navigate]);
    


    useEffect(() => {
        dispatch(verifyToken());
      }, [dispatch]);


    useEffect(() => {

      if (user) {
        dispatch(fetchUserInfo())
      }

    }, [dispatch, user])



    const form = useForm({
        initialValues: {
            name: userInfo?.user?.name || "",
            id: userInfo?.user?.id || "",
            family: userInfo?.user?.family || "",
            // mobile: userInfo?.user?.mobile || "",
            email: userInfo?.user?.email || "",
            nationalCode: userInfo?.user?.nationalCode || "",
            birthday: userInfo?.user?.birthday || "",
        },
        validate: yupResolver(validationSchema)
    });
    

    useEffect(() => {
        if (userInfo && userInfo.user) {
            form.setValues({
                name: userInfo.user.name || "",
                family: userInfo.user.family || "",
                mobile: userInfo.user.mobile || "",
                email: userInfo.user.email || "",
                nationalCode: userInfo.user.nationalCode || "",
                birthday: userInfo.user.birthday || ""
                    
            });
        }
    }, [userInfo]);
    

    const submitForm = async (values) => {
        const updatedValues = {
            ...values,
            mobile: values.mobile, // Rename 'mobile' to 'phone'
        };

       await dispatch(updateUserInfo(updatedValues));

       await dispatch(fetchUserInfo())
    }


    if (loadingUserInfo) {
        return <Center><Loader /></Center>;
    }
    
    if (!userInfo || !userInfo.user) {
        return <Center>خطایی رخ داده است. لطفاً دوباره تلاش کنید.</Center>;
    }



  return (
    <>
        <ErrorMessageModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            // status={errorUpdateUser?.status}
            message={errorUpdateUser?.message}
        />
        <Title mb="lg">جزئیات حساب</Title>
        <form onSubmit={form.onSubmit((values) => submitForm(values))}>
            <Grid>
                <GridCol span={{lg: 6}}>
                    <TextInput 
                        placeholder='نام خود را وارد کنید' 
                        label="نام" 
                        {...form.getInputProps("name")} 
                        error={
                            (updateuser?.state === "error" && updateuser?.errors?.name) || form.errors.name ? (
                              <div>
                                {updateuser?.state === "error" && updateuser?.errors?.name && (
                                  <div>{updateuser?.errors?.name}</div>
                                )}
                                {form.errors.name && <div>{form.errors.name}</div>}
                              </div>
                            ) : null
                          }                    
                          />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput 
                        placeholder='نام خانوادگی خود را کنید' 
                        label="نام خانوادگی" 
                        {...form.getInputProps("family")} 
                        error={
                            (updateuser?.state === "error" && updateuser?.errors?.family) || form.errors.family ? (
                              <div>
                                {updateuser?.state === "error" && updateuser?.errors?.family && (
                                  <div>{updateuser?.errors?.family}</div>
                                )}
                                {form.errors.family && <div>{form.errors.family}</div>}
                              </div>
                            ) : null
                          }
                        />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput  
                        placeholder='شماره تلفن خود را کنید' 
                        label="شماره تلفن" 
                        {...form.getInputProps("mobile")} 
                        // error={updateuser?.state === "error" && updateuser?.error?.mobile}
                        disabled={true}
                    />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput 
                        placeholder='ایمیل خود را کنید'  
                        label="ایمیل" 
                        {...form.getInputProps("email")}
                        error={
                            (updateuser?.state === "error" && updateuser?.errors?.email) || form.errors.email ? (
                              <div>
                                {updateuser?.state === "error" && updateuser?.errors?.email && (
                                  <div>{updateuser?.errors?.email}</div>
                                )}
                                {form.errors.email && <div>{form.errors.email}</div>}
                              </div>
                            ) : null
                          }
                        />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <TextInput  
                        placeholder='کدملی خود را کنید' 
                        label="کدملی" 
                        {...form.getInputProps("nationalCode")} 
                        error={
                            (updateuser?.state === "error" && updateuser?.errors?.nationalCode) || form.errors.nationalCode ? (
                              <div>
                                {updateuser?.state === "error" && updateuser?.errors?.nationalCode && (
                                  <div>{updateuser?.errors?.nationalCode}</div>
                                )}
                                {form.errors.nationalCode && <div>{form.errors.nationalCode}</div>}
                              </div>
                            ) : null
                          }                    
                          />
                </GridCol>
                <GridCol span={{lg: 6}}>
                    <DatePicker 
                        placeholder='تاریخ تولد خود را کنید' 
                        label="تاریخ تولد" 
                        {...form.getInputProps('birthday')} 
                        styles={{ input: { textAlign: "left" } }} 
                        dir='ltr'
                        error={
                            (updateuser?.state === "error" && updateuser?.errors?.birthday) || form.errors.birthday ? (
                              <div>
                                {updateuser?.state === "error" && updateuser?.errors?.birthday && (
                                  <div>{updateuser?.errors?.birthday}</div>
                                )}
                                {form.errors.birthday && <div>{form.errors.birthday}</div>}
                              </div>
                            ) : null
                          } 
                        />
                </GridCol>
            </Grid>
            <Button mt="40" type='submit' loading={loadingUpdateUser}>ذخیره</Button>

        </form>


        {/* {updateuser && updateuser?.state === "ok" ? (
            <Flex mt="md">
                {showAlert && <Alert>{updateuser?.message}</Alert>}
            </Flex>
            ) : updateuser && updateuser?.state === "error" ? (
            <Flex>
                <Alert color="red">{updateuser?.message}</Alert>
            </Flex>
            ) : null} */}

        </>
  )
}

export default Account_EditAccount