import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';           // 👈 ADD THIS
import { selectUser } from '../store/slices/authSlice';
import { selectCourses } from '../store/slices/courseSlice';
import CourseList from '../features/shared/CourseList';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();                         // 👈 AND THIS
  const user = useSelector(selectUser);
  const courses = useSelector(selectCourses);
  
  const [activeView, setActiveView] = useState('dashboard');

  const videoCourses = courses.filter(c => c.contentType === 'video').length;
  const materialCourses = courses.filter(c => c.contentType === 'material').length;
  const homeworkCourses = courses.filter(c => c.contentType === 'homework').length;

  const renderContent = () => {
    switch (activeView) {
      case 'courses':
        return <CourseList />;
      default:
        return (
          <div>
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3 text-primary">
                <i className="bi bi-mortarboard-fill text-success me-3"></i>
                {t('pages.studentDashboard.title')}
              </h1>
              <p className="lead text-black mb-4">
                <b>
                  {t('pages.studentDashboard.welcome', { name: user?.fullName })}
                </b>
              </p>
              <div className="alert alert-success border-0 rounded-3 mb-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-book-fill me-3 fs-4"></i>
                  <div>
                    <h5 className="mb-1 fw-bold">
                      {t('pages.studentDashboard.studentPortal')}
                    </h5>
                    <p className="mb-0 small">
                      {t('pages.studentDashboard.studentDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="row g-4 mb-5">
              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t('pages.studentDashboard.stats.availableCourses')}
                        </p>
                        <h2 className="fw-bold mb-0">{courses.length}</h2>
                      </div>
                      <div className="bg-primary bg-opacity-10 p-3 rounded">
                        <i className="bi bi-collection-fill text-primary fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t('pages.studentDashboard.stats.videoLessons')}
                        </p>
                        <h2 className="fw-bold mb-0">{videoCourses}</h2>
                      </div>
                      <div className="bg-danger bg-opacity-10 p-3 rounded">
                        <i className="bi bi-play-circle-fill text-danger fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <p className="text-muted mb-1">
                          {t('pages.studentDashboard.stats.assignments')}
                        </p>
                        <h2 className="fw-bold mb-0">{homeworkCourses}</h2>
                      </div>
                      <div className="bg-warning bg-opacity-10 p-3 rounded">
                        <i className="bi bi-clipboard-check-fill text-warning fs-3"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="row g-4 mb-5">
              {/* Browse courses */}
              <div className="col-lg-6 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i className="bi bi-book-half text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t('pages.studentDashboard.actions.browseCourses.title')}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t('pages.studentDashboard.actions.browseCourses.description')}
                    </p>
                    <button 
                      className="btn btn-primary px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => setActiveView('courses')}
                    >
                      <i className="bi bi-eye-fill me-2"></i>
                      {t('pages.studentDashboard.actions.browseCourses.button')}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Summarize your material */}
              <div className="col-lg-6 col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <i className="bi bi-stars text-success" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h4 className="card-title fw-bold mb-3 text-primary">
                      {t(
                        'pages.studentDashboard.actions.summarizeMaterials.title',
                        'Summarize your material'
                      )}
                    </h4>
                    <p className="card-text text-muted mb-4">
                      {t(
                        'pages.studentDashboard.actions.summarizeMaterials.description',
                        'Upload or paste your study materials and instantly get a clear, concise summary.'
                      )}
                    </p>
                    <button 
                      className="btn btn-success px-4 py-2 rounded-3 fw-semibold"
                      onClick={() => navigate('/summary')}      // 👈 GO TO SUMMARY PAGE
                    >
                      <i className="bi bi-magic me-2"></i>
                      {t(
                        'pages.studentDashboard.actions.summarizeMaterials.button',
                        'Summarize your material'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick links */}

          </div>
        );
    }
  };

  return (
    <div className="min-vh-100 bg-gradient-light d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12">
            {activeView !== 'dashboard' && (
              <button
                className="btn btn-outline-primary mb-3"
                onClick={() => setActiveView('dashboard')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t('pages.studentDashboard.backToDashboard')}
              </button>
            )}
            
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
