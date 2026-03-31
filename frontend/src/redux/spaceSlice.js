import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  agenda: {},
  caregivers: [],
  created_at: "",
  created_by: {},
  description: "",
  id: "",
  name: "",
  recipients: [],
  todos: {},
  updated_at: "",
};

const spaceSlice = createSlice({
  name: "space",
  initialState,
  reducers: {
    setValues(state, action) {
      for (const [key, value] of Object.entries(action.payload)) {
        state[key] = value
      }
    },
  },
});



export const { setValues, alterValue } = spaceSlice.actions;
export default spaceSlice.reducer;
