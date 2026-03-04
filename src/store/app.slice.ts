import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi, constantsApi } from "@/services/api";
import type { AppUser } from "@/lib/api";

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

type AppState = {
  constants: Record<string, unknown> | null;
  constantsStatus: AsyncStatus;
  constantsError: string | null;
  profile: AppUser | null;
  profileStatus: AsyncStatus;
  profileError: string | null;
};

const initialState: AppState = {
  constants: null,
  constantsStatus: "idle",
  constantsError: null,
  profile: null,
  profileStatus: "idle",
  profileError: null,
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Request failed";
};

export const fetchConstants = createAsyncThunk("app/fetchConstants", async () => {
  return constantsApi.getAll();
});

export const fetchProfile = createAsyncThunk("app/fetchProfile", async () => {
  return authApi.me();
});

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<AppUser | null>) {
      state.profile = action.payload;
      state.profileStatus = action.payload ? "succeeded" : "idle";
      state.profileError = null;
    },
    clearProfile(state) {
      state.profile = null;
      state.profileStatus = "idle";
      state.profileError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchConstants.pending, state => {
        state.constantsStatus = "loading";
        state.constantsError = null;
      })
      .addCase(fetchConstants.fulfilled, (state, action) => {
        state.constantsStatus = "succeeded";
        state.constants = action.payload || null;
      })
      .addCase(fetchConstants.rejected, (state, action) => {
        state.constantsStatus = "failed";
        state.constantsError = toErrorMessage(action.error);
      })
      .addCase(fetchProfile.pending, state => {
        state.profileStatus = "loading";
        state.profileError = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.profile = action.payload || null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.profileError = toErrorMessage(action.error);
        state.profile = null;
      });
  },
});

export const { setProfile, clearProfile } = appSlice.actions;
export default appSlice.reducer;
