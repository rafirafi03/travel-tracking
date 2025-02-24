// PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("userToken");

  // If token exists, redirect to home
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;