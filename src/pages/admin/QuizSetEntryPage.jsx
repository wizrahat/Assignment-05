import { Link, useNavigate, useParams } from "react-router-dom";
import useNewQuiz from "../../hooks/useNewQuiz";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import api from "../../api";
import { toast } from "sonner";
import Error from "../../components/Error";

export default function QuizSetEntryPage() {
  const { newQuiz, setNewQuiz } = useNewQuiz();
  const { auth } = useAuth(); // No need to modify the auth state
  const { newQuizSet } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [editQuestion, setEditQuestion] = useState(null);
  let selectedId = 0;
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

  const mutation = useMutation({
    mutationKey: ["createQuestion", newQuizSet.id],
    mutationFn: (data) => {
      const formattedData = {
        question: data.question,
        options: data.options,
        correctAnswer: data.options[data.correctAnswer - 1], // Use 1-based index for correct answer
      };

      // If we're editing, use PATCH, otherwise use POST for creating
      if (editQuestion) {
        return api.patch(
          `/api/admin/questions/${editQuestion.id}`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        return api.post(
          `/api/admin/quizzes/${newQuizSet}/questions`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    },
    onSuccess: (data) => {
      if (editQuestion) {
        // Update an existing question
        const updatedQuestions = newQuiz.questions.map((q) =>
          q.id === editQuestion.id ? data.data.data : q
        );
        setNewQuiz((prev) => ({ ...prev, questions: updatedQuestions }));
        toast.success("Successfully updated question");
      } else {
        // Add a new question
        setNewQuiz((prev) => ({
          ...prev,
          questions: [...(prev.questions || []), data.data.data],
        }));
        toast.success("Successfully created question");
      }

      // Reset form and state after submission
      reset({ question: "", options: ["", "", "", ""], correctAnswer: null });
      setEditQuestion(null);
    },
    onError: (err) => {
      setError(err);
    },
  });

  const deleteMutation = useMutation({
    mutationKey: ["deleteQuestion", newQuizSet.id],
    mutationFn: (id) => {
      setNewQuiz((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== id),
      }));
      return api.delete(`/api/admin/questions/${id}`, {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data) => {},
    onError: (err) => {
      setError(err);
    },
  });

  const onDelete = (id) => {
    toast.promise(deleteMutation.mutateAsync(id), {
      loading: "Deleting question...",
      success: "Successfully deleted question",
      error: "Couldn't delete question",
    });
  };

  const onEdit = (question) => {
    reset({
      question: question.question,
      options: question.options,
      correctAnswer: question.options.indexOf(question.correctAnswer) + 1, // Shift to 1-based index
    });
    setEditQuestion(question);
  };

  const onSubmit = (data) => {
    if (data.correctAnswer === null) {
      toast.error("Please select the correct answer");
      return;
    }

    // Convert correctAnswer to 0-based before submission
    data.correctAnswer = parseInt(data.correctAnswer);

    //  Trigger the appropriate mutation based on whether we're editing or adding
    toast.promise(mutation.mutateAsync(data), {
      loading: "Saving question...",
      success: "Successfully saved question",
      error: "Couldn't save question",
    });
  };
  if (error) {
    return <Error />;
  }

  return (
    <main className="md:flex-grow pxs-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 md:gap-8 lg:gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-4">{newQuiz.title}</h2>
          <div className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block mb-4">
            Total number of questions : {newQuiz?.questions?.length || 0}
          </div>
          <p className="text-gray-600 mb-4">{newQuiz.description}</p>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">
              Create/Edit Quiz
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
                      type="radio"
                      name="correctAnswer"
                      value={index + 1} // Make the correct answer 1-based
                      checked={watchedCorrectAnswer === index + 1}
                      onChange={() => setValue("correctAnswer", index + 1)}
                      className="text-primary focus:ring-0 w-4 h-4"
                    />
                    <label htmlFor={`optionText${index}`} className="sr-only">
                      Option {index + 1}
                    </label>
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
                {editQuestion ? "Update Question" : "Save Question"}
              </button>
            </form>
          </div>
        </div>

        <div className="px-4">
          {newQuiz?.questions?.map((question, index) => {
            const correctAnswer = newQuiz?.questions?.find(
              (q) => q.id === question.id
            )?.correctAnswer;
            return (
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
                      <label
                        key={option}
                        className={`flex items-center space-x-3 p-2 border rounded ${
                          correctAnswer === option
                            ? "bg-green-100 text-green-700"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="answer1"
                          className="form-radio text-buzzr-purple"
                          defaultChecked={correctAnswer === option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-between mt-6 pt-4 border-t border-border">
                    <button
                      onClick={() => onEdit(question)}
                      className="text-sm text-muted-foreground hover:text-foreground/80 focus:outline-none transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(question.id)}
                      className="text-sm text-destructive hover:text-destructive/80 focus:outline-none transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
