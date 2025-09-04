import {
  LoadingOverlay,
  Flex,
  Title,
  Button,
  Grid,
  GridCol,
} from "@mantine/core";

import ProductBox from "../account-favorite/productBox/index"

import { useDispatch, useSelector } from "react-redux";
import { getUserMyAccount } from "../../../redux/usermyaccounts/usermyaccounts/getusermyaccounts/userMyAccountsGetActions";
import { useEffect } from "react";

function Account_Favorite() {


  const dispatch = useDispatch();

  const { userAccount, loading, error } = useSelector((state) => state.userMyAccounts);




  useEffect(() => {

    if (userAccount) {
      dispatch(getUserMyAccount());
    }

  }, [dispatch]);




  return (
    <>
      <Flex justify="space-between" align="center" mb="xl">
        <Title>محصولات علاقه مندی</Title>
      </Flex>
      {!loading ? (
        <Grid>
          {userAccount &&
            userAccount?.favorites?.map((item, index) => (
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
