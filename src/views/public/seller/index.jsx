import {useEffect, useState} from "react";
import Info from "./info";
import { Divider, Paper, Tabs, TabsList, TabsPanel } from "@mantine/core";
import Seller_Home from "./home";
import Products from "./products";
import Comments from "./comments";
import { useParams } from "react-router";
import ShareModal from "../../../components/shareModal";
import { useDisclosure } from "@mantine/hooks";

function Seller() {
  const [activeTab, setActiveTab] = useState('home');
  const [opened,{close,open,toggle}] = useDisclosure(false);
  const {id} = useParams();
  return (
    <>
      <Paper p="xl">
        <Info toggleShareModal={toggle} />
      </Paper>
      <Tabs variant="pills" value={activeTab} onChange={setActiveTab} mt="lg">
        <Paper mb="xl">
          <TabsList >
            <Tabs.Tab value="home">خانه</Tabs.Tab>
            <Tabs.Tab value="products">محصولات</Tabs.Tab>
            <Tabs.Tab value="comments">دیدگاه مشتری‌ها</Tabs.Tab>
          </TabsList>
        </Paper>
        <TabsPanel value="home">
          <Seller_Home />
        </TabsPanel>
        <TabsPanel value="products">
          <Products id={id} activeTab={activeTab} />
        </TabsPanel>
        <TabsPanel value="comments"><Comments activeTab={activeTab} /></TabsPanel>
      </Tabs>
      <ShareModal close={close} opened={opened} link={window.location.href}  />
    </>
  );
}

export default Seller;
