import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LogInPage from "./pages/LogInPage";
import RegistrationPage from "./pages/RegistrationPage";
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
            <Route path="/" element={<HomePage />} />
            <Route path="/:quizSet/leaderboard" element={<LeaderBoardPage />} />
            <Route path="/:quizSet/result" element={<ResultPage />} />
            <Route path="/:quizSet" element={<QuizPage />} />
          </Route>
          <Route path="/login" element={<LogInPage />} />
          <Route path="/register" element={<RegistrationPage />} />
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
