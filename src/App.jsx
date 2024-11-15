import React from "react";
import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LeaderBoardPage from "./pages/LeaderBoardPage";
import ResultPage from "./pages/ResultPage";
import QuizPage from "./pages/QuizPage";
import PrivateRoute from "./routes/PrivateRoute";
import AuthProvider from "./providers/AuthProvider";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {/* Sonner Toaster for notifications */}
        <Toaster position="bottom-right" richColors closeButton theme="dark" />
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/:quizSet/leaderboard" element={<LeaderBoardPage />} />
            <Route path="/:quizSet/result" element={<ResultPage />} />
            <Route path="/:quizSet" element={<QuizPage />} />
          </Route>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
