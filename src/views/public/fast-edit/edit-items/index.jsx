import { ActionIcon, Button, Center, Flex, Input, Loader, LoadingOverlay } from "@mantine/core";
import { IconPlus, IconMinus, IconTrash, IconBasket } from "@tabler/icons-react";
import { useData, useSend } from '../../../../Libs/api'
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { setInitial } from "../../../../redux/cart";
import { useEffect, useState } from "react";
import { updateFastEditBrandMode } from "../../../../redux/fastedit/fasteditbrandmode/fastEditBrandModeUpdateActions";
import { notifications } from "@mantine/notifications";
import { useRef } from "react";



const EditItemsFastOrder = (props) => {
  const {
    productId = 125,
    seller = 3,
    onChange,
    options = { t: "" },
    productName = "",
    productImages = "",
    // isPending = false,
    item,
    formData
  } = props;




  const { 
    loadingBrandModeUpdate, 
    brandModeUpdate, 
    errorBrandModeUpdate, 
    successMessageBrandModeUpdate 
  } = useSelector((state) => state.fastEditBrandMode);



  // const hasShownNotification = useRef(false);
  
  // useEffect(() => {
  //   if (!brandModeUpdate || hasShownNotification.current) return;
  
  //   if (brandModeUpdate.state === "error") {
  //     notifications.show({
  //       title: brandModeUpdate?.message,
  //       color: "red",
  //       autoClose: true,
  //     });
  //     hasShownNotification.current = true;
  //   }
  
  //   if (brandModeUpdate.state === "ok") {
  //     notifications.show({
  //       title: brandModeUpdate?.message,
  //       color: "green",
  //       autoClose: true,
  //     });
  //     hasShownNotification.current = true;
  //   }
  // }, [brandModeUpdate]);
  


  const dispatch = useDispatch()

  const [showLoader, setShowLoader] = useState(false);



    const handleEdit = () => {

            // Search for the matching entry in formData using item.id
    const matchingDataKey = Object.keys(formData).find(key => key === item.psid);

    // If matching data is found, retrieve it
    const matchingData = matchingDataKey ? formData[matchingDataKey] : null;
   
    setShowLoader(true); // Start local loading



    dispatch(updateFastEditBrandMode({updateData: matchingData, itemId: item.psid}))

    setTimeout(() => {
      setShowLoader(false); // Stop loader after 2 seconds
    }, 2000);

    }



    if (showLoader) {
            return (
              <Center>
                <LoadingOverlay />
              </Center>
            );
    }


  

    return (
      <>
        {
          showLoader ? (
            <Center>
              <Loader />
            </Center>
          ) : (
            <Button h={35} onClick={handleEdit}>
              ادیت
            </Button>
          )
        }
     </>
    );
    
};

export default EditItemsFastOrder;
