import useAuth from "../hooks/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  const { auth } = useAuth();
  return (
    <>
      {auth?.user ? (
        <>
          <Outlet />
        </>
      ) : (
        <Navigate to="/signin" />
      )}
    </>
  );
}
