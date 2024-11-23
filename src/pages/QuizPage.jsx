import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Logo from "../assets/logo.svg";
import Avatar from "../assets/avater.webp";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { shuffleArray } from "../utils";
import { ArrowRight, ArrowLeft, Send } from "lucide-react";
import QuizSubmitModal from "../components/quiz/QuizSubmitModal";
import { useForm } from "react-hook-form";
import api from "../api";
import useQuiz from "../hooks/useQuiz";
import ErrorComponent from "../components/ErrorComponent";
export default function QuizPage() {
  const { auth, setAuth } = useAuth();
  const { quizSetId } = useParams();
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { register } = useForm();
  const { quizData, isLoading, quizError } = useQuiz({ quizSetId });

  const mutation = useMutation({
    mutationFn: submitAnswers,
    onSuccess: () => {
      navigate(`/quiz/${quizSetId}/result`);
    },
    onError: (err) => {
      setError(err);
    },
  });

  async function submitAnswers(data) {
    try {
      const res = await api.post(`/api/quizzes/${quizSetId}/attempt`, data, {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return res;
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
            `/api/quizzes/${quizSetId}/attempt`,
            data,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          return retryResponse;
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          throw refreshError;
        }
      }

      console.error("Error fetching quiz data:", err);
      throw err;
    }
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const selectedQuestion = quizData?.questions[currentQuestionIndex];
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (selectedQuestion) {
      const shuffled = shuffleArray(selectedQuestion.options);
      setOptions(shuffled);
    }
  }, [selectedQuestion]);
  function handleOptions(selectedOption) {
    setAnswers((prev) => {
      const currentAnswer = prev[selectedQuestion?.id];

      if (currentAnswer === selectedOption) {
        // If the same option is selected again, deselect it by removing the key
        const updatedAnswers = { ...prev };
        delete updatedAnswers[selectedQuestion?.id]; // Remove the answer for this question
        return updatedAnswers;
      }

      // Otherwise, update the answer for the selected question
      return {
        ...prev,
        [selectedQuestion?.id]: selectedOption,
      };
    });
  }

  const participatingQuestions = Object.keys(answers).length;

  const totalQuestions = quizData?.questions.length || 0;
  const remainingQuestions = totalQuestions - participatingQuestions;

  const handleSubmit = async () => {
    toast.promise(mutation.mutateAsync({ answers: answers }), {
      loading: "Submitting Answers...",
      success: "Successfully submitted answers!",
      error: "Couldn't submit answers",
    });
  };
  if (quizData.user_attempt.attempted) return <Navigate to="/quiz/result" />;
  if (isLoading) return <div>Loading...</div>;
  if (error || quizError) return <ErrorComponent />;

  return (
    <>
      {isModalOpen && (
        <QuizSubmitModal
          handleSubmit={handleSubmit}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
      <div className="bg-[#F5F3FF] min-h-screen">
        <div className="container mx-auto py-3">
          <header className="flex justify-between items-center mb-12">
            <Link to={"/"}>
              <img src={Logo} className="h-7" />
            </Link>

            <div>
              {auth?.user ? (
                <Link
                  onClick={() => {
                    setAuth({});
                  }}
                  to={"/signin"}
                  className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
                >
                  Sign out
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </header>

          <main className="max-w-8xl mx-auto h-[calc(100vh-10rem)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 h-full">
              <div className="lg:col-span-1 bg-white rounded-md p-6 h-full flex flex-col">
                <div>
                  <h2 className="text-4xl font-bold mb-4">{quizData?.title}</h2>
                  <p className="text-gray-600 mb-4">{quizData?.description}</p>

                  <div className="flex flex-col">
                    <div className="w-fit bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Total number of questions :{" "}
                      {quizData?.stats?.total_questions}
                    </div>
                    <div className="w-fit bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Participation :{participatingQuestions}
                    </div>
                    <div className="w-fit bg-gray-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded-full inline-block mb-2">
                      Remaining :{remainingQuestions}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center">
                  <img
                    src={Avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <span className="text-black font-semibold">
                    {auth?.user?.full_name}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white">
                <div className="bg-white p-6 !pb-2 rounded-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold">
                      {currentQuestionIndex + 1}. {selectedQuestion?.question}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center space-x-3 py-3 px-4 bg-primary/5 rounded-md text-lg"
                      >
                        <input
                          {...register(option)}
                          type="checkbox"
                          name={option}
                          className="form-radio text-buzzr-purple"
                          checked={answers[selectedQuestion.id] === option}
                          onChange={() => handleOptions(option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      disabled={currentQuestionIndex === 0}
                      onClick={() => {
                        if (currentQuestionIndex > 0) {
                          setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
                        }
                      }}
                      className="inline-flex gap-2 justify-center  items-center bg-primary text-white py-2 px-4 rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-6 font-semibold disabled:opacity-50"
                    >
                      {" "}
                      <ArrowLeft size={20} className="" />
                      Prev
                    </button>
                    <button
                      disabled={
                        currentQuestionIndex ===
                          quizData?.questions.length - 1 &&
                        Object.keys(answers).length !==
                          quizData.questions.length
                      }
                      onClick={() => {
                        if (
                          Object.keys(answers).length ===
                            quizData.questions.length &&
                          currentQuestionIndex ===
                            quizData?.questions.length - 1
                        ) {
                          setIsModalOpen(true);
                        }
                        if (
                          currentQuestionIndex !==
                          quizData?.questions.length - 1
                        ) {
                          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
                        }
                        if (
                          currentQuestionIndex ===
                            quizData?.questions.length - 1 &&
                          Object.keys(answers).length !==
                            quizData.questions.length
                        ) {
                          toast.error("Please answer all the questions");
                        }
                      }}
                      className=" gap-2 inline-flex justify-center items-center  bg-primary text-white py-2  px-4 rounded-md hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mb-6 font-semibold disabled:opacity-50"
                    >
                      {currentQuestionIndex < quizData?.questions.length - 1
                        ? "Next"
                        : "Submit "}
                      {currentQuestionIndex < quizData?.questions.length - 1 ? (
                        <ArrowRight size={20} />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <footer className="mt-6 mb-3 opacity-40 text-center">
          Copyright &copy; 2024 Learn With Sumit | All Rights Reserved
        </footer>
      </div>
    </>
  );
}
