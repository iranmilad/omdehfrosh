import { combineReducers, configureStore } from "@reduxjs/toolkit";
import basketInfo from "./basket-info";
import global from "./global"

export default configureStore({
    reducer: {
        basketInfo,
        global
    },
    devTools: process.env.NODE_ENV === "development" ? true : false
})