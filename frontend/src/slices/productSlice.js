import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async ({ keyword = '', pageNumber = '', category = '', featured = false, trending = false }) => {
    try {
      let url = `/api/products?keyword=${keyword}&pageNumber=${pageNumber}`;
      if (category) url += `&category=${category}`;
      if (featured) url += '&featured=true';
      if (trending) url += '&trending=true';
      
      const { data } = await axios.get(url);
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      throw new Error(message);
    }
  }
);

export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data;
    } catch (error) {
      const message = error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
      throw new Error(message);
    }
  }
);

// Product list slice
const productListSlice = createSlice({
  name: 'productList',
  initialState: {
    products: [],
    pages: 0,
    page: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Product details slice
const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState: {
    product: { reviews: [] },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const productListReducer = productListSlice.reducer;
export const productDetailsReducer = productDetailsSlice.reducer;