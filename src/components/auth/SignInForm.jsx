import { useForm } from "react-hook-form";
import Field from "../common/Field";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "../../api";

export default function SignInForm() {
  const navigate = useNavigate();
  //TODO: add redirection to previous page
  // const location = useLocation();
  // const previousPath = location.state?.from?.pathname || "/";
  const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/api/auth/login`, data);
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Sign in failed");
      }
    },
    onSuccess: (data) => {
      const { tokens, user } = data.data;
      if (tokens) {
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;
        setAuth({ user, accessToken, refreshToken });
        if (user.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      }
    },
    onError: () => {
      setError("root.random", {
        type: "random",
        message: "Username or password is incorrect",
      });
    },
  });

  const onSubmit = async (data) => {
    const user = { email: data.email, password: data.password };
    toast.promise(mutation.mutateAsync(user), {
      loading: "Signing in...",
      success: "Successfully signed in!",
      error: "Couldn't find user",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field label="Enter your username or email address" error={errors.email}>
        <div className="mb-3 ">
          <input
            {...register("email", {
              required: "Email or username is required",
            })}
            type="text"
            id="email"
            name="email"
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 ${
              errors.email ? " border-red-500" : "border-gray-300"
            } `}
            placeholder="Username or email address"
          />
        </div>
      </Field>
      <Field label="Enter your Password" error={errors.password}>
        <div className="mb-6 ">
          <input
            {...register("password", {
              required: "Password is required",
            })}
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 ${
              errors.password ? " border-red-500" : "border-gray-300"
            }`}
            name="password"
            type="password"
            id="password"
            placeholder="Password"
          />
        </div>
      </Field>
      {/* //*removed redundent checkbox */}
      {/* <Field>
        <div className="mb-1 flex gap-2 items-center">
          <input
            {...register("admin")}
            type="checkbox"
            id="admin"
            name="admin"
            className="px-4 py-3 rounded-lg border border-gray-300"
          />
          <label htmlFor="admin" className="block ">
            Login as Admin
          </label>
        </div>
      </Field> */}
      <div role="alert" className="text-red-600 mb-2 ">
        {errors?.root?.random?.message}
      </div>
      <Field>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg mb-4"
        >
          Sign in
        </button>
      </Field>
    </form>
  );
}
