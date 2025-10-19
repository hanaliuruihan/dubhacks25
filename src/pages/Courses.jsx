import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfessorLink from '../components/ProfessorLinks';
import './Courses.css';

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data for recommended courses (will be replaced by backend)
  const [recommendations] = useState({
    studentName: 'John Doe',
    major: 'Computer Science',
    quarters: [
      {
        name: 'Autumn 2025',
        courses: [
          {
            id: 1,
            code: 'CSE 446',
            title: 'Machine Learning',
            credits: 4,
            professor: 'Sewoong Oh',
            schedule: 'TTh 10:00-11:20',
            location: 'CSE2 G20',
            description:
              'Design of efficient algorithms that learn from data. Representative topics include supervised learning, unsupervised learning, regression and classification, deep learning, kernel methods, and optimization.',
            prerequisites: 'CSE 332, MATH 208, STAT 390/391 or CSE 312',
            rating: 3.3
          },
          {
            id: 2,
            code: 'CSE 447',
            title: 'Natural Language Processing',
            credits: 4,
            professor: 'Yulia Tsvetkov',
            schedule: 'MWF 11:30-12:20',
            location: 'CSE2 G10',
            description:
              'Methods for designing systems that process natural language text data, including text categorization, syntactic and semantic analysis, and machine translation.',
            prerequisites: 'CSE 312 and CSE 332',
            rating: 3
          },
          {
            id: 3,
            code: 'CSE 473',
            title: 'Artificial Intelligence',
            credits: 4,
            professor: 'Megan Hazen',
            schedule: 'MWF 14:30-15:20',
            location: 'SAV 260',
            description:
              'Principal ideas and developments in artificial intelligence: search, game playing, reasoning, uncertainty, machine learning, and natural language processing.',
            prerequisites: 'CSE 312 and CSE 332',
            rating: 3.5
          }
        ],
        totalCredits: 12
      }
    ]
  });

  // ---- This is what comes back from Claude/Bedrock ----
  const claudeJson = {
    status: "ok",
    extracted: {
      completed_courses: [
        "ENGL 111", "CSE 110", "ENGL 388", "ENGL 288",
        "PSYCH 210", "CHIN 231", "CSE 312", "CSE 331", "CSE 332", "CSE 351"
      ],
      remaining_requirements: [
        "CSE 446", "CSE 451", "CSE 473", "AMATH 482"
      ],
      notes: [
        "All requirements have been satisfied with planned courses included",
        "Student has 158 earned credits, 12 in-progress credits, and 11 planned credits",
        "Cumulative GPA is 3.76",
        "Some courses are listed as planned or in-progress and must be completed to satisfy requirements"
      ]
    },
    ml_guidance: {
      summary:
        "The student has a solid foundation in computer science and mathematics, with completed courses in programming, data structures, algorithms, and machine organization. They are planning to take advanced courses in machine learning, artificial intelligence, and scientific computing. To strengthen their ML skills, they should focus on probability, linear algebra, and optimization, while also gaining practical experience with Python/NumPy and data visualization.",
      recommended_focus: [
        "Probability and Statistics",
        "Linear Algebra",
        "Optimization",
        "Python/NumPy",
        "Data Visualization",
        "Deep Learning",
        "Natural Language Processing",
        "Computer Vision"
      ],
      reasoning: [
        "Completed CSE 446 (Machine Learning) indicates interest in ML",
        "Planned courses in AMATH suggest interest in scientific computing and data analysis",
        "Strong math background provides a good foundation for advanced ML topics",
        "Planned AI course (CSE 473) shows interest in broader AI applications",
        "Focus on probability and statistics would complement existing math skills",
        "Practical skills in Python/NumPy and data visualization are crucial for ML projects",
        "Deep learning, NLP, and computer vision are key areas in modern ML applications"
      ]
    },
    meta: {
      bytes: 522533,
      async: true,
      contentType: "application/pdf"
    },
    build: "anthropic-v3"
  };

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [view, setView] = useState('grid');

  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleCloseModal = () => setSelectedCourse(null);
  const handleRegister = () =>
    window.open('https://myplan.uw.edu/home/', '_blank', 'noopener,noreferrer');

  const handleGoBack = () => {
    const lastStep = location.state?.step || 5;
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
      {/* HEADER */}
      <div className="courses-header">
        <div className="header-content">
          <h1>Your Course Recommendations</h1>
          <div className="student-info">
            <p>
              <strong>{recommendations.studentName}</strong>
            </p>
            <p>{recommendations.major}</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="back-button" onClick={handleGoBack}>
            ← Back to Survey
          </button>
          <button
            className="view-toggle"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          >
            {view === 'grid' ? '📋 List View' : '📊 Grid View'}
          </button>
          <button
            type="button"
            className="register-button"
            onClick={handleRegister}
          >
            ✓ Register for Courses
          </button>
        </div>
      </div>

      {/* COURSE RECOMMENDATIONS */}
      <div className="courses-content">
        {recommendations.quarters.map((quarter, qIndex) => (
          <div key={qIndex} className="quarter-section">
            <div className="quarter-header">
              <h2>{quarter.name}</h2>
              <span className="total-credits">
                {quarter.totalCredits} Credits
              </span>
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
                    <div className="course-credits">
                      {course.credits} credits
                    </div>
                  </div>

                  <h3 className="course-title">{course.title}</h3>

                  <div className="course-info">
                    <div
                      className="info-row"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="info-label">👤</span>
                      <ProfessorLink
                        name={String(course.professor)
                          .replace(/\u00A0/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()}
                        campus="UW"
                      />
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

                  <div className="course-footer">
                    <span className="course-type">{course.type}</span>
                    <span className="course-rating">⭐ {course.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* DEGREE AUDIT OUTPUT (Claude JSON) */}
      <div className="audit-panel" style={{ marginTop: '2rem' }}>
        <div className="audit-panel-header">
          <h2>Degree Audit Summary</h2>
        </div>

        <div className="audit-chip" style={{ marginBottom: 8 }}>
          Advising Summary — Machine Learning & Remaining Requirements
        </div>

        <details className="audit-details" open>
          <summary>Show full extracted JSON</summary>
          <pre className="audit-json">
            {JSON.stringify(claudeJson, null, 2)}
          </pre>
        </details>
      </div>

      {/* MODAL */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <div className="modal-header">
              <div className="modal-code">{selectedCourse.code}</div>
              <div className="modal-credits">
                {selectedCourse.credits} credits
              </div>
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
                  <span className="detail-label">Prerequisites:</span>
                  <span>{selectedCourse.prerequisites}</span>
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
            </div>

            <div className="modal-actions">
              <button
                className="modal-button secondary"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                className="modal-button primary"
                onClick={() =>
                  alert('Add to calendar feature coming soon!')
                }
              >
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
