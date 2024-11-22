import { toast } from "sonner";
import useAuth from "../hooks/useAuth";
import { Link, Navigate, Outlet } from "react-router-dom";
import Logo from "../assets/logo-white.svg";
import Avatar from "../assets/avater.webp";
export default function AdminRoute() {
  const { auth, setAuth } = useAuth();
  if (auth?.user === "user") {
    toast.message("You must be an admin to access this page");
  }
  return (
    <>
      {auth?.user?.role === "admin" ? (
        <div className="bg-gray-100 min-h-screen flex">
          <aside className="w-64 bg-primary p-6 flex flex-col">
            <Link to={"/"} className="mb-10">
              <img src={Logo} className="h-7" />
            </Link>
            <nav className="flex-grow">
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 rounded-lg bg-buzzr-purple bg-white text-primary font-bold"
                  >
                    Quizzes
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 rounded-lg text-gray-100 hover:bg-gray-100 hover:text-primary"
                  >
                    Settings
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 rounded-lg text-gray-100 hover:bg-gray-100 hover:text-primary"
                  >
                    Manage Users
                  </a>
                </li>

                <li>
                  <a
                    href="#"
                    className="block py-2 px-4 rounded-lg text-gray-100 hover:bg-gray-100 hover:text-primary"
                  >
                    Manage Roles
                  </a>
                </li>

                <li>
                  <Link
                    to="/signin"
                    onClick={() => {
                      setAuth({});
                    }}
                    className="block py-2 px-4 rounded-lg text-gray-100 hover:bg-gray-100 hover:text-primary"
                  >
                    Logout
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="mt-auto flex items-center">
              <img
                src={Avatar}
                alt="Avatar"
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <span className="text-white font-semibold">
                {auth?.user?.full_name}
              </span>
            </div>
          </aside>
          <Outlet />
        </div>
      ) : (
        <Navigate to="/" />
      )}
    </>
  );
}
