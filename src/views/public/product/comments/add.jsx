import { Collapse,Button, Grid, Textarea, Paper, Text, Flex, Rating, Stack, Title } from "@mantine/core"
import { useForm, yupResolver } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks"
import * as Yup from 'yup';
import {IconMessage2} from "@tabler/icons-react"


const commentValidationSchema = Yup.object().shape({
    comment: Yup.string()
      .required('کامنت الزامی است.')
      .min(5, 'کامنت باید حداقل ۵ کاراکتر باشد.')
      .max(500, 'کامنت نمی‌تواند بیش از ۵۰۰ کاراکتر باشد.'),
  });


const AddComment = (props) => {
    const [opened,{toggle}] = useDisclosure(false);
    const form = useForm({
        initialValues: {
            comment: "",
            rating: 0
        },
        validate: yupResolver(commentValidationSchema)
    })
    return (
        <Paper>
            <Button h="60" fullWidth variant="light" leftSection={<IconMessage2 />} onClick={toggle}>ثبت دیدگاه</Button>
            <Collapse in={opened}>
            <Title my="lg">دیدگاه خود را بنویسید</Title>
                <form onSubmit={form.onSubmit((value) => console.log(value))}>
                    <Stack>
                        <Flex>
                            <Text me="lg" size="sm" fw="500"> امتیاز شما</Text>
                            <Rating {...form.getInputProps('rating')}
                            />
                        </Flex>
                        <Textarea label="دیدگاه شما" withAsterisk rows={5} placeholder="دیدگاه خود را وارد کنید" {...form.getInputProps('comment')}></Textarea>
                        <Button w="max-content" type="submit">ارسال</Button>
                    </Stack>
                </form>
            </Collapse>
        </Paper>
    )
}

export default AddComment