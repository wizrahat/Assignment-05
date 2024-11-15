import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import LeaderBoardPage from "./pages/LeaderBoardPage";
import ResultPage from "./pages/ResultPage";
import QuizPage from "./pages/QuizPage";
import PrivateRoute from "./routes/PrivateRoute";
import AuthProvider from "./providers/AuthProvider";

function App() {
  return (
    <>
      <AuthProvider>
        {" "}
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/:quizSet/leaderboard" element={<LeaderBoardPage />} />
            <Route path="/:quizSet/result" element={<ResultPage />} />
            <Route path="/:quizSet" element={<QuizPage />} />
          </Route>
          <Route path="/" element={<HomePage />} />

          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="*" element={<div>not found</div>} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
