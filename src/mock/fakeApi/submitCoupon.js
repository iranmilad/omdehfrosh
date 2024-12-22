

export default function SubmitCoupon(server,apiPrefix){
    server.post(`${apiPrefix}/submitcoupon`, (schema, {requestBody }) => {
        let {code} = JSON.parse(requestBody);
        
        if(code){
            if(code !== "farhad"){
                return {error: "کد تخفیف معتبر نیست"}
            }
            else{
                return {message: "کد تخفیف اعمال شد"}
            }
        }

    })
}