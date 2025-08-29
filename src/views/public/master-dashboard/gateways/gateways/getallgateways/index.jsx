// import { useDispatch, useSelector } from "react-redux";
// import { useEffect } from "react";
// import { getAllProducts } from "../redux/homePageProductsActions";

// const GetAllProducts = () => {
//     const dispatch = useDispatch();
//     const products = useSelector(state => state.homePageProducts.products);

//     useEffect(() => {
//         dispatch(getAllProducts());
//     }, [dispatch]);

//     return (
//         <div>
//             <h2>All Products</h2>
//             <pre>{JSON.stringify(products, null, 2)}</pre>
//         </div>
//     );
// };

// export default GetAllProducts;
