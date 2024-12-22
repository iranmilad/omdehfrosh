
export default function EditAccount(server,apiPrefix){
    server.post(`${apiPrefix}/edit-account`, (schema, {requestBody }) => {
        let body = JSON.parse(requestBody)
        if(body){
            return {message: "ok"}
        }
    })

    server.get(`${apiPrefix}/edit-account`, (schema, {requestBody }) => {
        const user = schema.db.signInUserData.findBy({
            mobile: "09374039436"
        });
        if(user){
            return {message: "ok", data: user}
        }
    })
}