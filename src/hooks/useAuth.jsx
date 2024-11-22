import { useContext } from "react";
import { AuthContext } from "../context";

function useAuth() {
  return useContext(AuthContext);
}
export default useAuth;
