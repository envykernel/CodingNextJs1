// Third-party Imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Type Imports
type LoadingState = {
  isLoading: boolean
  loadingMessage?: string
}

const initialState: LoadingState = {
  isLoading: false,
  loadingMessage: undefined
}

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ isLoading: boolean; message?: string }>) => {
      state.isLoading = action.payload.isLoading
      state.loadingMessage = action.payload.message
    }
  }
})

export const { setLoading } = loadingSlice.actions

export default loadingSlice.reducer
