import { rem,Container, Paper, Title } from "@mantine/core";

const CONTAINER_SIZES= {
  xxs: rem(300),
  xs: rem(400),
  sm: rem(500),
  md: rem(600),
  lg: rem(700),
  xl: rem(800),
  xxl: "1520px",
};

const Theme = {
  fontFamily: "IRANSansX, sans-serif",
  headings: { fontFamily: "IRANSansX, sans-serif" },
  fontFamilyMonospace: "IRANSansX, sans-serif",
  primaryColor: "indigo",
  defaultRadius: "8px",
  primaryShade: 5,
  colors: {
    brand: [
      "#fef2f2",
      "#fee2e2",
      "#fecaca",
      "#fca5a5",
      "#f87171",
      "#ef4444",
      "#dc2626",
      "#b91c1c",
      "#991b1b",
      "#7f1d1d",
    ],
  },
  components: {
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
            ? CONTAINER_SIZES[size]
            : rem(size),
        },
      }),
      defaultProps:{
        size: "xxl"
      }
    }),
    Paper: Paper.extend({
      defaultProps:{
        shadow: "md",
        p:"md"
      }
    }),
    Title: Title.extend({
      defaultProps: {
        size: "md"
      }
    })
  },
};

export default Theme;
