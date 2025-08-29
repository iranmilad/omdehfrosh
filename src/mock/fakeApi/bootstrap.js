/**
 * تکمیل شده
 * این آدرس هیچ مقدار ورودی ندارد
 */

import { Response } from 'miragejs';
import { bootstrap } from '../data/bootstrap';

export default function Bootstrap(server, apiPrefix) {
    // ای‌پی‌آی برای دریافت اطلاعات اولیه سایت (بوت‌استرپ)
    server.get(`${apiPrefix}/bootstrap`, (schema, request) => {
        // بررسی توکن احراز هویت برای صفحات غیر از لاگین و ثبت‌نام
        // request.requestHeaders['url'] faghat dar halat development ersal mishavad va ba php address darkhast shode ra mitavan daryaft kard
        // const token = request.requestHeaders["Authorization"] || request.requestHeaders["Authorization"];
        // if (request.requestHeaders['url'] !== "/login" && request.requestHeaders['url'] !== "/register") {
        //     if (!token) {
        //         // اگر توکن وجود نداشت، خطای ۴۰۱ برگردانده می‌شود
        //         return new Response(401, { some: "header" }, { error: "Authorization token missing." });
        //     }
        // }

        return { message: "ok", data:bootstrap };
    });
}