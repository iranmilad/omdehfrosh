export default function Cart(server, apiPrefix) {
    // ای‌پی‌آی برای ویرایش اطلاعات حساب کاربری (POST)
    server.post(`${apiPrefix}/cart/update`, (schema, { requestBody }) => {
      // پارس کردن بدنه درخواست
      let body = JSON.parse(requestBody);
      let response = {message: 'ok',cart: []}
      console.log(schema.carts);
      if(body?.max){
        response.max = 30;
      }
      return response;
    });
  
  }