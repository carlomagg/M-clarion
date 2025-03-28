import { createSlice } from "@reduxjs/toolkit";

const globalSlice = createSlice({
  name: "globalSlice",
  initialState: {
    formShow: false,
    showAssignedProcess: false,
    title: "",
    processType: "",
    processTypeTitle: "",
  },
  reducers: {
    toggleFormShow: (state, action) => {
      state.formShow = !state.formShow;
      state.title = action.payload;
    },
    toggleShowAssignedProcess: (state, action) => {
      state.showAssignedProcess = true;
      state.processType = action.payload.type;
      state.processTypeTitle = action.payload.title;
    },
    hideAssignedProcess: (state) => {
      state.showAssignedProcess = false;
    },
  },
});

export const {
  toggleFormShow,
  toggleShowAssignedProcess,
  hideAssignedProcess,
} = globalSlice.actions;
export default globalSlice.reducer;
