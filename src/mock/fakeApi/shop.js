import { shuffleArray } from "../../Libs/helper";
import { archive } from "../data/products";

export default function Shop(server,apiPrefix){
    server.get(`${apiPrefix}/shop`, (schema, {requestBody }) => {
        let data = archive;

        data.products = shuffleArray(data.products);
        
        return { message: "ok", data };
    })
}