import { useDispatch } from "react-redux";
import { useState } from "react";

import {brandsFastOrder} from '../../../../../../mock/fakeApi/fastorder'

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportFastOrderPageBrands } from "../../../../../../redux/master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmode/fastorderpagedatabrands/fastOrderPageDataBrandsActions";


const AddBatchFastOrderBrands = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportFastOrderPageBrands({brands: brandsFastOrder}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Fast Order Brands
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Fast Order Brands
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchFastOrderBrands;