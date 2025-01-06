import { shuffleArray } from "../../Libs/helper";
import { products } from "../data/products";

export default function Product(server,apiPrefix){
    server.get(`${apiPrefix}/product/related`, (schema, {requestBody }) => {
        let data = products;

        return {message: "ok", data: shuffleArray(data)}
    })
}