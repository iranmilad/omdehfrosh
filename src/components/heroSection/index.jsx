import { Flex, Grid, GridCol, Image, Title,Text, Container } from '@mantine/core'
import React from 'react'
import ToolbarItem from '../editor/toolbar/toolbarItem';

function HeroSection() {
  return (
    <Container>
      <Grid gutter="70">
        <GridCol span={{md: 6}}>
            <Flex gap="xl" direction="column">
              <Title size="xl">متن اول</Title>
              <Text ta="justify">لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد، در این صورت می توان امید داشت که تمام و دشواری موجود در ارائه راهکارها، و شرایط سخت تایپ به پایان رسد و زمان مورد نیاز شامل حروفچینی دستاوردهای اصلی، و جوابگوی سوالات پیوسته اهل دنیای موجود طراحی اساسا مورد استفاده قرار گیرد.</Text>
            </Flex>
          </GridCol>
          <GridCol span={{md: 6}}>
            <Image src="https://placehold.co/250" h={500} radius="25"  />
          </GridCol>
      </Grid>
    </Container>
  )
}

EditorContainer.craft = {
  displayName: "Container",
  props: {
    padding: '10px 10px 10px 10px',
    margin: '10px 10px 10px 10px',
    backgroundColor: "",
    borderRadius: "4px 4px 4px 4px",
  },
  related: {
    settings: () => (
      <div>
        <ToolbarItem type="image" propKey="image" label="تصویر" /> {/* Padding */}
        <ToolbarItem type="text" propKey="title" label="عنوان" /> {/* Margin */}
        <ToolbarItem type="text" propKey="text" label="متن" /> {/* Background Color */}
      </div>
    ),
  },
};

export default HeroSection