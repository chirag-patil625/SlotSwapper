import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from './pages/Dashboard.tsx';
import Marketplace from './pages/Marketplace.tsx';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Auth from './pages/Auth.tsx';
import Requests from './pages/Requests.tsx';
import App from './App.tsx';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <Auth />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/marketplace',
        element: <Marketplace />,
      },
      {
        path: '/requests',
        element: <Requests />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>
);


