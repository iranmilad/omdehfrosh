import { useDispatch } from "react-redux";
import { useState } from "react";
import {productGrid} from '../../../../../mock/data/products'
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageProductGrids } from '../../../../../redux/master-dash/productgrids/homePageProductGrids/homePageProductGridsActions'


const AddBatchProductGrids = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportHomePageProductGrids({productGrid: productGrid}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Product Grids
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Product Grids
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchProductGrids;