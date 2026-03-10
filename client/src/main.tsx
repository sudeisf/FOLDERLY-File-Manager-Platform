import { QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"

import App from "./App"
import ThemeProvider from "./components/providers/ThemeProvider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./context/AuthContext"
import { queryClient } from "./lib/queryClient"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <DndProvider backend={HTML5Backend}>
            <App />
            <Toaster />
          </DndProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
)
