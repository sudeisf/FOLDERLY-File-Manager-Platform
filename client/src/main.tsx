import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './components/Forms/login.tsx';
import Register from './components/Forms/SignIn.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedLayout from './components/layouts/ProtectedLayout.tsx';
import Home from './pages/home.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.tsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


// Define your router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true, // The base path "/"
        element: <Navigate to="protected/home" replace />, // Redirects "/" to "/protected/home"
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "protected",
        element: <ProtectedLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="home" replace />, // Redirects "/protected" to "/protected/home"
          },
          {
            path: "home",
            element: <Home />,
          },
        ],
      },
    ],
  },
]);

// Render the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <DndProvider backend={HTML5Backend}>
          <RouterProvider router={router} />
          <Toaster />
        </DndProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
