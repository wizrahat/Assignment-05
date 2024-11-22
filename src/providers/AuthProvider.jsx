import { useState } from "react";
import { AuthContext } from "../context";
import api from "../api";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({});

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
