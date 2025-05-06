import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Set default axios config
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 