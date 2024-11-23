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
import ErrorPage from "./pages/ErrorPage";
import AdminRoute from "./routes/AdminRoute";
import DashBoardPage from "./pages/admin/DashBoardPage";
import NewQuizSetPage from "./pages/admin/NewQuizSetPage";
import NewQuizSetEntryPage from "./pages/admin/NewQuizSetEntryPage";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NewQuizProvider from "./providers/NewQuizProvider";
import EditQuizSetPage from "./pages/admin/EditQuizSetPage";

// Create a QueryClient instance
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NewQuizProvider>
          {/* Sonner Toaster for notifications */}
          <Toaster
            position="bottom-right"
            richColors
            duration={4000}
            closeButton
            theme="dark"
          />
          <ReactQueryDevtools initialIsOpen={false} />
          <Routes>
            <Route element={<PrivateRoute />}>
              <Route
                path="/quiz/:quizSetId/leaderboard"
                element={<LeaderBoardPage />}
              />
              <Route path="/quiz/:quizSetId/result" element={<ResultPage />} />
              <Route path="/quiz/:quizSetId" element={<QuizPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/dashboard" element={<DashBoardPage />} />
                <Route path="/dashboard/new" element={<NewQuizSetPage />} />
                <Route
                  path="/dashboard/new/:newQuizSetId"
                  element={<NewQuizSetEntryPage />}
                />
                <Route
                  path="/dashboard/edit/:quizSetId"
                  element={<EditQuizSetPage />}
                />
              </Route>
            </Route>
            <Route path="/" element={<HomePage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </NewQuizProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

//TODO: fix style="font-family: Jaro" problems
//TODO: add leader boeard marks
//TODO: add full page loading and error handling and display on all pages
