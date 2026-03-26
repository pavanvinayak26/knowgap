import React, { useEffect, useRef, useState } from "react";
import AiTutorService from "../services/ai-tutor.service";

const QUICK_ASK = [
  "Create a 2-week plan for Java",
  "Give me interview prep tips",
  "Explain arrays vs linked lists"
];

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi. I am your study assistant. Ask me any learning question."
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const response = await AiTutorService.chat({
        message: text,
        subjectName: "General Studies",
        currentLevel: "beginner"
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: response?.data?.reply || "I could not generate a reply right now."
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "I am not available right now. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onQuickAsk = (text) => {
    setInput(text);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: "assistant",
        text: "Conversation cleared. Ask me anything to continue."
      }
    ]);
  };

  return (
    <div className="chatbot-widget-root">
      {open ? (
        <div className="chatbot-panel fade-in">
          <div className="chatbot-header">
            <div>
              <h4>KnowGap Chatbot</h4>
              <p>Quick study help</p>
            </div>
            <button className="chatbot-icon-btn" onClick={() => setOpen(false)} aria-label="Close chatbot">
              x
            </button>
          </div>

          <div className="chatbot-quick-ask">
            {QUICK_ASK.map((prompt) => (
              <button key={prompt} type="button" onClick={() => onQuickAsk(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`chatbot-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {loading ? <div className="chatbot-message assistant">Typing...</div> : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <textarea
              className="form-control"
              rows="2"
              placeholder="Ask anything about learning..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <div className="chatbot-actions">
              <button type="button" className="chatbot-clear" onClick={clearConversation}>Clear</button>
              <button type="button" className="btn-primary chatbot-send" onClick={sendMessage} disabled={loading}>
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <button className="chatbot-launcher" onClick={() => setOpen((prev) => !prev)} aria-label="Open chatbot">
        Chat
      </button>
    </div>
  );
};

export default ChatbotWidget;
