import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import QuizService from "../services/quiz.service";

const Dashboard = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({
    heatmap: [],
    weakTopics: [],
    topicTrends: [],
    recentAttempts: []
  });
  const [learnedSubjects, setLearnedSubjects] = useState([]);
  const [recallHistory, setRecallHistory] = useState([]);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      navigate("/login");
      return;
    }

    setCurrentUser(user);

    Promise.all([QuizService.getInsights(), QuizService.getLearnedSubjects(), QuizService.getRecallHistory(6)]).then(
      ([insightsRes, learnedRes, recallRes]) => {
        setInsights(insightsRes.data || { heatmap: [], weakTopics: [], topicTrends: [], recentAttempts: [] });
        setLearnedSubjects(learnedRes.data || []);
        setRecallHistory(recallRes.data || []);
        setLoading(false);
      },
      (err) => {
        if (err.response?.status === 401) {
          AuthService.logout();
          navigate("/login");
          return;
        }
        setLoading(false);
      }
    );
  }, [navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <div style={{ padding: "3rem 1.5rem", maxWidth: "1280px", margin: "0 auto" }} className="fade-in">
      <div className="glass-container">
        <h2 className="title" style={{ textAlign: "left", marginBottom: "1rem" }}>
          Welcome, <span style={{ color: "var(--primary)", fontWeight: "800" }}>{currentUser.username}</span>
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginBottom: "2rem" }}>
          This dashboard now tracks scores, wrong-answer patterns, weak topics, and trend movement across attempts.
        </p>

        <div className="dashboard-grid">
          <div className="admin-card" style={{ gridColumn: "span 2" }}>
            <h3 style={{ marginBottom: "0.8rem" }}>What You Learned Till Now</h3>
            {loading ? (
              <p style={{ color: "var(--text-dim)" }}>Loading learned subjects...</p>
            ) : learnedSubjects.length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No learned history yet. Complete a few quizzes and this section will auto-fill.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {learnedSubjects.map((subject) => (
                  <div key={subject.subjectId} className="admin-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <p style={{ margin: "0 0 0.3rem 0", fontWeight: "700" }}>{subject.subjectName}</p>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        Topics learned: {subject.topicsLearned} | Attempts: {subject.attemptsCount} | Avg accuracy: {subject.averageAccuracy}%
                      </p>
                    </div>
                    <Link to={`/recall/${subject.subjectId}`}>
                      <button className="btn-primary" style={{ width: "auto", padding: "0.55rem 1rem" }}>Recall Check</button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card" style={{ gridColumn: "span 2" }}>
            <h3 style={{ marginBottom: "0.8rem" }}>Recent Recall Checks</h3>
            {loading ? (
              <p style={{ color: "var(--text-dim)" }}>Loading recall history...</p>
            ) : recallHistory.length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No recall checks submitted yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.7rem" }}>
                {recallHistory.map((item) => (
                  <div key={item.attemptId} className="admin-card" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <p style={{ margin: "0 0 0.25rem 0", fontWeight: "700" }}>{item.subjectName}</p>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        {item.score}/{item.totalQuestions} | {item.accuracy}% | {new Date(item.attemptedAt).toLocaleString()}
                      </p>
                    </div>
                    <Link to={`/recall/${item.subjectId}`}>
                      <button className="btn-primary" style={{ width: "auto", padding: "0.5rem 0.9rem" }}>Retake Recall</button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="admin-card" style={{ gridColumn: "span 2" }}>
            <h3 style={{ marginBottom: "1rem" }}>Knowledge Synthesis Heatmap</h3>
            {loading ? (
              <p style={{ color: "var(--text-dim)" }}>Aggregating performance metrics...</p>
            ) : (insights.heatmap || []).length === 0 ? (
              <p style={{ color: "var(--text-dim)" }}>No attempts yet. Complete a quiz to generate analytics.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {(insights.heatmap || []).map((item, index) => {
                  let barColor = "var(--success)";
                  if (item.successRate < 70) barColor = "var(--warning)";
                  if (item.successRate < 50) barColor = "var(--error)";

                  return (
                    <div key={`${item.topicName}-${index}`} className="admin-card" style={{ padding: "0.9rem 1.1rem", background: "rgba(255,255,255,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.35rem" }}>
                        <span>{item.topicName}</span>
                        <span style={{ color: barColor }}>{item.successRate}% proficiency</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ width: `${item.successRate}%`, height: "100%", background: `linear-gradient(to right, ${barColor}, #ffffff)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-card">
              <h3 style={{ marginBottom: "0.8rem" }}>Weak Topic Radar</h3>
              {loading ? (
                <p style={{ color: "var(--text-dim)" }}>Analyzing topic weaknesses...</p>
              ) : (insights.weakTopics || []).length === 0 ? (
                <p style={{ color: "var(--success)" }}>No major weak topics detected.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.7rem" }}>
                  {(insights.weakTopics || []).map((topic) => (
                    <div key={topic.topicId} style={{ border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "0.75rem", background: "rgba(239, 68, 68, 0.08)" }}>
                      <p style={{ margin: 0, fontWeight: "600" }}>{topic.topicName}</p>
                      <p style={{ margin: "0.2rem 0", color: "#fca5a5", fontSize: "0.85rem" }}>{topic.wrong} wrong / {topic.attempted} attempted</p>
                      <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>{topic.recommendation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-card" style={{ textAlign: "center" }}>
              <h3 style={{ marginBottom: "0.6rem" }}>Next Action</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Jump into a fresh quiz to verify whether weak areas are improving.
              </p>
              <Link to="/subjects" style={{ width: "100%" }}>
                <button className="btn-primary" style={{ padding: "0.9rem" }}>Launch Subject Bank</button>
              </Link>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="admin-card">
              <h3 style={{ marginBottom: "0.8rem" }}>Topic Trend Delta</h3>
              {loading ? (
                <p style={{ color: "var(--text-dim)" }}>Computing trend movement...</p>
              ) : (insights.topicTrends || []).length === 0 ? (
                <p style={{ color: "var(--text-dim)" }}>Need at least one attempt to build trends.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {(insights.topicTrends || []).map((trend) => {
                    const up = trend.improved;
                    const deltaText = `${up ? "+" : ""}${trend.delta}%`;
                    return (
                      <div key={trend.topicId} style={{ border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "0.75rem", background: "rgba(255,255,255,0.02)" }}>
                        <p style={{ margin: 0, fontWeight: "600" }}>{trend.topicName}</p>
                        <p style={{ margin: "0.2rem 0", fontSize: "0.83rem", color: up ? "var(--success)" : "var(--error)" }}>
                          Delta: {deltaText} ({trend.previousAccuracy}% → {trend.latestAccuracy}%)
                        </p>
                        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.8rem" }}>{trend.recommendation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="admin-card">
              <h3 style={{ marginBottom: "0.8rem" }}>Recent Attempts</h3>
              {loading ? (
                <p style={{ color: "var(--text-dim)" }}>Loading attempt history...</p>
              ) : (insights.recentAttempts || []).length === 0 ? (
                <p style={{ color: "var(--text-dim)" }}>No attempts yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.6rem" }}>
                  {(insights.recentAttempts || []).map((attempt) => (
                    <div key={attempt.attemptId} style={{ border: "1px solid var(--glass-border)", borderRadius: "10px", padding: "0.75rem" }}>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "0.9rem" }}>{attempt.topicName}</p>
                      <p style={{ margin: "0.2rem 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                        {attempt.score}/{attempt.totalQuestions} | {attempt.accuracy}% | Grade {attempt.grade}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
