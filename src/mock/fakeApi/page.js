
export default function Page(server,apiPrefix){
    server.post(`${apiPrefix}/page`, (schema, {requestBody }) => {
        let {slug} = JSON.parse(requestBody)
        if(slug){
            return {message: "ok", data: "<h2>hello</h2>"}
        }
    })
}