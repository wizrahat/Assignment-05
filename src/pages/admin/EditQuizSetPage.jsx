import { useForm } from "react-hook-form";
import Field from "../../components/common/Field";
import { useMutation } from "@tanstack/react-query";
import api from "../../api";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";
import ArrowLeftIcon from "../../components/icons/ArrowLeftIcon";
import QuizDeleteModal from "../../components/quiz/QuizDeleteModal";

export default function EditQuizSetPage() {
  const { auth, setAuth } = useAuth();
  const { quizSetId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quizTitle = searchParams.get("title");
  const quizDescription = searchParams.get("description");
  const quizStatus = searchParams.get("status");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isPublished, setIsPublished] = useState(quizStatus === "published");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      quizTitle: quizTitle,
      quizDescription: quizDescription,
    },
  });
  const deleteMutation = useMutation({
    mutationKey: ["deleteMutation"],
    mutationFn: async (data) => {
      try {
        const res = await api.delete(`/api/admin/quizzes/${data}`, {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        });

        return res?.data.data;
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

            const retryResponse = await api.delete(
              `/api/admin/quizzes/${data}`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            return retryResponse?.data?.data;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            throw refreshError;
          }
        }
        console.error("Error fetching quiz data:", err);
        throw err;
      }
    },
    onSuccess: () => {
      navigate(`/dashboard`);
    },
    onError: (err) => {
      setError(err);
    },
  });

  const editQuizSet = async (data) => {
    const formattedData = {
      title: data.title,
      description: data.description,
      status: isPublished ? "published" : "draft",
    };
    console.log(formattedData);
    try {
      const res = await api.patch(
        `/api/admin/quizzes/${quizSetId}`,
        formattedData,

        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
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

          const retryResponse = await api.patch(
            `/api/admin/quizzes/${quizSetId}`,
            formattedData,
            {
              headers: {
                Authorization: `Bearer ${auth?.accessToken}`,
              },
            }
          );

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
    mutationFn: editQuizSet,
    onSuccess: () => {
      navigate(`/dashboard`);
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
      loading: "Saving quiz...",
      success: "Successfully save quiz!",
      error: "Couldn't save quiz",
    });
  };
  const handleDelete = () => {
    toast.promise(deleteMutation.mutateAsync(quizSetId), {
      loading: "Deleting question...",
      success: "Question deleted successfully!",
      error: "Couldn't delete question",
    });
  };
  return (
    <>
      {" "}
      {isModalOpen && (
        <QuizDeleteModal
          handleDelete={handleDelete}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
      <main className="md:flex-grow px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* <!-- Left Column --> */}
          <div className="w-fit">
            <Link
              to={"/dashboard"}
              className="inline-flex items-center text-sm text-gray-600 mb-6 hover:text-buzzr-purple"
            >
              <ArrowLeftIcon />
              Back to Dashboard
            </Link>
            <div className="flex gap-2 items-center mb-6 ">
              {" "}
              <h2 className="text-3xl font-bold ">
                Edit your quiz title and description
              </h2>{" "}
              <div className="flex gap-4 items-center">
                {" "}
                <button
                  onClick={() => {
                    setIsPublished(!isPublished);
                    toast.success(
                      `${
                        isPublished ? "Unpublished" : "Published"
                      }  successfully!`
                    );
                    toast.info(
                      "Remember to save before after publishing or unpublishing"
                    );
                  }}
                  className=" inline text-center border-primary border-[1px]  transition-all bg-white text-black hover:text-white py-2 px-4 rounded-full hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  {isPublished ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className=" inline text-center border-red-700 border-[1px]  transition-all bg-white text-red-700 hover:text-white py-2 px-4 rounded-full hover:bg-red-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Delete
                </button>
              </div>
            </div>

            <form>
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
                onClick={handleSubmit(onSubmit)}
                className="w-full block text-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
