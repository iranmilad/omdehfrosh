import React, { useState, useEffect } from "react";
import { Center,Loader,Flex,Paper,Text } from "@mantine/core";
import ProductBox from "../../../../components/productBox";
import Archive from "../../../../components/archive";
import { useData } from "../../../../Libs/api";
import { IconBuildingStore } from "@tabler/icons-react";

function Products({ children, id, activeTab }) {
    const [mounted, setMounted] = useState(0);
  const url = `/seller/${id}/products`;

    useEffect(() => {
      if (activeTab === "products") setMounted((val) => val + 1);
    }, [activeTab]);
  return (
    <Archive url={url} activeTab={activeTab} enabled={mounted >= 1} />
  );
}

export default Products;
