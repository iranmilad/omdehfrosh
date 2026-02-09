import { Stack, Text } from "@mantine/core";
import Attributes from "../attributes";
import { useProduct } from "..";

function SummaryEntry({ data }) {
  const { optionsForDisplay } = useProduct();
  const attributeItems = optionsForDisplay ?? data?.options;

  return (
    <Stack gap="md" p={{ base: "xs", md: "md" }}>
      <Text 
        fz={{ base: "md", md: "lg", lg: "xl" }} 
        fw={600}
        c="dark.7"
        lineClamp={3}
      >
        {data.general.title}
      </Text>
      {data.general.english_title && (
        <Text 
          fz={{ base: "xs", md: "sm" }} 
          c="dimmed"
          mt="xs"
        >
          {data.general.english_title}
        </Text>
      )}
      <Attributes items={attributeItems ?? []} />
    </Stack>
  );
}

export default SummaryEntry;
