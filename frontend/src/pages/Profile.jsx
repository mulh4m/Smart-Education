import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  updateProfile,
  changePassword,
  selectUser,
  selectIsLoading,
  selectError,
  selectSuccessMessage,
  selectProfileUpdateStatus,
  selectPasswordChangeStatus,
  clearError,
  clearSuccessMessage,
  clearProfileUpdateStatus,
  clearPasswordChangeStatus,
} from "../store/slices/authSlice";

const Profile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const successMessage = useSelector(selectSuccessMessage);
  const profileUpdateStatus = useSelector(selectProfileUpdateStatus);
  const passwordChangeStatus = useSelector(selectPasswordChangeStatus);

  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Reset password form on successful change
  useEffect(() => {
    if (passwordChangeStatus === "success") {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setTimeout(() => {
        dispatch(clearPasswordChangeStatus());
      }, 3000);
    }
  }, [passwordChangeStatus, dispatch]);

  // Clear profile update status
  useEffect(() => {
    if (profileUpdateStatus === "success") {
      setTimeout(() => {
        dispatch(clearProfileUpdateStatus());
      }, 3000);
    }
  }, [profileUpdateStatus, dispatch]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};

    if (!profileData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (profileData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    }

    if (!profileData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (profileData.phone && !/^\+?[\d\s\-\(\)]+$/.test(profileData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (validateProfileForm()) {
      // Only send changed fields (exclude email as it cannot be changed)
      const changedFields = {};
      if (profileData.fullName !== user.fullName) {
        changedFields.fullName = profileData.fullName;
      }
      // Email is disabled, so we don't include it in the update
      if (profileData.phone !== user.phone) {
        changedFields.phone = profileData.phone;
      }

      if (Object.keys(changedFields).length > 0) {
        dispatch(updateProfile(changedFields));
      }
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      dispatch(changePassword(passwordData));
    }
  };

  if (!user) {
    return (
      <div className="container mt-5 pt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                User Profile
              </h4>
            </div>
            <div className="card-body p-0">
              {/* Alert Messages */}
              {error && (
                <div className="alert alert-danger alert-dismissible fade show m-3 mb-0" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => dispatch(clearError())}
                  ></button>
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success alert-dismissible fade show m-3 mb-0" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {successMessage}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => dispatch(clearSuccessMessage())}
                  ></button>
                </div>
              )}

              {/* Tabs */}
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "profile" ? "active" : ""}`}
                    onClick={() => setActiveTab("profile")}
                    type="button"
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile Information
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === "password" ? "active" : ""}`}
                    onClick={() => setActiveTab("password")}
                    type="button"
                  >
                    <i className="bi bi-lock me-2"></i>
                    Change Password
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content p-4">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="tab-pane fade show active">
                    <form onSubmit={handleProfileSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="fullName" className="form-label fw-semibold">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${profileErrors.fullName ? "is-invalid" : ""}`}
                            id="fullName"
                            name="fullName"
                            value={profileData.fullName}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                          />
                          {profileErrors.fullName && (
                            <div className="invalid-feedback">{profileErrors.fullName}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label fw-semibold">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${profileErrors.email ? "is-invalid" : ""}`}
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            placeholder="Enter your email address"
                            disabled
                          />
                          <small className="text-muted">Email cannot be changed</small>
                          {profileErrors.email && (
                            <div className="invalid-feedback">{profileErrors.email}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="phone" className="form-label fw-semibold">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className={`form-control ${profileErrors.phone ? "is-invalid" : ""}`}
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                          />
                          {profileErrors.phone && (
                            <div className="invalid-feedback">{profileErrors.phone}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-semibold">Role</label>
                          <input
                            type="text"
                            className="form-control"
                            value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                            disabled
                          />
                          <small className="text-muted">Role cannot be changed</small>
                        </div>
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading || profileUpdateStatus === "loading"}
                        >
                          {isLoading || profileUpdateStatus === "loading" ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Updating Profile...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-circle me-2"></i>
                              Update Profile
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === "password" && (
                  <div className="tab-pane fade show active">
                    <form onSubmit={handlePasswordSubmit}>
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label htmlFor="currentPassword" className="form-label fw-semibold">
                            Current Password <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className={`form-control ${passwordErrors.currentPassword ? "is-invalid" : ""}`}
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your current password"
                          />
                          {passwordErrors.currentPassword && (
                            <div className="invalid-feedback">{passwordErrors.currentPassword}</div>
                          )}
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="newPassword" className="form-label fw-semibold">
                            New Password <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className={`form-control ${passwordErrors.newPassword ? "is-invalid" : ""}`}
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter your new password"
                          />
                          {passwordErrors.newPassword && (
                            <div className="invalid-feedback">{passwordErrors.newPassword}</div>
                          )}
                          <small className="text-muted">Password must be at least 6 characters long</small>
                        </div>

                        <div className="col-md-6 mb-3">
                          <label htmlFor="confirmPassword" className="form-label fw-semibold">
                            Confirm New Password <span className="text-danger">*</span>
                          </label>
                          <input
                            type="password"
                            className={`form-control ${passwordErrors.confirmPassword ? "is-invalid" : ""}`}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm your new password"
                          />
                          {passwordErrors.confirmPassword && (
                            <div className="invalid-feedback">{passwordErrors.confirmPassword}</div>
                          )}
                        </div>
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          className="btn btn-warning"
                          disabled={isLoading || passwordChangeStatus === "loading"}
                        >
                          {isLoading || passwordChangeStatus === "loading" ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Changing Password...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-shield-lock me-2"></i>
                              Change Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
