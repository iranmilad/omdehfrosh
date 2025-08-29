import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";
import {products} from '../../../../../../mock/data/products'
import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";


const AddBatchProducts = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportHomePageProducts({products: products}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Products
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Products
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchProducts;