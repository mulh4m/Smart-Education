import * as yup from "yup";

// Example validation schema for a user form
export const userSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters"),

  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[\d\s\-\+\(\)]+$/, "Please provide a valid phone number"),

  role: yup
    .string()
    .oneOf(['admin', 'teacher', 'student'], "Role must be either admin, teacher, or student"),

  website: yup.string().url("Invalid URL format"),
});

// Example login schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Email is required")
    .email("Invalid email format"),

  password: yup.string().required("Password is required"),
});

// Export validation functions
export const validateUser = async (data) => {
  try {
    await userSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};

export const validateLogin = async (data) => {
  try {
    await loginSchema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (err) {
    const errors = {};
    err.inner.forEach((error) => {
      errors[error.path] = error.message;
    });
    return { isValid: false, errors };
  }
};
