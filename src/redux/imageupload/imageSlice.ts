import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface ImageState {
  value: string
}

const initialState: ImageState = {
  value: '',
}

export const imageSlice = createSlice({
  name: 'imageUrl',
  initialState,
  reducers: {
    setImageUrl: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setImageUrl } = imageSlice.actions

export default imageSlice.reducer