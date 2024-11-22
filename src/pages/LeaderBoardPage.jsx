import useAuth from "../hooks/useAuth";
import Logo from ".././assets/logo.svg";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import Avatar from ".././assets/avater.webp";
export default function LeaderBoardPage() {
  const { auth, setAuth } = useAuth();
  const { quizSet } = useParams();
  const {
    data: quizAttempts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quizAttempts", quizSet],
    queryFn: fetchQuizAttempts,
  });

  async function fetchQuizAttempts() {
    try {
      const res = await api.get(`/api/quizzes/${quizSet}/attempts`, {
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
            `/api/quizzes/${quizSet}/attempts`,
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading quiz data</div>;

  // Find current user's attempt
  const currentUserAttempt = quizAttempts?.attempts.find(
    (attempt) => attempt.user.id === auth?.user?.id
  );

  // Function to calculate the number of correct answers
  const calculateCorrectAnswers = (attempt) => {
    return attempt.correct_answers.reduce((score, correctAnswer) => {
      const submitted = attempt.submitted_answers.find(
        (ans) => ans.question_id === correctAnswer.question_id
      );
      return score + (submitted?.answer === correctAnswer.answer ? 1 : 0);
    }, 0);
  };

  // Sort attempts by score to display leaderboard
  const sortedAttempts = quizAttempts?.attempts
    .map((attempt) => ({
      ...attempt,
      correctCount: calculateCorrectAnswers(attempt),
    }))
    .sort((a, b) => b.correctCount - a.correctCount);
  const topFiveAttempts = sortedAttempts.slice(0, 5);
  return (
    <div className="bg-[#F5F3FF] p-4">
      <header className="flex justify-between items-center mb-12">
        <Link to={"/"}>
          <img src={Logo} className="h-7" alt="Logo" />
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

      <main className="min-h-[calc(100vh-50px)] flex items-center justify-center ">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="bg-primary rounded-lg p-6 text-white">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={Avatar}
                  alt="Profile Pic"
                  className="w-20 h-20 rounded-full border-4 border-white mb-4 object-cover"
                />
                <h2 className="text-2xl font-bold">
                  {currentUserAttempt?.user.full_name || "Your Name"}
                </h2>
                <p className="text-xl">
                  {sortedAttempts.findIndex(
                    (attempt) => attempt.user.id === currentUserAttempt?.user.id
                  ) + 1}{" "}
                  Position
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm opacity-75">Total Marks</p>
                  <p className="text-2xl font-bold">
                    {quizAttempts.quiz.total_marks}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-75">Correct</p>
                  <p className="text-2xl font-bold">
                    {calculateCorrectAnswers(currentUserAttempt)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-75">Wrong</p>
                  <p className="text-2xl font-bold">
                    {quizAttempts.quiz.total_questions -
                      calculateCorrectAnswers(currentUserAttempt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="mb-6">{quizAttempts.quiz.title}</p>
              <ul className="space-y-4">
                {topFiveAttempts.map((attempt, index) => (
                  <li
                    key={attempt.id}
                    className={`flex items-center justify-between ${
                      attempt.user.id === auth?.user?.id
                        ? "bg-green-100" // Light green background for the current user
                        : ""
                    } p-2 rounded-md`}
                  >
                    <div className="flex items-center">
                      <img
                        src={Avatar}
                        alt={attempt.user.full_name}
                        className="object-cover w-10 h-10 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold">
                          {attempt.user.full_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {index === 0
                            ? "1st"
                            : index === 1
                            ? "2nd"
                            : index === 2
                            ? "3rd"
                            : `${index + 1}th`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {calculateCorrectAnswers(attempt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
