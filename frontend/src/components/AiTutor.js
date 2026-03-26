import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiTutorService from "../services/ai-tutor.service";
import QuizService from "../services/quiz.service";

const QUICK_PROMPTS = [
  "Learn Data Structures for placements",
  "Master Digital Marketing from scratch",
  "Become strong in Linear Algebra for AI",
  "Learn UI/UX end-to-end with practice"
];

const AiTutor = () => {
  const [subjectName, setSubjectName] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [currentLevel, setCurrentLevel] = useState("beginner");
  const [topicsCount, setTopicsCount] = useState(6);
  const [questionsPerTopic, setQuestionsPerTopic] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(null);
  const [remediationPlan, setRemediationPlan] = useState(null);
  const [aiInfo, setAiInfo] = useState({ provider: "", model: "" });
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I am your AI Tutor. Tell me what you want to learn, your goal, and I will create a complete subject path with quizzes."
    }
  ]);

  const hasPlan = useMemo(() => plan && plan.topics && plan.topics.length > 0, [plan]);

  const loadRemediationPlan = async () => {
    setError("");
    try {
      const [insightsRes, practiceRes] = await Promise.all([
        QuizService.getInsights(),
        QuizService.getWeakPractice(8)
      ]);

      const weakTopics = insightsRes?.data?.weakTopics || [];
      const trends = insightsRes?.data?.topicTrends || [];
      const practiceQuestions = practiceRes?.data?.questions || [];

      setRemediationPlan({
        weakTopics,
        trends,
        practiceReason: practiceRes?.data?.focusReason || "",
        practiceQuestions
      });
    } catch (err) {
      setError("Login and complete at least one quiz to generate your remediation plan.");
    }
  };

  const guessSubjectFromPrompt = (prompt) => {
    const trimmed = (prompt || "").trim();
    if (!trimmed) return "General Studies";

    const patterns = [
      /learn\s+([a-zA-Z0-9\s+-]+)/i,
      /study\s+([a-zA-Z0-9\s+-]+)/i,
      /want to learn\s+([a-zA-Z0-9\s+-]+)/i
    ];

    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match && match[1]) {
        return match[1].split(" for ")[0].split(" in ")[0].trim();
      }
    }

    return trimmed.split(" ").slice(0, 3).join(" ");
  };

  const appendUserMessage = (text) => {
    const userMessage = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
  };

  const appendAssistantMessage = (text) => {
    setMessages((prev) => [...prev, { role: "assistant", text }]);
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setError("");
    setLoading(true);

    const inferredSubject = subjectName.trim() || guessSubjectFromPrompt(chatInput);
    setSubjectName(inferredSubject);
    appendUserMessage(chatInput.trim());

    try {
      const response = await AiTutorService.chat({
        message: chatInput.trim(),
        subjectName: inferredSubject,
        currentLevel
      });

      setAiInfo({
        provider: response?.data?.provider || "",
        model: response?.data?.model || ""
      });
      appendAssistantMessage(response?.data?.reply || "I could not generate a response right now. Please retry.");
      setChatInput("");
    } catch (err) {
      setError("Unable to reach AI chatbot right now. Please retry in a moment.");
      appendAssistantMessage("I am temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setError("");
    setLoading(true);
    setPlan(null);

    const inferredSubject = subjectName.trim() || guessSubjectFromPrompt(chatInput);
    setSubjectName(inferredSubject);

    appendUserMessage(chatInput.trim());

    try {
      const response = await AiTutorService.buildPlan({
        subjectName: inferredSubject,
        learnerGoal: chatInput.trim(),
        currentLevel,
        topicsCount,
        questionsPerTopic
      });

      const generatedPlan = response.data;
      setPlan(generatedPlan);

      const assistantSummary = {
        role: "assistant",
        text: `Done. I prepared ${generatedPlan.topics.length} topics for ${generatedPlan.subjectName} and generated quizzes for each module.`
      };
      setMessages((prev) => [...prev, assistantSummary]);
      setChatInput("");
    } catch (err) {
      setError("Unable to generate learning plan right now. Please retry in a moment.");
      appendAssistantMessage("I could not generate the plan right now. Please try once again.");
    } finally {
      setLoading(false);
    }
  };

  const applyPrompt = (prompt) => {
    setChatInput(prompt);
    const guessed = guessSubjectFromPrompt(prompt);
    setSubjectName(guessed || "General Studies");
  };

  return (
    <div style={{ padding: "3rem 1.5rem", maxWidth: "1200px", margin: "0 auto" }} className="fade-in">
      <div className="glass-container" style={{ marginBottom: "1.5rem" }}>
        <h2 className="title" style={{ textAlign: "left", marginBottom: "1rem" }}>AI Tutor Chatbot</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Chat with AI about any subject. It will build your full curriculum, create topics, and prepare quizzes automatically.
        </p>

        {aiInfo.provider ? (
          <div
            style={{
              marginBottom: "1rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.7rem",
              borderRadius: "999px",
              border: "1px solid var(--glass-border)",
              background: "rgba(255,255,255,0.04)",
              fontSize: "0.8rem",
              color: "var(--text-secondary)"
            }}
          >
            <span>AI Provider: <strong style={{ color: "#c7d2fe" }}>{aiInfo.provider}</strong></span>
            {aiInfo.model ? <span>| Model: <strong style={{ color: "#c7d2fe" }}>{aiInfo.model}</strong></span> : null}
          </div>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="btn-primary"
              onClick={() => applyPrompt(prompt)}
              style={{ width: "auto", padding: "0.55rem 1rem", fontSize: "0.85rem", borderRadius: "100px" }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="admin-card" style={{ padding: "1rem", marginBottom: "1rem", maxHeight: "260px", overflowY: "auto" }}>
          {messages.map((msg, idx) => (
            <div key={`${msg.role}-${idx}`} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "0.7rem" }}>
              <div
                style={{
                  maxWidth: "78%",
                  padding: "0.7rem 0.95rem",
                  borderRadius: "12px",
                  background: msg.role === "user" ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)",
                  border: "1px solid var(--glass-border)",
                  color: msg.role === "user" ? "#c7d2fe" : "var(--text-primary)",
                  fontSize: "0.95rem"
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleChat}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>Detected Subject (Editable)</label>
              <input
                className="form-control"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Example: Data Science, Economics, Guitar, Cybersecurity"
              />
            </div>

            <div className="form-group">
              <label>Current Level</label>
              <select className="form-control" value={currentLevel} onChange={(e) => setCurrentLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Chat Message</label>
            <textarea
              className="form-control"
              rows="3"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Example: I want to learn Machine Learning from scratch and become interview-ready in 8 weeks"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label>How Many Topics</label>
              <input
                type="number"
                min="4"
                max="8"
                className="form-control"
                value={topicsCount}
                onChange={(e) => setTopicsCount(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Questions Per Topic</label>
              <input
                type="number"
                min="5"
                max="8"
                className="form-control"
                value={questionsPerTopic}
                onChange={(e) => setQuestionsPerTopic(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <button className="btn-primary" type="submit" disabled={loading} style={{ width: "auto", padding: "0.7rem 1.2rem" }}>
              {loading ? "AI is responding..." : "Ask Chatbot"}
            </button>
            <button className="btn-primary" type="button" disabled={loading} style={{ width: "auto", padding: "0.7rem 1.2rem" }} onClick={handleGeneratePlan}>
              {loading ? "Preparing plan..." : "Generate Learning Plan"}
            </button>
          </div>
          <button
            className="btn-primary"
            type="button"
            onClick={loadRemediationPlan}
            style={{ marginTop: "0.8rem", background: "transparent", border: "1px solid var(--glass-border)", boxShadow: "none" }}
          >
            Build My Personalized Remediation Plan
          </button>
        </form>

        {error ? <div className="alert alert-danger" style={{ marginTop: "1rem" }}>{error}</div> : null}
      </div>

      {hasPlan ? (
        <div className="glass-container">
          <h3 style={{ marginBottom: "0.5rem" }}>{plan.subjectName}</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "0.8rem" }}>{plan.subjectSummary}</p>
          <p style={{ color: "#c7d2fe", marginBottom: "1.5rem" }}>{plan.learningPath}</p>

          <div style={{ display: "grid", gap: "1rem" }}>
            {plan.topics.map((topic, idx) => (
              <div key={topic.topicId} className="admin-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <h4 style={{ margin: "0 0 0.35rem 0" }}>{idx + 1}. {topic.topicName}</h4>
                  <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.92rem" }}>{topic.overview}</p>
                  <p style={{ margin: "0.45rem 0 0 0", color: "#a5b4fc", fontSize: "0.86rem" }}>
                    Questions prepared: {topic.questionsPrepared}
                  </p>
                </div>
                <Link to={`/quiz/${topic.topicId}`}>
                  <button className="btn-primary" style={{ width: "auto", padding: "0.7rem 1.2rem" }}>Start Topic Quiz</button>
                </Link>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "1.3rem", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link to="/subjects">
              <button className="btn-primary" style={{ width: "auto", padding: "0.7rem 1.2rem" }}>Open Subject Bank</button>
            </Link>
            <button className="btn-primary" style={{ width: "auto", padding: "0.7rem 1.2rem", background: "transparent", border: "1px solid var(--glass-border)", boxShadow: "none" }} onClick={() => setPlan(null)}>
              Create Another Plan
            </button>
          </div>
        </div>
      ) : null}

      {remediationPlan ? (
        <div className="glass-container" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ marginBottom: "0.7rem" }}>Performance-Driven AI Remediation Path</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            {remediationPlan.practiceReason || "This plan is generated from your incorrect answers and topic performance trend."}
          </p>

          {(remediationPlan.weakTopics || []).length === 0 ? (
            <p style={{ color: "var(--success)" }}>No high-priority weak topics found. Keep solving mixed quizzes.</p>
          ) : (
            <div style={{ display: "grid", gap: "0.8rem", marginBottom: "1rem" }}>
              {remediationPlan.weakTopics.map((topic) => (
                <div key={topic.topicId} className="admin-card" style={{ padding: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.25rem 0" }}>{topic.topicName}</h4>
                  <p style={{ margin: 0, fontSize: "0.88rem", color: "#fca5a5" }}>
                    Accuracy: {topic.accuracy}% ({topic.wrong} wrong / {topic.attempted} attempted)
                  </p>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{topic.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {(remediationPlan.trends || []).length > 0 ? (
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ marginBottom: "0.5rem" }}>Trend Alerts</h4>
              <div style={{ display: "grid", gap: "0.7rem" }}>
                {remediationPlan.trends.map((trend) => (
                  <div key={`${trend.topicId}-trend`} className="admin-card" style={{ padding: "0.85rem" }}>
                    <p style={{ margin: 0, fontWeight: "600" }}>{trend.topicName}</p>
                    <p style={{ margin: "0.15rem 0", color: trend.improved ? "var(--success)" : "var(--error)", fontSize: "0.85rem" }}>
                      Delta: {trend.delta}% ({trend.previousAccuracy}% to {trend.latestAccuracy}%)
                    </p>
                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>{trend.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {(remediationPlan.practiceQuestions || []).length > 0 ? (
            <div>
              <h4 style={{ marginBottom: "0.5rem" }}>Immediate Practice Queue</h4>
              <div style={{ display: "grid", gap: "0.7rem" }}>
                {remediationPlan.practiceQuestions.map((question, idx) => (
                  <div key={question.questionId} className="admin-card" style={{ padding: "0.9rem" }}>
                    <p style={{ margin: 0 }}>{idx + 1}. {question.questionText}</p>
                    <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.83rem", color: "#c7d2fe" }}>{question.topicName}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AiTutor;
