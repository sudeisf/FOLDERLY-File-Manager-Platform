import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom"

import ProtectedLayout from "@/components/layouts/ProtectedLayout"
import FileManagerLayout from "@/components/layouts/FileManagerLayout"
import Login from "@/components/Forms/login"
import Register from "@/components/Forms/SignIn"
import Folders from "@/pages/Folders"
import ForgotPassword from "@/pages/ForgotPassword"
import Home from "@/pages/home"
import AllFilesPage from "@/pages/files/AllFilesPage"
import SharedPage from "@/pages/files/SharedPage"
import StarredPage from "@/pages/files/StarredPage"
import { useAuth } from "@/context/AuthContext"

function GuestOnlyRoute() {
  const { isLoggedIn } = useAuth()

  if (isLoggedIn) {
    return <Navigate to="/protected/home" replace />
  }

  return <Outlet />
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/protected/home" replace />,
  },
  {
    element: <GuestOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
  {
    path: "/protected",
    element: <ProtectedLayout />,
    children: [
      {
        element: <FileManagerLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="home" replace />,
          },
          {
            path: "home",
            element: <Home />,
          },
          {
            path: "folders",
            element: <Folders />,
          },
          {
            path: "all-files",
            element: <AllFilesPage />,
          },
          {
            path: "starred",
            element: <StarredPage />,
          },
          {
            path: "shared",
            element: <SharedPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/protected/home" replace />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
