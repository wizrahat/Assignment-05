import { useParams } from "react-router-dom";
import useNewQuiz from "../../hooks/useNewQuiz";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import api from "../../api";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function NewQuizSetEntryPage() {
  const { newQuiz, setNewQuiz } = useNewQuiz();
  const { auth, setAuth } = useAuth();
  const { newQuizSetId } = useParams();
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false); // Tracks edit mode
  const [editingQuestionId, setEditingQuestionId] = useState(null); // Tracks the ID of the question being edited

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: null,
    },
  });

  const watchedOptions = watch("options");
  const watchedCorrectAnswer = watch("correctAnswer");

  // Create question mutation
  const createMutation = useMutation({
    mutationKey: ["createQuestion", newQuizSetId],
    mutationFn: async (data) => {
      const formattedData = {
        question: data.question,
        options: data.options,
        correctAnswer: data.options[data.correctAnswer - 1],
      };
      try {
        const res = await api.post(
          `/api/admin/quizzes/${newQuizSetId}/questions`,
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

            const retryResponse = await api.post(
              `/api/admin/quizzes/${newQuizSetId}/questions`,
              formattedData,
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
    onSuccess: (data) => {
      setNewQuiz((prevQuiz) => ({
        ...prevQuiz,
        questions: [...(prevQuiz.questions || []), data],
      }));
      resetForm();
    },
    onError: (err) => {
      setError(err);
    },
  });

  // Edit question mutation
  const editMutation = useMutation({
    mutationKey: ["editQuestion"],
    mutationFn: async (data) => {
      const formattedData = {
        question: data.question,
        options: data.options,
        correctAnswer: data.options[data.correctAnswer - 1],
      };

      const res = await api.patch(
        `/api/admin/questions/${editingQuestionId}`,
        formattedData,
        {
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        }
      );
      return res?.data?.data;
    },
    onSuccess: (data) => {
      setNewQuiz((prevQuiz) => ({
        ...prevQuiz,
        questions: prevQuiz.questions.map((q) =>
          q.id === editingQuestionId ? data : q
        ),
      }));
      resetForm();
    },
    onError: (err) => {
      setError(err);
    },
  });

  // Handle form submission
  const onSubmit = (data) => {
    if (data.correctAnswer === null) {
      toast.error("Please select the correct answer");
      return;
    }

    data.correctAnswer = parseInt(data.correctAnswer);

    if (editMode) {
      toast.promise(editMutation.mutateAsync(data), {
        loading: "Editing question...",
        success: "Successfully edited question",
        error: "Couldn't edit question",
      });
    } else {
      toast.promise(createMutation.mutateAsync(data), {
        loading: "Saving question...",
        success: "Successfully saved question",
        error: "Couldn't save question",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (question) => {
    setEditMode(true);
    setEditingQuestionId(question.id);
    setValue("question", question.question);
    setValue("options", question.options);
    setValue(
      "correctAnswer",
      question.options.indexOf(question.correctAnswer) + 1
    );
  };

  // Reset form
  const resetForm = () => {
    reset({ question: "", options: ["", "", "", ""], correctAnswer: null });
    setEditMode(false);
    setEditingQuestionId(null);
  };

  // Delete question
  const handleDelete = (id) => {
    setNewQuiz((prevQuiz) => ({
      ...prevQuiz,
      questions: prevQuiz.questions.filter((q) => q.id !== id),
    }));
    toast.success("Question deleted successfully!");
  };

  return (
    <main className="md:flex-grow pxs-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-8 lg:gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">{newQuiz.title}</h2>
          <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block mb-4">
            Total number of questions: {newQuiz?.questions?.length || 0}
          </div>
          <p className="text-gray-600 mb-4">{newQuiz.description}</p>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              {editMode ? "Edit Quiz" : "Create Quiz"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label
                  htmlFor="quizTitle"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Question Title
                </label>
                <input
                  type="text"
                  id="quizTitle"
                  {...register("question", {
                    required: "Question is required",
                  })}
                  className="w-full mt-2 p-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="Enter quiz title"
                />
                {errors.question && (
                  <p className="text-red-500 text-sm">
                    {errors.question.message}
                  </p>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-4">Add Options</p>
              <div id="optionsContainer" className="space-y-2 mt-4">
                {watchedOptions.map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 px-4 py-1 rounded-md group focus-within:ring focus-within:ring-primary/80 bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={
                        watchedCorrectAnswer === index + 1 ? true : false
                      }
                      onChange={() => setValue("correctAnswer", index + 1)}
                      className="cursor-pointer"
                    />
                    <input
                      type="text"
                      id={`optionText${index}`}
                      {...register(`options.${index}`, {
                        required: `Option ${index + 1} is required`,
                      })}
                      className="w-full p-2 bg-transparent rounded-md text-foreground outline-none focus:ring-0"
                      placeholder={`Option ${index + 1}`}
                    />
                    {errors.options?.[index] && (
                      <p className="text-red-500 text-sm">
                        {errors.options[index].message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full mt-3 bg-primary text-white text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                {editMode ? "Edit Question" : "Save Question"}
              </button>
            </form>
          </div>
        </div>

        <div className="px-4">
          {newQuiz?.questions?.map((question, index) => (
            <div
              key={question.id}
              className="rounded-lg overflow-hidden shadow-sm mb-4"
            >
              <div className="bg-white p-6 !pb-2">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {index + 1}. {question.question}
                  </h3>
                </div>
                <div className="space-y-2">
                  {question.options.map((option) => (
                    <div
                      key={option}
                      className={`flex items-center space-x-3 p-2 border rounded ${
                        question.correctAnswer === option
                          ? "bg-green-100 text-green-700"
                          : ""
                      }`}
                    >
                      {question.correctAnswer === option ? <Check /> : ""}

                      <span>{option}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex space-x-4 bg-primary/10 px-6 py-2">
                <button
                  onClick={() => handleEdit(question)}
                  className="text-primary hover:text-primary/80"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
