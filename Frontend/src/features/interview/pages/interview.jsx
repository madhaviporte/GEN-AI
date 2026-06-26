import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'



const NAV_ITEMS = [
    { 
        id: 'technical', 
        label: 'Technical Questions', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        )
    },
    { 
        id: 'behavioral', 
        label: 'Behavioral Questions', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        )
    },
    { 
        id: 'roadmap', 
        label: 'Road Map', 
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7l6-6 6 6 6-6v15l-6 6-6-6-6 6V7z" />
            </svg>
        )
    },
]

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
    const [ open, setOpen ] = useState(false)
    return (
        <div className={`q-card ${open ? 'q-card--open' : ''}`}>
            <div className='q-card__header' onClick={() => setOpen(o => !o)}>
                <span className='q-card__index'>Q{index + 1}</span>
                <p className='q-card__question'>{item.question}</p>
                <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
            </div>
            {open && (
                <div className='q-card__body'>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--intention'>Intention</span>
                        <p>{item.intention}</p>
                    </div>
                    <div className='q-card__section'>
                        <span className='q-card__tag q-card__tag--answer'>Model Answer</span>
                        <p>{item.answer}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

const RoadMapDay = ({ day }) => (
    <div className='roadmap-day'>
        <div className='roadmap-day__header'>
            <span className='roadmap-day__badge'>Day {day.day}</span>
            <h3 className='roadmap-day__focus'>{day.focus}</h3>
        </div>
        <ul className='roadmap-day__tasks'>
            {day.tasks?.map((task, i) => (
                <li key={i}>{task}</li>
            ))}
        </ul>
    </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('technical')
    const { report, getReportById, loading, getResumePdf } = useInterview()
    const { interviewId } = useParams()

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        }
    }, [ interviewId ])



    if (loading || !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    const scoreColor =
        report.matchScore >= 80 ? 'score--high' :
            report.matchScore >= 60 ? 'score--mid' : 'score--low'


    return (
        <div className='interview-page'>
            <div className='interview-layout'>

                {/* ── Left Nav ── */}
                <nav className='interview-nav'>
                    <p className='sidebar-label'>Sections</p>
                    <div className="nav-links">
                        {NAV_ITEMS.map(item => (
                            <button
                                key={item.id}
                                className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                onClick={() => setActiveNav(item.id)}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section className="fade-in">
                            <div className='content-header'>
                                <h2>Technical Questions</h2>
                                <span className='content-header__badge'>{report.technicalQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.technicalQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'behavioral' && (
                        <section className="fade-in">
                            <div className='content-header'>
                                <h2>Behavioral Questions</h2>
                                <span className='content-header__badge'>{report.behavioralQuestions?.length || 0} questions</span>
                            </div>
                            <div className='q-list'>
                                {report.behavioralQuestions?.map((q, i) => (
                                    <QuestionCard key={i} item={q} index={i} />
                                ))}
                            </div>
                        </section>
                    )}

                    {activeNav === 'roadmap' && (
                        <section className="fade-in">
                            <div className='content-header'>
                                <h2>Preparation Road Map</h2>
                                <p className='content-subtitle'>Structured path for {report.preparationPlan?.length || 7} days</p>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>
                    
                    <div className="sidebar-section">
                        <p className='sidebar-label'>Match Score</p>
                        <div className="match-score-gauge">
                            <div className="gauge-container">
                                <svg className="gauge-ring" viewBox="0 0 100 100">
                                    <circle className="ring-bg" cx="50" cy="50" r="45" />
                                    <circle 
                                        className="ring-fill" 
                                        cx="50" cy="50" r="45" 
                                        strokeDasharray={`${(report.matchScore / 100) * 283} 283`}
                                    />
                                </svg>
                                <div className="gauge-text">
                                    <span className="value">{report.matchScore}</span>
                                    <span className="pct">%</span>
                                </div>
                            </div>
                            <p className="gauge-status">Strong match for this role</p>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <p className='sidebar-label'>Skill Gaps</p>
                        <div className='skill-gaps-list'>
                            {report.skillGaps?.map((gap, i) => {
                                const colorClass = ['high', 'medium', 'low', 'none'][i % 4];
                                return (
                                    <div key={i} className={`skill-gap-card skill-gap-card--${colorClass}`}>
                                        <span className="gap-name">{gap.skill}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <button onClick={() => getResumePdf(interviewId)} className='download-btn'>
                        Download Report
                    </button>
                    
                </aside>
            </div>
        </div>
    )
}

export default Interview