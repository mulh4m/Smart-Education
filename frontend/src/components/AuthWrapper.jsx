import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUser } from '../store/slices/authSlice';

const AuthWrapper = ({ children }) => {
  const dispatch = useDispatch();
  const { isLoading, token, user, isAuthenticated } = useSelector((state) => state.auth);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Only try to load user if we have a token but no user data
    if (token && !user && !isAuthenticated) {
      dispatch(loadUser()).finally(() => {
        setInitialLoad(false);
      });
    } else {
      setInitialLoad(false);
    }
  }, [dispatch, token, user, isAuthenticated]);

  // Show loading spinner while checking authentication
  if (initialLoad && token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading your dashboard...</h5>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthWrapper;
