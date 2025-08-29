import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { subscriptionData } from "../../../../../../mock/data/subscriptions";
import { batchImportSubscriptions } from "../../../../../../redux/master-dash/subscriptions/subscriptions/subscriptionsActions";



const AddBatchSubscriptions = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportSubscriptions({subscriptions: subscriptionData}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Subscriptions
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Subscriptions
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchSubscriptions;