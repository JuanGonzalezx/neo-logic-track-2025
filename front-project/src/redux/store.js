import {configureStore} from "@reduxjs/toolkit";
import authreducer from "./authSlice"

export const store = configureStore({
    reducer: {
        auth: authreducer
    },
})
export default store;