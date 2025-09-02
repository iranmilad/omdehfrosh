import {
  Grid,
  GridCol,
  Paper,
  Radio,
  Title,
  Group,
  Stack,
  Text,
  Image,
  TextInput,
  Flex,
  Button,
  Center,
  Loader,
} from "@mantine/core";
import CartStepper from "../../../components/cartStepper";
import { data, NavLink, useNavigate, useParams } from "react-router";
import PaymentCalc from "../../../components/payment_calc";
import { useForm } from "@mantine/form";
import { IconBuildingCommunity, IconCreditCard } from "@tabler/icons-react";
import { useEffect, useLayoutEffect, useState } from "react";
import {useSend} from '../../../Libs/api'
import { useDispatch, useSelector } from "react-redux";
import { toggleLoading } from "../../../redux/global";
import { notifications } from '@mantine/notifications';
import { useCookies } from "react-cookie";
import { verifyToken } from "../../../redux/auth/authusers/auth";
import PaymentCalcReceipt from "../../../components/payment_calc_receipt";
import { updateFinalReceiptWithDiscount } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountActions";
import { fetchFinalReceipt } from "../../../redux/cartfinalreceipt/cartfinalreceipt";
import { getAllGateWaysData } from "../../../redux/gatewaysdata/gatewaysdata/gateWaysDataActions";
import { clearCartFinalReceiptUpdate } from "../../../redux/cartfinalreceipt/cartfinalreceiptupdate/cartFinalReceiptUpdateDiscountSlice";
import ErrorMessageModal from '../../../components/errormessagemodal';
import { handleForbiddenError, handleKnownErrors } from "../../../Libs/errorstatushandle/httpErrorStatus";

import { updateFinalReceiptDeleteDiscountCode } from "../../../redux/cartfinalreceipt/cartfinalreceiptdeletediscount/cartfinalreceiptdeletediscountActions";
import { getOrderByReceiptID } from "../../../redux/orders/orders/getorderbyreceiptid/getOrderByReceiptIDActions";
import PaymentCalcReceiptSellers from "../../../components/payment_calc_receipt_sellers";


const PaymentSellers = () => {

  const { receipt_id } = useParams();

  const dispatch = useDispatch();

  const { gateways: fetchedGateways, loading, error } = useSelector((state) => state.gateWaysData); // Use the state from Redux

  const [paymentURL , setPaymentURL]  = useState("");

  const {mutateAsync} = useSend({url:"https://jsonplaceholder.typicode.com/posts"})

  const [cookies, setCookie] = useCookies(["user"]);

  const [pageActive, setPageActive] = useState(false);
  const { isVerified, loading: authLoading, error: authError } = useSelector((state) => state.auth);

  const { orderfinalreceipt } = useSelector((state) => state.cartfinalreceipt); // Access cartfinalreceipt from Redux




  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  // useEffect(() => {
  //   if (cartfinalreceipt?.cartDiscounts?.discountCode?.code) {
  //     setIsDiscountApplied(true);
  //   } else {
  //     setIsDiscountApplied(false);
  //   }
  // }, [cartfinalreceipt]);
  



  const navigate = useNavigate();
  const form = useForm({
    initialValues: {
      gateway: {},
    },
  });

  const { orderByReceiptID, loadingByReceiptID, errorByReceiptID } = useSelector(
    (state) => state.getOrderByReceiptID
  );

  useEffect(() => {
    // dispatch(getAllGateWaysData()); // Dispatch the action to fetch all gateways data
    // dispatch(fetchFinalReceipt());
    dispatch(getOrderByReceiptID({receipt_id: receipt_id}));

  }, [dispatch]);

  const cards = fetchedGateways?.map((item) => (
    <Radio.Card
      p="lg"
      radius="md"
      value={item?.info.name} // Use the 'name' as the value of the radio button
      key={item?.info.name}
      defaultChecked
      styles={{
        card: {
          borderColor:
            form.getValues().gateway.name === item?.info.name
              ? "var(--mantine-primary-color-5)"
              : "transparent",
        },
      }}
    >
      <Group wrap="nowrap" align="center">
        <Radio.Indicator />
        <div
          style={{
            color:
              form.getValues().gateway.name === item.info.name
                ? "var(--mantine-primary-color-5)"
                : "var(--mantine-color-gray-6)",
          }}
        >
          <img src={item.icon} alt={item.label} style={{ width: 30, height: 30 }} />
        </div>
        <div>
          <Text>{item.label}</Text>
          <Text size="13px" c="gray.6">
            {item.description}
          </Text>
        </div>
      </Group>
    </Radio.Card>
  ));

  function SubmitCart () {

    dispatch(toggleLoading())

    mutateAsync({},{
        onSuccess: () => {
            dispatch(toggleLoading());
            setButtonLink({component:"a", href:"https://google.com"})
        },
        onError: () => {
        },
        onSettled: (err) => {
        }
    })
  }

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  // Check the verification state and decide what to render
  
  useEffect(() => {
  
    if (authLoading) {
      return;
    }
  
    if (isVerified === false) {
      navigate("/login", { replace: true });
    } else if (isVerified === true) {
      setPageActive(true);
    }
  }, [isVerified, authLoading, navigate]);

  //   useLayoutEffect(() => {
  //   if (!cookies.user && cookies?.user !== "") {
  //     navigate("/login",{replace:true});
  //   }
  //   else{
  //       setPageActive(true);
  //   }
  // }, []);


  useEffect(() => {
    if (fetchedGateways?.[0]?.info) {
      form.setValues({ gateway: fetchedGateways[0].info });
    }
    
  }, [fetchedGateways]); // Runs only when `fetchedGateways` is updated

  
  if(!pageActive) return <></>;


    if (!fetchedGateways || loading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }


  return (
    <>
      <CartStepper active={2} />
      <Grid>

        <GridCol>
        {
           (
            <PaymentCalcReceiptSellers
              // prev={{ to: "/basket-info", component: NavLink }}
              // gateway={form.getValues().gateway}
              receipt_id={receipt_id}
            >
              پرداخت
            </PaymentCalcReceiptSellers>
          )
        }
        </GridCol>
      </Grid>
    </>
  );
};


// const SubmitCoupon = ({ isDiscountApplied, setIsDiscountApplied, gateway }) => {


//   const dispatch = useDispatch();
//   const { cartfinalreceipt } = useSelector((state) => state.cartfinalreceipt); // Access cartfinalreceipt from Redux
  

  


//   // const [isDiscountApplied, setIsDiscountApplied] = useState(false);

//   const navigate = useNavigate();


//   const {
//     cartfinalreceiptDiscount=[], 
//     totalfinalreceiptDiscount, 
//     loadingUpdateDiscount, 
//     errorUpdateDiscount
//   } = useSelector((state) => state.cartFinalReceiptUpdateDiscount);


//   const {
//     cartfinalreceiptDiscountDelete=[], 
//     totalfinalreceiptDiscountDelete, 
//     loadingUpdateDiscountDelete, 
//     errorUpdateDiscountDelete
//   } = useSelector((state) => state.cartFinalReceiptUpdateDiscountDelete);



//       const [showAlert, setShowAlert] = useState(false);
//       const [modalOpen, setModalOpen] = useState(false);



//       useEffect(() => {
//         if (cartfinalreceiptDiscount && cartfinalreceiptDiscount.state) {
//           setShowAlert(true);
    
//           // Hide alert after 2 seconds
//           const timer = setTimeout(() => {
//             setShowAlert(false);
//           }, 2000);
    
//           // Cleanup timeout if component unmounts or the alert is hidden earlier
//           return () => clearTimeout(timer);
//         }
//       }, [cartfinalreceiptDiscount]);

//       useEffect(() => {
//         const nonNotifyStatuses = [
//           400, 401, 403, 404, 405, 406, 408, 409,
//           410, 411, 412, 413, 414, 415, 416, 417,
//           422, 429
//         ];
      
//         const isEmpty = (obj) => obj && Object.keys(obj).length === 0; // Check if the object is defined
      
//         const hasValidStatus = errorUpdateDiscount && typeof errorUpdateDiscount.status !== "undefined" && !isNaN(Number(errorUpdateDiscount.status));
      
//         if (!isEmpty(errorUpdateDiscount) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorUpdateDiscount.status))) {
//           // Clear errors first
//           setErrors({});
//           form.setErrors({});  // Clears any existing errors

//           // Then show notification
//           notifications.show({
//             title: errorUpdateDiscount?.message || "خطایی رخ داده است",
//             color: "red",
//             autoClose: true,
//           });
//         }
//       }, [cartfinalreceiptDiscount, errorUpdateDiscount]);
      
      

//       useEffect(() => {
//         if (errorUpdateDiscount?.status) {
//           handleKnownErrors(errorUpdateDiscount.status, setModalOpen, navigate);
//         }
//       }, [errorUpdateDiscount, data]);



//       //////

//       useEffect(() => {
//         if (cartfinalreceiptDiscountDelete && cartfinalreceiptDiscountDelete.state) {
//           setShowAlert(true);
    
//           // Hide alert after 2 seconds
//           const timer = setTimeout(() => {
//             setShowAlert(false);
//           }, 2000);
    
//           // Cleanup timeout if component unmounts or the alert is hidden earlier
//           return () => clearTimeout(timer);
//         }
//       }, [cartfinalreceiptDiscountDelete]);

//       useEffect(() => {
//         const nonNotifyStatuses = [
//           400, 401, 403, 404, 405, 406, 408, 409,
//           410, 411, 412, 413, 414, 415, 416, 417,
//           422, 429
//         ];
      
//         const isEmpty = (obj) => obj && Object.keys(obj).length === 0; // Check if the object is defined
      
//         const hasValidStatus = errorUpdateDiscountDelete && typeof errorUpdateDiscountDelete.status !== "undefined" && !isNaN(Number(errorUpdateDiscountDelete.status));
      
//         if (!isEmpty(errorUpdateDiscountDelete) && hasValidStatus && !nonNotifyStatuses.includes(Number(errorUpdateDiscountDelete.status))) {
//           // Clear errors first
//           // setErrors({});
//           form.setErrors({});  // Clears any existing errors

//           // Then show notification
//           notifications.show({
//             title: errorUpdateDiscountDelete?.message || "خطایی رخ داده است",
//             color: "red",
//             autoClose: true,
//           });
//         }
//       }, [cartfinalreceiptDiscountDelete, errorUpdateDiscountDelete]);
      
      

//       useEffect(() => {
//         if (errorUpdateDiscountDelete?.status) {
//           handleKnownErrors(errorUpdateDiscountDelete.status, setModalOpen, navigate);
//         }
//       }, [errorUpdateDiscountDelete, data]);




//     // useEffect(() => {


//     //     if (errorUpdateDiscount?.status === 401) {
//     //         setModalOpen(true);

//     //       setTimeout(() => {
//     //         setModalOpen(false);
//     //         dispatch(clearCartFinalReceiptUpdate())

//     //         navigate("/"); 
//     //       }, 4000);
//     //     }



//     //     if (errorUpdateDiscount?.status === 403) {
//     //         setModalOpen(true);

//     //       setTimeout(() => {
//     //         dispatch(clearCartFinalReceiptUpdate())
//     //         setModalOpen(false);

//     //       }, 4000);


//     //     }

//     // }, [errorUpdateDiscount, dispatch, navigate]);
    





//   const form = useForm({
//     initialValues: {
//       code: "",
//     },
//     validate: {
//       code: (value) => (value.length < 2 ? "کد تخفیف را وارد کنید" : null),
//     },
//   });

//   const applyDiscount = async (values) => {
    
//     try {
//       // Dispatch the discount update action and wait for the response
//       const response = await dispatch(updateFinalReceiptWithDiscount({ discountCode: values.code, paymentMethod: gateway }));
  
//       // Check if the response indicates success (you can adjust the condition depending on your backend response)
//       if (response?.payload?.status === "OK") {
//         // If the status is OK, disable the input and button
//         setIsDiscountApplied(true);
  
//         // Show success notification
//         notifications.show({
//           title: "پیام سیستم",
//           message: "کد تخفیف و روش پرداخت اعمال شد!",
//           color: "green",
//         });
//       } else {
//         // Handle the case where the discount application failed
//         notifications.show({
//           title: "خطا",
//           message: "مشکلی در اعمال کد تخفیف پیش آمد!",
//           color: "red",
//         });
//       }
  
//       // Fetch updated final receipt
//       dispatch(fetchFinalReceipt());
//     } catch (error) {
//       // Handle errors in case of failure
//       notifications.show({
//         title: "خطا",
//         message: "مشکلی در اتصال به سرور پیش آمد!",
//         color: "red",
//       });
//     }
//   };
  
//   const removeDiscount = async () => {
//     try {
//       // Dispatch an action to remove the discount (you can create a removeDiscount action as per your API)
//       const response = await dispatch(updateFinalReceiptDeleteDiscountCode({ discountCode: cartfinalreceipt.cartDiscounts.discountCode.code, paymentMethod: gateway }));

//       // If successful, reset the state
//       if (response?.payload?.status === "OK") {
//         // setIsDiscountApplied(false);

//         // Show success notification
//         notifications.show({
//           title: "پیام سیستم",
//           message: "کد تخفیف حذف شد!",
//           color: "green",
//         });
//       } else {
//         // Handle the failure case
//         notifications.show({
//           title: "خطا",
//           message: "مشکلی در حذف کد تخفیف پیش آمد!",
//           color: "red",
//         });
//       }

//       // Fetch updated final receipt
//       dispatch(fetchFinalReceipt());
//     } catch (error) {
//       // Handle errors in case of failure
//       notifications.show({
//         title: "خطا",
//         message: "مشکلی در اتصال به سرور پیش آمد!",
//         color: "red",
//       });
//     }
//   };


//   return (
//     <>
//       <ErrorMessageModal
//         opened={modalOpen}
//         onClose={() => setModalOpen(false)}
//         // status={errorUpdateDiscount?.status || errorUpdateDiscountDelete?.status}
//         message={errorUpdateDiscount?.message || errorUpdateDiscountDelete?.message}
//       />
//       <Title fw="600" c="gray.8" mt="xl" mb="sm">
//         کد تخفیف
//       </Title>
//       <Paper>
//         <form onSubmit={form.onSubmit((values) => applyDiscount(values))}>
//           <Flex align="end" gap="sm" w={{ lg: "50%" }}>
//             <TextInput
//               w="100%"
//               label="وارد کردن کد تخفیف"
//               placeholder="اینجا بنویسید"
//               {...form.getInputProps("code")}
//               disabled={isDiscountApplied} // Disable input if discount is applied
//               error={
//                 (cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code) || (form.errors.code) || (cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code) ? (
//                   <div>
//                     {cartfinalreceiptDiscount?.state === "error" && cartfinalreceiptDiscount?.errors?.code && (
//                       <div>{cartfinalreceiptDiscount?.errors?.code}</div>
//                     )}
//                     {form.errors.code && <div>{form.errors.code}</div>}
//                     {cartfinalreceiptDiscountDelete?.state === "error" && cartfinalreceiptDiscountDelete?.errors?.code && (
//                       <div>{cartfinalreceiptDiscountDelete?.errors?.code}</div>
//                     )}
//                   </div>
//                 ) : null
//               }
//             />
//             <Button w="70" type="submit" disabled={isDiscountApplied}>
//               ثبت
//             </Button>
//           </Flex>
//           {/* <Flex align="end" w={{ lg: "50%" }}>
//             <Text c="red" size="13px">
//               {form.getInputProps("code").error}
//             </Text>
//           </Flex> */}
//         </form>

//         {/* Display the applied coupon code below */}
//         {cartfinalreceipt?.cartDiscounts?.discountCode?.code && (
//           <>
//             <Text mt="sm" c="green">
//               کد تخفیف اعمال شده: {cartfinalreceipt.cartDiscounts.discountCode.code}
//             </Text>
//             <Button mt="sm" color="red" onClick={removeDiscount}>
//               حذف کد
//             </Button>
//           </>
//         )}
//       </Paper>
//     </>
//   );


// };



export default PaymentSellers;
