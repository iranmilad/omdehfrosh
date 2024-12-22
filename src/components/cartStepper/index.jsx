import { Stepper } from "@mantine/core"
import { IconCircleCheck, IconShoppingCart, IconUserCheck, IconWallet } from "@tabler/icons-react";

const CartStepper = (props) => {
    return (
        <Stepper mb="xl" active={props.active}>
        <Stepper.Step label="سبد خرید" icon={<IconShoppingCart />} />
        <Stepper.Step label="اطلاعات خریدار" icon={<IconUserCheck />} />
        <Stepper.Step label="انتخاب روش پرداخت" icon={<IconWallet />} />
        <Stepper.Step label="پرداخت نهایی" icon={<IconCircleCheck />} />
    </Stepper>
    )
}

export default CartStepper