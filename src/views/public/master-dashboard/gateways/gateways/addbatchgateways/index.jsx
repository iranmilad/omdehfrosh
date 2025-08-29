import { useDispatch } from "react-redux";
import { useState } from "react";
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportGateways } from "../../../../../../redux/master-dash/gateways/gateways/gateWaysActions";

import {gateways} from '../../../../../../mock/data/gateways'

const AddBatchGateways = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportGateways({gateways: gateways}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Gateways
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Gateways
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchGateways;