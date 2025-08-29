import useBreadcrumbs from "use-react-router-breadcrumbs";
import { Anchor, Text } from "@mantine/core";
import { NavLink } from "react-router";

const Breadcrumbs = ({ routes }) => {
  const breadcrumbs = useBreadcrumbs(routes, {
    disableDefaults: false,
    excludePaths: ["/product"],
    defaultFormatter: (str) => str,
  });

  return breadcrumbs.map(({ match, breadcrumb }, index) => {
    if(index === breadcrumbs.length - 1){
      return <Text
      fw={index === 0 ? "bold" : null}
      size="16px"
      c="gray"
      underline="never"
      key={index}
    >
      {breadcrumb?.props?.children}
    </Text>
    }
    else{
      return <Anchor
      fw={index === 0 ? "600" : null}
      size="16px"
      underline="never"
      key={index}
      component={NavLink}
      to={match.pathname}
    >
      {breadcrumb?.props?.children}
    </Anchor>
    }
  });
};

export default Breadcrumbs;
