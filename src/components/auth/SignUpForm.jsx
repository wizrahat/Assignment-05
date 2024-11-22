import { useForm } from "react-hook-form";
import Field from "../common/Field";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import api from "../../api";

export default function SignUpForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm();

  const password = watch("password");
  const mutation = useMutation({
    mutationFn: async (data) => {
      // Ensure the API receives the correct payload
      const res = await api.post(`/api/auth/register`, data);
      return res.data;
    },
    onSuccess: () => {
      navigate("/signin");
    },
    onError: (error) => {
      if (error.response?.data?.message === "Email already registered") {
        setError("email", {
          type: "manual",
          message:
            "This email is already registered. Please use a different one.",
        });
      } else {
        setError("root.random", {
          type: "random",
          message: "An unexpected error occurred. Please try again later.",
        });
      }
    },
  });

  const onSubmit = async (data) => {
    const user = {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      role: data.admin ? "admin" : "user", // Only add 'role' if required
    };
    if (!data.admin) {
      delete user.role; // Remove role if not needed
    }

    try {
      // Perform the signup and handle the success or error directly in toast
      toast.promise(mutation.mutateAsync(user), {
        loading: "Signing up...",
        success: "Successfully signed up!",
        error: (err) => {
          if (err.response?.data?.message === "Email already registered") {
            return "This email is already registered. Please try another one.";
          }
          if (err.response?.data?.message === "Validation failed") {
            return "Please enter a valid email address with a proper TLD (e.g., .com, .io, .au)";
          }
          return "Couldn't sign up. Please try again later.";
        },
      });
    } catch (error) {
      console.log("Signup error:", error); // For debugging
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="">
        <Field label={"Full name"} error={errors.full_name}>
          <div className="mb-2">
            <input
              {...register("full_name", {
                required: " name is required",
              })}
              type="text"
              id="full_name"
              name="full_name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="John Doe"
            />
          </div>
        </Field>
        <Field label={"Email"} error={errors.email}>
          <div className="mb-4">
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  // This pattern checks for valid email format with a proper TLD
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message:
                    "Please enter a valid email address with a proper TLD (e.g., .com, .io, .au)",
                },
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

      <div className="flex gap-4">
        <Field label={"Enter your Password"} error={errors.password}>
          <div className="mb-6">
            <input
              {...register("password", {
                required: " password is required",
                minLength: {
                  value: 8,
                  message: "password must be atleast 8 characters",
                },
              })}
              type="password"
              id="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Password"
            />
          </div>
        </Field>
        <Field label={"Confirm Password"} error={errors.confirmPassword}>
          <div className="mb-6">
            <input
              {...register("confirmPassword", {
                required: " password is required",
                validate: (value) =>
                  value === password || "Password does not match",
              })}
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full px-4 py-3 rounded-lg border border-gray-300"
              placeholder="Confirm Password"
            />
          </div>
        </Field>
      </div>
      <Field label={"Register as Admin"}>
        <div className="mb-6 flex gap-2 items-center">
          <input
            {...register("admin")}
            type="checkbox"
            id="admin"
            name="admin"
            className="px-4 py-3 rounded-lg border border-gray-300"
          />
        </div>
      </Field>
      <Field>
        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg mb-2"
        >
          Create Account
        </button>
      </Field>
    </form>
  );
}
