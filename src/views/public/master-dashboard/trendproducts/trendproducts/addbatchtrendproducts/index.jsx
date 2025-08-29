import { useDispatch } from "react-redux";
import { useState } from "react";
import {trendProducts} from '../../../../../../mock/data/products'
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportTrendProducts } from "../../../../../../redux/master-dash/trendproducts/homePageTrendProducts/homePageTrendProductsActions";


const AddBatchTrendProducts = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportTrendProducts({trendProducts: trendProducts}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Trend Products
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Trend Products
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchTrendProducts;