import { getCookie } from "../utils/cookies";

const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY ?? "auth_user";
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY ?? "auth_token";

export const getUser = () => {
  const user = getCookie(USER_KEY);

  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
};

export const getToken = () => {
  return getCookie(TOKEN_KEY);
};
