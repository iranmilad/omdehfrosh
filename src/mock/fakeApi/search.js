
export default function SearchApi(server,apiPrefix){
    server.get(`${apiPrefix}/search`, (schema, {requestBody }) => {
        const data = {
            category: [
              {
                title: "موبایل",
                slug: "mobile",
              },
            ],
            products: [
              {
                title: "آیفون 16",
                slug: "iphone-16",
              },
            ],
          };
    
        return {message: "ok", data }
    })
}