import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProfessorLink from '../components/ProfessorLinks'; // <- if your file is ProfessorLinks.jsx, change this import
import './Courses.css';

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Mock data - will be replaced with actual data from your backend/AI
  const [recommendations, setRecommendations] = useState({
    studentName: 'John Doe',
    major: 'Computer Science',
    quarters: [
      {
        name: 'Autumn 2025',
        courses: [
          {
            id: 1,
            code: 'CSE 312',
            title: 'Foundations of Computing II',
            credits: 4,
            professor: 'Robbie Weber',
            schedule: 'MWF 09:30-10:20',
            location: 'ARC 147',
            description:
              'Examines fundamentals of enumeration and discrete probability; applications of randomness to computing; polynomial-time versus NP; and NP-completeness.',
            prerequisites: 'CSE 311',
            rating: 4.8
          },
          {
            id: 2,
            code: 'CSE 311',
            title: 'Foundations of Computing I',
            credits: 4,
            professor: 'Miya Natsuhara',
            schedule: 'MWF 13:30-14:20',
            location: 'ARC 147',
            description:
              'Examines fundamentals of logic, set theory, induction, and algebraic structures with applications to computing; finite state machines; and limits of computability.',
            prerequisites:
              'CSE 123/143 and MATH 126/135 (min grade of 2.0)',
            rating: 4.5
          },
          {
            id: 3,
            code: 'CSE 333',
            title: 'Systems Programming',
            credits: 4,
            professor: 'Chris Thachuk',
            schedule: 'MWF 11:30-12:20',
            location: 'SAV 260',
            description:
              'Includes substantial programming experience in languages that expose machine characteristics and low-level data representation (e.g., C and C++); explicit memory management; modern libraries and language features; interacting with operating-system services; introduction to concurrent programming.',
            prerequisites: 'CSE 351',
            rating: 4.0
          }
        ],
        totalCredits: 12
      },
      {
        name: 'Winter 2026',
        courses: [
          {
            id: 4,
            code: 'CSE 440',
            title: 'Introduction to HCI',
            credits: 4,
            professor: 'Amy Xian Zhang',
            schedule: 'TTh 10:00-11:20',
            location: 'CSE2 G10',
            description:
              'Human-Computer Interaction (HCI) theory and techniques. Methods for designing, prototyping, and evaluating user interfaces to computing applications. Human capabilities, interface technology, interface design methods, and interface evaluation tools and techniques.',
            prerequisites: 'CSE 332',
            rating: 'None available'
          },
          {
            id: 5,
            code: 'CSE 160',
            title: 'Data Programming',
            credits: 4,
            professor: 'Ruth Anderson',
            schedule: 'MWF 15:30-16:20',
            location: 'KNE 120',
            description:
              'Introduction to computer programming. Assignments solve real data manipulation tasks from science, engineering, business, and the humanities. Concepts of computational thinking, problem-solving, data analysis, Python programming, control and data abstraction, file processing, and data visualization. Intended for students without prior programming experience.',
            prerequisites: 'None',
            rating: 4.0
          },
          {
            id: 6,
            code: 'CSE 442',
            title: 'Data Visualization',
            credits: 4,
            professor: 'Jeffrey Heer',
            schedule: 'TTh 11:30-12:50',
            location: 'CSE2 G20',
            description:
              'Techniques for creating effective visualizations of data based on principles from graphic design, perceptual psychology, and statistics. Topics include visual encoding models, exploratory data analysis, visualization software, interaction techniques, graphical perception, color, animation, high-dimensional data, cartography, network visualization, and text visualization.',
            prerequisites: 'CSE 332',
            rating: 'None available'
          }
        ],
        totalCredits: 12
      }
    ]
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [view, setView] = useState('grid'); // 'grid' or 'list'

  const handleCourseClick = (course) => setSelectedCourse(course);
  const handleCloseModal = () => setSelectedCourse(null);

  const handleRegister = () => {
    window.open('https://myplan.uw.edu/home/', '_blank', 'noopener,noreferrer');
  };

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
            aria-label="Register for courses on MyPlan"
          >
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
                    <div className="info-row" onClick={(e) => e.stopPropagation()}>
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

      {selectedCourse && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>

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

              <div className="detail-section">
                <h3>Professor Summary</h3>
                <p>{/* TODO: populate with summary */}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-button secondary" onClick={handleCloseModal}>
                Close
              </button>
              <button
                className="modal-button primary"
                onClick={() => alert('Add to calendar feature coming soon!')}
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
