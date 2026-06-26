import React, { useState, useEffect } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'



const NAV_ITEMS = [
    { id: 'technical', label: 'Technical Questions', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
    ) },
    { id: 'behavioral', label: 'Behavioral Questions', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ) },
    { id: 'roadmap', label: 'Road Map', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
            <path d="M3 18l6-6-6-6" />
        </svg>
    ) },
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
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
                <li key={i}>
                    <span className='roadmap-day__bullet' />
                    {task}
                </li>
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
                    <div className="nav-content">
                        <div className='nav-brand'>
                            <span className="brand-dot" />
                            <p className='interview-nav__label'>Sections</p>
                        </div>
                        <div className="nav-links">
                            {NAV_ITEMS.map(item => (
                                <button
                                    key={item.id}
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => setActiveNav(item.id)}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </nav>

                <div className='vertical-divider' />

                {/* ── Center Content ── */}
                <main className='interview-content'>
                    {activeNav === 'technical' && (
                        <section className="fade-in">
                            <div className='content-header'>
                                <div>
                                    <h2>Technical Questions</h2>
                                    <p className='content-subtitle'>Deep dive into your technical expertise</p>
                                </div>
                                <span className='content-header__count'>{report.technicalQuestions?.length || 0}</span>
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
                                <div>
                                    <h2>Behavioral Questions</h2>
                                    <p className='content-subtitle'>Assessing soft skills and professional conduct</p>
                                </div>
                                <span className='content-header__count'>{report.behavioralQuestions?.length || 0}</span>
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
                                <div>
                                    <h2>Preparation Road Map</h2>
                                    <p className='content-subtitle'>A structured {report.preparationPlan?.length || 7}-day learning path</p>
                                </div>
                            </div>
                            <div className='roadmap-list'>
                                {report.preparationPlan?.map((day) => (
                                    <RoadMapDay key={day.day} day={day} />
                                ))}
                            </div>
                        </section>
                    )}
                </main>

                <div className='vertical-divider' />

                {/* ── Right Sidebar ── */}
                <aside className='interview-sidebar'>
                    <div className="sidebar-section">
                        <p className='sidebar-label'>Match Score</p>
                        <div className="match-score-container">
                            <svg className="score-ring" viewBox="0 0 100 100">
                                <circle className="score-ring-bg" cx="50" cy="50" r="45" />
                                <circle 
                                    className={`score-ring-fill ${scoreColor}`} 
                                    cx="50" cy="50" r="45" 
                                    strokeDasharray={`${(report.matchScore / 100) * 283} 283`}
                                />
                            </svg>
                            <div className="score-text">
                                <span className='score-value'>{report.matchScore}</span>
                                <span className='score-pct'>%</span>
                            </div>
                        </div>
                    </div>

                    <div className='sidebar-section'>
                        <p className='sidebar-label'>Skill Gaps</p>
                        <div className='skill-gaps-list'>
                            {report.skillGaps?.map((gap, i) => (
                                <div key={i} className={`skill-gap-pill skill-gap--${gap.severity}`}>
                                    <span className="skill-name">{gap.skill}</span>
                                    <span className="skill-severity-dot" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <button
                            onClick={() => { getResumePdf(interviewId) }}
                            className='download-btn'
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                            Download Report
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    )
}

export default Interview