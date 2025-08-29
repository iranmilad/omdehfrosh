import { Card, Image, Text, Button } from "@mantine/core";

const DiscountMessageCard = ({ message }) => {



  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Card.Section>
      <Image 
          src={message.icon} 
          alt="icon" 
          style={{ width: "70px", height: "70px", objectFit: "contain" }} 
        />        
        </Card.Section>
      <Text weight={500} size="lg" mt="md">
        {message.messageDiscountCodeTitle}
      </Text>
      <Text size="sm" mt="xs" color="dimmed">
        {message.messageDiscountCodeBody}
      </Text>
      <Button component="a" href={message.link} mt="md" fullWidth>
        مشاهده
      </Button>
    </Card>
  );
};

export default DiscountMessageCard;
