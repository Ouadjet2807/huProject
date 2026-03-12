import { configureStore } from '@reduxjs/toolkit'
import spaceReducer from './spaceSlice'

export const store = configureStore({
  reducer: {
    space: spaceReducer,
  },
})