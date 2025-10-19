import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const TagInput = ({ value, onChange, placeholder, options }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const tags = Array.isArray(value) ? value : (value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : []);
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(inputValue.toLowerCase()) &&
    !tags.includes(option)
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(newValue.length > 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      onChange(newTags);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleSuggestionClick = (option) => {
    addTag(option);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };


 

  return (
    <div className="tag-input-container">
      <div className="tag-input-wrapper">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(index)}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input-field"
        />
      </div>
      {showSuggestions && filteredOptions.length > 0 && (
        <div className="tag-suggestions">
          {filteredOptions.slice(0, 8).map((option, index) => (
            <div
              key={index}
              className="tag-suggestion"
              onClick={() => handleSuggestionClick(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentQuarter, setCurrentQuarter] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    studentId: '',
    major: '',
    
    // Academic Preferences
    selectedQuarters: [],
    quarterPreferences: {
      fall: {
        preferredClassTimes: [],
        maxCredits: ''
      },
      winter: {
        preferredClassTimes: [],
        maxCredits: ''
      },
      spring: {
        preferredClassTimes: [],
        maxCredits: ''
      },
      summer: {
        preferredClassTimes: [],
        maxCredits: ''
      }
    },
    
    // Professor Preferences (global)
    preferredProfessors: [],
    avoidProfessors: [],
    
    // MyPlan Integration
    myPlanData: null,
    completedCourses: [],
    remainingRequirements: [],
    transferCredits: [],
    
    // Goals and Interests
    careerGoals: [],
    interests: [],
    studyAbroad: false,
    internship: false,
    
    // Extracurricular Activities
    extracurriculars: [],
    workSchedule: '',
    timeCommitments: '',
    
    // Constraints
    financialAid: false,
    housingLocation: '',
    transportation: '',
    
    // Course Preferences
    difficultyPreference: '',
    classSizePreference: '',
    onlinePreference: '',
    
    // Additional Notes
    additionalNotes: ''
  });

  const surveySteps = [
    {
      title: "Basic Information",
      questions: [
        {
          id: 'name',
          label: 'Full Name',
          type: 'text',
          required: true
        },
     
        {
          id: 'major',
          label: 'Major',
          type: 'select',
          options: [
            'Computer Science',
            'Computer Science: Data Science',
            'Computer Engineering',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Business Administration',
            'Economics',
            'Psychology',
            'Biology',
            'Chemistry',
            'Mathematics',
            'Physics',
            'English',
            'History',
            'Political Science',
            'Other'
          ],
          required: true
        }
      ]
    },
    {
      title: "Academic Preferences",
      questions: [
        {
          id: 'selectedQuarters',
          label: 'Which quarters would you like to plan for?',
          type: 'checkbox',
          options: ['Fall', 'Winter', 'Spring', 'Summer'],
          required: true
        }
      ]
    },
    {
      title: "Quarter-Specific Preferences",
      questions: []
    },
    {
      title: "Professor Preferences",
      questions: [
        {
          id: 'preferredProfessors',
          label: 'Preferred Professors (if any)',
          type: 'datalist',
          placeholder: 'Start typing to see professor suggestions...',
          options: [
            'Kevin Z', 'Kevin Zhang',
            'Adam Blank',
            'Alan Borning',
            'Anna Karlin',
            'Arvind Krishnamurthy',
            'Bill Howe',
            'Brian Curless',
            'Carl Ebeling',
            'Chetan Gupta',
            'Chris Dovolis',
            'Dan Grossman',
            'David Notkin',
            'Ed Lazowska',
            'Elena Glassman',
            'Eugene Luks',
            'Gary Haggard',
            'Hank Levy',
            'Heather Zheng',
            'James Landay',
            'Jeff Heer',
            'Jennifer Mankoff',
            'John Zahorjan',
            'Josh Tenenbaum',
            'Kai Li',
            'Kathy Yelick',
            'Luis Ceze',
            'Magda Balazinska',
            'Maya Cakmak',
            'Michael Ernst',
            'Michael Taylor',
            'Oren Etzioni',
            'Pedro Domingos',
            'Rajesh Rao',
            'Richard Anderson',
            'Shwetak Patel',
            'Steve Seitz',
            'Susan Eggers',
            'Tadayoshi Kohno',
            'Tom Anderson',
            'Yoshi Kohno',
            'Zoran Popovic'
          ]
        },
        {
          id: 'avoidProfessors',
          label: 'Professors to Avoid (if any)',
          type: 'datalist',
          placeholder: 'Start typing to see professor suggestions...',
          options: [
            'Kevin Z', 'Kevin Zhang',
            'Adam Blank',
            'Alan Borning',
            'Anna Karlin',
            'Arvind Krishnamurthy',
            'Bill Howe',
            'Brian Curless',
            'Carl Ebeling',
            'Chetan Gupta',
            'Chris Dovolis',
            'Dan Grossman',
            'David Notkin',
            'Ed Lazowska',
            'Elena Glassman',
            'Eugene Luks',
            'Gary Haggard',
            'Hank Levy',
            'Heather Zheng',
            'James Landay',
            'Jeff Heer',
            'Jennifer Mankoff',
            'John Zahorjan',
            'Josh Tenenbaum',
            'Kai Li',
            'Kathy Yelick',
            'Luis Ceze',
            'Magda Balazinska',
            'Maya Cakmak',
            'Michael Ernst',
            'Michael Taylor',
            'Oren Etzioni',
            'Pedro Domingos',
            'Rajesh Rao',
            'Richard Anderson',
            'Shwetak Patel',
            'Steve Seitz',
            'Susan Eggers',
            'Tadayoshi Kohno',
            'Tom Anderson',
            'Yoshi Kohno',
            'Zoran Popovic'
          ]
        }
      ]
    },
    {
      title: "MyPlan Integration",
      questions: [
        {
          id: 'myPlanData',
          label: 'Upload your MyPlan degree audit (PDF)',
          type: 'file',
          accept: '.pdf',
         
          required: true
        },
        {
          id: 'completedCourses',
          label: 'Completed Courses (if not in MyPlan data)',
          type: 'textarea',
          placeholder: 'List any additional completed courses not shown in MyPlan (e.g., CSE 142, MATH 124, etc.)'
        },
        {
          id: 'remainingRequirements',
          label: 'Specific Requirements to Focus On',
          type: 'textarea',
          placeholder: 'List any specific degree requirements you want to prioritize (e.g., "Need to complete CSE core", "Focus on electives", etc.)'
        },
        
      ]
    },
    {
      title: "Goals and Interests",
      questions: [
        {
          id: 'careerGoals',
          label: 'Career Goals (select all that apply)',
          type: 'checkbox',
          options: [
            'Software Engineering',
            'Data Science',
            'Research',
            'Graduate School',
            'Medical School',
            'Law School',
            'Business/Consulting',
            'Startup/Entrepreneurship',
            'Other'
          ]
        },
        {
          id: 'interests',
          label: 'Academic Interests (select all that apply)',
          type: 'checkbox',
          options: [
            'Artificial Intelligence',
            'Machine Learning',
            'Web Development',
            'Mobile Development',
            'Cybersecurity',
            'Database Systems',
            'Computer Graphics',
            'Human-Computer Interaction',
            'Software Engineering',
            'Algorithms',
            'Other'
          ]
        }
      
      ]
    },
   
  
  
  ];

  const getQuarterQuestions = () => {
    return [
      {
        id: 'quarter_preferredClassTimes',
        label: 'Preferred Class Times (select all that apply)',
        type: 'checkbox',
        options: [
          'Morning (9 AM - 12 PM)',
          'Afternoon (12 PM - 5 PM)',
          'Evening (5 PM - 8 PM)'
        ]
      },
      {
        id: 'quarter_maxCredits',
        label: 'Maximum Credits for this Quarter',
        type: 'select',
        options: ['12', '15', '18', '21'],
        required: true
      },
      {
        id: 'quarter_onlinePreference',
        label: 'Online vs In-Person Preference',
        type: 'select',
        options: [
          'In-person only',
          'Online only',
          'Hybrid',
          'No preference'
        ],
        required: true
      }
    ];
  };

  const handleInputChange = (questionId, value) => {
    if (questionId === 'selectedQuarters') {
      setFormData(prev => ({
        ...prev,
        [questionId]: value
      }));
    } else if (currentQuarter && questionId.startsWith('quarter_')) {
      const field = questionId.replace('quarter_', '');
      setFormData(prev => ({
        ...prev,
        quarterPreferences: {
          ...prev.quarterPreferences,
          [currentQuarter]: {
            ...prev.quarterPreferences[currentQuarter],
            [field]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.selectedQuarters && formData.selectedQuarters.length > 0) {
        setCurrentStep(2);
        setCurrentQuarter(formData.selectedQuarters[0].toLowerCase());
      } else {
        alert('Please select at least one quarter to continue.');
        return;
      }
    } else if (currentStep === 2) {
      if (currentQuarter) {
        const currentIndex = formData.selectedQuarters.findIndex(q => q.toLowerCase() === currentQuarter);
        
        if (currentIndex < formData.selectedQuarters.length - 1) {
          setCurrentQuarter(formData.selectedQuarters[currentIndex + 1].toLowerCase());
        } else {
          setCurrentStep(3);
          setCurrentQuarter(null);
        }
      } else {
        setCurrentStep(3);
      }
    } else if (currentStep < surveySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2 && currentQuarter) {
      const currentIndex = formData.selectedQuarters.findIndex(q => q.toLowerCase() === currentQuarter);
      if (currentIndex > 0) {
        setCurrentQuarter(formData.selectedQuarters[currentIndex - 1].toLowerCase());
      } else {
        setCurrentStep(1);
        setCurrentQuarter(null);
      }
    } else if (currentStep === 3) {
      const lastQuarter = formData.selectedQuarters[formData.selectedQuarters.length - 1].toLowerCase();
      setCurrentStep(2);
      setCurrentQuarter(lastQuarter);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend/AI service
    navigate('/courses');
  };

  const renderQuestion = (question) => {
    const { id, label, type, options, required, placeholder } = question;
    let value;
    
    if (id.startsWith('quarter_') && currentQuarter) {
      const field = id.replace('quarter_', '');
      value = formData.quarterPreferences[currentQuarter][field];
    } else {
      value = formData[id];
    }

    switch (type) {
      case 'text':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              placeholder={placeholder}
              className="form-input"
              required={required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              placeholder={placeholder}
              className="form-textarea"
              rows={4}
              required={required}
            />
          </div>
        );

      case 'select':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className="form-select"
              required={required}
            >
              <option value="">Select an option</option>
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {options.map(option => (
                <label key={option} className="radio-option">
                  <input
                    type="radio"
                    name={id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(id, e.target.value)}
                    required={required}
                  />
                  <span className="radio-label">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={id} className="question">
            <label className="question-label">{label}</label>
            <div className="checkbox-group">
              {options.map(option => (
                <label key={option} className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...value, option]
                        : value.filter(item => item !== option);
                      handleInputChange(id, newValue);
                    }}
                  />
                  <span className="checkbox-label">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className="form-input"
              required={required}
            />
          </div>
        );

      case 'file':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <div className="file-upload-container">
              <input
                type="file"
                accept={question.accept || '*'}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleInputChange(id, file);
                  }
                }}
                className="form-file-input"
                id={`file-${id}`}
                required={required}
              />
              <label htmlFor={`file-${id}`} className="file-upload-label">
                {value ? value.name : placeholder || 'Choose a file'}
              </label>
              {value && (
                <button
                  type="button"
                  onClick={() => handleInputChange(id, null)}
                  className="file-remove-button"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        );

      case 'datalist':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <TagInput
              value={value}
              onChange={(newValue) => handleInputChange(id, newValue)}
              placeholder={placeholder}
              options={options}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="home-container">
      <div className="survey-header">
        <h1>Registrawr</h1>
        <p>Let's create your perfect course schedule!</p>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentStep + 1) / surveySteps.length) * 100}%` }}
          ></div>
        </div>
        <p className="step-indicator">
          {currentStep === 2 && currentQuarter ? (
            `Step ${currentStep + 1} of ${surveySteps.length}: ${currentQuarter.charAt(0).toUpperCase() + currentQuarter.slice(1)} Quarter Preferences`
          ) : (
            `Step ${currentStep + 1} of ${surveySteps.length}: ${surveySteps[currentStep].title}`
          )}
        </p>
      </div>

      <div className="survey-content">
        <div className="step-questions">
          {currentStep === 2 && currentQuarter ? (
            <div>
              <h3 className="quarter-header">
                {currentQuarter.charAt(0).toUpperCase() + currentQuarter.slice(1)} Quarter Preferences
              </h3>
              {getQuarterQuestions().map(renderQuestion)}
            </div>
          ) : currentStep === 4 ? (
            <div>
              <div className="myplan-instructions">
                <h3 className="myplan-title">MyPlan Integration</h3>
                <div className="myplan-help">
                  <p><strong>How to get your MyPlan PDF:</strong></p>
                  <ol>
                    <li>Go to <a href="https://myplan.uw.edu" target="_blank" rel="noopener noreferrer">myplan.uw.edu</a></li>
                    <li>Log in with your UW NetID</li>
                    <li>Navigate to your degree audit</li>
                    <li>Print or export your degree audit as a PDF</li>
                    <li>Upload the PDF file below</li>
                  </ol>
        
                </div>
              </div>
              {surveySteps[currentStep].questions.map(renderQuestion)}
            </div>
          ) : (
            <div>
             
              {surveySteps[currentStep].questions.map(renderQuestion)}
            </div>
          )}
        </div>

        <div className="survey-navigation">
          <button 
            onClick={handlePrevious} 
            disabled={currentStep === 0}
            className="nav-button prev-button"
          >
            Previous
          </button>
          
          {currentStep === surveySteps.length - 1 ? (
            <button onClick={handleSubmit} className="nav-button submit-button">
              Complete Survey
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="nav-button next-button"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;