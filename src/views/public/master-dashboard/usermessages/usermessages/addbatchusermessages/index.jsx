import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";

import {userMessages} from '../../../../../../mock/data/usermessages'

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportUserMessages } from "../../../../../../redux/master-dash/usermessages/usermessages/userMessagesActions";


const AddBatchUserMessages = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportUserMessages({messages: userMessages}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch User Messages
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import User Messages
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchUserMessages;