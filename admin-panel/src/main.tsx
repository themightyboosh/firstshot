import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminProvider } from './lib/AdminContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CASConfig from './pages/CASConfig';
import Situations from './pages/Situations';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cas-config" element={<CASConfig />} />
            <Route path="situations" element={<Situations />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  </React.StrictMode>,
);
