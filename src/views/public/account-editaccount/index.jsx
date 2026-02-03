import { Alert, Button, Center, Flex, Grid, GridCol, Loader, LoadingOverlay, TextInput, Title } from '@mantine/core'
import { useForm, yupResolver } from '@mantine/form'
import React, { useEffect, useState } from 'react'
import DatePicker from '../../../components/datePicker';
import * as yup from 'yup';
import { IMaskInput } from 'react-imask';
import { useDispatch, useSelector } from "react-redux";
import { useSessionQuery, useQueryClient } from "../../../Libs/reactQuery";
import { updateUserInfo } from '../../../redux/users/updateuserinfo/updateUserInforActions';
import moment from "moment-jalaali";
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router';
import { clearUserInfo } from '../../../redux/users/updateuserinfo/updateUserInfoSlice';
import ErrorMessageModal from '../../../components/errormessagemodal';


const validationSchema = yup.object().shape({
    name: yup.string().required("نام الزامی است"),
    family: yup.string().required("نام خانوادگی الزامی است"),
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
        .required("تاریخ تولد الزامی است"),
});




function Account_EditAccount() {

    const dispatch = useDispatch();

    const [showAlert, setShowAlert] = useState(false);

    const token = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const { isVerified, loading: authLoading, user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const { data: userInfoData, isLoading: loadingUserInfo, error: errorUserInfo } = useSessionQuery({
      endpoint: "/users/getuserinfo",
      queryKey: ["userInfo"],
      enabled: !!token,
      retry: (failureCount, error) => {
        const msg = typeof error === "string" ? error : error?.message || String(error);
        if (msg.includes("401")) return false;
        return failureCount < 2;
      },
    });

    const userInfo = userInfoData?.data ?? userInfoData;

    const navigate = useNavigate();

    const { updateuser, loadingUpdateUser, errorUpdateUser } = useSelector((state) => state.updateUserInfo)
    
    const [modalOpen, setModalOpen] = useState(false);


    
    useEffect(() => {
        if (updateuser && updateuser.state) {
          setShowAlert(true);
    
          const timer = setTimeout(() => {
            setShowAlert(false);
          }, 2000);
    
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
    



    // Helper function to convert Persian/Jalali date to Gregorian YYYY-MM-DD format for API
    const convertPersianToGregorian = (persianDate) => {
        if (!persianDate) return "";
        
        
        try {
            // If it's already in Gregorian format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(persianDate)) {
                return persianDate;
            }
            
            // Handle Persian format - flexible parsing for both 1402/6/5 and 1402/06/05
            if (persianDate.includes('/')) {
                // Parse with flexible format to handle single digit months/days
                const gregorianMoment = moment(persianDate, 'jYYYY/jM/jD');
                
                if (gregorianMoment.isValid()) {
                    const result = gregorianMoment.format('YYYY-MM-DD');
                    return result;
                }
            }
            
            console.error('Invalid Persian date format:', persianDate);
            return "";
        } catch (error) {
            console.error('Date conversion error:', error);
            return "";
        }
    };

    // Helper function to convert Gregorian date to display format if needed
    const convertGregorianToPersian = (gregorianDate) => {
        if (!gregorianDate) return "";
        try {
            // If it's already in Persian format, return as is
            if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(gregorianDate)) {
                return gregorianDate;
            }
            // Convert from Gregorian YYYY-MM-DD to Persian format for display
            const persianMoment = moment(gregorianDate, 'YYYY-MM-DD');
            return persianMoment.format('jYYYY/jMM/jDD');
        } catch (error) {
            console.error('Date conversion error:', error);
            return gregorianDate;
        }
    };


    const form = useForm({
        initialValues: {
            name: "",
            id: "",
            family: "",
            mobile: "",
            email: "",
            nationalCode: "",
            birthday: "",
        },
        validate: yupResolver(validationSchema)
    });
    

    // Fixed useEffect to properly set form values when userInfo is loaded
    useEffect(() => {
        if (userInfo && userInfo.user) {
            
            // For the DatePicker, we need to keep it in the original format that it expects
            // Check what format your DatePicker component expects
            const birthdayValue = userInfo.user.birthday || "";
            
            form.setValues({
                name: userInfo.user.name || "",
                id: userInfo.user.id || "",
                family: userInfo.user.family || "",
                mobile: userInfo.user.mobile || "",
                email: userInfo.user.email || "",
                nationalCode: userInfo.user.nationalCode || "",
                birthday: birthdayValue // Keep original format for DatePicker
            });
            
        }
    }, [userInfo]);
    

const submitForm = async (values) => {
  const updatedValues = {
    ...values,
    mobile: values.mobile,
    birthday: convertPersianToGregorian(values.birthday),
  };
  await dispatch(updateUserInfo(updatedValues));
  if (queryClient) {
    queryClient.invalidateQueries({ queryKey: ["userInfo"] });
    queryClient.invalidateQueries({ queryKey: ["userInitialData"] });
    queryClient.invalidateQueries({ queryKey: ["userMyAccount"] });
  }
};


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
    </>
  )
}

export default Account_EditAccount