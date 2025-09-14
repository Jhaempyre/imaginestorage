import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout, LoginPage, RegisterPage } from "./components/auth";
import { PrivateLayout } from "./components/private";

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={<PrivateLayout />}>
          <Route index element={<div>Home Page - Add your main app content here</div>} />
          {/* Add more protected routes here */}
        </Route>
        
        {/* Public Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
