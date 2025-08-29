import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { tickets } from "../../../../../../../mock/data/tickets";
import { batchImportMyAccountTickets } from "../../../../../../../redux/master-dash/myaccounttickets/myaccounttickets/myAccountTicketsActions";

const AddBatchMyAccountTickets = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);

            dispatch(batchImportMyAccountTickets({ tickets }))
            
            
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch My Account Tickets
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import My Account Tickets
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchMyAccountTickets;