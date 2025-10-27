import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cartItems: [],
    shippingAddress: {},
    paymentMethod: '',
    // store only non-sensitive, masked payment info
    paymentDetails: {},
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find(x => x.product === item.product);

      if (existItem) {
        state.cartItems = state.cartItems.map(x => 
          x.product === existItem.product ? item : x
        );
      } else {
        state.cartItems = [...state.cartItems, item];
      }
      
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(x => x.product !== action.payload);
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload));
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem('paymentMethod', JSON.stringify(action.payload));
    },
    savePaymentDetails: (state, action) => {
      state.paymentDetails = action.payload;
      localStorage.setItem('paymentDetails', JSON.stringify(action.payload));
    },
    clearCartItems: (state) => {
      state.cartItems = [];
      localStorage.removeItem('cartItems');
    },
  },
});

export const { 
  addToCart, 
  removeFromCart, 
  saveShippingAddress, 
  savePaymentMethod,
  savePaymentDetails,
  clearCartItems
} = cartSlice.actions;

export const cartReducer = cartSlice.reducer;