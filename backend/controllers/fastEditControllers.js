// backend\controllers\fastEditControllers.js
import SingleProduct from "../models/SingleProduct.js";
import jwt from "jsonwebtoken";
import getUserFromToken from "../libs/verifyToken.js";



export const updateProduct = async (req, res) => {
  const { updateData, itemId } = req.body;

  const psid = itemId;

  console.log("herererere",JSON.stringify(req.body))
  const { user_id, decoded, role } = getUserFromToken(req, res);

  if (role === 'supplier') {
    try {
      // Method 1: Using array filters (recommended for complex updates)
      const result = await SingleProduct.findOneAndUpdate(
        { "combinations.suppliers.psid": psid },
        {
          $set: Object.keys(updateData).reduce((acc, key) => {
            acc[`combinations.$[combination].suppliers.$[supplier].${key}`] = updateData[key];
            return acc;
          }, {})
        },
        {
          arrayFilters: [
            { "combination.suppliers.psid": psid }, // Filter for the combination that contains the supplier
            { "supplier.psid": psid } // Filter for the specific supplier
          ],
          new: true, // Return updated document
          runValidators: false // Skip validation
        }
      );

      // Alternative Method 2: Using positional operators (simpler approach)
      /*
      const result = await SingleProduct.findOneAndUpdate(
        { 
          "combinations.suppliers.psid": psid 
        },
        {
          $set: Object.keys(updateData).reduce((acc, key) => {
            acc[`combinations.$.suppliers.$[supplier].${key}`] = updateData[key];
            return acc;
          }, {})
        },
        {
          arrayFilters: [
            { "supplier.psid": psid }
          ],
          new: true,
          runValidators: false
        }
      );
      */

      if (!result) {
        return res.status(404).json({ message: "Product not found with this psid" });
      }


      res.status(201).json({ 
        message: "اطلاعات با موفقیت ویرایش شدند", 
        state: "ok",
        // errors: [
        //   {name: "price", label: "قیمت", message: "قیمت را به عدد وارد کنید"},
        //   {name: "maxOrder", label: "حداکثر موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},
        // ],
        product: result  
      });

      // res.status(201).json({ 
      //   message: "اطلاعات با موفقیت ویرایش شدند", 
      //   state: "ok",
      //   product: result 
      // });

    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else {
    res.status(403).json({ message: "you don't have access to edit item" });
  }
};

      
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
  
      // res.status(201).json({ 
      //   message: "خطایی رخ داده است", 
      //   state: "error",
      //   errors: [
      //     {name: "price", label: "قیمت", message: "قیمت را به عدد وارد کنید"},
      //     {name: "maxOrder", label: "حداکثر موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},
      //     {name: "discount", label: "تخفیف", message: "تخفیف را به عدد وارد کنید"},
      //     {name: "minOrder", label: "حداقل موجودی", message: "حداکثر موجودی را به عدد وارد کنید"},
      //     {name: "deliveryTime", label: "زمان تحویل", message: "زمان تحویل انتخاب نشده است"},
      //     {name: "payment_type", label: "نوع پرداخت", message: "نوع پرداخت انتخاب نشده است"},
      //     {name: "delivery", label: "محل ارسال", message: "محل ارسال انتخاب نشده است"},

      //   ],
      //   product
      // });
