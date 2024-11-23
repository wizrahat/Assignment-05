import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css"; // Import the styles
import { Link, useParams } from "react-router-dom";
import useQuiz from "../hooks/useQuiz";
import useAuth from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import LogoWhite from "../assets/logo-white.svg";
import ErrorComponent from "../components/ErrorComponent";
export default function ResultPage() {
  const { quizSetId } = useParams();
  const { auth, setAuth } = useAuth();
  const {
    quizData,
    isLoading: quizIsLoading,
    quizError,
  } = useQuiz({ quizSetId });
  const {
    data: quizResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quizResults", quizSetId],
    queryFn: fetchQuizResults,
  });

  async function fetchQuizResults() {
    try {
      const res = await api.get(`/api/quizzes/${quizSetId}/attempts`, {
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

          const retryResponse = await api.get(
            `/api/quizzes/${quizSetId}/attempts`,
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
  }

  // Find current user's attempt
  const currentUserAttempt = quizResults?.attempts.find(
    (attempt) => attempt.user.id === auth?.user?.id
  );

  if (isLoading) return <div>Loading...</div>;
  if (error || quizError) return <ErrorComponent />;

  // Initialize counters for correct and wrong answers
  let correctCount = 0;

  // Iterate through questions and count correct/incorrect answers
  quizData.questions.forEach((question) => {
    const userAnswer = currentUserAttempt.submitted_answers.find(
      (answer) => answer.question_id === question.id
    );
    const correctAnswer = currentUserAttempt.correct_answers.find(
      (answer) => answer.question_id === question.id
    );

    if (userAnswer?.answer === correctAnswer?.answer) {
      correctCount++;
    }
  });

  // Calculate wrong answers based on total questions minus correct answers
  const wrongCount = quizData.questions.length - correctCount;

  // Calculate percentage of correct answers
  const percentageCorrect = (correctCount / quizData.questions.length) * 100;

  if (isLoading || quizIsLoading) return <div>Loading...</div>;
  if (error || quizError) return <ErrorComponent />;
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="flex min-h-screen overflow-hidden">
        <Link to={"/"}>
          {" "}
          <img src={LogoWhite} className="max-h-11 fixed left-6 top-6 z-50" />
        </Link>

        {/* Left side */}
        <div className="max-h-screen overflow-hidden hidden lg:flex lg:w-1/2 bg-primary flex-col justify-center p-12 relative">
          <div>
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-2">
                {quizResults.quiz.title}
              </h2>
              <p>{quizResults.quiz.description}</p>

              <div className="my-6 flex items-center">
                <div className="w-1/2">
                  <div className="flex gap-6 my-6">
                    <div>
                      <p className="font-semibold text-2xl my-0">
                        {quizResults.quiz.total_questions}
                      </p>
                      <p className="text-gray-300">Questions</p>
                    </div>

                    <div>
                      <p className="font-semibold text-2xl my-0">
                        {correctCount}
                      </p>
                      <p className="text-gray-300">Correct</p>
                    </div>

                    <div>
                      <p className="font-semibold text-2xl my-0">
                        {wrongCount}
                      </p>
                      <p className="text-gray-300">Wrong</p>
                    </div>
                  </div>

                  <Link
                    to={`/quiz/${quizSetId}/leaderboard`}
                    className="bg-secondary py-3 rounded-md hover:bg-secondary/90 transition-colors text-lg font-medium underline text-white"
                  >
                    View Leaderboard
                  </Link>
                </div>

                <div className="w-1/2 bg-primary/80 rounded-md border border-white/20 flex items-center p-4">
                  <div className="flex-1">
                    <p className="text-2xl font-bold">
                      {correctCount} / {quizResults.quiz.total_questions}
                    </p>
                    <p>Your Mark</p>
                  </div>
                  <div className="w-24">
                    <CircularProgressbar
                      value={percentageCorrect}
                      text={`${Math.round(percentageCorrect)}%`}
                      styles={{
                        root: { width: 100 },
                        path: {
                          stroke: "aqua",
                          strokeLinecap: "round",
                          strokeWidth: "5px",
                        },
                        text: {
                          fill: "#fff",
                          fontSize: "25px",
                        },
                        trail: {
                          strokeWidth: "6px",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="max-h-screen md:w-1/2 flex items-center justify-center h-full p-8">
          <div className="h-[calc(100vh-50px)] overflow-y-scroll">
            <div className="rules-container">
              <h1 className="text-2xl font-bold mb-4">
                How to Understand Your Results
              </h1>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-2">
                  <p>
                    Your selected answer will be outlined{" "}
                    <strong className="text-primary">Purple</strong>.
                  </p>
                </li>
                <li className="mb-2">
                  <p>
                    selected correct answers will be highlighted{" "}
                    <strong className="text-green-500">Green</strong> and{" "}
                    <strong className="text-red-500">Red</strong> for incorrect
                    ones.
                  </p>
                </li>
                <li className="mb-2">
                  <p>
                    Correct answers will always be marked with a{" "}
                    <strong>✔️</strong> tick.
                  </p>
                </li>
                <li className="mb-2">
                  <p>
                    Incorrect answers you selected will be marked with a{" "}
                    <strong>❌</strong> cross.
                  </p>
                </li>
              </ul>
            </div>
            <div className="px-4">
              {/* Loop over questions and show the results */}
              {quizData.questions.map((question, index) => {
                const userAnswer = currentUserAttempt.submitted_answers.find(
                  (answer) => answer.question_id === question.id
                );
                const correctAnswer = currentUserAttempt.correct_answers.find(
                  (answer) => answer.question_id === question.id
                );

                return (
                  <div
                    key={question.id}
                    className="rounded-lg overflow-hidden shadow-sm mb-4"
                  >
                    <div className="bg-white p-6 !pb-2">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {index + 1}. {question.title}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        {question.options.map((option) => {
                          const isSelected = userAnswer?.answer === option;
                          const isOptionCorrect =
                            option === correctAnswer?.answer;
                          const isOptionWrong = isSelected && !isOptionCorrect;

                          return (
                            <label
                              key={option}
                              className={`flex items-center space-x-3 p-2 border rounded ${
                                isSelected
                                  ? isOptionCorrect
                                    ? "bg-green-100 text-green-700 "
                                    : "bg-red-100 text-red-700 "
                                  : ""
                              } ${isSelected ? "border-primary border-1" : ""}`}
                            >
                              <span>{option}</span>

                              {/* Show a tick if this is the correct answer */}
                              {isOptionCorrect && (
                                <span className="ml-2 text-green-500">✔</span>
                              )}

                              {/* Show a cross if this is the selected wrong answer */}
                              {isOptionWrong && (
                                <span className="ml-2 text-red-500">✖</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
