/**
 * @file NewPrompt Component
 * @description This component manages a chatbot interface, allowing users to input prompts, receive AI-generated responses, and optionally search the internet for relevant data.
 */

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import "./newPrompt.css";
import axios from "axios";
import { generateCompletion } from "../../lib/openai";

const NewPrompt = ({ initialMessages = [], selectedModel, chatId, loading, error }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [searchInternet, setSearchInternet] = useState(false);
  const loadingTexts = ["Digging resources...", "Connecting dots...", "Building sentences..."];
  const [inputText, setInputText] = useState("");

  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const formContainerRef = useRef(null);
  const buttonContainerRef = useRef(null);

  const GOOGLE_API_KEY = "AIzaSyBwzqCuatStPuWQCvz9cPkgd_iJWBTlpn0";
  const CSE_ID = "f0cacdf5d6360444e";

  useEffect(() => {
    setMessages(initialMessages);
  }, [chatId, initialMessages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

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

  const fetchInternetData = async (query) => {
    try {
      const response = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
          key: GOOGLE_API_KEY,
          cx: CSE_ID,
          q: query,
          num: 5,
        },
      });
      const results = response.data.items || [];
      return results.map((item, index) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      }));
    } catch (error) {
      console.error("Error fetching internet data:", error);
      return [];
    }
  };

  const add = async (text) => {
    const updatedMessages = [...messages, { role: "user", content: text }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      let internetData = "";

      if (searchInternet) {
        const searchResults = await fetchInternetData(text);
        if (searchResults.length > 0) {
          internetData = searchResults
            .map((result, index) => `${index + 1}. ${result.title}: ${result.snippet}`)
            .join("\n");
        } else {
          internetData = "No relevant internet data found.";
        }
      }

      const prompt = searchInternet
        ? `User Query: ${text}\n\nRelevant Internet Data:\n${internetData}`
        : text;

      const aiResponse = await generateCompletion(
        [...updatedMessages, { role: "user", content: prompt }],
        selectedModel
      );

      const updatedMessagesWithResponse = [
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ];
      setMessages(updatedMessagesWithResponse);

      await axios.put(`${import.meta.env.VITE_API_URL}/api/chats/${chatId}`, {
        question: text,
        assistantResponse: aiResponse,
      });
    } catch (err) {
      console.error("Error generating AI response or saving data:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    add(text);
    setInputText("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingTexts.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTyping]);

  return (
    <div className="newPrompt">
      <div className="chatContainer">
        {loading ? (
          <div className="message assistant loading">Loading chat...</div>
        ) : error ? (
          <div className="message assistant loading">Something went wrong!</div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.role === "assistant" ? (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {typeof message.content === "string" ? message.content : ""}
                  </ReactMarkdown>
                ) : (
                  <span>{typeof message.content === "string" ? message.content : ""}</span>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message assistant loading">
                {loadingTexts[loadingTextIndex]}
              </div>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      <form className="formContainer" onSubmit={handleSubmit} ref={formContainerRef}>

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
        <div className="formControls">
          <div className="formControls-left">
            {selectedModel === "general" && (
              <div className="toggleWrapper">
                <label className="toggleSwitch">
                  <input
                    type="checkbox"
                    checked={searchInternet}
                    onChange={() => setSearchInternet(!searchInternet)}
                  /><div className="formControls">
                    <div className="formControls-left">
                      {selectedModel === "general" && (
                        <div className="toggleWrapper">
                          <label className="toggleSwitch">
                            <input
                              type="checkbox"
                              checked={searchInternet}
                              onChange={() => setSearchInternet(!searchInternet)}
                            />
                            <span className="slider"></span>
                          </label>
                          <span className="toggleLabel">Search Internet</span>
                        </div>
                      )}
                    </div>
                    <div className="formControls-right">
                      <div className="button-container" ref={buttonContainerRef}>
                        <button type="submit" className="submitButton">
                          <i className="fa fa-paper-plane"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  <span className="slider"></span>
                </label>
                <span className="toggleLabel">Search Internet</span>
              </div>
            )}
          </div>
          <div className="formControls-right">
            <div className="button-container" ref={buttonContainerRef}>
              <button type="submit" className="submitButton">
                <i className="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NewPrompt;