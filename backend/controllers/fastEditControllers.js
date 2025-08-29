import SingleProduct from "../models/SingleProduct.js";
import jwt from "jsonwebtoken";
import getUserFromToken from "../libs/verifyToken.js";



export const updateProduct = async (req, res) => {


  const { updateData, itemId } = req.body;


  const { user_id, decoded, role } = getUserFromToken(req, res);  

  


  const psid = itemId; // Using psid to find the product combination


  if (role === 'supplier') {
    try {

      // Find the product that contains the given psid inside its combinations
      const product = await SingleProduct.findOne({ "combinations.suppliers.psid": psid });
  
      if (!product) {
        return res.status(404).json({ message: "Product not found with this psid" });
      }
  
      // Find the specific combination and supplier within the product
      let updated = false;
      product.combinations.forEach((combination) => {
        combination.suppliers.forEach((supplier) => {
          if (supplier.psid === psid) {
            // Update the supplier with the provided data
            Object.keys(updateData).forEach((key) => {
              supplier[key] = updateData[key];
            });
            updated = true;
          }
        });
      });
  
      if (!updated) {
        return res.status(404).json({ message: "Supplier not found with this psid" });
      }
  
      // Save the updated product
      await product.save();

      // res.status(500).send()

      // res.status(201).json({ 
      //   message: "اطلاعات با موفقیت ویرایش شدند", 
      //   state: "ok",
      //   // errors: [
      //   //   {name: "price", label: "قیمت", message: "قیمت را به عدد وارد کنید"},
      //   //   {name: "maxOrder", label: "حداکثر موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},

      //   // ],
      //   product 
      // });
  
      res.status(201).json({ 
        message: "خطایی رخ داده است", 
        state: "error",
        errors: [
          {name: "price", label: "قیمت", message: "قیمت را به عدد وارد کنید"},
          {name: "maxOrder", label: "حداکثر موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},
          {name: "discount", label: "تخفیف", message: "تخفیف را به عدد وارد کنید"},
          {name: "minOrder", label: "حداقل موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},
          {name: "deliveryTime", label: "زمان تحویل", message: "زمان تحویل انتخاب نشده است"},
          {name: "payment_type", label: "نوع پرداخت", message: "نوع پرداخت انتخاب نشده است"},
          {name: "delivery", label: "محل ارسال", message: "محل ارسال انتخاب نشده است"},

        ],
        product
      });


      
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error" });
    }


  } else 
  {
    res.status(404).json({ message: "you don't have access to edit item" });

  }



};

