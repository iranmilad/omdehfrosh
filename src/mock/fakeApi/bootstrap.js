import Banner from '../../assets/banner.webp'

export default function Bootstrap(server,apiPrefix){
    server.get(`${apiPrefix}/bootstrap`, (schema, {requestBody }) => {
        let data = {
            banner: {
                link: "https://digikala.com",
                src: Banner
            }
        }
        return { message: "ok", data }

    })
}