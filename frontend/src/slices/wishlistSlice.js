import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlistItems: localStorage.getItem('wishlistItems')
      ? JSON.parse(localStorage.getItem('wishlistItems'))
      : [],
  },
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const existItem = state.wishlistItems.find(x => x.product === item.product);

      if (!existItem) {
        state.wishlistItems = [...state.wishlistItems, item];
        localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
      }
    },
    removeFromWishlist: (state, action) => {
      state.wishlistItems = state.wishlistItems.filter(x => x.product !== action.payload);
      localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
    },
  },
});

export const { addToWishlist, removeFromWishlist } = wishlistSlice.actions;
export const wishlistReducer = wishlistSlice.reducer;