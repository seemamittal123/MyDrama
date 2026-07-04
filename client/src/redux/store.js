import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import showSlice from "./showSlice.js";
const store = configureStore({
  reducer: {
    user: userSlice,
    show: showSlice,
  },
});


export default store;