import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchFinalReceipt } from "../../redux/cartfinalreceipt/cartfinalreceipt";
import { Button, Divider, Flex, Grid, GridCol, Loader, Paper, Stack, Text, Title } from "@mantine/core";

const PaymentInfoCod = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { cartfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
        (state) => state.cartfinalreceipt
    );

    useEffect(() => {
        dispatch(fetchFinalReceipt());
    }, [dispatch]);

    if (!cartfinalreceipt) {
        return <Loader />;
    }

    if (cartfinalreceipt.paymentMethod.paymentMethod === "cod" && cartfinalreceipt?.isPaid == false) {
        return (
            <Grid mt="md" gutter="lg">
                {cartfinalreceipt?.sellers?.length > 0 ? (
                    cartfinalreceipt.sellers.map((sellerGroup) => (
                        <GridCol span={12} key={sellerGroup.seller.id}>
                            <Paper p="md" shadow="xs" fullWidth>
                                <Divider my="sm" />
                                <Stack>
                                    سفارش شما با موفقیت ثبت شد، برای کسب اطلاعات بیشتر و پیگیری سفارش می‌توانید به بخش سفارشات در پنل کاربری خود مراجعه کنید.
                                </Stack>
                            </Paper>
                        </GridCol>
                    ))
                ) : (
                    <Text>هیچ آیتمی موجود نیست</Text>
                )}

                {/* Button to navigate to "orders" */}
                <GridCol span={12}>
                    <Button fullWidth mt="lg" onClick={() => navigate("/account/orders")}>
                        مشاهده سفارشات
                    </Button>
                </GridCol>
            </Grid>
        );
    } else {
        return null;
    }
};

export default PaymentInfoCod;
