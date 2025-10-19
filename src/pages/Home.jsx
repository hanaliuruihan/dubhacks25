import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// >>> ADDED: Tiny API helper (uses your API Gateway)
const API_BASE = import.meta.env.VITE_API_BASE;

async function getUploadUrl(filename, contentType = 'application/pdf') {
  const r = await fetch(`${API_BASE}/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType })
  });
  if (!r.ok) throw new Error('Failed to get upload URL');
  return r.json(); // { uploadUrl, fileKey, resultUrl }
}

export async function putToS3(uploadUrl, file) {
  const contentType = file.type || "application/pdf"; // some PDFs have empty type
  const resp = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },   // <-- required to match the presign
    body: file,
    // mode: "cors" // usually not needed, but harmless
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`S3 upload failed: ${resp.status} ${resp.statusText} ${text}`);
  }
}

// ------------------------------------------------------

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

  // >>> ADDED: status + parsed result for MyPlan PDF
  const [uploadStatus, setUploadStatus] = useState('');
  const [parsedPreview, setParsedPreview] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    studentId: '',
    major: '',
    
    // Academic Preferences
    selectedQuarters: [],
    quarterPreferences: {
      fall: { preferredClassTimes: [], maxCredits: '' },
      winter: { preferredClassTimes: [], maxCredits: '' },
      spring: { preferredClassTimes: [], maxCredits: '' },
      summer: { preferredClassTimes: [], maxCredits: '' }
    },
    
    // Professor Preferences (global)
    preferredProfessors: [],
    avoidProfessors: [],
    
    // MyPlan Integration
    // >>> CHANGED: store metadata instead of raw File (we’ll add it when user selects)
    myPlanData: null, // { fileName, fileKey, resultUrl, parsed }
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
        { id: 'name', label: 'Full Name', type: 'text', required: true },
        {
          id: 'major',
          label: 'Major',
          type: 'select',
          options: [
            'Computer Science','Computer Science: Data Science','Computer Engineering','Electrical Engineering',
            'Mechanical Engineering','Civil Engineering','Business Administration','Economics','Psychology','Biology',
            'Chemistry','Mathematics','Physics','English','History','Political Science','Other'
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
    { title: "Quarter-Specific Preferences", questions: [] },
    {
      title: "Professor Preferences",
      questions: [
        {
          id: 'preferredProfessors',
          label: 'Preferred Professors (if any)',
          type: 'datalist',
          placeholder: 'Start typing to see professor suggestions...',
          options: [
            'Naomi Alterman','Tim Althoff','Ruth E. Anderson','Tom Anderson','Mitali Bafna','Magdalena Balazinska','Leilani Battle',
            'Paul Beame','Gilbert Bernstein','Byron Boots','Lauren Bricker','Nathan Brunelle','Maya Cakmak','Luis Ceze','Andrea Coladangelo',
            'Brian Curless','Simon Shaolei Du','Michael Ernst','Ali Farhadi','James Fogarty','Dieter Fox','Jon E. Froehlich','Elba Garza',
            'Shyam Gollakota','Matthew Golub','Dan Grossman','Abhishek Gupta','Hannaneh Hajishirzi','Megan Hazen','Jeffrey Heer',
            'Kurtis Heimerl','Justin Hsia','Vikram Iyer','Kevin Jamieson','Natasha Jaques','René Just','Anna R. Karlin','Baris Kasikci',
            'Ira Kemelmacher-Shlizerman','Pang Wei Koh','David Kohlbrenner','Ranjay Krishna','Arvind Krishnamurthy','Su-In Lee','Yin Tat Lee',
            'Jerry Li','Huijia (Rachel) Lin','Kevin Lin','Ryan Maas','Ratul Mahajan','Jen Mankoff','Barbara Mones','Jamie Morgenstern',
            'Sara Mostafavi','Miya Natsuhara','Chinmay Nirkhe','Jeff Nivala','Sewoong Oh','Mark Oskin','Shayan Oveis Gharan','Shwetak Patel',
            'Hal Perkins','Simon Peter','Zoran Popović','Anup Rao','Rajesh P.N. Rao','Katharina Reinecke','Franziska Roesner','Thomas Rothvoss',
            'Adrian Salguero','Georg Seelig','Steven Seitz','Linda Shapiro','R. Benjamin Shapiro','Joshua Smith','Noah Smith',
            'Siddhartha (Sidd) Srinivasa','Dan Suciu','Steve Tanimoto','Zachary Tatlock','Michael Bedford Taylor','Stefano Tessaro',
            'Chris Thachuk','Yulia Tsvetkov','Nirvan Tyagi','Matt Wang','Sheng Wang','Stephanie Wang','Robbie Weber','James Weichert',
            'James R. Wilcox','Brett Wortzman','Luke Zettlemoyer','Amy Zhang'
          ]
        },
        {
          id: 'avoidProfessors',
          label: 'Professors to Avoid (if any)',
          type: 'datalist',
          placeholder: 'Start typing to see professor suggestions...',
          options: [
            'Naomi Alterman','Tim Althoff','Ruth E. Anderson','Tom Anderson','Mitali Bafna','Magdalena Balazinska','Leilani Battle',
            'Paul Beame','Gilbert Bernstein','Byron Boots','Lauren Bricker','Nathan Brunelle','Maya Cakmak','Luis Ceze','Andrea Coladangelo',
            'Brian Curless','Simon Shaolei Du','Michael Ernst','Ali Farhadi','James Fogarty','Dieter Fox','Jon E. Froehlich','Elba Garza',
            'Shyam Gollakota','Matthew Golub','Dan Grossman','Abhishek Gupta','Hannaneh Hajishirzi','Megan Hazen','Jeffrey Heer',
            'Kurtis Heimerl','Justin Hsia','Vikram Iyer','Kevin Jamieson','Natasha Jaques','René Just','Anna R. Karlin','Baris Kasikci',
            'Ira Kemelmacher-Shlizerman','Pang Wei Koh','David Kohlbrenner','Ranjay Krishna','Arvind Krishnamurthy','Su-In Lee','Yin Tat Lee',
            'Jerry Li','Huijia (Rachel) Lin','Kevin Lin','Ryan Maas','Ratul Mahajan','Jen Mankoff','Barbara Mones','Jamie Morgenstern',
            'Sara Mostafavi','Miya Natsuhara','Chinmay Nirkhe','Jeff Nivala','Sewoong Oh','Mark Oskin','Shayan Oveis Gharan','Shwetak Patel',
            'Hal Perkins','Simon Peter','Zoran Popović','Anup Rao','Rajesh P.N. Rao','Katharina Reinecke','Franziska Roesner','Thomas Rothvoss',
            'Adrian Salguero','Georg Seelig','Steven Seitz','Linda Shapiro','R. Benjamin Shapiro','Joshua Smith','Noah Smith',
            'Siddhartha (Sidd) Srinivasa','Dan Suciu','Steve Tanimoto','Zachary Tatlock','Michael Bedford Taylor','Stefano Tessaro',
            'Chris Thachuk','Yulia Tsvetkov','Nirvan Tyagi','Matt Wang','Sheng Wang','Stephanie Wang','Robbie Weber','James Weichert',
            'James R. Wilcox','Brett Wortzman','Luke Zettlemoyer','Amy Zhang'
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
        }
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
            'Software Engineering','Data Science','Research','Graduate School','Medical School','Law School',
            'Business/Consulting','Startup/Entrepreneurship','Other'
          ]
        },
        {
          id: 'interests',
          label: 'Academic Interests (select all that apply)',
          type: 'checkbox',
          options: [
            'Artificial Intelligence','Machine Learning','Web Development','Mobile Development','Cybersecurity',
            'Database Systems','Computer Graphics','Human-Computer Interaction','Software Engineering','Algorithms','Other'
          ]
        }
      ]
    }
  ];

  const getQuarterQuestions = () => ([
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
      options: ['In-person only','Online only','Hybrid','No preference'],
      required: true
    }
  ]);

  // >>> ADDED: upload + poll handler for MyPlan PDF
  const uploadAndProcessPdf = async (file) => {
  try {
    const contentType = file.type || "application/pdf";

    setUploadStatus("Requesting upload URL…");
    const { uploadUrl, fileKey, resultUrl } =
      await getUploadUrl(file.name, contentType);

    setUploadStatus("Uploading to S3…");
    await putToS3(uploadUrl, file);

    setUploadStatus("Processing (Textract / Bedrock)…");
    // poll for result JSON (no-cache so we don't get a cached 404)
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let parsed = null;

    // simple backoff: 2s, then +250ms each try (up to ~17s avg)
    for (let i = 0; i < 60; i++) {
      const res = await fetch(resultUrl, {
        method: "GET",
        cache: "no-store"
      });

      if (res.ok) {
        const txt = await res.text();
        // be tolerant of non-JSON while object is being written
        try {
          parsed = JSON.parse(
            txt
              .trim()
              .replace(/^```json\s*/i, "")
              .replace(/```$/, "")
          );
          break;
        } catch {
          // object exists but not valid JSON yet—keep polling
        }
      }
      await sleep(2000 + i * 250);
    }

    if (!parsed) {
      throw new Error("Timed out waiting for extraction result");
    }

    // Save into formData and show preview
    setFormData((prev) => ({
      ...prev,
      myPlanData: { fileName: file.name, fileKey, resultUrl, parsed }
    }));
    setParsedPreview(parsed);
    setUploadStatus("Done.");
  } catch (err) {
    console.error(err);
    setUploadStatus(`Error: ${err.message}`);
  }
};

  const handleInputChange = (questionId, value) => {
    if (questionId === 'selectedQuarters') {
      setFormData(prev => ({ ...prev, [questionId]: value }));
    } else if (questionId === 'myPlanData') {
      // value is a File object here
      if (value) {
        // Kick off upload → process → poll
        uploadAndProcessPdf(value);
        // Optimistically store filename so the UI shows it
        setFormData(prev => ({
          ...prev,
          myPlanData: { ...(prev.myPlanData || {}), fileName: value.name }
        }));
      } else {
        // cleared
        setFormData(prev => ({ ...prev, myPlanData: null }));
        setParsedPreview(null);
        setUploadStatus('');
      }
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
      setFormData(prev => ({ ...prev, [questionId]: value }));
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
    // formData.myPlanData.parsed now contains the extracted JSON
    navigate('/courses', { state: { formData } });
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
              value={value || ''}
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
              value={value || ''}
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
              value={value || ''}
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
                    checked={(value || []).includes(option)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? ([...(value || []), option])
                        : ((value || []).filter(item => item !== option));
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
              value={value || ''}
              onChange={(e) => handleInputChange(id, e.target.value)}
              className="form-input"
              required={required}
            />
          </div>
        );

      case 'file':
        // >>> CHANGED: this now triggers upload + shows status/preview
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
                  const file = e.target.files?.[0];
                  handleInputChange(id, file || null);
                }}
                className="form-file-input"
                id={`file-${id}`}
                required={required}
              />
              <label htmlFor={`file-${id}`} className="file-upload-label">
                {formData.myPlanData?.fileName || placeholder || 'Choose a file'}
              </label>
              {formData.myPlanData && (
                <button
                  type="button"
                  onClick={() => handleInputChange(id, null)}
                  className="file-remove-button"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Status + preview */}
            {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            {parsedPreview && (
              <pre className="upload-preview" style={{ background:'#0b1020', color:'#cde8ff', padding:12, borderRadius:8, maxHeight:240, overflow:'auto' }}>
{JSON.stringify(parsedPreview, null, 2)}
              </pre>
            )}
          </div>
        );

      case 'datalist':
        return (
          <div key={id} className="question">
            <label className="question-label">
              {label} {required && <span className="required">*</span>}
            </label>
            <TagInput
              value={value || []}
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
        <h1>Advise Me</h1>
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
