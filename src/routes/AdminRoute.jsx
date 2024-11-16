import useAuth from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";
import ErrorPage from "../pages/ErrorPage";

export default function AdminRoute() {
  const { auth } = useAuth();
  return <>{auth?.user?.role === "admin" ? <Outlet /> : <ErrorPage />}</>;
}
