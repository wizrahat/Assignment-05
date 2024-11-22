import { useContext } from "react";
import { NewQuizContext } from "../context";

export default function useNewQuiz() {
  return useContext(NewQuizContext);
}
