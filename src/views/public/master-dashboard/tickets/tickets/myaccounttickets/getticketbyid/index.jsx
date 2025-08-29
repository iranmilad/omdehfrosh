// import { useDispatch, useSelector } from "react-redux";
// import { getProductById } from "../redux/homePageProductsActions";
// import { useState } from "react";

// const GetProductById = () => {
//     const dispatch = useDispatch();
//     const product = useSelector(state => state.homePageProducts.selectedProduct);
//     const [id, setId] = useState("");

//     const handleGetProduct = () => {
//         dispatch(getProductById(id));
//     };

//     return (
//         <div>
//             <h2>Get Product by ID</h2>
//             <input 
//                 type="text" 
//                 placeholder="Product ID" 
//                 value={id} 
//                 onChange={(e) => setId(e.target.value)}
//             />
//             <br />
//             <button onClick={handleGetProduct}>Get Product</button>
//             {product && <pre>{JSON.stringify(product, null, 2)}</pre>}
//         </div>
//     );
// };

// export default GetProductById;
