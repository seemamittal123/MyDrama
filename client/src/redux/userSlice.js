import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: true,
  watchList: [],
  history: [],
  continueWatch: [],
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
      state.loading = false;
    },
    removeWatchList: (state, action) => {
      const showId = action.payload;
      state.watchList = state.watchList.filter(
        (show) => show._id.toSring() != showId.toSring(),
      );
    },
    setHistory: (state, action) => {
      state.history = action.payload;
      state.loading=false;
    },
    setContinueWatch: (state, action) => {
      state.continueWatch = action.payload;
    },
  },
});

export const {
  setUser,
  setWatchList,
  setHistory,
  setContinueWatch,
  addWatchList,
  removeWatchList,
} = userSlice.actions;
export default userSlice.reducer;
