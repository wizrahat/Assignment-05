import { useContext } from "react";
import { NewQuizContext } from "../context";
import { useQuery } from "@tanstack/react-query";
import useAuth from "./useAuth";
import api from "../api";

function useQuiz({ quizSet }) {
  const { auth, setAuth } = useAuth();

  const {
    data: quizData,
    isLoading,
    quizError,
  } = useQuery({
    queryKey: ["quizData", quizSet],
    queryFn: fetchQuizData,
  });
  async function fetchQuizData() {
    try {
      const res = await api.get(`/api/quizzes/${quizSet}`, {
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

          const retryResponse = await api.get(`/api/quizzes/${quizSet}`, {
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
  return { quizData, isLoading, quizError };
}
export default useQuiz;
