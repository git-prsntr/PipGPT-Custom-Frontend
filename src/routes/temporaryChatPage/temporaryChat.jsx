import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { generateCompletion } from "../../lib/openai";
import "./temporaryChat.css";

const TemporaryChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedModel, setSelectedModel] = useState("ampgpt");
  const [loading, setLoading] = useState(false);
  const loadingTexts = [
    "Digging resources...",
    "Connecting dots...",
    "Building sentences..."
  ];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const textareaRef = useRef(null);
  const formContainerRef = useRef(null);
  const buttonContainerRef = useRef(null);
  const endRef = useRef(null);

  // Handle dynamic textarea height
  useEffect(() => {
    if (textareaRef.current && formContainerRef.current && buttonContainerRef.current) {
      const textarea = textareaRef.current;
      const formContainer = formContainerRef.current;
      const buttonContainer = buttonContainerRef.current;

      textarea.style.height = "auto";
      const newTextAreaHeight = Math.min(textarea.scrollHeight, 250);
      textarea.style.height = `${newTextAreaHeight}px`;

      const buttonHeight = buttonContainer.offsetHeight + 20;
      const totalHeight = newTextAreaHeight + buttonHeight + 20;
      formContainer.style.height = `${Math.min(totalHeight, 400)}px`;
    }
  }, [inputText]);

  // Auto-scroll and loading text effects
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Handle Enter/Shift+Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
    // Shift+Enter will work naturally for new lines
  };

  const handleToggleModel = () => {
    setSelectedModel((prev) => (prev === "ampgpt" ? "general" : "ampgpt"));
  };

  const handleSubmitMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      const assistantResponse = await generateCompletion(newMessages, selectedModel);
      setMessages([...newMessages, { role: "assistant", content: assistantResponse }]);
    } catch (err) {
      console.error("Error generating assistant response:", err);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error generating response." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmitMessage();
  };

  return (
    <div className="temporaryChat">
      <div className="topBar">
        <div className="greetings">
          <h1 className="header-style">You are using temporary chat. It won't be saved anywhere.</h1>
        </div>
      </div>
      
      <div className="chatContainer">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.role === "assistant" ? (
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {message.content}
              </ReactMarkdown>
            ) : (
              <span>{message.content}</span>
            )}
          </div>
        ))}
        {loading && (
          <div className="message assistant loading">
            {loadingTexts[loadingTextIndex]}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="formContainer" ref={formContainerRef}>
        <textarea
          ref={textareaRef}
          name="text"
          placeholder={`Ask me anything... (Press Enter to send, Shift+Enter for new line)`}
          autoComplete="off"
          rows="2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>

        <div className="button-container" ref={buttonContainerRef}>
          <div className="choosemodel">
            <div className="modelToggleSwitch" onClick={handleToggleModel}>
              <div className={`modelToggleOption ${selectedModel === "ampgpt" ? "active" : ""}`}>
                <i className={`fa-solid fa-brain modelIcon ${selectedModel === "ampgpt" ? "activeIcon" : ""}`}></i>
                Internal AMP GPT
              </div>
              <div className={`modelToggleOption ${selectedModel === "general" ? "active" : ""}`}>
                <i className={`fa-solid fa-robot modelIcon ${selectedModel === "general" ? "activeIcon" : ""}`}></i>
                External PipGPT
              </div>
            </div>
          </div>

          <button type="submit">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemporaryChat;