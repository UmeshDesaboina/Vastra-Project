import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import axios from 'axios';
import store from './store';
import config from './config/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Configure axios defaults
axios.defaults.baseURL = config.apiUrl;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Log configuration in development
if (config.isDevelopment) {
  console.log('🚀 Axios configured with baseURL:', axios.defaults.baseURL);
}

// Axios interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (config.isDevelopment) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
