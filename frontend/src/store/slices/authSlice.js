import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false, // Start as false, will be set to true after successful loadUser
  isLoading: false,
  error: null,
  registrationStatus: null,
  loginStatus: null,
  profileUpdateStatus: null,
  passwordChangeStatus: null,
  successMessage: null,
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to send reset email');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for loading user data from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // If token is invalid, remove it from localStorage
        localStorage.removeItem('token');
        // Clear remember me data if token is invalid
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
        return rejectWithValue(data.message || 'Failed to load user data');
      }

      return data;
    } catch (error) {
      // If there's an error, remove the token
      localStorage.removeItem('token');
      // Clear remember me data on error
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for changing password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to change password');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationStatus: (state) => {
      state.registrationStatus = null;
    },
    clearLoginStatus: (state) => {
      state.loginStatus = null;
    },
    clearProfileUpdateStatus: (state) => {
      state.profileUpdateStatus = null;
    },
    clearPasswordChangeStatus: (state) => {
      state.passwordChangeStatus = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.profileUpdateStatus = null;
      state.passwordChangeStatus = null;
      state.successMessage = null;
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Clear remember me data on logout
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Registration reducers
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationStatus = 'loading';
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationStatus = 'success';
        state.error = null;
        // Don't set user as authenticated until email is verified
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.registrationStatus = 'failed';
        state.error = action.payload;
      });

    // Login reducers
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.loginStatus = 'loading';
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loginStatus = 'success';
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        state.isAuthenticated = true;
        state.error = null;
        // Store token in localStorage
        localStorage.setItem('token', action.payload.data.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.loginStatus = 'failed';
        state.error = action.payload;
      });

    // Forgot password reducers
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Load user reducers
    builder
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.error = action.payload;
        // Remove token from localStorage if loadUser fails
        localStorage.removeItem('token');
        // Clear remember me data if loadUser fails
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      });

    // Update profile reducers
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.profileUpdateStatus = 'loading';
        state.successMessage = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileUpdateStatus = 'success';
        state.user = action.payload.data.user;
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.profileUpdateStatus = 'failed';
        state.error = action.payload;
      });

    // Change password reducers
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordChangeStatus = 'loading';
        state.successMessage = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwordChangeStatus = 'success';
        state.error = null;
        state.successMessage = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.passwordChangeStatus = 'failed';
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearError,
  clearRegistrationStatus,
  clearLoginStatus,
  clearProfileUpdateStatus,
  clearPasswordChangeStatus,
  clearSuccessMessage,
  logout,
  setUser,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectRegistrationStatus = (state) => state.auth.registrationStatus;
export const selectLoginStatus = (state) => state.auth.loginStatus;
export const selectProfileUpdateStatus = (state) => state.auth.profileUpdateStatus;
export const selectPasswordChangeStatus = (state) => state.auth.passwordChangeStatus;
export const selectSuccessMessage = (state) => state.auth.successMessage;

export default authSlice.reducer;
