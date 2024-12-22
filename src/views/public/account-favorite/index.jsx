import {
  LoadingOverlay,
  Flex,
  Title,
  Button,
  Grid,
  GridCol,
} from "@mantine/core";
import ProductBox from "../../../components/productBox";
import { useData } from "../../../Libs/api";

function Account_Favorite() {
  const { data, isLoading,refetch } = useData({ url: "/favorites" });
  return (
    <>
      <Flex justify="space-between" align="center" mb="xl">
        <Title>محصولات علاقه مندی</Title>
      </Flex>
      {!isLoading ? (
        <Grid>
          {data &&
            data.map((item, index) => (
              <GridCol key={index} span={{ lg: 4 }}>
                <ProductBox {...item} favoriteAdded={true} skeleton={false} refetchParent={refetch} />
              </GridCol>
            ))}
        </Grid>
      ) : (
        <Grid>
          {Array(3)
            .fill(0)
            .map((item, index) => (
              <GridCol span={{ lg: 4 }}>
                <ProductBox id="12" favoriteAdded={false} skeleton={true} />
              </GridCol>
            ))}
        </Grid>
      )}
    </>
  );
}

export default Account_Favorite;
