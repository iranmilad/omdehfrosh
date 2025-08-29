import { useDispatch } from "react-redux";
import { useState } from "react";


import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportFastOrderPageBrands } from "../../../../../../redux/master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmode/fastorderpagedatabrands/fastOrderPageDataBrandsActions";
import { batchImportFastOrderPageBrandModeFilters } from "../../../../../../../backend/controllers/master-dashboard/fastOrderPageDataBrandModeFiltersControllers";


import {filters} from '../../../../../../mock/fakeApi/fastorder'
import { batchImportFastOrderBrandModeFilters } from "../../../../../../redux/master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmodefilters/fastOrderPageDataBrandModeFiltersActions";


const AddBatchFastOrderFilters = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportFastOrderBrandModeFilters({filters: filters}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Fast Order Filters
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Fast Order Filters
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchFastOrderFilters;