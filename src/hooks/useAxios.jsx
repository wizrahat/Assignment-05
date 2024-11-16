import { useEffect } from "react";
import axios from "axios";
import { api } from "../api";
import useAuth from "./useAuth";

const useAxios = () => {
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    // Add a request interceptor
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        const authToken = auth?.authToken;
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add a response interceptor
    const responseIntercept = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error status is 401 and there is no originalRequest._retry flag,
        // it means the token has expired and we need to refresh it
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = auth?.refreshToken;

            // Ensure you use the same base URL as your `api` instance
            const response = await api.post(`/api/auth/refresh-token`, {
              refreshToken,
            });

            const newToken = response.data?.token;
            if (newToken) {
              console.log(`New Token: ${newToken}`);
              setAuth({ ...auth, authToken: newToken });

              // Retry the original request with the new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth]); // Watch the whole auth object for changes

  return { api };
};

export default useAxios;
