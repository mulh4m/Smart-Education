import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
  createTeacher,
  selectAllUsers,
  selectAdminLoading,
  selectAdminError,
  selectAdminSuccess,
  clearSuccessMessage,
  clearError,
} from "../../store/slices/adminSlice";
import { selectToken } from "../../store/slices/authSlice";

const UserManagement = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectAllUsers);
  const token = useSelector(selectToken);
  const isLoading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const successMessage = useSelector(selectAdminSuccess);

  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateTeacherModal, setShowCreateTeacherModal] = useState(false);
  const [teacherData, setTeacherData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [teacherErrors, setTeacherErrors] = useState({});

  useEffect(() => {
    if (token) {
      dispatch(getAllUsers(token));
    }
  }, [dispatch, token]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        dispatch(clearError());
      }, 5000);
    }
  }, [error, dispatch]);

  const handleDeleteUser = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser({ userId, token }));
    }
  };

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewPhone(user.phone);
    setShowRoleModal(true);
  };

  const handleUpdateRole = () => {
    if (selectedUser) {
      dispatch(
        updateUserRole({
          userId: selectedUser._id,
          role: newRole,
          phone: newPhone,
          token,
        })
      );
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole("");
      setNewPhone("");
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "admin":
        return "badge bg-danger";
      case "teacher":
        return "badge bg-info";
      case "student":
        return "badge bg-success";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fw-bold mb-0">
              <i className="bi bi-people-fill text-primary me-2"></i>
              User Management
            </h2>
            <div className="badge bg-primary fs-6">
              {filteredUsers.length} Users
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
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
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => dispatch(clearSuccessMessage())}
          ></button>
        </div>
      )}

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-primary text-white me-2">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="fw-semibold">{user.fullName}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.role)}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleOpenRoleModal(user)}
                          title="Edit User"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteUser(user._id)}
                          title={user.role === "admin" ? "Cannot delete admin accounts" : "Delete User"}
                          disabled={user.role === "admin"}
                          style={user.role === "admin" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Role & Phone Update Modal */}
      {showRoleModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update User Info</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRoleModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Update details for <strong>{selectedUser?.fullName}</strong>
                </p>

                <label className="form-label">Role</label>
                <select
                  className="form-select mb-3"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>

                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRoleModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateRole}
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
