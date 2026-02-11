import { Paper, Tabs } from "@mantine/core";
import React, { memo } from "react";
import Comments from "../comments";
import Features from "../features";

function index({data, slug}) {

    const [activeTab, setActiveTab] = React.useState("desc");


  return (
    // <Tabs
    //   mt="xl"
    //   variant="pills"
    //   defaultValue="desc"
    //   styles={{
    //     panel: {
    //       paddingTop: 20,
    //     },
    //   }}
    // >
    //   <Paper>
    //     <Tabs.List>
    //       <Tabs.Tab value="desc">توضیحات</Tabs.Tab>
    //       {data.general.specifications && (
    //         <Tabs.Tab value="feat">مشخصات</Tabs.Tab>
    //       )}
    //       <Tabs.Tab value="comm">نظرات</Tabs.Tab>
    //     </Tabs.List>
    //   </Paper>
    //   <Tabs.Panel value="desc">
    //     <Paper p="xl">
    //       <div
    //         className="prose-sm leading-8"
    //         dangerouslySetInnerHTML={{ __html: data.general.description }}
    //       />
    //     </Paper>
    //   </Tabs.Panel>
    //   <Tabs.Panel value="feat">
    //     <Features items={data.general.specifications || []} />
    //   </Tabs.Panel>
    //   <Tabs.Panel value="comm">
    //     <AddComment />
    //     <Comments slug={slug} />
    //   </Tabs.Panel>
    // </Tabs>

        <Tabs
      mt="xl"
      variant="pills"
      value={activeTab}
      onChange={setActiveTab}
      styles={{ panel: { paddingTop: 20 } }}
    >
      <Paper>
        <Tabs.List>
          <Tabs.Tab value="desc">توضیحات</Tabs.Tab>
          {data.general.specifications && data.general.specifications.length > 0 && (
            <Tabs.Tab value="feat">مشخصات</Tabs.Tab>
          )}
          <Tabs.Tab value="comm">نظرات</Tabs.Tab>
        </Tabs.List>
      </Paper>

      <Tabs.Panel value="desc">
        <Paper p="xl">
          <div
            className="prose-sm leading-8"
            dangerouslySetInnerHTML={{ __html: data.general.description }}
          />
        </Paper>
      </Tabs.Panel>

      <Tabs.Panel value="feat">
        <Features items={data.general.specifications || []} />
      </Tabs.Panel>

<Tabs.Panel value="comm">
  <Comments slug={slug} opened={activeTab === "comm"} />
</Tabs.Panel>

    </Tabs>
  );
}

const MemoizedTab = memo(index,(prev,next) => {
  return prev.data.id === next.data.id
})

export default MemoizedTab;
