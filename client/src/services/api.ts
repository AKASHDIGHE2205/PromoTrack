// import axios, { type AxiosError } from "axios";
// import { getCookie } from "../utils/cookies";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_BASE_URL ?? "",
// });

// api.interceptors.request.use((config) => {
//   const token = getCookie("auth_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export function getApiError(err: unknown): string {
//   if (axios.isAxiosError(err)) {
//     const axiosErr = err as AxiosError<{ message?: string }>;
//     return axiosErr.response?.data?.message ?? axiosErr.message;
//   }
//   return (err as Error).message ?? "Something went wrong";
// }

// export default api;
import axios, { type AxiosError } from "axios";
import { getCookie } from "../utils/cookies";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL ?? "/api",
});

api.interceptors.request.use((config) => {
  const token = getCookie("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const { store } = await import("../store/Store");
      const { logout } = await import("../feature/auth/authSlice");
      store.dispatch(logout());
    }

    return Promise.reject(error);
  }
);

export function getApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosErr =
      err as AxiosError<{ message?: string }>;

    return (
      axiosErr.response?.data?.message ??
      axiosErr.message
    );
  }

  return (
    (err as Error).message ??
    "Something went wrong"
  );
}

export default api;