// import { useDispatch } from "react-redux";
// import { editProduct } from "../redux/homePageProductsActions";
// import { useState } from "react";

// const EditProduct = () => {
//     const dispatch = useDispatch();
//     const [id, setId] = useState("");
//     const [updatedData, setUpdatedData] = useState("");

//     const handleEdit = () => {
//         try {
//             const parsedData = JSON.parse(updatedData);
//             dispatch(editProduct(id, parsedData));
//         } catch (error) {
//             alert("Invalid JSON format");
//         }
//     };

//     return (
//         <div>
//             <h2>Edit Product</h2>
//             <input 
//                 type="text" 
//                 placeholder="Product ID" 
//                 value={id} 
//                 onChange={(e) => setId(e.target.value)}
//             />
//             <textarea 
//                 rows="5" 
//                 cols="50" 
//                 placeholder='New Product JSON'
//                 value={updatedData} 
//                 onChange={(e) => setUpdatedData(e.target.value)}
//             />
//             <br />
//             <button onClick={handleEdit}>Edit Product</button>
//         </div>
//     );
// };

// export default EditProduct;
