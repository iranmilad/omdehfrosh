import { useDispatch } from "react-redux";
import { useState } from "react";

import { batchImportProductComments } from '../../../../../../redux/master-dash/comments/productcomments/productCommentsActions'
import {cc} from '../../../../../../mock/data/comments'

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";


const AddBatchProductComments = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportProductComments({productComments: cc}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Product Comments
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Product Comments
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchProductComments;