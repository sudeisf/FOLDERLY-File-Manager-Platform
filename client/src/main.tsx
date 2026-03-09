import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Login from './components/Forms/login.tsx';
import Register from './components/Forms/SignIn.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import ProtectedLayout from './components/layouts/ProtectedLayout.tsx';
import Home from './pages/home.tsx';
import FileManagerLayout from './components/layouts/FileManagerLayout.tsx';
import AllFilesPage from './pages/files/AllFilesPage.tsx';
import SharedPage from './pages/files/SharedPage.tsx';
import StarredPage from './pages/files/StarredPage.tsx';
import { Toaster } from './components/ui/toaster.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient.tsx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ThemeProvider from './components/providers/ThemeProvider.tsx';


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
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "protected",
        element: <ProtectedLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="all-files" replace />, // Redirects "/protected" to "/protected/all-files"
          },
          {
            element: <FileManagerLayout />,
            children: [
              {
                path: "home",
                element: <Home />,
              },
              {
                path: "all-files",
                element: <AllFilesPage />,
              },
              {
                path: "shared",
                element: <SharedPage />,
              },
              {
                path: "starred",
                element: <StarredPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

// Render the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>
            <RouterProvider router={router} />
            <Toaster />
          </DndProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
