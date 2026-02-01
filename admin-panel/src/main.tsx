import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CASConfig from './pages/CASConfig';
import Situations from './pages/Situations';
import PromptElements from './pages/PromptElements';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="cas-config" element={<CASConfig />} />
          <Route path="situations" element={<Situations />} />
          <Route path="prompt-elements" element={<PromptElements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
