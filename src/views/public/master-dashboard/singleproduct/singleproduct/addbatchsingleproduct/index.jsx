import { useDispatch } from "react-redux";
import { useState } from "react";

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";

import { singleProducts } from '../../../../../../mock/data/singleProducts.js'
import { batchImportSingleProducts } from "../../../../../../redux/master-dash/singleproducts/singleproducts/singleProductActions.js";


const AddBatchSingleProduct = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportSingleProducts({singleProducts}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Single Product
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Single Product
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchSingleProduct;