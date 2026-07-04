import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  watchList: [],
  history: [],
};
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setWatchList: (state, action) => {
      state.watchList = action.payload;
    },
    addWatchList: (state, action) => {
      state.watchList.unshift(action.payload);
    },
    removeWatchList: (state, action) => {
      const showId = action.payload;
      state.watchList = state.watchList.filter(
        (show) => show._id.toSring() != showId.toSring(),
      );
    },
    setHistory: (state, action) => {
      state.history = action.payload;
    },
  },
});

export const {
  setUser,
  setWatchList,
  setHistory,
  addWatchList,
  removeWatchList,
} = userSlice.actions;
export default userSlice.reducer;
