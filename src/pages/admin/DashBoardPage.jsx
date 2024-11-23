import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import api from "../../api";
import PlusIcon from "../../components/icons/PlusIcon";
import QuizSetIcon from "../../components/icons/QuizSetIcon";
import ErrorComponent from "../../components/ErrorComponent";
export default function DashBoardPage() {
  const { auth, setAuth } = useAuth();
  const {
    data: adminQuizData,
    isLoading,
    quizError,
  } = useQuery({
    queryKey: ["adminQuizData"],
    queryFn: fetchadminQuizData,
  });

  async function fetchadminQuizData() {
    try {
      const res = await api.get(`/api/admin/quizzes`, {
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      });
      return res?.data;
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

          const retryResponse = await api.get(`/api/admin/quizzes/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

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
  if (quizError || adminQuizData === undefined) return <ErrorComponent />;
  return (
    <main className="flex-grow p-10">
      <header className="mb-8">
        <h2 className="text-2xl font-semibold">Hey There 👋!</h2>
        <h1 className="text-4xl font-bold">Welcome Back To Your Quiz Hub!</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to={"/dashboard/new"} className="group">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 ">
            <div className="text-buzzr-purple mb-4 group-hover:scale-105 transition-all">
              <PlusIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2 group-hover:scale-105 transition-all">
              Create a new quiz
            </h3>
            <p className="text-gray-600 text-sm group-hover:scale-105 transition-all">
              Build from the ground up
            </p>
          </div>
        </Link>

        {adminQuizData?.map((quiz) => (
          <Link
            to={`/dashboard/edit/${quiz.id}?title=${quiz.title}&description=${quiz.description}&status=${quiz.status}`}
            key={quiz.id}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 group cursor-pointer"
          >
            <div className="text-buzzr-purple mb-4 group-hover:scale-105 transition-all">
              <QuizSetIcon />
            </div>
            <h3 className="font-semibold text-lg mb-2 group-hover:scale-105 transition-all">
              {quiz.title}
            </h3>
            <p className="text-gray-600 text-sm group-hover:scale-105 transition-all">
              {quiz.description}
            </p>
          </Link>
        ))}
      </div>
      {adminQuizData?.length === 0 && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            You haven't created any quizzes yet.
          </h2>
          <p className="text-gray-600 text-sm">
            Create a new quiz to get started.
          </p>
        </div>
      )}
    </main>
  );
}
