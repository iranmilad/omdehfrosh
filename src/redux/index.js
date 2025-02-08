import { combineReducers, configureStore } from "@reduxjs/toolkit";
import basketInfo from "./basket-info";
import global from "./global"
import editor from "./editor"
import cart from './cart';

export default configureStore({
    reducer: {
        basketInfo,
        global,
        editor,
        cart
    },
    devTools: process.env.NODE_ENV === "development" ? true : false
})