import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import courseSlice from './slices/courseSlice';
import adminSlice from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: courseSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
