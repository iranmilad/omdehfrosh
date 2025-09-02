import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Button, Divider, Flex, Grid, GridCol, Loader, Paper, Stack, Text, Title } from "@mantine/core";

const PaymentInfoCod = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { orderfinalreceipt, loadingfinalreceipt, errorfinalreceipt } = useSelector(
        (state) => state.cartfinalreceipt
    );

    useEffect(() => {
        dispatch(fetchFinalReceipt());
    }, [dispatch]);

    if (!orderfinalreceipt) {
        return <Loader />;
    }

    if (orderfinalreceipt.paymentMethod.paymentMethod === "cod" && orderfinalreceipt?.isPaid == false) {
        return (
            <Grid mt="md" gutter="lg">
                {orderfinalreceipt?.sellers?.length > 0 ? (
                    orderfinalreceipt.sellers.map((sellerGroup) => (
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
