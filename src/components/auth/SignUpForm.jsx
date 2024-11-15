import { useForm } from "react-hook-form";
import Field from "../common/Field";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { api } from "../../api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
export default function SignUpForm() {
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
      <div className="">
        <Field label={"Full name"}>
          <div className="mb-4">
            <input
              {...register("name", {
                required: " name is required",
              })}
              type="text"
              id="name"
              name="name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="John Doe"
            />
          </div>
        </Field>
        <Field label={"Email"}>
          {" "}
          <div className="mb-4">
            <input
              {...register("email", {
                required: " email is required",
              })}
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Email address"
            />
          </div>
        </Field>
      </div>
      {/* // TODO add confirm password feature */}
      <div className="flex  gap-4">
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2">
            Enter your Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
            placeholder="Password"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300"
            placeholder="Confirm Password"
          />
        </div>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <input
          type="checkbox"
          id="admin"
          className="px-4 py-3 rounded-lg border border-gray-300"
        />
        <label htmlFor="admin" className="block ">
          Register as Admin
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-white py-3 rounded-lg mb-2"
      >
        Create Account
      </button>
    </form>
  );
}
