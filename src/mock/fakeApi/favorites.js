import Product1 from "../../assets/products/1.webp";


export default function Favorites(server,apiPrefix){
    server.get(`${apiPrefix}/favorites`, (schema, {requestBody }) => {
        const data = [
            {
                id: 123,
                title: "گوشی موبایل اپل مدل پرومکس دو سیم‌ کارت نات اکتیو سیزده",
                slug: "123",
                regularPrice: 21000000,
                discountedPrice: 9120000,
                discountPercent: "40",
                image: Product1
            }
        ];
        
        return {message: "ok",data}
    })

    server.post(`${apiPrefix}/favorites`, (schema, {requestBody }) => {
        let {id} = JSON.parse(requestBody)
        if(id){
            return {message: "ok"}
        }
    })

    server.delete(`${apiPrefix}/favorites`, (schema, {requestBody }) => {
        let {id} = JSON.parse(requestBody);
        if(id){
            return {message: "ok"}
        }
    })
}