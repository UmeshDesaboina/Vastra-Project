import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import WishlistScreen from './screens/WishlistScreen';
import OrderTrackingScreen from './screens/OrderTrackingScreen';
import AdminDashboardScreen from './screens/admin/DashboardScreen';
import AdminProductListScreen from './screens/admin/ProductListScreen';
import AdminOrderListScreen from './screens/admin/OrderListScreen';
import AdminUserListScreen from './screens/admin/UserListScreen';
import AdminCategoryListScreen from './screens/admin/CategoryListScreen';
import AdminBannerListScreen from './screens/admin/BannerListScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import AdminProductEditScreen from './screens/admin/ProductEditScreen';

import './App.css';

const App = () => {
  return (
    <Router>
      <Header />
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:id" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/myorders" element={<MyOrdersScreen />} />
            <Route path="/shipping" element={<ShippingScreen />} />
            <Route path="/payment" element={<PaymentScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />
            <Route path="/order/:id" element={<OrderScreen />} />
            <Route path="/wishlist" element={<WishlistScreen />} />
            <Route path="/track/:id" element={<OrderTrackingScreen />} />
            <Route path="/admin/dashboard" element={<AdminDashboardScreen />} />
            <Route path="/admin/productlist" element={<AdminProductListScreen />} />
            <Route path="/admin/product/:id/edit" element={<AdminProductEditScreen />} />
            <Route path="/admin/orderlist" element={<AdminOrderListScreen />} />
            <Route path="/admin/userlist" element={<AdminUserListScreen />} />
            <Route path="/admin/categorylist" element={<AdminCategoryListScreen />} />
            <Route path="/admin/bannerlist" element={<AdminBannerListScreen />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
