import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import { Button, Divider, Flex, Grid, GridCol, Loader, Paper, Stack, Text, Title } from "@mantine/core";
import PaymentInfoOnline from "../payment-online";
import PaymentInfoCod from "../payment-info-cod";
import { useLocation } from "react-router-dom";


const PaymentInfo = ({ }) => {

    const location = useLocation();
    const gateway = location.state?.gateway;
    
    const dispatch = useDispatch();

    const { cartfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
        (state) => state.cartfinalreceipt
    );    

    const navigate = useNavigate();

    useEffect(() => {
        dispatch(fetchFinalReceipt());
    }, [dispatch]);

    
    if (!cartfinalreceipt || !gateway) {
        return <Loader />
    }

    if (gateway?.paymentMethod === "online") {
        return <PaymentInfoOnline />
    } else if (gateway?.paymentMethod === "cod") {
        return <PaymentInfoCod />
    }

}

export default PaymentInfo;