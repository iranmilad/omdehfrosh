import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getApiUrl } from "../../../Libs/utils/apiutils/apiutils";
import getHttpCodeMessage from "../../../Libs/httpcodes/httpcodes";

// Async Thunk for verifying JWT token
export const verifyToken = createAsyncThunk(
    "auth/verifyToken",
    async (_, { rejectWithValue }) => {
      const token = localStorage.getItem("user");

      if (!token) {
        return rejectWithValue({
          status: 401,
          message: "No token found"
        });
      }

      try {
        const response = await fetch(getApiUrl("/auth/verify-user"), {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`, 
            "Content-Type": "application/json"      
          },         
        });
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
        
          const error = {
            status: response.status,
            message: errorData?.message || getHttpCodeMessage(response.status),
          };
        
          return rejectWithValue(error);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Network error:", error);
        return rejectWithValue({
          status: 500,
          message: "Network error or server not responding"
        });
      }
    }
);
  
export const verifyTokenSilent = createAsyncThunk(
  'auth/verifyTokenSilent',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user");

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(getApiUrl('/auth/verify-user'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem("user");
        return rejectWithValue('Token verification failed');
      }

      const data = await response.json();
      return data; // Should return { valid: true, user: {...} }
    } catch (error) {
      console.error("Silent verification error:", error);
      localStorage.removeItem("user");
      return rejectWithValue('Verification error');
    }
  }
);

// Combined endpoint that fetches user + cart + notifications in ONE request
export const getUserInitialData = createAsyncThunk(
  'auth/getUserInitialData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("user");

      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(getApiUrl('/auth/user-initial-data'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        localStorage.removeItem("user");
        return rejectWithValue('Failed to fetch user data');
      }

      const data = await response.json();
      // Returns { valid, user, cart, total, notificationsCount }
      return data;
    } catch (error) {
      console.error("Failed to fetch user initial data:", error);
      localStorage.removeItem("user");
      return rejectWithValue('Failed to fetch user data');
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isVerified: false, // Changed from null to false
    loading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isVerified = false;
      state.loading = false;
      state.error = null;
    },
    /**
     * Sync auth state from `/auth/user-initial-data` response.
     * This avoids a second API call after login and keeps Header/UI in sync.
     */
    setAuthFromUserInitialData: (state, action) => {
      const payload = action.payload || {};
      const nextUser = payload.user || null;
      const nextValid = payload.valid;

      state.user = nextUser;
      state.isVerified = !!nextUser && (typeof nextValid === 'boolean' ? nextValid : true);
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // verifyToken cases
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isVerified = action.payload.valid || !!action.payload.user;
        state.user = action.payload.user;
        state.error = null;
      })      
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.isVerified = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // verifyTokenSilent cases - THIS WAS MISSING!
      .addCase(verifyTokenSilent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyTokenSilent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.user) {
          state.isVerified = action.payload.valid || true;
          state.user = action.payload.user;
        } else {
          state.isVerified = false;
          state.user = null;
        }
        state.error = null;
      })
      .addCase(verifyTokenSilent.rejected, (state, action) => {
        state.loading = false;
        state.isVerified = false;
        state.user = null;
        state.error = null; // Silent failure - no error shown
      })

      // getUserInitialData cases - combined endpoint
      .addCase(getUserInitialData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserInitialData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.user) {
          state.isVerified = action.payload.valid || true;
          state.user = action.payload.user;
        } else {
          state.isVerified = false;
          state.user = null;
        }
        state.error = null;
      })
      .addCase(getUserInitialData.rejected, (state, action) => {
        state.loading = false;
        state.isVerified = false;
        state.user = null;
        state.error = null; // Silent failure - no error shown
      });
  },
});

export const { logout, setAuthFromUserInitialData } = authSlice.actions;
export default authSlice.reducer;