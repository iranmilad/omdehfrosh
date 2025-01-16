import { combineReducers, configureStore } from "@reduxjs/toolkit";
import basketInfo from "./basket-info";
import global from "./global"
import editor from "./editor"

export default configureStore({
    reducer: {
        basketInfo,
        global,
        editor
    },
    devTools: process.env.NODE_ENV === "development" ? true : false
})