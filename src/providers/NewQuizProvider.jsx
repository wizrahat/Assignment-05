import { useState } from "react";
import { NewQuizContext } from "../context";

export default function NewQuizProvider({ children }) {
  const [newQuiz, setNewQuiz] = useState({});

  return (
    <NewQuizContext.Provider value={{ newQuiz, setNewQuiz }}>
      {children}
    </NewQuizContext.Provider>
  );
}
