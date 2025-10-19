import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Courses.css';

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock data - will be replaced with actual data from your backend/AI
  const [recommendations, setRecommendations] = useState({
    studentName: 'John Doe',
    studentId: '1234567',
    major: 'Computer Science',
    quarters: [
      {
        name: 'Fall 2025',
        courses: [
          {
            id: 1,
            code: 'CSE 142',
            title: 'Computer Programming I',
            credits: 4,
            professor: 'Kevin Zhang',
            schedule: 'MWF 10:30-11:20',
            location: 'CSE 303',
            description: 'Introduction to programming using Java.',
            prerequisites: 'None',
            rating: 4.5
          },
          {
            id: 2,
            code: 'MATH 124',
            title: 'Calculus with Analytic Geometry I',
            credits: 5,
            professor: 'Sarah Johnson',
            schedule: 'MTWThF 9:30-10:20',
            location: 'SMI 205',
            description: 'First quarter in calculus sequence.',
            prerequisites: 'Precalculus or equivalent',
            rating: 4.2
          },
          {
            id: 3,
            code: 'ENGL 131',
            title: 'Composition: Exposition',
            credits: 5,
            professor: 'Michael Brown',
            schedule: 'TTh 1:30-3:20',
            location: 'SMI 109',
            description: 'Academic writing and critical thinking.',
            prerequisites: 'None',
            rating: 4.0
          }
        ],
        totalCredits: 14
      },
      {
        name: 'Winter 2026',
        courses: [
          {
            id: 4,
            code: 'CSE 143',
            title: 'Computer Programming II',
            credits: 5,
            professor: 'Adam Blank',
            schedule: 'MWF 12:30-1:20',
            location: 'CSE 303',
            description: 'Continuation of CSE 142. Data structures and algorithms.',
            prerequisites: 'CSE 142',
            rating: 4.7
          },
          {
            id: 5,
            code: 'MATH 125',
            title: 'Calculus with Analytic Geometry II',
            credits: 5,
            professor: 'Emily Chen',
            schedule: 'MTWThF 10:30-11:20',
            location: 'SMI 205',
            description: 'Second quarter in calculus sequence.',
            prerequisites: 'MATH 124',
            rating: 4.3
          },
          {
            id: 6,
            code: 'PHYS 121',
            title: 'Mechanics',
            credits: 5,
            professor: 'David Lee',
            schedule: 'TTh 2:30-4:20',
            location: 'PHY 120',
            description: 'Introduction to mechanics and wave motion.',
            prerequisites: 'MATH 124',
            rating: 3.9
          }
        ],
        totalCredits: 15
      }
    ]
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  const handleExport = () => {
    // Future: Export to PDF or CSV
    alert('Export functionality coming soon!');
  };

  const handleRegister = () => {
    // Future: Integration with registration system
    alert('Registration integration coming soon!');
  };

  const handleGoBack = () => {
    // Go back to the last step (step 6 - Goals and Interests) with saved data
    const lastStep = location.state?.step || 5; // Default to step 5 (index of last step)
    navigate('/', { 
      state: { 
        formData: location.state?.formData, 
        step: lastStep,
        currentQuarter: location.state?.currentQuarter 
      } 
    });
  };

  return (
    <div className="courses-container">
      <div className="courses-header">
        <div className="header-content">
          <h1>Your Course Recommendations</h1>
          <div className="student-info">
            <p><strong>{recommendations.studentName}</strong> ({recommendations.studentId})</p>
            <p>{recommendations.major}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="back-button" onClick={handleGoBack}>
            ← Back to Survey
          </button>
          <button className="view-toggle" onClick={() => setView(view === 'grid' ? 'list' : 'grid')}>
            {view === 'grid' ? '📋 List View' : '📊 Grid View'}
          </button>
          <button className="export-button" onClick={handleExport}>
            📥 Export Schedule
          </button>
          <button className="register-button" onClick={handleRegister}>
            ✓ Register for Courses
          </button>
        </div>
      </div>

      <div className="courses-content">
        {recommendations.quarters.map((quarter, qIndex) => (
          <div key={qIndex} className="quarter-section">
            <div className="quarter-header">
              <h2>{quarter.name}</h2>
              <span className="total-credits">{quarter.totalCredits} Credits</span>
            </div>

            <div className={`courses-${view}`}>
              {quarter.courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="course-header">
                    <div className="course-code">{course.code}</div>
                    <div className="course-credits">{course.credits} credits</div>
                  </div>
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-info">
                    <div className="info-row">
                      <span className="info-label">👤</span>
                      <span>{course.professor}</span> <span className="course-rating">⭐ {course.rating}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">🕒</span>
                      <span>{course.schedule}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">📍</span>
                      <span>{course.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <div className="modal-header">
              <div className="modal-code">{selectedCourse.code}</div>
              <div className="modal-credits">{selectedCourse.credits} credits</div>
            </div>
            <h2 className="modal-title">{selectedCourse.title}</h2>
            
            <div className="modal-details">
              <div className="detail-section">
                <h3>Course Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Professor:</span>
                  <span>{selectedCourse.professor}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Schedule:</span>
                  <span>{selectedCourse.schedule}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Location:</span>
                  <span>{selectedCourse.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span>{selectedCourse.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Rating:</span>
                  <span>⭐ {selectedCourse.rating}/5.0</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Description</h3>
                <p>{selectedCourse.description}</p>
              </div>

              <div className="detail-section">
                <h3>Prerequisites</h3>
                <p>{selectedCourse.prerequisites}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-button secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button className="modal-button primary" onClick={() => alert('Add to calendar feature coming soon!')}>
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
