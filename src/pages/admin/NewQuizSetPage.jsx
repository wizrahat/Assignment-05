import { set, useForm } from "react-hook-form";
import Field from "../../components/common/Field";
import { useMutation } from "@tanstack/react-query";
import api from "../../api";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import useNewQuiz from "../../hooks/useNewQuiz";

export default function NewQuizSetPage() {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();
  const { setNewQuiz } = useNewQuiz();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const createNewQuizSet = async (data) => {
    try {
      const res = await api.post(`/api/admin/quizzes`, data, {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      });
      return res?.data?.data;
    } catch (err) {
      if (err.response?.status === 401) {
        try {
          const refreshResponse = await api.post(
            "/api/auth/refresh-token",
            { refreshToken: auth?.refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const { accessToken, refreshToken } = refreshResponse.data.data;

          setAuth((prev) => ({
            ...prev,
            accessToken,
            refreshToken,
          }));

          const retryResponse = await api.post(`/api/admin/quizzes/`, data, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          return retryResponse;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw refreshError;
        }
      }
      setError("root.random", {
        type: "random",
        message:
          "a quiz set with this title already exists or unexpected error occured",
      });
    }
  };
  const mutation = useMutation({
    mutationFn: createNewQuizSet,
    onSuccess: (data) => {
      setNewQuiz(data.data.data);
      navigate(`/dashboard/new/${data.data.data.id}`);
    },
    onError: () => {
      setError("Could not create new quiz set");
    },
  });

  const onSubmit = async (data) => {
    const newQuiz = {
      title: data.quizTitle,
      description: data.quizDescription,
    };

    toast.promise(mutation.mutateAsync(newQuiz), {
      loading: "Creating new quiz...",
      success: "Successfully created new quiz!",
      error: "Couldn't create new quiz",
    });
  };

  return (
    <main className="md:flex-grow px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* <!-- Left Column --> */}
        <div>
          <Link
            to={"/"}
            className="inline-flex items-center text-sm text-gray-600 mb-6 hover:text-buzzr-purple"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to Home
          </Link>

          <h2 className="text-3xl font-bold mb-6">
            Give your quiz title and description
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Field label="Quiz title">
              <div className="mb-4">
                <input
                  {...register("quizTitle", {
                    required: "Quiz title is required",
                  })}
                  type="text"
                  id="quizTitle"
                  name="quizTitle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-buzzr-purple focus:border-buzzr-purple"
                  placeholder="Quiz"
                />
                {errors.quizTitle && (
                  <span className="text-red-500 ">
                    {errors.quizTitle.message}
                  </span>
                )}
              </div>
            </Field>
            <Field label="Description">
              <div className="mb-6">
                <textarea
                  {...register("quizDescription", {
                    required: "Description is required",
                  })}
                  id="quizDescription"
                  name="quizDescription"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-buzzr-purple focus:border-buzzr-purple"
                  placeholder="Description"
                ></textarea>
                {errors.quizDescription && (
                  <span className="text-red-500">
                    {errors.quizDescription.message}
                  </span>
                )}
              </div>
            </Field>

            <button
              type="submit"
              className="w-full block text-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Next
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
