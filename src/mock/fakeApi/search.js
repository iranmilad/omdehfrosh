
export default function SearchApi(server,apiPrefix){
    server.post(`${apiPrefix}/search`, (schema, {requestBody }) => {
        let {s} = JSON.parse(requestBody)
        const search = schema.db.SearchData

        return {message: "ok", data: search}
    })
}