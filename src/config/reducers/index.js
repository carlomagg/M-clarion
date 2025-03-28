import { combineReducers } from "@reduxjs/toolkit";
import globalSlice from "../slices/globalSlice"


const rootReducer = combineReducers({
   global: globalSlice
})

export default rootReducer;