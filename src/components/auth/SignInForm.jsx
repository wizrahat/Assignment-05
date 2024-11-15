import { useForm } from "react-hook-form";
import Field from "../common/Field";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { api } from "../../api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SignInForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(`/auth/api/login`, data);
      if (res.status === 200) {
        return res.data;
      } else {
        throw new Error("Login failed");
      }
    },
    onSuccess: (data) => {
      const { token, user } = data;
      if (token) {
        const authToken = token.token;
        const refreshToken = token.refreshToken;
        setAuth({ user, authToken, refreshToken });
        navigate("/");
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
    // Use toast.promise to handle the mutation with feedback using sonner
    toast.promise(mutation.mutateAsync(data), {
      loading: "Signing in...",
      success: "Successfully logged in!",
      error: "Couldn't find user",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* <!-- email --> */}
      <Field
        label="Enter your username or email address"
        error={errors.username}
      >
        <div className="mb-3 ">
          <input
            {...register("username", {
              required: " email or username is required",
            })}
            type="text"
            id="username"
            name="username"
            className={`w-full px-4 py-3 rounded-lg border border-gray-300 ${
              errors.username ? " border-red-500" : "border-gray-300"
            } `}
            placeholder="Username or email address"
          />
        </div>
      </Field>
      <Field label="Enter your Password" error={errors.password}>
        <div className="mb-3 ">
          {" "}
          <input
            {...register("password", {
              required: " password is required",
              minLength: {
                value: 8,
                message: "password must be atleast 8 characters",
              },
            })}
            className={` w-full px-4 py-3 rounded-lg border border-gray-300 ${
              errors.password ? " border-red-500" : "border-gray-300"
            }`}
            name="password"
            type="password"
            id="password"
            placeholder="Password"
          />
        </div>
      </Field>
      <Field>
        {" "}
        <div className="mb-1 flex gap-2 items-center">
          <input
            type="checkbox"
            id="admin"
            className="px-4 py-3 rounded-lg border border-gray-300"
          />
          <label htmlFor="admin" className="block ">
            Login as Admin
          </label>
        </div>
      </Field>
      {/* <!-- password --> */}
      {/* // TODO FIX FONT WEIGHT */}
      <div role="alert" className="text-red-600 mb-2 ">
        {errors?.root?.random?.message}
      </div>
      <Field>
        {" "}
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
