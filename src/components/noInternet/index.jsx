import { useEffect } from "react";
import { notifications } from "@mantine/notifications"; // یا هر کتابخانه‌ای که استفاده می‌کنید
import { useNetwork } from "@mantine/hooks"; // فرض کنید از این کتابخانه استفاده می‌شود

function NoInternet() {
    const networkStatus = useNetwork();

    useEffect(() => {
        if (!networkStatus.online) {
            notifications.show({
                title: "خطا",
                color: "red",
                message: "ارتباط با اینترنت قطع شده است",
                autoClose: true
            });
        }
    }, [networkStatus.online]); // فقط زمانی اجرا شود که وضعیت آنلاین تغییر کند

    return null; // این کامپوننت چیزی رندر نمی‌کند
}

export default NoInternet;
