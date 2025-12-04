import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  teachers: [],
  students: [],
  allUsers: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// Async thunk to create teacher
export const createTeacher = createAsyncThunk(
  'admin/createTeacher',
  async ({ teacherData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`,
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(teacherData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create teacher');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get all teachers
export const getTeachers = createAsyncThunk(
  'admin/getTeachers',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/teachers`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch teachers');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get all students
export const getStudents = createAsyncThunk(
  'admin/getStudents',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/students`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch students');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get all users
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete user
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete user');
      }

      return { ...data, deletedId: userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update user role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role, phone, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ role, phone }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update user');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// Admin slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Create teacher
    builder
      .addCase(createTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers.push(action.payload.data.teacher);
        state.successMessage = 'Teacher created successfully!';
        state.error = null;
      })
      .addCase(createTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get teachers
    builder
      .addCase(getTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload.data.teachers;
        state.error = null;
      })
      .addCase(getTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get students
    builder
      .addCase(getStudents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.students = action.payload.data.students;
        state.error = null;
      })
      .addCase(getStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get all users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = action.payload.data.users;
        state.error = null;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allUsers = state.allUsers.filter(
          (u) => u._id !== action.payload.deletedId
        );
        state.teachers = state.teachers.filter(
          (u) => u._id !== action.payload.deletedId
        );
        state.students = state.students.filter(
          (u) => u._id !== action.payload.deletedId
        );
        state.successMessage = 'User deleted successfully!';
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update user role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedUser = action.payload.data.user;
        
        // Update in allUsers array
        const userIndex = state.allUsers.findIndex(
          (u) => u._id === updatedUser._id
        );
        if (userIndex !== -1) {
          state.allUsers[userIndex] = updatedUser;
        }
        
        state.successMessage = 'User role updated successfully!';
        state.error = null;
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearSuccessMessage } = adminSlice.actions;

// Selectors
export const selectTeachers = (state) => state.admin.teachers;
export const selectStudents = (state) => state.admin.students;
export const selectAllUsers = (state) => state.admin.allUsers;
export const selectAdminLoading = (state) => state.admin.isLoading;
export const selectAdminError = (state) => state.admin.error;
export const selectAdminSuccess = (state) => state.admin.successMessage;

export default adminSlice.reducer;

