import React, { useState, useEffect } from "react";
import QuizService from "../services/quiz.service";
import { Link, useNavigate } from "react-router-dom";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
    const [topicLoading, setTopicLoading] = useState(false);
    const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    QuizService.getSubjects().then(
      (response) => {
                const fetchedSubjects = response.data || [];
                setSubjects(fetchedSubjects);
                if (fetchedSubjects.length > 0) {
                    handleSubjectClick(fetchedSubjects[0]);
                }
        setLoading(false);
      },
      (error) => {
        if (error.response && error.response.status === 401) {
            navigate("/login");
        }
                setError("Unable to load subjects right now. Please retry.");
        setLoading(false);
      }
    );
  }, [navigate]);

  const handleSubjectClick = (subject) => {
        setError("");
        setTopicLoading(true);
    setSelectedSubject(subject);
    QuizService.getTopicsBySubject(subject.id).then(
      (response) => {
        setTopics(response.data);
                setTopicLoading(false);
      },
      (error) => {
                console.error("Failed to load topics", error);
                setTopics([]);
                setError("Unable to load topics for this subject.");
                setTopicLoading(false);
      }
    );
  };

  return (
    <div style={{ padding: '3rem' }} className="fade-in">
      <div className="glass-container">
        <h2 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Subjects & Topics</h2>
        
        {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Synchronizing with Knowledge Bank...</p>
            </div>
        ) : (
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1.5fr', alignItems: 'start' }}>
                {error ? <div className="alert alert-danger" style={{ gridColumn: '1 / -1' }}>{error}</div> : null}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                        Available Subjects
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {subjects.length === 0 ? <p style={{ color: 'var(--text-dim)' }}>No subjects available yet.</p> : null}
                        {subjects.map(subject => (
                            <div 
                                key={subject.id} 
                                onClick={() => handleSubjectClick(subject)}
                                className="admin-card"
                                style={{ 
                                    cursor: 'pointer',
                                    background: selectedSubject?.id === subject.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(0,0,0,0.2)',
                                    borderColor: selectedSubject?.id === subject.id ? 'var(--primary)' : 'var(--glass-border)',
                                    transform: selectedSubject?.id === subject.id ? 'translateX(8px)' : 'none'
                                }}
                            >
                                <h4 style={{ margin: '0 0 0.5rem 0', color: selectedSubject?.id === subject.id ? 'var(--primary)' : 'white' }}>{subject.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineBreak: 'anywhere' }}>{subject.description}</p>
                                <div style={{ marginTop: '0.7rem' }}>
                                    <Link to={`/recall/${subject.id}`} onClick={(e) => e.stopPropagation()}>
                                        <button className="btn-primary" style={{ width: 'auto', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                                            Check What I Remember
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--secondary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ width: '8px', height: '8px', background: 'var(--secondary)', borderRadius: '50%' }}></span>
                        Explore Topics
                    </h3>
                    {selectedSubject ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {topicLoading ? (
                                <div className="admin-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Loading modules...</p>
                                </div>
                            ) : null}
                            {topics.length === 0 ? (
                                <div className="admin-card" style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p style={{ color: 'var(--text-dim)', margin: 0 }}>No modules found for this subject yet.</p>
                                </div>
                            ) : null}
                            {!topicLoading && topics.map(topic => (
                                <div 
                                    key={topic.id}
                                    className="admin-card"
                                    style={{ 
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1.25rem 1.75rem'
                                    }}
                                >
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{topic.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quiz Module</span>
                                    </div>
                                    <Link to={`/quiz/${topic.id}`} style={{ textDecoration: 'none' }}>
                                        <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0.6rem 1.75rem', fontSize: '0.9rem' }}>
                                            Start Quiz
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="admin-card" style={{ textAlign: 'center', padding: '4rem 2rem', opacity: 0.6 }}>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Select a subject on the left to reveal its curriculum.</p>
                        </div>
                    )}
                </div>
            </div>
        ) }
      </div>
    </div>
  );
};

export default Subjects;
