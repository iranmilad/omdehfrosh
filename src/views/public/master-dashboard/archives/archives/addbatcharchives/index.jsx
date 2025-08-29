import { useDispatch } from "react-redux";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import {archive} from '../../../../../../mock/data/products'

import { batchImportArchives } from "../../../../../../redux/master-dash/archives/archives/archiveActions";



const AddBatchArchives = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportArchives({archives: archive}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Archives
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Archives
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchArchives;