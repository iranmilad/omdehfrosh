import { Stack, Text } from "@mantine/core";
import Attributes from "../attributes";

function SummaryEntry({ data }) {
  
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
      <Attributes items={data?.options} />
    </Stack>
  );
}

export default SummaryEntry;
