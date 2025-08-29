import { useDispatch } from "react-redux";
import { batchImportHomePageProducts } from "../../../../../../redux/master-dash/products/homepageproducts/homePageProductsActions";
import { useState } from "react";

import {widesliders} from '../../../../../../mock/fakeApi/wideslider'



import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportHomePageWideSliders } from "../../../../../../redux/master-dash/widesliders/homepagewidesliders/homepagewideslidersActions";


const AddBatchWideslider = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {

        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportHomePageWideSliders({WideSliders: widesliders}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch AddBatchWideslider
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import AddBatchWideslider
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchWideslider;