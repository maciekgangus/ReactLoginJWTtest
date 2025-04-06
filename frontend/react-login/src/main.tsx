import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import AuthProvider from "./context/AuthProvider";



createRoot(document.getElementById("root")!).render(
  
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  
);
