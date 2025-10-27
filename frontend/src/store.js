import { configureStore } from '@reduxjs/toolkit';
import { productListReducer, productDetailsReducer } from './slices/productSlice';
import { cartReducer } from './slices/cartSlice';
import { userReducer } from './slices/userSlice';
import { wishlistReducer } from './slices/wishlistSlice';

const store = configureStore({
  reducer: {
    productList: productListReducer,
    productDetails: productDetailsReducer,
    cart: cartReducer,
    user: userReducer,
    wishlist: wishlistReducer,
  },
  preloadedState: {
    cart: {
      cartItems: localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems'))
        : [],
      shippingAddress: localStorage.getItem('shippingAddress')
        ? JSON.parse(localStorage.getItem('shippingAddress'))
        : {},
      paymentMethod: localStorage.getItem('paymentMethod')
        ? JSON.parse(localStorage.getItem('paymentMethod'))
        : 'COD',
      paymentDetails: localStorage.getItem('paymentDetails')
        ? JSON.parse(localStorage.getItem('paymentDetails'))
        : {},
    },
    user: {
      userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
    },
    wishlist: {
      wishlistItems: localStorage.getItem('wishlistItems')
        ? JSON.parse(localStorage.getItem('wishlistItems'))
        : [],
    },
  },
});

export default store;
