import { useForm } from "react-hook-form";
import Field from "../common/Field";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { api } from "../../api";

export default function LoginForm() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  async function onSubmit(data) {
    try {
      const res = await api.post(`/api/login`, data);

      if (res.status === 200) {
        const { token, user } = res.data;
        if (token) {
          const authToken = token.token;
          const refreshToken = token.refreshToken;
          setAuth({ user, authToken, refreshToken });
          navigate("/");
        }
      }
    } catch (err) {
      setError("root.random", {
        type: "random",
        message: "Username or password is incorrect",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-b border-[#3F3F3F] pb-10 lg:pb-[60px]"
    >
      {/* <!-- email --> */}
      <Field label="Email" error={errors.email}>
        {" "}
        <input
          {...register("email", { required: " email is required" })}
          className={` auth-input ${
            errors.email ? " border-red-500" : "border-gray-200"
          }`}
          name="email"
          type="email"
          id="email"
        />
      </Field>
      <Field label="Password" error={errors.password}>
        {" "}
        <input
          {...register("password", {
            required: " password is required",
            minLength: {
              value: 8,
              message: "password must be atleast 8 characters",
            },
          })}
          className={` auth-input ${
            errors.password ? " border-red-500" : "border-gray-200"
          }`}
          name="password"
          type="password"
          id="password"
        />
      </Field>

      {/* <!-- password --> */}
      <div role="alert" className="text-red-500">
        {errors?.root?.random?.message}
      </div>
      <Field>
        {" "}
        <button
          className="auth-input bg-lwsGreen font-bold text-deepDark transition-all hover:opacity-90"
          type="submit"
        >
          Login
        </button>
      </Field>
    </form>
  );
}
