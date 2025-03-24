/**
 * @files Temporary Chat Component
 * @Description This component provides a temporary chat interface where  essages are not saved.
 */

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { generateCompletion } from "../../lib/openai";
import "./temporaryChat.css";

const TemporaryChat = () => {
  // Chat messages state (temporary session)
  const [messages, setMessages] = useState([]);
  // For the text input
  const [inputText, setInputText] = useState("");
  // Toggle selected model: "ampgpt" or "general"
  const [selectedModel, setSelectedModel] = useState("ampgpt");
  // Loading state for assistant response
  const [loading, setLoading] = useState(false);
  // For cycling through loading messages
  const loadingTexts = [
    "Digging resources...",
    "Connecting dots...",
    "Building sentences..."
  ];
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const [text, setText] = useState("");
    const textareaRef = useRef(null);
    const formContainerRef = useRef(null);
    const buttonContainerRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && formContainerRef.current && buttonContainerRef.current) {
      const textarea = textareaRef.current;
      const formContainer = formContainerRef.current;
      const buttonContainer = buttonContainerRef.current;
  
      // Reset the height firstÍ
      textarea.style.height = "auto";
  
      // Set new height based on content
      const newTextAreaHeight = Math.min(textarea.scrollHeight, 250); // Limit textarea height
      textarea.style.height = `${newTextAreaHeight}px`;
  
      // Calculate total height of form container
      const buttonHeight = buttonContainer.offsetHeight + 20; // Including padding
      const totalHeight = newTextAreaHeight + buttonHeight + 20; // Consistent spacing
      formContainer.style.height = `${Math.min(totalHeight, 400)}px`; // Limit max height
    }
  }, [inputText]);
  

  const endRef = useRef(null);

  // Auto-scroll to the bottom whenever messages update
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Cycle through loading texts when waiting for response
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
      }, 1000);
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Toggle between models
  const handleToggleModel = () => {
    setSelectedModel((prev) => (prev === "ampgpt" ? "general" : "ampgpt"));
  };

  // Handle the submission of a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    // Add the user's message
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInputText("");
    setLoading(true);

    try {
      // Generate assistant response based on conversation history and selected model
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

  return (
    <div className="temporaryChat">
      <div className="topBar">
        <div className="greetings">
          <h1>You are using temporary chat. It won't be saved anywhere.</h1>
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
      <form onSubmit={handleSubmit} className="formContainer" ref={formContainerRef}>
        <textarea
          ref={textareaRef}
          name="text"
          placeholder={`Ask me anything... (Using ${selectedModel === "ampgpt" ? "Internal AMP GPT" : "External PipGPT"})`}
          autoComplete="off"
          rows="2"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        ></textarea>

        <div className="button-container" ref={buttonContainerRef}>
          {/* Model Selection */}
          <div className="choosemodel">
            <div className="modelToggleSwitch" onClick={handleToggleModel}>
              <div className={`modelToggleOption ${selectedModel === "ampgpt" ? "active" : ""}`}>
                Internal AMP GPT
              </div>
              <div className={`modelToggleOption ${selectedModel === "general" ? "active" : ""}`}>
                External PipGPT
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </form>

    </div>
  );
};

export default TemporaryChat;
