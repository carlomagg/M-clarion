import { createSlice } from "@reduxjs/toolkit";

const globalSlice = createSlice({
  name: "globalSlice",
  initialState: {
    formShow: false,
    showAssignedProcess: false,
    title: "",
    processType: "",
    processTypeTitle: "",
    processId: null,
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
      state.processId = action.payload.id;
    },
    hideAssignedProcess: (state) => {
      state.showAssignedProcess = false;
      state.processId = null;
    },
  },
});

export const {
  toggleFormShow,
  toggleShowAssignedProcess,
  hideAssignedProcess,
} = globalSlice.actions;
export default globalSlice.reducer;
