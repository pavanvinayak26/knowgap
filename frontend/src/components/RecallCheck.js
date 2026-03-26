import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QuizService from "../services/quiz.service";

const RecallCheck = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [recallData, setRecallData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({
    remembered: "",
    rusty: ""
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    QuizService.getRecallCheck(subjectId, 8).then(
      (response) => {
        setRecallData(response.data);
        setLoading(false);
      },
      (err) => {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError("Unable to load recall check right now.");
        setLoading(false);
      }
    );
  }, [subjectId, navigate]);

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const totalQuestions = recallData?.questions?.length || 0;

  const onSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!recallData?.questions?.length) return;

    setSubmitting(true);
    const evaluations = recallData.questions.map((q) => {
      const selected = answers[q.questionId];
      const correctOption = q.correctOption;
      const correct = correctOption && selected === correctOption;

      return {
        questionId: q.questionId,
        questionText: q.questionText,
        topicName: q.topicName,
        selected,
        correctOption,
        correct
      };
    });

    const payload = {
      subjectId: Number(subjectId),
      rememberedNotes: notes.remembered,
      rustyNotes: notes.rusty,
      answers
    };

    QuizService.submitRecallAttempt(payload).then(
      (response) => {
        setResult({
          score: response.data?.score ?? evaluations.filter((item) => item.correct).length,
          totalQuestions: response.data?.totalQuestions ?? totalQuestions,
          accuracy: response.data?.accuracy ?? (totalQuestions === 0 ? 0 : Math.round((evaluations.filter((item) => item.correct).length * 1000) / totalQuestions) / 10),
          evaluations,
          attemptedAt: response.data?.attemptedAt || null
        });
        setSubmitting(false);
      },
      (err) => {
        setError(err.response?.data || "Failed to submit recall attempt.");
        setSubmitting(false);
      }
    );
  };

  if (loading) {
    return (
      <div style={{ padding: "3rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-secondary)" }}>Preparing recall checkpoint...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "3rem", maxWidth: "900px", margin: "0 auto" }}>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const questions = recallData?.questions || [];

  return (
    <div style={{ padding: "3rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }} className="fade-in">
      <div className="glass-container">
        <h2 className="title" style={{ textAlign: "left", marginBottom: "0.8rem" }}>Recall Check: {recallData?.subjectName}</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{recallData?.prompt}</p>

        {(recallData?.learnedTopics || []).length > 0 ? (
          <p style={{ color: "#c7d2fe", marginBottom: "1.2rem", fontSize: "0.9rem" }}>
            Learned topics till now: {(recallData.learnedTopics || []).join(", ")}
          </p>
        ) : null}

        <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 1fr", marginBottom: "1.2rem" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>What do you remember from this subject?</label>
            <textarea
              className="form-control"
              rows="3"
              value={notes.remembered}
              onChange={(e) => setNotes((prev) => ({ ...prev, remembered: e.target.value }))}
              placeholder="Write 2-3 points you remember"
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>What feels rusty right now?</label>
            <textarea
              className="form-control"
              rows="3"
              value={notes.rusty}
              onChange={(e) => setNotes((prev) => ({ ...prev, rusty: e.target.value }))}
              placeholder="Mention concepts you want to re-check"
            />
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="admin-card" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--text-dim)", marginBottom: "1rem" }}>No recall questions are available for this subject yet.</p>
            <Link to="/subjects">
              <button className="btn-primary" style={{ width: "auto" }}>Back to Subjects</button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.9rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <span>Recall Progress</span>
              <span>{answeredCount}/{questions.length} answered</span>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              {questions.map((q, index) => (
                <div key={q.questionId} className="admin-card" style={{ padding: "1rem" }}>
                  <p style={{ margin: "0 0 0.6rem 0", fontWeight: "600" }}>{index + 1}. {q.questionText}</p>
                  <p style={{ margin: "0 0 0.7rem 0", fontSize: "0.8rem", color: "#a5b4fc" }}>Topic: {q.topicName}</p>

                  <div style={{ display: "grid", gap: "0.6rem" }}>
                    {[
                      ["A", q.optionA],
                      ["B", q.optionB],
                      ["C", q.optionC],
                      ["D", q.optionD]
                    ].map(([opt, text]) => (
                      <label key={`${q.questionId}-${opt}`} style={{ display: "flex", gap: "0.55rem", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "0.6rem", borderRadius: "8px", border: "1px solid var(--glass-border)" }}>
                        <input
                          type="radio"
                          name={`recall_q_${q.questionId}`}
                          value={opt}
                          checked={answers[q.questionId] === opt}
                          onChange={() => onSelect(q.questionId, opt)}
                          required
                        />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "1.4rem", display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
              <button className="btn-primary" type="submit" disabled={submitting} style={{ width: "auto", padding: "0.7rem 1.2rem" }}>
                {submitting ? "Evaluating..." : "Submit Recall Check"}
              </button>
              <Link to="/subjects">
                <button className="btn-primary" type="button" style={{ width: "auto", padding: "0.7rem 1.2rem", background: "transparent", border: "1px solid var(--glass-border)", boxShadow: "none" }}>
                  Back to Subjects
                </button>
              </Link>
            </div>
          </form>
        )}

        {result ? (
          <div className="admin-card" style={{ marginTop: "1.3rem" }}>
            <h3 style={{ marginBottom: "0.55rem" }}>Recall Result</h3>
            <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)" }}>
              Score: {result.score}/{result.totalQuestions} | Accuracy: {result.accuracy}%
            </p>
            <p style={{ margin: "0 0 0.5rem 0", color: "var(--text-secondary)", fontSize: "0.88rem" }}>
              Goal: If accuracy is below 70%, revise your rusty areas and retake this recall check.
            </p>
            {result.attemptedAt ? (
              <p style={{ margin: "0 0 0.5rem 0", color: "#a5b4fc", fontSize: "0.82rem" }}>
                Saved at: {new Date(result.attemptedAt).toLocaleString()}
              </p>
            ) : null}
            <p style={{ margin: "0 0 0.5rem 0", color: "#c7d2fe", fontSize: "0.9rem" }}>
              Your notes: {notes.remembered || "No recall notes entered."}
            </p>
            <p style={{ margin: 0, color: "#fca5a5", fontSize: "0.9rem" }}>
              Rusty areas: {notes.rusty || "No rusty areas mentioned."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RecallCheck;
