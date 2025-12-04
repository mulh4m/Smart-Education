import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  courses: [],
  currentCourse: null,
  subjects: [],
  stats: null,
  mySubmission: null,
  submissions: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

// Helper function to get auth headers
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
});

// Async thunk to get all courses
export const getCourses = createAsyncThunk(
  'courses/getCourses',
  async ({ filters = {}, token }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses${queryParams ? `?${queryParams}` : ''}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch courses');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get single course
export const getCourse = createAsyncThunk(
  'courses/getCourse',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${id}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch course');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to create course
export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async ({ formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to create course');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update course
export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update course');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete course
export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async ({ id, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete course');
      }

      return { ...data, deletedId: id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get subjects
export const getSubjects = createAsyncThunk(
  'courses/getSubjects',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/subjects/list`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch subjects');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get course stats
export const getCourseStats = createAsyncThunk(
  'courses/getCourseStats',
  async (token, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/stats/overview`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch stats');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to submit homework/activity
export const submitHomework = createAsyncThunk(
  'courses/submitHomework',
  async ({ courseId, formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to submit homework');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get my submission
export const getMySubmission = createAsyncThunk(
  'courses/getMySubmission',
  async ({ courseId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/my-submission`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch submission');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to get all submissions for a course (teacher/admin)
export const getSubmissions = createAsyncThunk(
  'courses/getSubmissions',
  async ({ courseId, status, token }, { rejectWithValue }) => {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/submissions${queryParams}`,
        {
          method: 'GET',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to fetch submissions');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to grade a submission
export const gradeSubmission = createAsyncThunk(
  'courses/gradeSubmission',
  async ({ courseId, submissionId, grade, feedback, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/submissions/${submissionId}/grade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(token),
          },
          body: JSON.stringify({ grade, feedback }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to grade submission');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to update submission
export const updateSubmission = createAsyncThunk(
  'courses/updateSubmission',
  async ({ courseId, submissionId, formData, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/submissions/${submissionId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to update submission');
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to delete submission
export const deleteSubmission = createAsyncThunk(
  'courses/deleteSubmission',
  async ({ courseId, submissionId, token }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/courses/${courseId}/submissions/${submissionId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Failed to delete submission');
      }

      return { ...data, deletedId: submissionId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Course slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearMySubmission: (state) => {
      state.mySubmission = null;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
    },
  },
  extraReducers: (builder) => {
    // Get courses
    builder
      .addCase(getCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload.data.courses;
        state.error = null;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get single course
    builder
      .addCase(getCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCourse = action.payload.data.course;
        state.error = null;
      })
      .addCase(getCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Create course
    builder
      .addCase(createCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses.unshift(action.payload.data.course);
        state.successMessage = 'Course created successfully!';
        state.error = null;
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update course
    builder
      .addCase(updateCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.courses.findIndex(
          (c) => c._id === action.payload.data.course._id
        );
        if (index !== -1) {
          state.courses[index] = action.payload.data.course;
        }
        state.currentCourse = action.payload.data.course;
        state.successMessage = 'Course updated successfully!';
        state.error = null;
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete course
    builder
      .addCase(deleteCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = state.courses.filter(
          (c) => c._id !== action.payload.deletedId
        );
        state.successMessage = 'Course deleted successfully!';
        state.error = null;
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get subjects
    builder
      .addCase(getSubjects.pending, (state) => {
        state.error = null;
      })
      .addCase(getSubjects.fulfilled, (state, action) => {
        state.subjects = action.payload.data.subjects;
        state.error = null;
      })
      .addCase(getSubjects.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Get course stats
    builder
      .addCase(getCourseStats.pending, (state) => {
        state.error = null;
      })
      .addCase(getCourseStats.fulfilled, (state, action) => {
        state.stats = action.payload.data.stats;
        state.error = null;
      })
      .addCase(getCourseStats.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Submit homework
    builder
      .addCase(submitHomework.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(submitHomework.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmission = action.payload.data.submission;
        state.successMessage = 'Submission created successfully!';
        state.error = null;
      })
      .addCase(submitHomework.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Get my submission
    builder
      .addCase(getMySubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMySubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmission = action.payload.data.submission;
        state.error = null;
      })
      .addCase(getMySubmission.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error if submission not found (404) - it's normal for first time
        if (action.payload && !action.payload.includes('not found')) {
          state.error = action.payload;
        }
        state.mySubmission = null;
      });

    // Get submissions (teacher/admin)
    builder
      .addCase(getSubmissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSubmissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissions = action.payload.data.submissions;
        state.error = null;
      })
      .addCase(getSubmissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Grade submission
    builder
      .addCase(gradeSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.submissions.findIndex(
          (s) => s._id === action.payload.data.submission._id
        );
        if (index !== -1) {
          state.submissions[index] = action.payload.data.submission;
        }
        state.successMessage = 'Submission graded successfully!';
        state.error = null;
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Update submission
    builder
      .addCase(updateSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmission = action.payload.data.submission;
        state.successMessage = 'Submission updated successfully!';
        state.error = null;
      })
      .addCase(updateSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Delete submission
    builder
      .addCase(deleteSubmission.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSubmission.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mySubmission = null;
        state.successMessage = 'Submission deleted successfully!';
        state.error = null;
      })
      .addCase(deleteSubmission.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const { clearError, clearSuccessMessage, clearCurrentCourse, clearMySubmission, clearSubmissions } = courseSlice.actions;

// Selectors
export const selectCourses = (state) => state.courses.courses;
export const selectCurrentCourse = (state) => state.courses.currentCourse;
export const selectSubjects = (state) => state.courses.subjects;
export const selectCourseStats = (state) => state.courses.stats;
export const selectMySubmission = (state) => state.courses.mySubmission;
export const selectSubmissions = (state) => state.courses.submissions;
export const selectCoursesLoading = (state) => state.courses.isLoading;
export const selectCoursesError = (state) => state.courses.error;
export const selectCoursesSuccess = (state) => state.courses.successMessage;

export default courseSlice.reducer;

