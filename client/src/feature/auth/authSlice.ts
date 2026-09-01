import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { authApi, type AuthUser, type LoginPayload, type LoginResponse, } from "../../services/auth/authServices";
import { getCookie, removeCookie, setCookie } from "../../utils/cookies";
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
const USER_KEY = import.meta.env.VITE_AUTH_USER_KEY;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message ?? err.message;
  }
  return (err as Error).message;
}

export function getStoredUser(): AuthUser | null {
  const raw = getCookie(USER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return (parsed?.user ?? parsed) as AuthUser;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  user: getStoredUser(),
  token: getCookie(TOKEN_KEY),
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk("auth/login", async (payload: LoginPayload, { rejectWithValue }) => {
  try {
    const response: LoginResponse = await authApi.login(payload);
    return response;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
}
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      removeCookie(TOKEN_KEY);
      removeCookie(USER_KEY);
    },
    clearError(state) {
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;      
      setCookie(USER_KEY, JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        setCookie(TOKEN_KEY, action.payload.token);
        setCookie(USER_KEY, JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
