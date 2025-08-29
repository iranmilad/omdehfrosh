import { useDispatch } from "react-redux";
import { useState } from "react";

import {availableLocations} from '../../../../../../mock/fakeApi/fastorder'

import { Button, Container, Group, Notification, Paper, Textarea, Title } from "@mantine/core";
import { batchImportFastOrderPageBrands } from "../../../../../../redux/master-dash/fastorder/fastorderpagedata/fastorderpagedatabrandmode/fastorderpagedatabrands/fastOrderPageDataBrandsActions";
import { batchImportFastOrderLocations } from "../../../../../../redux/master-dash/fastorder/fastorderpagedata/general/fastorderlocations/fastOrderLocationsActions";


const AddBatchFastOrderLocations = () => {
    const dispatch = useDispatch();
    // const [products, setProducts] = useState("");

    const handleImport = () => {
        try {
            // const parsedProducts = JSON.parse(products);
            dispatch(batchImportFastOrderLocations({availableLocations: availableLocations}));
        } catch (error) {
            alert("Invalid JSON format");
        }
    };

    return (
        <Container size="sm" py="xl">
            <Title align="center" mb="lg" order={3}>
                Add Batch Fast Order Locations
            </Title>

            <Paper shadow="md" p="lg" radius="md" withBorder>


                <Group position="center">
                    <Button onClick={handleImport} color="blue" radius="md" size="md">
                        🚀 Import Fast Order Locations
                    </Button>
                </Group>
            </Paper>
        </Container>
    );
};

export default AddBatchFastOrderLocations;