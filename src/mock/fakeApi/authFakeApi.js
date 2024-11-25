import { Response } from "miragejs";

export default function authFake(server, apiPrefix) {
	server.post(`${apiPrefix}/auth/sms`, (schema, { requestBody }) => {
		const { mobile} = JSON.parse(requestBody);
		if (mobile) {
			const user = schema.db.signInUserData.findBy({
				mobile
			});
			if(user){
				return {sms: 2020}
			}
			else{
				return new Response(
					200,
					{},
					{error: "کاربری با این شماره موبایل یافت نشد"}
				)
			}
		}
		return new Response(
			401,
			{ some: "header" },
			{ message: "NOTHING" }
		);
	});
	server.post(`${apiPrefix}/auth/login`, (schema, { requestBody }) => {
		const { mobile,code} = JSON.parse(requestBody);
		if (mobile && code) {
			if(code === "2020"){
				const user = schema.db.signInUserData.findBy({
					mobile
				});
				return {
					user,
					token: "TOKEN wVYrxaeNa9OxdnULvde1Au5m5w63",
					maxAge: 30 * 24 * 60 * 60
				}
			}
			else{
				return new Response(
					200,
					{some: "header"},
					{error: "کد وارد شده اشتباه است"}
				)
			}
		}
		return new Response(
			401,
			{ some: "header" },
			{ message: "NOTHING" }
		);
	});
}