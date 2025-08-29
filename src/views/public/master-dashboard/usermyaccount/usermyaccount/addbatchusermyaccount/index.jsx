import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/products/homepageproducts/homePageProductsActions.js";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { batchImportSingleProducts } from "../../../../../../redux/singleproducts/singleproducts/singleProductActions.js";

import { myAccountData } from "../../../../../../mock/data/myaccount.js";
import { batchImportUserMyAccounts } from "../../../../../../redux/master-dash/usermyaccounts/usermyaccounts/userMyAccountsActions.js";


const AddBatchUserMyAccounts  = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportUserMyAccounts({myAccountData}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch User My Accounts
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import User My Accounts
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchUserMyAccounts;